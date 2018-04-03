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

        // COPY DATA
        DB::statement("UPDATE electors
                       JOIN invites ON electors.invite_id = invites.id
                       SET electors.invite_email = invites.email,
                           electors.invite_accepted_at = invites.accepted_at");

        Schema::table('electors', function (Blueprint $table) {
            $table->dropForeign('electors_invite_id_foreign');
            $table->dropColumn('invite_id');
        });

        $m = new CreateInvitesTable();
        $m->down();
    }

    /**
     * Reverse the migrations.  WARNING: this does not restore contents of invite table.
     * Only the schema.
     *
     * @return void
     */
    public function down()
    {
        $m = new CreateInvitesTable();
        $m->up();

        Schema::table('electors', function (Blueprint $table) {
            $table->integer('invite_id')->nullable()->unsigned()->index();
            $table->foreign('invite_id')->references('id')->on('invites')->onDelete('cascade');
        });

        // TODO: COPY DATA BACK TO INVITES

        Schema::table('electors', function (Blueprint $table) {
            $table->dropColumn('invite_email');
            $table->dropColumn('invite_accepted_at');
        });
    }
}
