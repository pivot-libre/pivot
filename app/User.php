<?php

namespace App;

use Carbon\Carbon;
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

    /**
     * Accept invite with specified code
     *
     * @param string $code
     */
    public function accept($code)
    {
        /** @TODO Prevent user from being multiple electors */

        $invite = Invite::where('code', $code)->firstOrFail();

        $invite->elector->user()->associate($this);
        $invite->elector->save();

        $invite->accepted_at = Carbon::now();
        $invite->save();

        return $invite;
    }
}
