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
