<?php

namespace App\Definitions;

/**
 * @SWG\Definition(
 *     definition="Candidate",
 *     type="object",
 *     @SWG\Xml(name="Candidate")
 * )
 */
class Candidate
{
    /**
     * @var string
     * @SWG\Property(example="123")
     */
    public $id;

    /**
     * @var string
     * @SWG\Property(example="123")
     */
    public $election_id;

    /**
     * @var string
     * @SWG\Property(example="Funds for road construction")
     */
    public $name;

    /**
     * @var string
     * @SWG\Property(example="2017-01-01 11:00:00")
     */
    public $created_at;

    /**
     * @var string
     * @SWG\Property(example="2017-01-01 11:00:00")
     */
    public $updated_at;
}