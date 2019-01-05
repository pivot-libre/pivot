<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Election;
use App\Config;

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
        $this->election = $election;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $viewParams = [
            'electionName' => $this->election->name,
            'appUrl' => config('app.url'),
            'appName' => config('app.name'),
            'ballotUrl' => route('ballot', ['election' => $this->election->id])
        ];

        return $this->markdown('emails.elections.invite')->with($viewParams);
    }
}
