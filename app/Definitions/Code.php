<?php

namespace App\Definitions;

/**
 * @SWG\Definition(
 *     definition="Code",
 *     type="object",
 *     @SWG\Xml(name="Code")
 * )
 */
class Code
{
    /**
     * @var string
     * @SWG\Property(example="12345678")
     */
    public $code;
}