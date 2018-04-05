<?php


namespace Tests\Feature;


use App\Candidate;
use App\Election;
use App\Elector;
use App\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ElectionTest extends TestCase
{
    use DatabaseTransactions;

    /** @test */
    public function can_get_a_election()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        /** @var Elector $elector */
        $elector = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
        ]);

        $response = $this->actingAs($user, 'api')->getJson("api/election/{$election->id}");

        $response->assertStatus(200);
        $this->assertInstanceOf(Election::class, $response->getOriginalContent());
    }

    /** @test */
    public function can_batch_vote()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        /** @var Elector $elector */
        $elector = factory(Elector::class)->create([
            'user_id' => $user->id,
            'election_id' => $election->id,
        ]);

        $candidateA = factory(Candidate::class)->create([
            'name' => 'candidate-A',
            'election_id' => $election->id,
        ]);
        $candidateB = factory(Candidate::class)->create([
            'name' => 'candidate-B',
            'election_id' => $election->id,
        ]);
        $candidateC = factory(Candidate::class)->create([
            'name' => 'candidate-C',
            'election_id' => $election->id,
        ]);

        $this->assertEquals(0, $elector->ranks()->count());
        $response = $this->actingAs($user, 'api')->postJson("api/election/{$election->id}/batchvote", [
            'votes' => [
                [
                    'candidate_id' => $candidateA->id,
                    'rank' => 2
                ],
                [
                    'candidate_id' => $candidateB->id,
                    'rank' => 1
                ],
                [
                    'candidate_id' => $candidateC->id,
                    'rank' => 3
                ]
            ]
        ]);

        $response->assertStatus(200);
        $this->assertEquals(3, $elector->ranks()->count());
    }

    /** @test */
    public function cannot_batch_vote_if_invalid_election_id()
    {
        $user = factory(User::class)->create();

        $election = factory(Election::class)->create();

        $candidateA = factory(Candidate::class)->create([
            'name' => 'candidate-A'
        ]);

        $invalidElectionId = $election->id + 9999;
        $response = $this->actingAs($user, 'api')->postJson("api/election/{$invalidElectionId}/batchvote", [
            'votes' => [
                [
                    'candidate_id' => $candidateA->id,
                    'rank' => 2
                ],
            ]
        ]);
        $this->assertInstanceOf(ModelNotFoundException::class, $response->exception);
    }
}