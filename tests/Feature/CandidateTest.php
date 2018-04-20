<?php


namespace Tests\Feature;


use App\Candidate;
use App\Election;
use App\Elector;
use App\User;
use Carbon\Carbon;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CandidateTest extends TestCase
{
    use DatabaseTransactions;

    /** @test */
    public function cannot_get_a_candidate_if_not_creator_or_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_a_candidate_if_guest()
    {
        $election = factory(Election::class)->create();

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);

        $response = $this->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthenticationException::class, $response->exception);
    }

    /** @test */
    public function can_get_a_candidate_if_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(200);
        $responseCandidate = $response->getOriginalContent();
        $this->assertTrue($candidate->is($responseCandidate));
    }

    /** @test */
    public function can_get_a_candidate_if_creator()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id
        ]);

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(200);
        $responseCandidate = $response->getOriginalContent();
        $this->assertTrue($candidate->is($responseCandidate));
    }


    /** @test */
    public function cannot_get_all_candidates_if_not_creator_or_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        $candidate = factory(Candidate::class)->times(5)->create([
            'election_id' => $election->id
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_all_candidates_if_guest()
    {
        $election = factory(Election::class)->create();


        $response = $this->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthenticationException::class, $response->exception);
    }

    /** @test */
    public function can_get_all_candidates_if_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        $candidates = factory(Candidate::class)->times(5)->create([
            'election_id' => $election->id
        ]);

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(200);
        $responseCandidates = $response->getOriginalContent();

        $this->assertContainsAllModels($candidates, $responseCandidates);
    }

    /** @test */
    public function can_get_all_candidates_if_creator()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id
        ]);

        $candidates = factory(Candidate::class)->times(5)->create([
            'election_id' => $election->id
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates");

        $response->assertStatus(200);
        $responseCandidates = $response->getOriginalContent();

        $this->assertContainsAllModels($candidates, $responseCandidates);
    }

    /** @test */
    public function cannot_get_candidates_in_other_election_if_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();
        $otherElection = factory(Election::class)->create();

        $candidates = factory(Candidate::class)->times(5)->create([
            'election_id' => $election->id
        ]);
        $candidatesInOtherElection = factory(Candidate::class)->times(5)->create([
            'election_id' => $otherElection->id
        ]);

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$otherElection->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_candidates_in_other_election_if_creator()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id
        ]);
        $otherElection = factory(Election::class)->create();

        $candidates = factory(Candidate::class)->times(5)->create([
            'election_id' => $election->id
        ]);
        $candidatesInOtherElection = factory(Candidate::class)->times(5)->create([
            'election_id' => $otherElection->id
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$otherElection->id}/candidates");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_a_candidate_in_other_election_if_creator()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id
        ]);
        $otherElection = factory(Election::class)->create();

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);
        $candidateInOtherElection = factory(Candidate::class)->create([
            'election_id' => $otherElection->id
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$otherElection->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);

        //$this->disableExceptionHandling();

        // Trying to access the other candidate in other election through the election with access to.
        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(404);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }

    /** @test */
    public function cannot_get_a_candidate_in_other_election_if_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();
        $otherElection = factory(Election::class)->create();

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);
        $candidateInOtherElection = factory(Candidate::class)->create([
            'election_id' => $otherElection->id
        ]);

        // Accepted invite
        $electorA = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$otherElection->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);

        // Trying to access the other candidate in other election through the election with access to.
        $response = $this->actingAs($user, 'api')->getJson("api/elections/{$election->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(404);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }

    /** @test */
    public function can_delete_a_candidate_if_creator()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id,
            'ballot_version' => 1
        ]);

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->deleteJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(204);
        $this->assertEquals(2, $election->fresh()->ballot_version);
        $this->assertEmpty($election->candidates);
    }

    /** @test */
    public function cannot_delete_a_candidate_if_elector()
    {
        $user = factory(User::class)->create();
        $election = factory(Election::class)->create();
        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);
        // Accepted invite
        $elector = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->deleteJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertCount(1, $election->fresh()->candidates);
    }

    /** @test */
    public function cannot_delete_a_candidate_if_guest()
    {
        $user = factory(User::class)->create();
        $election = factory(Election::class)->create();
        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->deleteJson("api/elections/{$election->id}/candidates/{$candidate->id}");

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertCount(1, $election->fresh()->candidates);
    }

    /** @test */
    public function cannot_delete_a_candidate_in_other_election_if_has_access()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id
        ]);
        $otherElection = factory(Election::class)->create();

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id
        ]);
        $candidateInOtherElection = factory(Candidate::class)->create([
            'election_id' => $otherElection->id
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->deleteJson("api/elections/{$election->id}/candidates/{$candidateInOtherElection->id}");

        $response->assertStatus(404);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
        $this->assertCount(1, $election->fresh()->candidates);
    }

    /** @test */
    public function can_update_a_candidates_name_if_creator()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id,
            'ballot_version' => 1
        ]);

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [
            'name' => "new name"
        ]);

        $response->assertStatus(204);
        $this->assertEquals(1, $election->fresh()->ballot_version);
        $this->assertEquals("new name", $candidate->fresh()->name);
    }

    /** @test */
    public function cannot_update_a_candidate_if_no_name_is_specified()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id,
            'ballot_version' => 1
        ]);

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [

        ]);

        $response->assertStatus(400);
        $this->assertInstanceOf(ValidationException::class, $response->exception);
        $this->assertEquals(1, $election->fresh()->ballot_version);
        $this->assertEquals("old name", $candidate->fresh()->name);
    }

    /** @test */
    public function cannot_update_a_candidate_if_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'ballot_version' => 1
        ]);

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Accepted invite
        $elector = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [
            'name' => "new name"
        ]);

        $response->assertStatus(400);
        $this->assertEquals(1, $election->fresh()->ballot_version);
        $this->assertEquals("old name", $candidate->fresh()->name);
    }

    /** @test */
    public function cannot_update_a_candidate_if_guest()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'ballot_version' => 1
        ]);

        $candidate = factory(Candidate::class)->create([
            'election_id' => $election->id,
            'name' => "old name",
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->patchJson("api/elections/{$election->id}/candidates/{$candidate->id}", [
            'name' => "new name"
        ]);

        $response->assertStatus(400);
        $this->assertEquals(1, $election->fresh()->ballot_version);
        $this->assertEquals("old name", $candidate->fresh()->name);
    }

    /** @test */
    public function can_create_a_candidate_if_creator()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'creator_id' => $user->id,
            'ballot_version' => 1
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->postJson("api/elections/{$election->id}/candidates", [
            'name' => "new name"
        ]);

        $response->assertStatus(201);
        $this->assertEquals(2, $election->fresh()->ballot_version);
        $this->assertEquals("new name", $response->getOriginalContent()->name);
    }

    /** @test */
    public function cannot_create_a_candidate_if_elector()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'ballot_version' => 1
        ]);

        // Accepted invite
        $elector = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
            'invite_accepted_at' => Carbon::now()
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->postJson("api/elections/{$election->id}/candidates", [
            'name' => "new name"
        ]);

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertEquals(1, $election->fresh()->ballot_version);
    }

    /** @test */
    public function cannot_create_a_candidate_if_guest()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create([
            'ballot_version' => 1
        ]);

        // Trying to access the other candidate in other election through the other election
        $response = $this->actingAs($user, 'api')->postJson("api/elections/{$election->id}/candidates", [
            'name' => "new name"
        ]);

        $response->assertStatus(400);
        $this->assertInstanceOf(AuthorizationException::class, $response->exception);
        $this->assertEquals(1, $election->fresh()->ballot_version);
    }

}