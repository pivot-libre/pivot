<?php

namespace App\Definitions;

use OpenApi\Attributes\Schema;

#[Schema(
    schema: "Code",
    type: "object",
)]
class Code
{
    /**
     * @var string
     * @OA\Property(example="12345678")
     */
    public $code;
}