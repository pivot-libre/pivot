<?php
namespace App\Http\Controllers;

use App\Election;
use App\CandidateRank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PivotLibre\Tideman\Agenda;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate;
use PivotLibre\Tideman\CandidateList;
use PivotLibre\Tideman\NBallot;
use PivotLibre\Tideman\RankedPairsCalculator;
use PivotLibre\Tideman\Grouper;

class ResultController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * @param int $electionId
     * @return Illuminate\Collection of all CandidateRanks associated with
     * the election identified by the parameterized  id.
     */
    public function getCandidateRankCollection($electionId)
    {
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
     * @param Illuminate\Database\Eloquent\Relations\Collection of App\CandidateRank
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
                    return new Candidate($candidateArray['id'], $candidateArray['name']);
                }, $candidateListArray);

                $candidateList = new CandidateList(...$candidates);
                return $candidateList;
            }, $ballotArray);
            $nBallot = new NBallot(1, ...$candidateLists);
            return $nBallot;
        }, $candidateRanksGroupedByElectorAndRank);
        return $nBallots;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        $this->authorize('update', $election);
        
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
