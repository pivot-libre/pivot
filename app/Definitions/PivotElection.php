<?php

namespace App\Definitions;

/**
 * @SWG\Definition(
 *     definition="PivotElection",
 *     type="object",
 *     @SWG\Xml(name="PivotElection")
 * )
 */
class PivotElection
{
    /**
     * @var string
     * @SWG\Property(example="123")
     */
    public $election_id;

    /**
     * @var string
     * @SWG\Property(example="123")
     */
    public $invite_id;
}