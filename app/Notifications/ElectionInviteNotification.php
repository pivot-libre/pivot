<?php

namespace App\Notifications;

use App\Models\Election;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ElectionInviteNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Election $election,
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->line("You have been invited to rank options in the {$this->election->name} election.")
            ->action('Vote', route('ballot', ['election' => $this->election->getKey()]))
            ->line('Thank you for using our application!');
    }
}
