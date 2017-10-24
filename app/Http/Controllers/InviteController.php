<?php

namespace App\Http\Controllers;

use App\Election;
use App\Invite;
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
     * * @SWG\Get(
     *     tags={"Invites"},
     *     path="/election/{electionId}/invite",
     *     summary="View pending invites",
     *     operationId="pendingInviteIndex",
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

        return $election->invites;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @SWG\Post(
     *     tags={"Invites"},
     *     path="/election/{electionId}/invite",
     *     summary="Send an invite",
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

        $invite = $election->invite($email);

        return redirect()->route(
            'election.invite.show',
            [
                'election' => $election,
                'invite' => $invite,
            ]
        );
    }

    /**
     * Display the specified resource.
     *
     * @SWG\Get(
     *     tags={"Invites"},
     *     path="/election/{electionId}/invite/{code}",
     *     operationId="inviteSearch",
     *     summary="Get information about an invite",
     *     @SWG\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         name="code",
     *         in="path",
     *         description="Invite to get",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(ref="#/definitions/Invite")
     *     ),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @param  \App\Invite  $invite
     * @return \Illuminate\Http\Response
     */
    public function show(Election $election, Invite $invite)
    {
        $this->authorize('update', $election);

        return $invite;
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
        $code = $request->json()->get('code');

        $invite = Auth::user()->accept($code);

        $election = $invite->elector->election;

        return redirect()->route(
            'election.invite.show', [
                'election' => $election,
                'invite' => $invite,
            ]
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * * @SWG\Delete(
     *     tags={"Invites"},
     *     path="/election/{electionId}/invite/{code}",
     *     summary="Delete an invite",
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
     *         name="code",
     *         in="path",
     *         description="Invite Code",
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
     * @param  \App\Election  $election
     * @param  \App\Invite  $invite
     * @return \Illuminate\Http\Response
     */
    public function destroy(Election $election, Invite $invite)
    {
        $this->authorize('update', $election);

        $invite->delete();

        return response()->json(new \stdClass());
    }
}
