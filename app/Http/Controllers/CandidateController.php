<?php

namespace App\Http\Controllers;

use App\Election;
use App\Candidate;
use Illuminate\Http\Request;

class CandidateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the resource.
     *
     * @SWG\Get(
     *     tags={"Candidates"},
     *     path="/election/{electionId}/candidate",
     *     summary="View candidates for an election",
     *     operationId="candidateIndex",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
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
        $this->authorize('view', $election);

        return $election->candidates;
    }

    /**
     * Show a candidate from an election
     *
     * @SWG\Get(
     *     tags={"Candidates"},
     *     path="/election/{electionId}/candidate/{candidateId}",
     *     summary="Get information about a candidate",
     *     operationId="getCandidateById",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         name="candidateId",
     *         in="path",
     *         description="Candidate to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(ref="#/definitions/Candidate")
     *     ),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @param Election $election
     * @param Candidate $candidate
     * @return Candidate
     */
    public function show(Election $election, Candidate $candidate)
    {
        $this->authorize('view', $election);

        return $candidate;
    }

    /**
     * Add a new candidate for an election
     *
     * @SWG\Post(
     *     tags={"Candidates"},
     *     path="/election/{electionId}/candidate",
     *     summary="Add a candidate",
     *     consumes={"application/json"},
     *     produces={"application/json"},
     *     operationId="createCandidate",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election ID",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         name="payload",
     *         in="body",
     *         description="Candidate to add",
     *         required=true,
     *         @SWG\Schema(ref="#/definitions/CreateCandidate")
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="successful operation",
     *         @SWG\Schema(ref="#/definitions/Candidate")
     *     ),
     *     @SWG\Response(
     *         response="400",
     *         description="Bad Request",
     *     )
     * )
     *
     * @param Request $request
     * @param Election $election
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Election $election)
    {
        $this->authorize('update', $election);

        // bump election version, reseting voter indications
        $election->ballot_version += 1;
        $election->save();

        // save new candidate
        $candidate = new Candidate();
        $candidate->name = $request->json()->get('name');
        $candidate->election_id = $election->id;
        $candidate->save();
        return $candidate;
    }

    /**
     * Delete a candidate from an election
     *
     * @SWG\Delete(
     *     tags={"Candidates"},
     *     path="/election/{electionId}/candidate/{candidateId}",
     *     summary="Delete a candidate",
     *     consumes={"application/json"},
     *     produces={"application/json"},
     *     operationId="deleteCandidate",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election ID",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         name="candidateId",
     *         in="path",
     *         description="Candidate ID to delete",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="successful operation"
     *     ),
     *     @SWG\Response(
     *         response="400",
     *         description="Bad Request",
     *     )
     * )
     *
     * @param Election $election
     * @param Candidate $candidate
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Election $election, Candidate $candidate)
    {
        // TODO: does this allow deletion of candidates in other elections?
        $this->authorize('update', $election);

        // bump ballot version, reseting voter indications
        $election->ballot_version += 1;
        $election->save();

        // delete candidate
        $candidate->delete();
        return response()->json(new \stdClass());
    }
}
