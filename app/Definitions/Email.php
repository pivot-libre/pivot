<?php

namespace App\Definitions;

use OpenApi\Attributes\Schema;

#[Schema(
    schema: "Email",
    type: "object",
)]
class Email
{
    /**
     * @var string
     * @OA\Property(example="john.doe@example.com")
     */
    public $email;
}