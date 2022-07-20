<?php

namespace Tests;

use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Exceptions\Handler;
use Illuminate\Support\Collection;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use LazilyRefreshDatabase;

    protected function assertContainsAllModels(Collection $models, Collection $responseModel)
    {
        $responseModel->each(function (Model $responseModel) use ($models) {
            $contains = $models->contains(fn(Model $model) => $model->is($responseModel));
            $this->assertTrue($contains, "Model [{$responseModel->getKey()}] is not in the collection");
        });
    }

    protected function assertModelIsSame(Model $origin, Model $other)
    {
        $this->assertTrue($origin->is($other), "Models are not equals");
    }
}
