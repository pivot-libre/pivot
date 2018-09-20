<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Util\ResultSnapshotViewConverter;


class ResultSnapshotViewConverterTest extends TestCase
{
    private $instance;
    public function setUp() {
        parent::setUp();
        $this->instance = new ResultSnapshotViewConverter();
    }
    /**
     * A basic test example.
     *
     * @return void
     */
    public function testConvertPairsToMap()
    {
        $pairs = [
            [
                'name' => 'alice',
                'id' => 'a',
                'something' => 'irrelevant'
            ],
            [
                'name' => 'bob',
                'id' => 'b',
                'another' => 'irrelenvant value'
            ]
        ];


        $actual = $this->instance->convertPairsToMap($pairs, 'id', 'name');
        $expected = [
            'a' => 'alice',
            'b' => 'bob'
        ];
        throw new Exception('baaaaaa');
        $this->assertEquals($expected, $actual);
    }
}
