<?php

namespace App\Definitions;

use OpenApi\Attributes\Schema;

#[Schema(
    schema: "CreateCandidate",
    type: "object",
)]
class CreateCandidate
{
    /**
     * @var string
     * @OA\Property(example="Highland Avenue")
     */
    public $name;
}