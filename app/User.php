<?php

namespace App;

use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    public function elections()
    {
        return $this->belongsToMany('App\Election', 'electors');
    }

    public function isAdmin(Election $election) {
        return $election->creator->is($this);
    }

    public function isElector(Election $election) {
        return $election->electors()->where('user_id', $this->id)->exists();
    }
}
