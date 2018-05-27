<?php

namespace App;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ResultSnapshot extends Model
{
    protected $casts = [
        'result_blob' => 'array'
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }
}
