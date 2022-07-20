<?php


namespace Tests\Feature;


use App\Models\Election;
use App\Models\Elector;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Laravel\Passport\Passport;
use Tests\TestCase;

class ElectorTest extends TestCase
{
    /** @test */
    public function can_get_electors()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Non-accepted invite
        $electorWithoutUser = Elector::factory()->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = Elector::factory()->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/electors");

        $response->assertStatus(200);
        $electors = $response->getOriginalContent();
        $this->assertCount(1, $electors);
        $this->assertTrue($electorA->is($electors->get(0)));
    }

    /** @test */
    public function can_get_a_specific_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Non-accepted invite
        $electorWithoutUser = Elector::factory()->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = Elector::factory()->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/electors/{$electorA->id}");

        $response->assertStatus(200);
        $this->assertTrue($electorA->is($response->getOriginalContent()));
    }

    /** @test */
    public function cannot_get_a_specific_elector_where_invite_not_accepted()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Non-accepted invite
        $electorWithoutUser = Elector::factory()->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = Elector::factory()->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/electors/{$electorWithoutUser->id}");

        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }


    /** @test */
    public function cannot_get_a_specific_elector_which_belongs_to_other_election()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Non-accepted invite
        $electorWithoutUser = Elector::factory()->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite, but in other election.
        $electorNotInElection = Elector::factory()->create([
            'user_id' => $user->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/electors/{$electorNotInElection->id}");

        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }

}