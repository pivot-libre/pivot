<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Election;

class GetVoterDetails
{
    public function __invoke(Election $election): array
    {
        $electionId = $election->getKey();

        $stats = [
            "outstanding_invites" => [],
            "approved_none" => [],
            "approved_current" => [],
            "approved_previous" => []
        ];

        $query = Election::query()
            // Convert to base so Election models are not returned.
            ->toBase()
            ->where('elections.id', '=', $electionId)
            ->join('electors', 'elections.id', '=', 'electors.election_id')
            ->leftJoin('users', 'electors.user_id', '=', 'users.id')
            ->select('users.name',
                'users.email',
                'electors.id',
                'electors.voter_name',
                'electors.invite_email',
                'electors.invite_accepted_at',
                'elections.ballot_version',
                'electors.ballot_version_approved');

        foreach ($query->get() as $row) {
            if ($row->invite_accepted_at == null) {
                $key = 'outstanding_invites';
            } else if ($row->ballot_version_approved == null) {
                $key = 'approved_none';
            } else if ($row->ballot_version_approved == $row->ballot_version) {
                $key = 'approved_current';
            } else {
                $key = 'approved_previous';
            }

            $user_name = $row->name;
            $voter_name = $row->voter_name;
            $email = $row->email != null ? $row->email : $row->invite_email;
            $elector_id = $row->id;
            # user_name may be different from voter_name if this is a proxy-voting use case.
            # user_name may be null if the elector hasn't created an
            # account yet.  voter_name will be non null iff user is
            # proxy voting on behalf of voter.
            $elector = [
                "user_name" => $user_name,
                "voter_name" => $voter_name,
                "email" => $email,
                "elector_id" => $elector_id
            ];
            $stats[$key][] = $elector;
        }

        return $stats;
    }

}