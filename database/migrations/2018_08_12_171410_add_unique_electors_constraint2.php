<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUniqueElectorsConstraint2 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // a user may control multiple electors for the same election,
        // but those multiple electors may not have the same
        // voter_name.
        Schema::table('electors', function (Blueprint $table) {
            $table->unique(['election_id', 'user_id', 'voter_name']);
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
            $table->dropUnique(['election_id', 'user_id', 'voter_name']);
        });
    }
}
