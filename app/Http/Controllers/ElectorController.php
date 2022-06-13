<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Elector;
use Carbon\Carbon;
use DummyFullModelClass;
use Illuminate\Support\Facades\Auth;

class ElectorController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     tags={"Electors"},
     *     path="/api/elections/{electionId}/electors",
     *     summary="View the electorate for an election",
     *     operationId="electorIndex",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(response="200", description="Success", @OA\Schema(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/User")
     *         )),
     *     @OA\Response(response="400", description="Bad Request")
     * )
     *
     * @param  \App\Models\Election $election
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        $this->authorize('view_electors', $election);

        return $election->electors()->accepted()->get();
    }

    public function electors_for_self(Election $election)
    {
        // auth note: viewing electors you control requires no special privilege
        $user = Auth::user();

        // accept all invitations for this user to this election
        $electors = Elector::where('invite_email', $user->email)
                           ->where('invite_accepted_at', null)
                           ->where('election_id', $election->id)
                           ->get();

        foreach ($electors as $elector) {
            $elector->user()->associate($user);
            $elector->invite_accepted_at = Carbon::now();
            $elector->save();
        }

        return $election->electors()->where('user_id', Auth::id())->get();
    }

    /**
     * Display the specified resource.
     *
     * @OA\Get(
     *     tags={"Electors"},
     *     path="/api/elections/{electionId}/electors/{electorId}",
     *     summary="Get information about an elector",
     *     operationId="getElectorById",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *         name="electorId",
     *         in="path",
     *         description="Elector to get",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(response="200", description="Success", @OA\Schema(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(response="400", description="Bad Request")
     * )
     *
     * @param  \App\Models\Election $election
     * @return \Illuminate\Http\Response
     */
    public function show(Election $election, $elector_id)
    {
        $this->authorize('view_electors', $election);

        $elector = $election->electors()->accepted()->whereKey($elector_id)->firstOrFail();
        return $elector;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Election $election
     * @param  \App\Models\User $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(Election $election, $elector_id)
    {
        $this->authorize('update', $election);

        $elector = Elector::where([
            'election_id' => $election->id,
            'id' => $elector_id,
        ])->firstOrFail();

        $elector->delete();
        return response()->json(new \stdClass());
    }
}
