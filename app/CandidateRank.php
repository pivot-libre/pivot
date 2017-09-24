<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CandidateRank extends Model
{
    protected $fillable = ['election_id', 'candidate_id'];

    public function elector()
    {
        return $this->belongsTo('App\Elector');
    }

    public function candidate()
    {
        return $this->belongsTo('App\Candidate');
    }
}
