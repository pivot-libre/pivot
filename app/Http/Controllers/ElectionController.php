<?php

namespace App\Http\Controllers;

use App\Election;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ElectionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * @SWG\Get(
     *     tags={"Election"},
     *     path="/election",
     *     operationId="electionIndex",
     *     summary="View all elections",
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(
     *             type="array",
     *             @SWG\Items(ref="#/definitions/Election")
     *         )),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     */
    public function index()
    {
        $id = Auth::id();

        return Election::where('creator_id', '=', $id)->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $creator = Auth::user();

        $election = new Election();
        $election->name = $request->json()->get('name');
        $election->creator()->associate($creator);
        $election->save();

        return redirect()->route('election.show', ['id' => $election->id]);
    }

    /**
     * Display the specified resource.
     *
     * * @SWG\Get(
     *     tags={"Election"},
     *     path="/election/{electionId}",
     *     summary="View information about an election",
     *     operationId="getElectionById",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(
     *             type="array",
     *             @SWG\Items(ref="#/definitions/ElectionWithCreator")
     *         )),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @param  \App\Election $election
     * @return \Illuminate\Http\Response
     */
    public function show(Election $election)
    {
        $this->authorize('view', $election);

        return $election;
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \App\Election $election
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Election $election)
    {
        $this->authorize('update', $election);

        $election->name = $request->json()->get('name');
        $election->save();

        // Make the creator the first elector
        $elector = new Elector();
        $elector->election()->associate($this);
        $elector->user()->associate(Auth::user());
        $elector->save();

        return $election;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Election $election
     * @return \Illuminate\Http\Response
     */
    public function destroy(Election $election)
    {
        $this->authorize('delete', $election);

        $election->delete();

        return response()->json(new \stdClass());
    }
}
