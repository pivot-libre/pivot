<?php

namespace App;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Elector
 *
 * @package App
 * @method self accepted()
 */
class Elector extends Model
{
    public $timestamps = false;

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ranks()
    {
        return $this->hasMany(CandidateRank::class);
    }

    public function scopeAccepted(Builder $query)
    {
        return $query->whereNotNull('invite_accepted_at');
    }
}
