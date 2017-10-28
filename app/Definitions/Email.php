<?php

namespace App\Definitions;

/**
 * @SWG\Definition(
 *     definition="Email",
 *     type="object",
 *     @SWG\Xml(name="Email")
 * )
 */
class Email
{
    /**
     * @var string
     * @SWG\Property(example="john.doe@example.com")
     */
    public $email;
}