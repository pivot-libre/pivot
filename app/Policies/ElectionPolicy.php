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
     * @return bool
     */
    public function view(User $user, Election $election)
    {
        return $this->is_admin($election, $user) || $this->is_elector($election, $user);
    }

    /**
     * Determine whether the user can view electors associated with the election.
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
     */
    public function view_electors(User $user, Election $election)
    {
        // TODO: should electors be able to see other electors?
        return $this->is_admin($election, $user) || $this->is_elector($election, $user);
    }

    /**
     * Determine whether the user can update the election.
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
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
     * @return bool
     */
    public function delete(User $user, Election $election)
    {
        return $election->creator->is($user);
    }

    /**
     * Determine whether the user is an election admin
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
     */
    public function is_admin(Election $election, User $user)
    {
        return $election->creator->is($user);
    }

    /**
     * Determine whether the user is an election admin
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
     */
    public function is_elector(Election $election, User $user)
    {
        return $election->electors->contains($user);
    }
}
