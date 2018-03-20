<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CascadeCandidateDeleteToRanks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('candidate_ranks', function (Blueprint $table) {
            $table->dropForeign('candidate_ranks_elector_id_foreign');
            $table->dropForeign('candidate_ranks_candidate_id_foreign');
            $table->foreign('elector_id')->references('id')->on('electors')->onDelete('cascade');
            $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('candidate_ranks', function (Blueprint $table) {
            $table->dropForeign('candidate_ranks_elector_id_foreign');
            $table->dropForeign('candidate_ranks_candidate_id_foreign');
            $table->foreign('elector_id')->references('id')->on('electors');
            $table->foreign('candidate_id')->references('id')->on('candidates');
        });
    }
}
