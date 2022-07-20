<?php

namespace App\Http\Controllers;

use App\Actions\InviteElector;
use App\Models\Election;
use App\Models\Elector;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes\MediaType;
use OpenApi\Attributes\RequestBody;

class InviteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     tags={"Invites"},
     *     path="/api/elections/{electionId}/invite",
     *     summary="View electors who have not accepted their invite yet",
     *     operationId="inviteIndex",
     *     @OA\Parameter(
     *         name="electionId",
     *         in="path",
     *         description="Election to get",
     *         required=true,
     *         @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(response="200", description="Success", @OA\Schema(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/InviteWithElection")
     *         )),
     *     @OA\Response(response="400", description="Bad Request")
     * )
     */
    public function index(Election $election)
    {
        $this->authorize('update', $election);

        return $election->electors()->whereNull('invite_accepted_at')->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @OA\Post(
     *     tags={"Invites"},
     *     path="/api/elections/{electionId}/invite",
     *     summary="Send an invite",
     *     operationId="createInvite",
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
     *         description="Email to invite",
     *         required=true,
     *         @OA\Schema(ref="#/components/schemas/Email")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\Schema(ref="#/components/schemas/Invite")
     *     ),
     *     @OA\Response(
     *         response="400",
     *         description="Bad Request",
     *     )
     * )
     */
    public function store(
        Request $request,
        Election $election,
        InviteElector $inviteElector
    ) {
        $this->authorize('update', $election);

        $email = $request->json()->get('email');
        $voterName = $request->json()->get('voter_name');

        return $inviteElector(
            $election,
            $email,
            $voterName,
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @OA\Post(
     *     tags={"Invites"},
     *     path="/api/invite/accept",
     *     summary="Accept an invite",
     *     operationId="acceptInvite",
     *     @OA\Parameter(
     *         name="payload",
     *         in="query",
     *         description="Code to accept an invite",
     *         required=true,
     *         @OA\Schema(ref="#/components/schemas/Code")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\Schema(ref="#/components/schemas/Invite")
     *     ),
     *     @OA\Response(
     *         response="400",
     *         description="Bad Request",
     *     )
     * )
     */
    public function accept(Request $request)
    {
        // auth note: if an elector exists for the given election with
        // invite_email matching the user's email, then the user has
        // the right to accept the "invite"

        # TODO(tylerharter): clean this up?  Putting elector_id in "code" variable is silly
        $elector_id = (int)$request->json()->get('code');
        $user = Auth::user();
        $email = $user->email;

        $elector = Elector::where('invite_email', $email)->where('id', $elector_id)->firstOrFail();

        if ($elector->invite_accepted_at == null)
        {
            $elector->user()->associate($user);
            $elector->invite_accepted_at = Carbon::now();
            $elector->save();
        }

        # hack, because eloquent reformats dates after a save
        $elector = Elector::find($elector_id);
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
            $code = (string)$elector->id;
            $row = array("election_name" => $election->name,
                         "election_id" => $election->id,
                         "code" => $code);
            $results[$code] = $row;
        }

        return array_values($results);
    }
}
