<?php

namespace App\Definitions;

use OpenApi\Attributes\Schema;

#[Schema(
    schema: "User",
    type: "object",
)]
class User
{
    /**
     * @var string
     * @OA\Property(example="123")
     */
    public $id;

    /**
     * @var string
     * @OA\Property(example="John Doe")
     */
    public $name;

    /**
     * @var string
     * @OA\Property(example="john.doe@example.com")
     */
    public $email;

    /**
     * @var string
     * @OA\Property(example="2017-01-01 11:00:00")
     */
    public $created_at;

    /**
     * @var string
     * @OA\Property(example="2017-01-01 11:00:00")
     */
    public $updated_at;
}