<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class ProfileController extends Controller
{
    /**
     * Show the application dashboard.
     */
    public function index()
    {
        return view('profile');
    }

    /**
     * Show the invite accept form.
     */
    public function accept(Request $request)
    {
        $invite = $request->input('invite', Session::get('invite', ''));

        $user = Auth::user();
        if (empty($user)) {
            Session::push('invite', $invite);
            return redirect()->route('login');
        }

        return view('invite.accept', ['invite' => $invite]);
    }

    /**
     * Greet user who created a new account.
     */
    public function new_account()
    {
        return view('new_account');
    }
}
