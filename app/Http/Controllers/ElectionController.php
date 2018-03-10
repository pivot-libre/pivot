<?php

namespace App\Http\Controllers;

use App\Election;
use App\Elector;
use App\CandidateRank;
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
        // auth note: viewing your own elections requires no special privilege
        $user = Auth::user();
        $id = Auth::id();

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
        // auth note: creating your own elections requires no special privilege
        $user = Auth::user();

        $election = new Election();
        $election->name = $request->json()->get('name');
        $election->creator()->associate($user);
        $election->save();

        return $election;
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

        // TODO: should this reset voter ready indications?
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

    public function batchvote(Request $request, $election_id)
    {
        $election = Election::where('id', '=', $election_id)->firstOrFail();
        $this->authorize('vote', $election);
        
        $elector = Elector::where('election_id', '=', $election_id)->
                            where('user_id', '=', Auth::user()->id)->firstOrFail();

        $ranks = array();

        // iterate over list of rankings
        foreach($request->json()->get('votes') as $vote) {
            // TODO: check this is a valid candidate?
            $candidate_id = $vote['candidate_id'];
            $rank_num = $vote['rank'];

            $rank = CandidateRank::firstOrNew(['elector_id' => $elector->id, 'candidate_id' => $candidate_id]);
            $rank->elector_id = $elector->id;
            $rank->candidate_id = $candidate_id;
            $rank->rank = $rank_num;
            $rank->save();

            array_push($ranks, $rank);
        }

        return $ranks;
    }

    public function batchvote_view(Request $request, $election_id)
    {
        $election = Election::where('id', '=', $election_id)->firstOrFail();
        $this->authorize('vote', $election);

        $elector = Elector::where('election_id', '=', $election_id)->
                            where('user_id', '=', Auth::user()->id)->firstOrFail();
        return $elector->ranks;
    }

    // check whether vote is ready
    public function get_ready(Request $request, $election_id)
    {
        $election = Election::where('id', '=', $election_id)->firstOrFail();
        $this->authorize('vote', $election);
        $elector = Elector::where('election_id', '=', $election_id)->
                            where('user_id', '=', Auth::user()->id)->firstOrFail();

        // what is the approval version, and is it current?
        $approved_version = $elector->ballot_version_approved;
        $latest_version = $election->ballot_version;
        $is_latest = ($approved_version == $latest_version);

        // return version status
        return response()->json(array("approved_version" => $approved_version,
                                      "latest_version" => $latest_version,
                                      "is_latest" => $is_latest));
    }

    // mark vote ready
    public function set_ready(Request $request, $election_id)
    {
        $election = Election::where('id', '=', $election_id)->firstOrFail();
        $this->authorize('vote', $election);
        $elector = Elector::where('election_id', '=', $election_id)->
                            where('user_id', '=', Auth::user()->id)->firstOrFail();

        // what is the approval version, and is it current?
        $approved_version = $request->json()->get('approved_version');
        $latest_version = $election->ballot_version;
        $is_latest = ($approved_version == $latest_version);

        // save version to elector, return version status
        $elector->ballot_version_approved = $approved_version;
        $elector->save();
        return response()->json(array("approved_version" => $approved_version,
                                      "latest_version" => $latest_version,
                                      "is_latest" => $is_latest));
    }
}
