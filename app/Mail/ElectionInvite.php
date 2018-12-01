<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ElectionInvite extends Mailable
{
    use Queueable, SerializesModels;
    protected $election;
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Election $election)
    {
        $this->electionId = $election;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->markdown('emails.election.invite')->with([
            'electionId' => $this->election->getId(),
            'electionName' => $this->election->getName(),
            'appUrl' => Config::get('app.url')
        ]);
    }
}
