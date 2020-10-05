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

    protected $casts = [
        'config' => 'array'
    ];

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

    public function voter_details() {
        $electionId = $this->getKey();

        $stats = array(
            "outstanding_invites" => array(),
            "approved_none" => array(),
            "approved_current" => array(),
            "approved_previous" => array()
        );

        $query = Election::where('elections.id', '=', $electionId)
            ->join('electors', 'elections.id', '=', 'electors.election_id')
            ->leftJoin('users', 'electors.user_id', '=', 'users.id')
            ->select('users.name',
                'users.email',
                'electors.id',
                'electors.voter_name',
                'electors.invite_email',
                'electors.invite_accepted_at',
                'elections.ballot_version',
                'electors.ballot_version_approved');

        foreach ($query->get() as $row) {
            $key = null;
            if ($row->invite_accepted_at == null) {
                $key = 'outstanding_invites';
            } else if ($row->ballot_version_approved == null) {
                $key = 'approved_none';
            } else if ($row->ballot_version_approved == $row->ballot_version) {
                $key = 'approved_current';
            } else {
                $key = 'approved_previous';
            }

            $user_name = $row->name;
            $voter_name = $row->voter_name;
            $email = $row->email != null ? $row->email : $row->invite_email;
            $elector_id = $row->id;
            # user_name may be different from voter_name if this is a proxy-voting use case.
            # user_name may be null if the elector hasn't created an
            # account yet.  voter_name will be non null iff user is
            # proxy voting on behalf of voter.
            $elector = array(
                "user_name" => $user_name,
                "voter_name" => $voter_name,
                "email" => $email,
                "elector_id" => $elector_id
            );
            array_push($stats[$key], $elector);
        }

        return $stats;
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

    public function get_config_value($key, $default_value) {
        $config = $this->config;
        if (is_null($config) || !array_key_exists($key, $config)) {
            return $default_value;
        }
        return $config[$key];
    }

    public function get_config_approved_only($default_value=true) {
        return $this->get_config_value('approved_only', $default_value);
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

    public function invite($email, $voter_name)
    {
        $elector = $this->electors()->where(['invite_email' => $email, 'voter_name' => $voter_name])->first();
        $mail_error = null;

        if (empty($elector))
        {
            $elector = new Elector();
            $elector->election()->associate($this);
            $elector->invite_email = $email;
            $elector->voter_name = $voter_name;
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
               });
        if ($this->get_config_approved_only()) {
            $query = $query->where('electors.ballot_version_approved', '=', \DB::raw('elections.ballot_version'));
        }
        $query = $query->select('electors.id AS elector_id', 'candidates.id AS candidate_id', 'candidates.name', 'candidate_ranks.rank');

        Log::debug('BALLOT QUERY: ' . $query->toSql());
        
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
        // determine largest (worst) rank
        $max_rank = 1;
        $ranks = array_map(function($candidateRank){return $candidateRank->rank;}, $candidateRanks->toArray());
        if (count($ranks) > 0) {
            $max_rank = max($ranks);
        }
        $unranked = $max_rank + 1;

        // bucketize by elector
        $candidateRanksGroupedByElector = $candidateRanks->mapToGroups(function($candidateRank){
            $key = $candidateRank->elector_id;
            $value = $candidateRank;
            return [ $key => $value ];
        });

        // bucketize by rank within each elector
        $candidateRanksGroupedByElectorAndRank = $candidateRanksGroupedByElector->map(function($candidateRanksFromOneElector) use ($unranked) {
            return $candidateRanksFromOneElector->mapToGroups(function($candidateRank) use ($unranked) {
                // default rank is <= 0.  Map that to largest value
                $key = (is_null($candidateRank->rank) || $candidateRank->rank <= 0) ? $unranked : $candidateRank->rank;
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

            # sort by rank (best=1 first)
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
        
        return new Ballot(...$totalOrder);
    }

    public static function ballotToText($nBallot) {
        $line = implode(">",
                        array_map(function($candidateList) {
                            return implode("=",
                                           array_map(function($candidate) {
                                               return $candidate->getId();
                                           }, $candidateList->toArray()));
                        }, $nBallot->toArray()));
        return $line;
    }
    
    public static function ballotsToText($nBallots) {
        $lines = [];
        foreach ($nBallots as $nBallot) {
            array_push($lines, self::ballotToText($nBallot));
        }
        return implode("\n", $lines);
    }

    public function calculateResult()
    {
        // values to populate for the result snapshot
        $pivotCandidates = null;
        $pivotElectors = null;
        $nBallots = null;
        $tieBreaker = null;
        $tieBreakerTotal = null;
        $pivotWinners = null;
        $errorMessage = null;
        $exceptionMessage = null;
        $exceptionStack = null;

        # calculate Tideman
        try {
            # generate Tideman inputs
            $pivotElectors = $this->voter_details();
            $nBallots = $this->buildNBallots();
            Log::debug('BALLOTS: ' . self::ballotsToText($nBallots));
            if (count($nBallots) == 0) {
                $errorMessage = "there were 0 ballots ready for the election";
                throw new \Exception($errorMessage);
            }
            $tieBreaker = $nBallots[array_rand($nBallots)];
            $tieBreakerTotal = self::createTotallyOrderedBallot($tieBreaker);

            // calculated results
            $calculator = new RankedPairsCalculator($tieBreakerTotal);
            $numWinners = $this->candidates()->count();
            $result = $calculator->calculate($numWinners, null, ...$nBallots);
            $tidemanWinners = $result->getRanking();

            // translate tideman candidate objects back to pivot candidate objects
            $pivotCandidates = $this->candidates()->get()->keyBy('id');
            $pivotWinners = array_map(function($tidemanCandidateList) use ($pivotCandidates){
                return array_map(function($tidemanCandidate) use ($pivotCandidates){
                    $candidateId = $tidemanCandidate->getId();
                    return $pivotCandidates[$candidateId];
                }, $tidemanCandidateList->toArray());
            }, $tidemanWinners->toArray());
        } catch (\Exception $e) {
            // visible to users
            if (is_null($errorMessage)) {
                $errorMessage = 'a result could not be computed for this snapshot';
            }

            // for debug blob
            $exceptionMessage = $e->getMessage();
            $exceptionStack = $e->getTraceAsString();
        }

        // populate snapshot blob (json): debug, debug_private, and order
        $debug = array();
        $debug["ballots"] = is_null($nBallots) ? null : array_map('self::ballotToText', $nBallots);
        $debug["tie_breaker"] = is_null($tieBreaker) ? null : self::ballotToText($tieBreaker);
        $debug["tie_breaker_total"] = is_null($tieBreakerTotal) ? null : self::ballotToText($tieBreakerTotal);
        $debug["election_config"] = $this->config;
        $debug["exception"] = array("message" => $exceptionMessage, "stack" => $exceptionStack);
        $result = array();
        $debug_private = array();
        $debug_private["candidates"] = array();
        if (!is_null($pivotCandidates)) {
            foreach ($pivotCandidates as $c) {
                array_push($debug_private["candidates"], array("id"=>$c->id, "name"=>$c->name));
            }
        }
        $debug_private["electors"] = array();
        if (!is_null($pivotElectors)) {
            foreach ($pivotElectors as $state => $electors) {
                foreach ($electors as $e) {
                    $row = array("id"=>$e["elector_id"],
                                 "name"=>$e["voter_name"] ? $e["voter_name"] : $e["user_name"],
                                 "email"=>$e["email"],
                                 "state"=>$state);
                    array_push($debug_private["electors"], $row);
                }
            }
        }

        // top-level fields in snapshot blob
        $result["error"] = $errorMessage;
        $result["debug"] = $debug;
        $result["debug_private"] = $debug_private;
        $result["order"] = $pivotWinners;

        return $result;
    }
}
