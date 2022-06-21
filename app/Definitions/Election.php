<?php

namespace App\Definitions;

use OpenApi\Attributes\Schema;

#[Schema(
    schema: "Election",
    type: "object",
)]
class Election
{
    /**
     * @var string
     * @OA\Property(example="123")
     */
    public $id;

    /**
     * @var string
     * @OA\Property(example="123")
     */
    public $creator_id;

    /**
     * @var string
     * @OA\Property(example="Funds for road construction")
     */
    public $name;

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

    /**
     * @var string
     * @OA\Property(example="2017-01-01 11:00:00")
     */
    public $deleted_at;
}