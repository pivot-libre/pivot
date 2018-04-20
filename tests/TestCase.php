<?php

namespace Tests;

use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Exceptions\Handler;
use Illuminate\Support\Collection;


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

    protected function assertContainsAllModels(Collection $models, Collection $responseModel)
    {
        $responseModel->each(function (Model $responseModel) use ($models) {
            $contains = $models->contains(function (Model $model) use ($responseModel) {
                return $model->is($responseModel);
            });
            $this->assertTrue($contains, "Model [{$responseModel->getKey()}] is not in the collection");
        });
    }

    protected function assertModelIsSame(Model $origin, Model $other)
    {
        $this->assertTrue($origin->is($other), "Models are not equals");
    }
}
