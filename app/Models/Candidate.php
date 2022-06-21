<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

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
