<?php

namespace App;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property Collection electors
 */
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
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function electors()
    {
        return $this->hasMany(Elector::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

    public function send_invite_email($email)
    {
        // don't even try if the mail driver is not configured
        if (env('MAIL_DRIVER', null) == null) {
            return 'mail driver not configured';
        }

        $msg = 'You have been invited to an election';

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
        $elector = $this->hasMany('App\Elector')->where(['invite_email' => $email])->first();
        $mail_error = null;

        if (empty($elector))
        {
            $elector = new Elector();
            $elector->election()->associate($this);
            $elector->invite_email = $email;
            $elector->save();

            $mail_error = $this->send_invite_email($email);
        }

        return $elector;
    }
}
