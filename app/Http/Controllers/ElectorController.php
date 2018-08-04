<?php

namespace App\Http\Controllers;

use DummyFullModelClass;
use App\Election;
use App\Elector;
use App\User;
use Illuminate\Http\Request;

class ElectorController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @SWG\Get(
     *     tags={"Electors"},
     *     path="/elections/{electionId}/electors",
     *     summary="View the electorate for an election",
     *     operationId="electorIndex",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(
     *             type="array",
     *             @SWG\Items(ref="#/definitions/User")
     *         )),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @param  \App\Election $election
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        $this->authorize('view_electors', $election);

        return $election->electors()->accepted()->get();
    }

    /**
     * Display the specified resource.
     *
     * @SWG\Get(
     *     tags={"Electors"},
     *     path="/elections/{electionId}/electors/{electorId}",
     *     summary="Get information about an elector",
     *     operationId="getElectorById",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         name="electorId",
     *         in="path",
     *         description="Elector to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(ref="#/definitions/User")
     *     ),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @param  \App\Election $election
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
     * @param  \App\Election $election
     * @param  \App\User $user
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
