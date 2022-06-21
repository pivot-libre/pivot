<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidateRank extends Model
{
    use HasFactory;

    protected $fillable = ['election_id', 'candidate_id', 'rank', 'elector_id'];

    public function elector()
    {
        return $this->belongsTo('App\Models\Elector');
    }

    public function candidate()
    {
        return $this->belongsTo('App\Models\Candidate');
    }
}
