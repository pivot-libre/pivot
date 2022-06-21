<?php

namespace App\Definitions;

use OpenApi\Attributes\Schema;

#[Schema(
    schema: "Invite",
    type: "object",
)]
class Invite
{
    /**
     * @var string
     * @OA\Property(example="123")
     */
    public $id;

    /**
     * @var string
     * @OA\Property(example="12345678")
     */
    public $code;

    /**
     * @var string
     * @OA\Property(example="john.doe@example.com")
     */
    public $email;

    /**
     * @var string
     * @OA\Property(example="2017-01-01 11:00:00")
     */
    public $accepted_at;

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