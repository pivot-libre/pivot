<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Election;
use App\Elector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InviteController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the resource.
     *
     * @SWG\Get(
     *     tags={"Invites"},
     *     path="/election/{electionId}/invite",
     *     summary="View electors who have not accepted their invite yet",
     *     operationId="inviteIndex",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(
     *             type="array",
     *             @SWG\Items(ref="#/definitions/InviteWithElection")
     *         )),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        $this->authorize('update', $election);

        return $election->electors()->whereNull('invite_accepted_at')->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @SWG\Post(
     *     tags={"Invites"},
     *     path="/election/{electionId}/invite",
     *     summary="Send an invite",
     *     operationId="createInvite",
     *     consumes={"application/json"},
     *     produces={"application/json"},
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
     *         description="Email to invite",
     *         required=true,
     *         @SWG\Schema(ref="#/definitions/Email")
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="successful operation",
     *         @SWG\Schema(ref="#/definitions/Invite")
     *     ),
     *     @SWG\Response(
     *         response="400",
     *         description="Bad Request",
     *     )
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Election $election)
    {
        $this->authorize('update', $election);

        $email = $request->json()->get('email');
        $elector = $election->invite($email);
        return $elector;
    }

    /**
     * Update the specified resource in storage.
     *
     * @SWG\Post(
     *     tags={"Invites"},
     *     path="/invite/accept",
     *     summary="Accept an invite",
     *     consumes={"application/json"},
     *     produces={"application/json"},
     *     operationId="acceptInvite",
     *     @SWG\Parameter(
     *         name="payload",
     *         in="body",
     *         description="Code to accept an invite",
     *         required=true,
     *         @SWG\Schema(ref="#/definitions/Code")
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="successful operation",
     *         @SWG\Schema(ref="#/definitions/Invite")
     *     ),
     *     @SWG\Response(
     *         response="400",
     *         description="Bad Request",
     *     )
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function accept(Request $request)
    {
        // auth note: if an elector exists for the given election with
        // invite_email matching the user's email, then the user has
        // the right to accept the "invite"

        # TODO(tylerharter): clean this up?  Putting election_id in "code" variable is silly
        $election_id = (int)$request->json()->get('code');
        $user = Auth::user();
        $email = $user->email;

        $elector = Elector::where('invite_email', $email)->where('election_id', $election_id)->firstOrFail();

        if ($elector->invite_accepted_at == null)
        {
            $elector->user()->associate($user);
            $elector->invite_accepted_at = Carbon::now();
            $elector->save();
        }

        # hack, because eloquent reformats dates after a save
        $elector = Elector::find($elector->id);
        return $elector;
    }

    public function acceptable(Request $request)
    {
        // auth note: viewing your own invitations requires no special privilege
        $user = Auth::user();
        $results = array();
        $electors = Elector::where('invite_email', $user->email)->where('invite_accepted_at', null)->get();

        foreach ($electors as $elector) {
            $election = $elector->election;
            $code = (string)$election->id;
            $row = array("election_name" => $election->name,
                         "election_id" => $election->id,
                         "code" => $code);
            $results[$code] = $row;
        }

        return array_values($results);
    }
}
