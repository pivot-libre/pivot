<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $fillable = [
        'name'
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function ranks()
    {
        return $this->hasMany(CandidateRank::class);
    }

    // TODO: allow admin to specify candidate order
}
