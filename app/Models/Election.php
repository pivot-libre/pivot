<?php

namespace App\Models;

use App\Notifications\ElectionInviteNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate as TidemanCandidate;
use PivotLibre\Tideman\CandidateList;
use PivotLibre\Tideman\NBallot;
use PivotLibre\Tideman\RankedPairsCalculator;

/**
 * @property Collection<int, Elector> $electors
 * @property string $name
 */
class Election extends Model
{
    use SoftDeletes;
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = ['name'];

    protected $casts = [
        'config' => 'array'
    ];

    /**
     * The attributes that should be mutated to dates.
     */
    protected $dates = ['deleted_at'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function electors(): HasMany
    {
        return $this->hasMany(Elector::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    public function result_snapshots(): HasMany
    {
        return $this->hasMany(ResultSnapshot::class);
    }

    public function get_config_value($key, $default_value) {
        $config = $this->config;
        if (is_null($config) || !array_key_exists($key, $config)) {
            return $default_value;
        }
        return $config[$key];
    }
}
