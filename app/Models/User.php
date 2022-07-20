<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use Notifiable;
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    public function elections(): BelongsToMany
    {
        return $this->belongsToMany(Election::class, 'electors');
    }

    public function isAdmin(Election $election) {
        return $election->creator->is($this);
    }

    public function isElector(Election $election): bool
    {
        return $election->electors()->where('user_id', $this->id)->exists();
    }
}
