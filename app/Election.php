<?php

namespace App;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate as TidemanCandidate;
use PivotLibre\Tideman\CandidateList;
use PivotLibre\Tideman\NBallot;
use PivotLibre\Tideman\RankedPairsCalculator;
use PivotLibre\Tideman\Grouper;

/**
 * @property Collection electors
 */
class Election extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name'];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|Elector
     */
    public function electors()
    {
        return $this->hasMany(Elector::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

    public function result_snapshots()
    {
        return $this->hasMany(ResultSnapshot::class);
    }

    public function send_invite_email($email)
    {
        // don't even try if the mail driver is not configured
        if (env('MAIL_DRIVER', null) == null) {
            return 'mail driver not configured';
        }

        $msg = 'You have been invited to an election';

        try {
            Mail::raw($msg, function ($message) use ($email) {
                $name = 'Elector';
                $message->to($email, $name)->subject('Pivot Libre Election Invitation');
            });
        } catch(\Exception $e) {
            return $e->getMessage();
        }
        return null;
    }

    public function invite($email)
    {
        $elector = $this->electors()->where(['invite_email' => $email])->first();
        $mail_error = null;

        if (empty($elector))
        {
            $elector = new Elector();
            $elector->election()->associate($this);
            $elector->invite_email = $email;
            $elector->save();

            $mail_error = $this->send_invite_email($email);
        }

        return $elector;
    }

    /**
     * @param int $electionId
     * @return Collection of all CandidateRanks associated with
     * the election identified by the parameterized  id.
     */
    public function getCandidateRankCollection($electionId)
    {
        // TODO: should we filter out electors who haven't indicated they are ready?

        /*
        SELECT 
            candidate_ranks.elector_id,
            candidate_ranks.rank,
            candidate_ranks.candidate_id
        FROM
            candidate_ranks
                JOIN
            candidates ON candidates.id = candidate_ranks.candidate_id
        WHERE
            candidates.election_id = '4'
        ORDER BY elector_id , rank;
        */
        $candidateRanks = CandidateRank::
            join('candidates', 'candidate_ranks.candidate_id', '=', 'candidates.id')
            ->where('candidates.election_id', '=', $electionId)
            ->orderBy('elector_id', 'asc')
            ->orderBy('rank', 'asc')
            ->get();
        return $candidateRanks;
    }

    /**
     * @param Collection of App\CandidateRank
     * @return array of arrays of arrays. The arrays are grouped at the outermost level
     * on elector id. The arrays are grouped at the next level by rank. Array entries at this level are ordered in
     * ascending rank. The innermost arrays are associative arrays that contain CandidateRank attributes.
     */
    public function groupRankingsByElectorAndRank($candidateRanks)
    {
        $candidateRanksGroupedByElector = $candidateRanks->mapToGroups(function($candidateRank){
            $value = $candidateRank;
            $key = $candidateRank->getAttributeValue('elector_id');
            return [ $key => $value ];
        });

        $candidateRanksGroupedByElectorAndRank = $candidateRanksGroupedByElector->map(function($candidateRanksFromOneElector){
            return $candidateRanksFromOneElector->mapToGroups(function($candidateRank){
                $value = $candidateRank;
                $key = $candidateRank->getAttributeValue('rank');
                return [ $key => $value ];
            });
        })->toArray();
        return $candidateRanksGroupedByElectorAndRank;
    }

    /**
     * @param array of arrays of arrays as output by $this->groupRankingsByElectorAndRank
     * @return array of NBallots
     */
    public function buildNBallots($candidateRanksGroupedByElectorAndRank)
    {
        $nBallots = array_map(function($ballotArray){
            $candidateLists = array_map(function($candidateListArray){
                
                $candidates = array_map(function($candidateArray){
                    return new TidemanCandidate($candidateArray['id'], $candidateArray['name']);
                }, $candidateListArray);

                $candidateList = new CandidateList(...$candidates);
                return $candidateList;
            }, $ballotArray);
            $nBallot = new NBallot(1, ...$candidateLists);
            return $nBallot;
        }, $candidateRanksGroupedByElectorAndRank);
        return $nBallots;
    }

    public function calculateResult()
    {
        $election = $this;
        $electionId = $election->getKey();
        
        $candidateRanks = $this->getCandidateRankCollection($electionId);
        $candidateRanksGroupedByElectorAndRank = $this->groupRankingsByElectorAndRank($candidateRanks);

        $nBallots = $this->buildNBallots($candidateRanksGroupedByElectorAndRank);
        $numWinners = $election->candidates()->count();

        //choose a random ballot for tie-breaking
        $tieBreakerBallotIndex = array_rand($nBallots);
        $tieBreakerBallot = $nBallots[$tieBreakerBallotIndex];

        $calculator = new RankedPairsCalculator($tieBreakerBallot);
        $winnerOrder = $calculator->calculate($numWinners, ...$nBallots)->toArray();

        $pivotCandidates = $election->candidates()->get()->keyBy('id');
        
        // format for return (i.e., convert tideman candidates back to pivot candidates)
        $orderedPivotCandidates = [];
        //use explicit numerical indexing because order is very important
        for($i = 0; $i < sizeof($winnerOrder); $i++) {
            $tidemanCandidate = $winnerOrder[$i];
            $candidateId = (int)$tidemanCandidate->getId();
            $pivotCandidate = $pivotCandidates->get($candidateId);
            $orderedPivotCandidates[] = $pivotCandidate;
        }
        $wrapper = ["order" => $orderedPivotCandidates];
        return $wrapper;
    }
}
