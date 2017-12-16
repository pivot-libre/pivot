<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SimpleElectionTest extends TestCase
{
    use DatabaseMigrations;
    use WithoutMiddleware;

    public function setUp() {
        parent::setUp();
        $this->user = factory(\App\User::class)->create();
    }

    /**
     * A basic test example.
     *
     * @return void
     */
    public function testExample()
    {
        $response = $this->actingAs($this->user)
            ->withSession(['foo' => 'bar'])
            ->get('/');
        $response->assertStatus(200);
    }
    public function createElection($electionName)
    {
        $storeRoute = route('election.store');
        $response = $this->actingAs($this->user)
            ->json('POST', '/api/election', [
               'name' => $electionName 
           ]);

        return $response;
    }
        
    public function testCreateElection()
    {
        $response = $this->createElection('myElection');
        $response->assertStatus(201);
        $response->assertHeader('Location');
    }

    public function addCandidate($candidateId, $candidateName = '')
    {

    }
}
