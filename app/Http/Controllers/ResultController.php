<?php
namespace App\Http\Controllers;

use App\Election;
use App\CandidateRank;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResultController extends Controller
{
    /**
     * Get Election Results.
     *
     * @SWG\Get(
     *     tags={"Election"},
     *     path="/api/election/{electionId}/result",
     *     summary="View results for an election",
     *     operationId="getElectionResults",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get results of",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(
     *             type="array",
     *             @SWG\Items(ref="#/definitions/Candidate")
     *         )),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        $this->authorize('view_results', $election);
        
        return $election->calculateResult();
    }
}
