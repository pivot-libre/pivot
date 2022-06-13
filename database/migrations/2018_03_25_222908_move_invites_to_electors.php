<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MoveInvitesToElectors extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('electors', function (Blueprint $table) {
            $table->string('invite_email')->nullable();
            $table->dateTime('invite_accepted_at')->nullable();
        });

        $m = new CreateInvitesTable();
        $m->down();
    }
}
