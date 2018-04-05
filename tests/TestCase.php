<?php

namespace Tests;

use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Exceptions\Handler;


abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function disableExceptionHandling()
    {
        app()->instance(ExceptionHandler::class, new class extends Handler {
            public function __construct() {
            }
            public function report(\Exception $e)
            {
                // no-op
            }
            public function render($request, \Exception $e)
            {
                throw $e;
            }
        });
    }
}
