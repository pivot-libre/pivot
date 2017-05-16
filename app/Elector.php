<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Elector extends Model
{
    public $timestamps = false;

    public function election()
    {
        return $this->belongsTo('App\Election');
    }

    public function invite()
    {
        return $this->belongsTo('App\Invite');
    }

    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
