<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method self accepted()
 */
class Elector extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public $timestamps = false;

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ranks(): HasMany
    {
        return $this->hasMany(CandidateRank::class);
    }

    public function scopeAccepted(Builder $query)
    {
        return $query->whereNotNull('invite_accepted_at');
    }
}
