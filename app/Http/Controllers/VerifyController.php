<?php

namespace App\Http\Controllers;

use Mail;
use App\Election;
use App\Invite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyController extends Controller
{
    public function __construct()
    {
        $this->middleware('web');
    }

    public function send_verify_email(Request $request)
    {
        // don't even try if the mail driver is not configured
        if (env('MAIL_DRIVER', null) == null) {
            return 'mail driver not configured';
        }

        try {
            // TODO: send a real code
            $msg = 'Your Pivot Libre code is XXXX-XXXX-XXXX-XXXX';

            $email = $request->json()->get('email');
            Mail::raw($msg, function ($message) use ($email) {
                $name = $email;
                $message->to($email, $name)->subject('Pivot Libre Email Confirmation');
            });
            return 'confirmation email sent';
        } catch(\Exception $e) {
            return $e->getMessage();
        }
    }
}
