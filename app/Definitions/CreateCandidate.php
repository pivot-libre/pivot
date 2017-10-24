<?php

namespace App\Definitions;

/**
 * @SWG\Definition(
 *     definition="CreateCandidate",
 *     type="object",
 *     @SWG\Xml(name="CreateCandidate")
 * )
 */
class CreateCandidate
{
    /**
     * @var string
     * @SWG\Property(example="Highland Avenue")
     */
    public $name;
}