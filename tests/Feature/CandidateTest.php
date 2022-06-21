<?php


namespace Tests\Feature;


use App\Models\Candidate;
use App\Models\Election;
use App\Models\Elector;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Laravel\Passport\Passport;
use Tests\TestCase;

class CandidateTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function cannot_get_a_candidate_if_not_creator_or_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_a_candidate_if_guest()
    {
        $election = Election::factory()->create();

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);

        $response = $this->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthenticationException::class, $response->exception);
    }

    /** @test */
    public function can_get_a_candidate_if_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(200);
        $responseCandidate = $response->getOriginalContent();
        $this->assertTrue($candidate->is($responseCandidate));
    }

    /** @test */
    public function can_get_a_candidate_if_creator()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(200);
        $responseCandidate = $response->getOriginalContent();
        $this->assertTrue($candidate->is($responseCandidate));
    }


    /** @test */
    public function cannot_get_all_candidates_if_not_creator_or_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        $candidate = Candidate::factory()->times(5)->create([
            'election_id' => $election->id,
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_all_candidates_if_guest()
    {
        $election = Election::factory()->create();


        $response = $this->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthenticationException::class, $response->exception);
    }

    /** @test */
    public function can_get_all_candidates_if_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        $candidates = Candidate::factory()->times(5)->create([
            'election_id' => $election->id,
        ]);

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(200);
        $responseCandidates = $response->getOriginalContent();

        $this->assertContainsAllModels($candidates, $responseCandidates);
    }

    /** @test */
    public function can_get_all_candidates_if_creator()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
        ]);

        $candidates = Candidate::factory()->times(5)->create([
            'election_id' => $election->id,
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(200);
        $responseCandidates = $response->getOriginalContent();

        $this->assertContainsAllModels($candidates, $responseCandidates);
    }

    /** @test */
    public function cannot_get_candidates_in_other_election_if_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();
        $otherElection = Election::factory()->create();

        $candidates = Candidate::factory()->times(5)->create([
            'election_id' => $election->id,
        ]);
        $candidatesInOtherElection = Candidate::factory()->times(5)->create([
            'election_id' => $otherElection->id,
        ]);

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$otherElection->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_candidates_in_other_election_if_creator()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
        ]);
        $otherElection = Election::factory()->create();

        $candidates = Candidate::factory()->times(5)->create([
            'election_id' => $election->id,
        ]);
        $candidatesInOtherElection = Candidate::factory()->times(5)->create([
            'election_id' => $otherElection->id,
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$otherElection->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_a_candidate_in_other_election_if_creator()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
        ]);
        $otherElection = Election::factory()->create();

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);
        $candidateInOtherElection = Candidate::factory()->create([
            'election_id' => $otherElection->id,
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$otherElection->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);

        //$this->disableExceptionHandling();

        // Trying to access the other candidate in other election through the election with access to.
        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(404);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_a_candidate_in_other_election_if_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();
        $otherElection = Election::factory()->create();

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);
        $candidateInOtherElection = Candidate::factory()->create([
            'election_id' => $otherElection->id,
        ]);

        // Accepted invite
        $electorA = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$otherElection->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);

        // Trying to access the other candidate in other election through the election with access to.
        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(404);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }

    /** @test */
    public function can_delete_a_candidate_if_creator()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
            'ballot_version' => 1,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->deleteJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(204);
        $this->assertEquals(2, $election->fresh()->ballot_version);
        $this->assertEmpty($election->candidates);
    }

    /** @test */
    public function cannot_delete_a_candidate_if_elector()
    {
        $user = User::factory()->create();
        $election = Election::factory()->create();
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);
        // Accepted invite
        $elector = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->deleteJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertCount(1, $election->fresh()->candidates);
    }

    /** @test */
    public function cannot_delete_a_candidate_if_guest()
    {
        $user = User::factory()->create();
        $election = Election::factory()->create();
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->deleteJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertCount(1, $election->fresh()->candidates);
    }

    /** @test */
    public function cannot_delete_a_candidate_in_other_election_if_has_access()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
        ]);
        $otherElection = Election::factory()->create();

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
        ]);
        $candidateInOtherElection = Candidate::factory()->create([
            'election_id' => $otherElection->id,
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->deleteJson("api/elections/{$election->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(404);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
        $this->assertCount(1, $election->fresh()->candidates);
    }

    /** @test */
    public function can_update_a_candidates_name_if_creator()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
            'ballot_version' => 1,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [
            'name' => "new name",
        ]);

        $response->assertStatus(204);

        // The edit should have bumped the ballot version number
        $this->assertEquals(2, $election->fresh()->ballot_version);
        $this->assertEquals("new name", $candidate->fresh()->name);
    }

    /** @test */
    public function cannot_update_a_candidate_if_no_name_is_specified()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
            'ballot_version' => 1,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [

        ]);

        $response->assertStatus(400);
        $this->assertInstanceOf(ValidationException::class, $response->exception);
        $this->assertEquals(1, $election->fresh()->ballot_version);
        $this->assertEquals("old name", $candidate->fresh()->name);
    }

    /** @test */
    public function cannot_update_a_candidate_if_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'ballot_version' => 1,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Accepted invite
        $elector = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [
            'name' => "new name",
        ]);

        $response->assertStatus(400);
        $this->assertEquals(1, $election->fresh()->ballot_version);
        $this->assertEquals("old name", $candidate->fresh()->name);
    }

    /** @test */
    public function cannot_update_a_candidate_if_guest()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'ballot_version' => 1,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [
            'name' => "new name",
        ]);

        $response->assertStatus(400);
        $this->assertEquals(1, $election->fresh()->ballot_version);
        $this->assertEquals("old name", $candidate->fresh()->name);
    }

    /** @test */
    public function can_create_a_candidate_if_creator()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'creator_id' => $user->id,
            'ballot_version' => 1,
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->postJson("api/elections/{$election->id}/candidates", [
            'name' => "new name",
        ]);

        $response->assertStatus(201);
        $this->assertEquals(2, $election->fresh()->ballot_version);
        $this->assertEquals("new name", $response->getOriginalContent()->name);
    }

    /** @test */
    public function cannot_create_a_candidate_if_elector()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'ballot_version' => 1,
        ]);

        // Accepted invite
        $elector = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now(),
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->postJson("api/elections/{$election->id}/candidates", [
            'name' => "new name",
        ]);

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertEquals(1, $election->fresh()->ballot_version);
    }

    /** @test */
    public function cannot_create_a_candidate_if_guest()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create([
            'ballot_version' => 1,
        ]);

        // Trying to access the other candidate in other election through the other election
        Passport::actingAs($user);
        $response = $this->postJson("api/elections/{$election->id}/candidates", [
            'name' => "new name",
        ]);

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertEquals(1, $election->fresh()->ballot_version);
    }

}