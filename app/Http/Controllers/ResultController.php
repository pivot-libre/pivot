<?php
namespace App\Http\Controllers;

use App\Models\Election;

class ResultController extends Controller
{
    /**
     * Get Election Results.
     *
     * @OA\Get(
     *     tags={"Election"},
     *     path="/api/election/{electionId}/result",
     *     summary="View results for an election",
     *     operationId="getElectionResults",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get results of",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(response="200", description="Success", @OA\Schema(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Candidate")
     *         )),
     *     @OA\Response(response="400", description="Bad Request")
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
