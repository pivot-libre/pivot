<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultSnapshot extends Model
{
    protected $casts = [
        'result_blob' => 'array'
    ];

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }
}
