<?php


namespace Tests\Feature;


use App\Election;
use App\Elector;
use App\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ElectorTest extends TestCase
{

    /** @test */
    public function can_get_electors()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Non-accepted invite
        $electorWithoutUser = factory(Elector::class)->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = factory(Elector::class)->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/election/{$election->id}/elector");

        $response->assertStatus(200);
        $electors = $response->getOriginalContent();
        $this->assertCount(1, $electors);
        $this->assertTrue($electorA->is($electors->get(0)));
    }

    /** @test */
    public function can_get_a_specific_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Non-accepted invite
        $electorWithoutUser = factory(Elector::class)->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = factory(Elector::class)->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/election/{$election->id}/elector/{$electorA->id}");

        $response->assertStatus(200);
        $this->assertTrue($electorA->is($response->getOriginalContent()));
    }

    /** @test */
    public function cannot_get_a_specific_elector_where_invite_not_accepted()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Non-accepted invite
        $electorWithoutUser = factory(Elector::class)->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = factory(Elector::class)->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/election/{$election->id}/elector/{$electorWithoutUser->id}");

        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }


    /** @test */
    public function cannot_get_a_specific_elector_which_belongs_to_other_election()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Non-accepted invite
        $electorWithoutUser = factory(Elector::class)->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = factory(Elector::class)->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/election/{$election->id}/elector/{$electorNotInElection->id}");

        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }

}