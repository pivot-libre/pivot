<?php

namespace App\Policies;

use App\Models\Election;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ElectionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the election.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function view(User $user, Election $election)
    {
        return $user->isAdmin($election) || $user->isElector($election);
    }

    /**
     * Determine whether the user can view electors associated with the election.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function view_electors(User $user, Election $election)
    {
        // TODO: should electors be able to see other electors?
        return $user->isAdmin($election) || $user->isElector($election);
    }

    /**
     * Determine whether the user can view the result of the election.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function view_results(User $user, Election $election)
    {
        // TODO: should electors be able to view results?
        return $user->isAdmin($election) || $user->isElector($election);
    }

    /**
     * Determine whether the user can view stats the state voters are in
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function view_voter_stats(User $user, Election $election)
    {
        // TODO: should electors be able to view stats?
        return $user->isAdmin($election) || $user->isElector($election);
    }

    /**
     * Determine whether the user can view voters in the election
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function view_voter_details(User $user, Election $election)
    {
        // TODO: should electors be able to view list of other electors?
        return $user->isAdmin($election);
    }

    /**
     * Determine whether the user can vote on the election.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function vote(User $user, Election $election)
    {
        return $user->isElector($election);
    }
    
    /**
     * Determine whether the user can update the election.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function update(User $user, Election $election)
    {
        return $user->isAdmin($election);
    }

    /**
     * Determine whether the user can delete the election.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Election  $election
     * @return bool
     */
    public function delete(User $user, Election $election)
    {
        return $user->isAdmin($election);
    }
}
