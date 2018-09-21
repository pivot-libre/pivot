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
        $this->assertEquals($expected, $actual);
    }

    public function testConvertTieBreakerWithTotallyOrderedBallot() : void
    {
        //totally ordered
        $tieBreakerString = 'A>C>B';
        $candidateIdPairs = [
            [
                'id' => 'A',
                'name' => 'Alice'
            ],
            [
                'id' => 'B',
                'name' => 'Bob'
            ],
            [
                'id' => 'C',
                'name' => 'Claire'
            ]
        ];
        $actual = $this->instance->convertTieBreaker($tieBreakerString, $candidateIdPairs);
        $expected = [
            [
                [
                    'id' => 'A',
                    'name' => 'Alice'
                ]
            ],
            [
                [
                    'id' => 'C',
                    'name' => 'Claire'
                ]
            ],
            [
                [
                    'id' => 'B',
                    'name' => 'Bob'
                ]
            ]
        ];
        $this->assertEquals($expected, $actual);
    }
    public function testConvertTieBreakerWithPartiallyOrderedBallot() : void
    {
        //partially ordered
        $tieBreakerString = 'A>C=B';
        $candidateIdPairs = [
            [
                'id' => 'A',
                'name' => 'Alice'
            ],
            [
                'id' => 'B',
                'name' => 'Bob'
            ],
            [
                'id' => 'C',
                'name' => 'Claire'
            ]
        ];
        $actual = $this->instance->convertTieBreaker($tieBreakerString, $candidateIdPairs);
        $expected = [
            [
                [
                    'id' => 'A',
                    'name' => 'Alice'
                ]
            ],
            [
                [
                    'id' => 'C',
                    'name' => 'Claire'
                ],
                [
                    'id' => 'B',
                    'name' => 'Bob'
                ]
            ]
        ];
        $this->assertEquals($expected, $actual);
    }

}
