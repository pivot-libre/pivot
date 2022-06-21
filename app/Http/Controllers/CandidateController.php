<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Election;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes\MediaType;
use OpenApi\Attributes\RequestBody;

class CandidateController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     tags={"Candidates"},
     *     path="/api/elections/{electionId}/candidates",
     *     summary="View candidates for an election",
     *     operationId="candidateIndex",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
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
        $this->authorize('view', $election);

        return $election->candidates;
    }

    /**
     * Show a candidate from an election
     *
     * @OA\Get(
     *     tags={"Candidates"},
     *     path="/api/elections/{electionId}/candidates/{candidateId}",
     *     summary="Get information about a candidate",
     *     operationId="getCandidateById",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *         name="candidateId",
     *         in="path",
     *         description="Candidate to get",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(response="200", description="Success", @OA\Schema(ref="#/components/schemas/Candidate")
     *     ),
     *     @OA\Response(response="400", description="Bad Request")
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
     * @OA\Post(
     *     tags={"Candidates"},
     *     path="/api/elections/{electionId}/candidates",
     *     summary="Add a candidate",
     *     operationId="createCandidate",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election ID",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *         name="payload",
     *         in="query",
     *         description="Candidate to add",
     *         required=true,
     *         @OA\Schema(ref="#/components/schemas/CreateCandidate")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\Schema(ref="#/components/schemas/Candidate")
     *     ),
     *     @OA\Response(
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

        $candidate = null;
        DB::transaction(function() use (&$election, $request, &$candidate) {
            // bump election version, reseting voter indications
            $election->ballot_version += 1;
            $election->save();

            // save new candidate
            $candidate = new Candidate();
            $candidate->name = $request->json()->get('name');
            $candidate->election_id = $election->id;
            $candidate->save();


        });
        return response($candidate, 201);
    }

    /**
     * Delete a candidate from an election
     *
     * @OA\Patch(
     *     tags={"Candidates"},
     *     path="/api/elections/{electionId}/candidates/{candidateId}",
     *     summary="Update a candidate",
     *     operationId="updateCandidate",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election ID",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *         name="payload",
     *         in="query",
     *         description="Candidate to update",
     *         required=true,
     *         @OA\Schema(ref="#/components/schemas/CreateCandidate")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="successful operation"
     *     ),
     *     @OA\Response(
     *         response="400",
     *         description="Bad Request",
     *     )
     * )
     *
     * @param Election $election
     * @param Candidate $candidate
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Election $election, Candidate $candidate)
    {
        $this->authorize('update', $election);

        $this->validate($request, [
            'name' => 'required|string',
        ]);

        // bump ballot version, reseting voter indications
        $election->ballot_version += 1;
        $election->save();

        $candidate->update([
           'name' => $request->get('name')
        ]);

        return response(null, 204);
    }

    /**
     * Delete a candidate from an election
     *
     * @OA\Delete(
     *     tags={"Candidates"},
     *     path="/api/elections/{electionId}/candidates/{candidateId}",
     *     summary="Delete a candidate",
     *     operationId="deleteCandidate",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election ID",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *         name="candidateId",
     *         in="path",
     *         description="Candidate ID to delete",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="successful operation"
     *     ),
     *     @OA\Response(
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
        $this->authorize('update', $election);

        // bump ballot version, reseting voter indications
        $election->ballot_version += 1;
        $election->save();

        // delete candidate
        $candidate->delete();
        return response(null, 204);
    }
}
