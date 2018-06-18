<?php

namespace App;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
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
    public function getCandidateRankCollection()
    {
        $electionId = $this->getKey();
        $query = \DB::table('elections')->where('elections.id', '=', $electionId)
               ->join('candidates', 'candidates.election_id', '=', 'elections.id')
               ->join('electors', 'electors.election_id', '=', 'elections.id')
               ->leftJoin('candidate_ranks', function($join) {
                   $join->on('candidate_ranks.elector_id', '=', 'electors.id');
                   $join->on('candidate_ranks.candidate_id', '=', 'candidates.id');
               })->select('electors.id AS elector_id', 'candidates.id AS candidate_id', 'candidates.name', 'candidate_ranks.rank');

        return $query->get();
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
            $key = $candidateRank->elector_id;
            $value = $candidateRank;
            return [ $key => $value ];
        });

        $candidateRanksGroupedByElectorAndRank = $candidateRanksGroupedByElector->map(function($candidateRanksFromOneElector){
            return $candidateRanksFromOneElector->mapToGroups(function($candidateRank){
                // default rank is 0
                $key = is_null($candidateRank->rank) ? 0 : $candidateRank->rank;
                $value = $candidateRank;
                return [ $key => $value ];
            });
        })->toArray();
        return $candidateRanksGroupedByElectorAndRank;
    }

    /**
     * @param array of arrays of arrays as output by $this->groupRankingsByElectorAndRank
     * @return array of NBallots
     */
    public function buildNBallots()
    {
        $electionId = $this->getKey();
        $candidateRanks = $this->getCandidateRankCollection();
        $candidateRanksGroupedByElectorAndRank = $this->groupRankingsByElectorAndRank($candidateRanks);

        $nBallots = array_map(function($ballotArray){
            $candidateLists = array_map(function($candidateListArray){
                
                $candidates = array_map(function($candidateArray){
                    return new TidemanCandidate($candidateArray->candidate_id, $candidateArray->name);
                }, $candidateListArray);

                $candidateList = new CandidateList(...$candidates);
                return $candidateList;
            }, $ballotArray);

            # we want the highest ranked entries first
            ksort($candidateLists);
            array_reverse($candidateLists);

            $nBallot = new NBallot(1, ...$candidateLists);
            return $nBallot;
        }, $candidateRanksGroupedByElectorAndRank);
        return $nBallots;
    }

    public function createTotallyOrderedBallot($nBallot) {
        $totalOrder = array();
        foreach ($nBallot as $candidateList) {
            $candidates = (clone $candidateList)->toArray();
            shuffle($candidates);
            array_push($totalOrder, ...$candidates);
        }

        // every candidate should be in its own CandidateList
        $totalOrder = array_map(function($candidate){
            return new CandidateList($candidate);
        }, $totalOrder);
        
        return new NBallot(1, ...$totalOrder);
    }

    public function ballotsToText($nBallots) {
        $lines = [];
        foreach ($nBallots as $nBallot) {
            $line = implode(">",
                            array_map(function($candidateList) {
                                return implode("=",
                                               array_map(function($candidate) {
                                                   return $candidate->getId();
                                               }, $candidateList->toArray()));
                            }, $nBallot->toArray()));
            array_push($lines, $line);
        }
        return implode("\n", $lines);
    }

    public function calculateResult()
    {
        # generate Tideman ballots from Pivot data
        $nBallots = $this->buildNBallots();
        Log::debug('BALLOTS: ' . self::ballotsToText($nBallots));
        $tieBreakerBallot = $nBallots[array_rand($nBallots)];
        $tieBreakerBallot = self::createTotallyOrderedBallot($tieBreakerBallot);

        # calculate results
        $calculator = new RankedPairsCalculator($tieBreakerBallot);
        $numWinners = $this->candidates()->count();
        $tidemanWinners = $calculator->calculate($numWinners, ...$nBallots)->toArray();

        // iterate over IDs in winningOrder, lookup Pivot candidates, and append in order
        $pivotWinners = [];
        $pivotCandidates = $this->candidates()->get()->keyBy('id');
        for($i = 0; $i < sizeof($tidemanWinners); $i++) {
            $candidateId = $tidemanWinners[$i]->getId();
            array_push($pivotWinners, $pivotCandidates[$candidateId]);
        }

        $result = ["order" => $pivotWinners];
        return $result;
    }
}
