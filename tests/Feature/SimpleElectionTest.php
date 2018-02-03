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

    public function assertNewEntity($response)
    {
        $response->assertStatus(201);
        $response->assertHeader('Location');
    }
    
    public function getNewEntity($response) {
        
        $newEntityUrl = $response->headers->get('Location');
        $response = $this->actingAs($this->user)
            ->json('GET', $newEntityUrl);
        $response->assertStatus(200);
        $objects = $response->decodeResponseJson();
        return $objects;
    }
    
    public function createElection($electionName)
    {
        $storeRoute = route('election.store');
        $response = $this->actingAs($this->user)
            ->json('POST', '/api/election', [
               'name' => $electionName 
           ]);
        $this->assertNewEntity($response);
        $election = $this->getNewEntity($response);
        
        return $election;
    }
   
    public function addCandidate($candidateName, $electionId)
    {
        $response = $this->actingAs($this->user)
            ->json('POST', "/api/election/$electionId/candidate", [
                'name' => $candidateName
            ]);

        $this->assertNewEntity($response);
        $candidate = $this->getNewEntity($response);
        return $candidate;
    }

    public function testSimpleElection()
    {
        $election = $this->createElection('myElection')[0];
        $electionId = $election['id'];
        $candidateName = 'Alice';
        $candidate = $this->addCandidate($candidateName, $electionId);
        $this->assertNotEmpty($candidate);
    }
}
