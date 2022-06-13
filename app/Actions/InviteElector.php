<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Election;
use App\Models\Elector;
use App\Notifications\ElectionInviteNotification;
use Illuminate\Support\Facades\Notification;

class InviteElector
{
    public function __invoke(
        Election $election,
        string $voteEmail,
        string|null $voteName,
    ): Elector
    {
        /** @var Elector $elector */
        $elector = $election->electors()->firstOrCreate([
            'invite_email' => $voteEmail,
            'voter_name' => $voteName,
        ]);

        if ($elector->wasRecentlyCreated) {
            Notification::route('mail', $voteEmail)
                ->notifyNow(new ElectionInviteNotification($election));
        }

        return $elector;
    }
}