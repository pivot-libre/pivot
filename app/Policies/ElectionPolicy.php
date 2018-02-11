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
     * Determine whether the user can view the result of the election.
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
     */
    public function view_results(User $user, Election $election)
    {
        // TODO: should electors be able to view results?
        return $this->is_admin($election, $user) || $this->is_elector($election, $user);
    }

    /**
     * Determine whether the user can vote on the election.
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
     */
    public function vote(User $user, Election $election)
    {
        return $this->is_elector($election, $user);
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
        return $this->is_admin($election, $user);
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
        return $this->is_admin($election, $user);
    }

    /**
     * Determine whether the user can join the election as an elector
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
     */
    public function become_elector(User $user, Election $election)
    {
        return $this->is_invited($election, $user);
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

    /**
     * Determine whether the user is invited to the election
     *
     * @param  \App\User  $user
     * @param  \App\Election  $election
     * @return bool
     */
    public function is_invited(Election $election, User $user)
    {
        foreach ($user->acceptable() as $invite) {
            if ($invite->elector->election->id == $election->id) {
                return true;
            }
        }
        return false;
    }
}
