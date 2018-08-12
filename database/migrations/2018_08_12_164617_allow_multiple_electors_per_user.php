<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AllowMultipleElectorsPerUser extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('electors', function (Blueprint $table) {
            // user_id will be the user with the capability of submitting ballots.
            // If voter_name is null, the user will be voting on behalf of himself/herself.
            // If voter_name is not null, the user is proxy voting on behalf of the person
            // identified by the voter_name field (that person may not have a pivot account).
            $table->dropUnique(['election_id', 'user_id']);
            $table->string('voter_name')->nullable(true);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('electors', function (Blueprint $table) {
            $table->unique(['election_id', 'user_id']);
            $table->dropColumn('voter_name');
        });
    }
}
