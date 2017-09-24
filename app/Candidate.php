<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    public function election()
    {
        return $this->belongsTo('App\Election');
    }

    public function ranks()
    {
        return $this->hasMany('App\CandidateRank');
    }
}
