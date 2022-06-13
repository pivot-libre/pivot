<?php

namespace App\Http\Controllers;

use App\Models\EmailVerification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

class VerifyController extends Controller
{
    public function send_verify_email(Request $request)
    {
        // don't even try if the mail driver is not configured
        if (config('mail.default') === null) {
            return 'mail driver not configured';
        }

        $email = $request->json()->get('email');

        $verification = EmailVerification::where(['email' => $email])->first();
        if (empty($verification))
        {
            $verification = new EmailVerification();
            $verification->email = $email;
        }
        $verification->token = bin2hex(random_bytes(32));
        $verification->save();

        Notification::route('mail', $verification->email)
            ->notifyNow(new VerifyEmailNotification($verification));

        return 'confirmation email sent';
    }
}
