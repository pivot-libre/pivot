<?php

namespace App\Actions;

use App\Models\CandidateRank;
use App\Models\Election;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate as TidemanCandidate;
use PivotLibre\Tideman\CandidateList;
use PivotLibre\Tideman\NBallot;
use PivotLibre\Tideman\RankedPairsCalculator;

class CalculateResult
{
    public function __construct(
        private readonly GetVoterDetails $getVoterDetails
    )
    {
    }

    public function __invoke(Election $election): array
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
            $pivotElectors = ($this->getVoterDetails)($election);
            $nBallots = $this->buildNBallots($election);
            Log::debug('BALLOTS: ' . self::ballotsToText($nBallots));
            if (count($nBallots) == 0) {
                $errorMessage = "there were 0 ballots ready for the election";
                throw new \Exception($errorMessage);
            }
            $tieBreaker = $nBallots[array_rand($nBallots)];
            $tieBreakerTotal = self::createTotallyOrderedBallot($tieBreaker);

            // calculated results
            $calculator = new RankedPairsCalculator($tieBreakerTotal);
            $numWinners = $election->candidates()->count();
            $result = $calculator->calculate($numWinners, null, ...$nBallots);
            $tidemanWinners = $result->getRanking();

            // translate tideman candidate objects back to pivot candidate objects
            $pivotCandidates = $election->candidates()->get()->keyBy('id');
            $pivotWinners = array_map(function($tidemanCandidateList) use ($pivotCandidates){
                return array_map(function($tidemanCandidate) use ($pivotCandidates){
                    $candidateId = $tidemanCandidate->getId();
                    return $pivotCandidates[$candidateId];
                }, $tidemanCandidateList->toArray());
            }, $tidemanWinners->toArray());
        } catch (\Exception $e) {
            // for debug blob
            $exceptionMessage = $e->getMessage();
            $exceptionStack = $e->getTraceAsString();
        }

        // populate snapshot blob (json): debug, debug_private, and order
        $debug = array();
        $debug["ballots"] = array_map('self::ballotToText', $nBallots);
        $debug["tie_breaker"] = is_null($tieBreaker) ? null : self::ballotToText($tieBreaker);
        $debug["tie_breaker_total"] = is_null($tieBreakerTotal) ? null : self::ballotToText($tieBreakerTotal);
        $debug["election_config"] = $election->config;
        $debug["exception"] = array("message" => $exceptionMessage, "stack" => $exceptionStack);
        $result = array();
        $debug_private = array();
        $debug_private["candidates"] = array();
        foreach ($pivotCandidates as $c) {
            $debug_private["candidates"][] = ["id" => $c->id, "name" => $c->name];
        }
        $debug_private["electors"] = array();
        foreach ($pivotElectors as $state => $electors) {
            foreach ($electors as $e) {
                $row = array("id"=>$e["elector_id"],
                    "name"=>$e["voter_name"] ?: $e["user_name"],
                    "email"=>$e["email"],
                    "state"=>$state);
                $debug_private["electors"][] = $row;
            }
        }

        // top-level fields in snapshot blob
        $result["error"] = $errorMessage;
        $result["debug"] = $debug;
        $result["debug_private"] = $debug_private;
        $result["order"] = $pivotWinners;

        return $result;
    }

    public static function ballotToText($nBallot): string
    {
        return implode(">",
            array_map(function($candidateList) {
                return implode("=",
                    array_map(function($candidate) {
                        return $candidate->getId();
                    }, $candidateList->toArray()));
            }, $nBallot->toArray()));
    }

    public static function ballotsToText($nBallots): string
    {
        $lines = [];
        foreach ($nBallots as $nBallot) {
            $lines[] = self::ballotToText($nBallot);
        }
        return implode("\n", $lines);
    }

    public function createTotallyOrderedBallot($nBallot): Ballot
    {
        $totalOrder = [];
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

    /**
     * @return array<int, NBallot> of NBallots
     */
    public function buildNBallots(Election $election): array
    {
        $candidateRanks = $this->getCandidateRankCollection($election);
        $candidateRanksGroupedByElectorAndRank = $this->groupRankingsByElectorAndRank($candidateRanks);

        return array_map(function($ballotArray){
            $candidateLists = array_map(function($candidateListArray){

                $candidates = array_map(function($candidateArray){
                    return new TidemanCandidate($candidateArray->candidate_id, $candidateArray->name);
                }, $candidateListArray);

                return new CandidateList(...$candidates);
            }, $ballotArray);

            # sort by rank (best=1 first)
            ksort($candidateLists);

            return new NBallot(1, ...$candidateLists);
        }, $candidateRanksGroupedByElectorAndRank);
    }

    /**
     * @param Collection<int, CandidateRank> $candidateRanks
     * @return array of arrays of arrays. The arrays are grouped at the outermost level
     * on elector id. The arrays are grouped at the next level by rank. Array entries at this level are ordered in
     * ascending rank. The innermost arrays are associative arrays that contain CandidateRank attributes.
     */
    public function groupRankingsByElectorAndRank($candidateRanks): array
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
        $candidateRanksGroupedByElectorAndRank = $candidateRanksGroupedByElector->map(
            fn($candidateRanksFromOneElector) => $candidateRanksFromOneElector->mapToGroups(function($candidateRank) use ($unranked) {
                // default rank is <= 0.  Map that to largest value
                $key = (is_null($candidateRank->rank) || $candidateRank->rank <= 0) ? $unranked : $candidateRank->rank;
                $value = $candidateRank;
                return [ $key => $value ];
            })
        )->toArray();
        return $candidateRanksGroupedByElectorAndRank;
    }

    /**
     * @return \Illuminate\Support\Collection of all CandidateRanks associated with
     * the election identified by the parameterized id.
     */
    public function getCandidateRankCollection(Election $election)
    {
        $electionId = $election->getKey();
        $query = DB::table('elections')->where('elections.id', '=', $electionId)
            ->join('candidates', 'candidates.election_id', '=', 'elections.id')
            ->join('electors', 'electors.election_id', '=', 'elections.id')
            ->leftJoin('candidate_ranks', function($join) {
                $join->on('candidate_ranks.elector_id', '=', 'electors.id');
                $join->on('candidate_ranks.candidate_id', '=', 'candidates.id');
            });
        if ($this->getConfigApprovedOnly($election)) {
            $query = $query->where('electors.ballot_version_approved', '=', DB::raw('elections.ballot_version'));
        }
        $query = $query->select('electors.id AS elector_id', 'candidates.id AS candidate_id', 'candidates.name', 'candidate_ranks.rank');

        Log::debug('BALLOT QUERY: ' . $query->toSql());

        return $query->get();
    }

    public function getConfigApprovedOnly(Election $election, $default_value = true) {
        return $election->get_config_value('approved_only', $default_value);
    }

    public function voterDetails(Election $election) {
        $electionId = $election->getKey();

        $stats = array(
            "outstanding_invites" => array(),
            "approved_none" => array(),
            "approved_current" => array(),
            "approved_previous" => array()
        );

        $query = Election::query()
            // Convert to base so Election models are not returned.
            ->toBase()
            ->where('elections.id', '=', $electionId)
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
            $elector = [
                "user_name" => $user_name,
                "voter_name" => $voter_name,
                "email" => $email,
                "elector_id" => $elector_id
            ];
            $stats[$key][] = $elector;
        }

        return $stats;
    }
}