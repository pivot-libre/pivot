<?php

namespace App\Definitions;

/**
 * @SWG\Definition(
 *     definition="InviteWithElection",
 *     type="object",
 *     @SWG\Xml(name="InviteWithElection")
 * )
 */
class InviteWithElection
{
    /**
     * @var string
     * @SWG\Property(example="123")
     */
    public $id;

    /**
     * @var string
     * @SWG\Property(example="12345678")
     */
    public $code;

    /**
     * @var string
     * @SWG\Property(example="john.doe@example.com")
     */
    public $email;

    /**
     * @var string
     * @SWG\Property(example="2017-01-01 11:00:00")
     */
    public $accepted_at;

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

    /**
     * @var PivotElection
     * @SWG\Property()
     */
    public $pivot;
}