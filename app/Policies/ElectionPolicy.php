<?php

namespace App\Policies;

use App\User;
use App\Election;
use Illuminate\Auth\Access\HandlesAuthorization;

class ElectionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the election.
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return mixed
     */
    public function view(User $user, Election $election)
    {
        return $election->creator->is($user) || $election->electors->contains($user);
    }

    /**
     * Determine whether the user can create elections.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can update the election.
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return mixed
     */
    public function update(User $user, Election $election)
    {
        return $election->creator->is($user);
    }

    /**
     * Determine whether the user can delete the election.
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return mixed
     */
    public function delete(User $user, Election $election)
    {
        return $election->creator->is($user);
    }
}
