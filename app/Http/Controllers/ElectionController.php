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
        $user = Auth::user();

        // TODO: add more election metadata:
        // - number of people who voted (X of Y)

        $can_vote = 'can_vote';
        $can_edit = 'can_edit';
        $results = array();

        // first, collect elections we can vote on
        foreach ($user->elections as $election) {
            $row = $election->toArray();
            $row[$can_vote] = true;
            $row[$can_edit] = false;
            $results[$row['id']] = $row;
        }

        // second, collect elections we can admin
        foreach (Election::where('creator_id', '=', $id)->get() as $election) {
            $row = $election->toArray();
            if (array_key_exists($row['id'], $results)) {
                // can both edit and vote
                $results[$row['id']][$can_edit] = true;
            } else {
                $row[$can_vote] = false;
                $row[$can_edit] = true;
                $results[$row['id']] = $row;
            }
        }

        return array_values($results);
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
        $location = route('election.index', ['id' => $election->id]);

#        $response = Response::make(null, 201)
        #            ->header('Location', $location, true, 201);
        $response = response(null, 201)->header('Location', $location);
        return $response;
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
