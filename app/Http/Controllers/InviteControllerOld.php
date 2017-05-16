<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptInviteRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class InviteController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth', ['except' => ['accept']]);
    }

    /**
     * Show the invite accept form.
     *
     * @return \Illuminate\Http\Response
     */
    public function accept(Request $request)
    {
        $invite = $request->input('invite', Session::get('invite', ''));
        $user = Auth::user();
        if (empty($user)) {
            return redirect()->route('register', ['invite' => $invite]);
        }
        return view('invite.accept', ['invite' => $invite]);
    }

    /**
     * Associate user with invited elector
     *
     * @return \Illuminate\Http\Response
     */
    public function associate(AcceptInviteRequest $request)
    {
        $invite = $request->input('invite', '');
        if (empty($invite)) {
            // Show error
            die("Invite code required\n");
        }

        die("Invite code: {$invite}\n");
    }
}
