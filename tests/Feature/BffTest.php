<?php

namespace Tests\Feature;

use Tests\TestCase;

class BffTest extends TestCase
{
    public function testBffFormDoesNotRequireAuth()
    {
        $response = $this->call('GET', '/open/try');
        $this->assertEquals(200, $response->status());
    }
    
    public function testBffAPIWorksWithoutAuth()
    {
        $ballot = 'A>B>C';
        $response = $this->call('POST', '/open/try', ['ballots' => $ballot, 'tieBreaker'=> $ballot]);
        $this->assertEquals(200, $response->status());
        $this->assertEquals($ballot, $response->content());
    }
    
}
