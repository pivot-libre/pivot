<?php

namespace App\Definitions;

use OpenApi\Attributes\Schema;

#[Schema(
    schema: "PivotElection",
    type: "object",
)]
class PivotElection
{
    /**
     * @var string
     * @OA\Property(example="123")
     */
    public $election_id;

    /**
     * @var string
     * @OA\Property(example="123")
     */
    public $invite_id;
}