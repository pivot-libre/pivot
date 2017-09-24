<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Election extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name'];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];

    public function creator()
    {
        return $this->belongsTo('App\User', 'creator_id');
    }

    public function electors()
    {
        return $this->belongsToMany('App\User', 'electors');
    }

    public function candidates()
    {
        return $this->hasMany('App\Candidate');
    }

    public function invites()
    {
        return $this->belongsToMany('App\Invite', 'electors')->whereNull('accepted_at');
    }

    public function invite($email)
    {
        $invite = $this->invites()->where(['email' => $email])->first();

        if (empty($invite)) {
            $invite = new Invite();
            $invite->code = bin2hex(random_bytes(4));
            $invite->email = $email;
            $invite->save();

            $elector = new Elector();
            $elector->election()->associate($this);
            $elector->invite()->associate($invite);
            $elector->save();
        }

        /** @todo #1 Send Invitation Email */

        return $invite;
    }
}
