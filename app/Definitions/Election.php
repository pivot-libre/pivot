<?php

namespace app\Definitions;

/**
 * @SWG\Definition(
 *     definition="Election",
 *     type="object",
 *     @SWG\Xml(name="Election")
 * )
 */
class Election
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
    public $creator_id;

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

    /**
     * @var string
     * @SWG\Property(example="2017-01-01 11:00:00")
     */
    public $deleted_at;
}

/**
 * @SWG\Definition(
 *     definition="ElectionWithCreator",
 *     type="object",
 *     @SWG\Xml(name="ElectionWithCreator")
 * )
 */
class ElectionWithCreator
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
    public $creator_id;

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

    /**
     * @var string
     * @SWG\Property(example="2017-01-01 11:00:00")
     */
    public $deleted_at;

    /**
     * @var User
     * @SWG\Property()
     */
    public $creator;
}

/**
 * @SWG\Definition(
 *     definition="User",
 *     type="object",
 *     @SWG\Xml(name="User")
 * )
 */
class User
{
    /**
     * @var string
     * @SWG\Property(example="123")
     */
    public $id;

    /**
     * @var string
     * @SWG\Property(example="John Doe")
     */
    public $name;

    /**
     * @var string
     * @SWG\Property(example="john.doe@example.com")
     */
    public $email;

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
