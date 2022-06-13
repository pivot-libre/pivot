<?php

namespace App\Notifications;

use App\Models\EmailVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    public function __construct(
        private EmailVerification $emailVerification,
    ) {
    }


    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = URL::route('register', [
            'token' => $this->emailVerification->token,
            'email' => $this->emailVerification->email,
        ]);

        return (new MailMessage)
            ->subject('Pivot Libre Email Confirmation')
                ->action('Continue your registration here', $url);
    }
}
