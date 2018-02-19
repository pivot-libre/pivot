<?php

namespace App;

use Mail;
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

    // TODO: consider where this is used, and make sure the null filter an accepted_at is appropriate
    public function invites()
    {
        return $this->belongsToMany('App\Invite', 'electors')->whereNull('accepted_at');
    }

    public function send_invite_email($email, $code)
    {
        // don't even try if the mail driver is not configured
        if (env('MAIL_DRIVER', null) == null) {
            return 'mail driver not configured';
        }

        $msg = 'Your Pivot Libre code is '.$code;

        try {
            Mail::raw($msg, function ($message) use ($email) {
                $name = 'Elector';
                $message->to($email, $name)->subject('Pivot Libre Election Invitation');
            });
        } catch(\Exception $e) {
            return $e->getMessage();
        }
        return null;
    }

    public function invite($email)
    {
        $invite = $this->belongsToMany('App\Invite', 'electors')->where(['email' => $email])->first();
        $mail_error = null;

        if (empty($invite))
        {
            $invite = new Invite();
            $invite->code = bin2hex(random_bytes(4));
            $invite->email = $email;
            $invite->save();

            $elector = new Elector();
            $elector->election()->associate($this);
            $elector->invite()->associate($invite);
            $elector->save();

            $mail_error = $this->send_invite_email($email, $invite->code);
        }

        $result = $invite->toArray();
        $result['mail_error'] = $mail_error;
        return $result;
    }
}
