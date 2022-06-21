<?php


namespace Tests\Feature;


use App\Models\Candidate;
use App\Models\Election;
use App\Models\Elector;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class ElectionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_get_a_election()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        /** @var Elector $elector */
        $elector = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
        ]);

        Passport::actingAs($user);
        $response = $this->getJson("api/elections/{$election->id}");

        $response->assertStatus(200);
        $this->assertInstanceOf(Election::class, $response->getOriginalContent());
    }

    /** @test */
    public function can_batch_vote()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        /** @var Elector $elector */
        $elector = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
        ]);

        $candidateA = Candidate::factory()->create([
            'name' => 'candidate-A',
            'election_id' => $election->id,
        ]);
        $candidateB = Candidate::factory()->create([
            'name' => 'candidate-B',
            'election_id' => $election->id,
        ]);
        $candidateC = Candidate::factory()->create([
            'name' => 'candidate-C',
            'election_id' => $election->id,
        ]);

        $this->assertEquals(0, $elector->ranks()->count());
        Passport::actingAs($user);

        $response = $this->postJson("api/elections/{$election->id}/batchvote", [
            'votes' => [
                [
                    'candidate_id' => $candidateA->id,
                    'rank' => 2,
                ],
                [
                    'candidate_id' => $candidateB->id,
                    'rank' => 1,
                ],
                [
                    'candidate_id' => $candidateC->id,
                    'rank' => 3,
                ],
            ],
            'elector_id' => $elector->id,
        ]);

        $response->assertStatus(200);
        $this->assertEquals(3, $elector->ranks()->count());
    }

    /** @test */
    public function cannot_batch_vote_if_invalid_election_id()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        $candidateA = Candidate::factory()->create([
            'name' => 'candidate-A',
        ]);

        $invalidElectionId = $election->id + 9999;

        $elector = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
        ]);

        Passport::actingAs($user);

        $response = $this->postJson("api/elections/{$invalidElectionId}/batchvote", [
            'votes' => [
                [
                    'candidate_id' => $candidateA->id,
                    'rank' => 2,
                ],
            ],
            'elector_id' => $elector->id,
        ]);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }

    /** @test */
    public function cannot_batch_vote_if_not_authenticated()
    {
        $user = User::factory()->create();

        $election = Election::factory()->create();

        $elector = Elector::factory()->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
        ]);

        $candidateA = Candidate::factory()->create([
            'name' => 'candidate-A',
        ]);

        $invalidElectionId = $election->id + 9999;
        $response = $this->postJson("api/elections/{$invalidElectionId}/batchvote", [
            'votes' => [
                [
                    'candidate_id' => $candidateA->id,
                    'rank' => 2,
                ],
            ],
            'elector_id' => $elector->id,
        ]);

        $this->assertInstanceOf(AuthenticationException::class, $response->exception);
    }
}