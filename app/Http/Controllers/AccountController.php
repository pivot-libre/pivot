<?php

namespace App\Http\Controllers;

use Mail;
use App\Election;
use App\EmailVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class AccountController extends Controller
{
    public function delete_account(Request $request)
    {
        $user = Auth::user();
        $user->delete();
        // should probably redirect or something
        return response()->json(array("result" => "deleted"));
    }
}
