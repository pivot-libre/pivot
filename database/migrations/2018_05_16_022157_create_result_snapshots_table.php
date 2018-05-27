<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResultSnapshotsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('result_snapshots', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('election_id')->unsigned()->index();
            $table->foreign('election_id')->references('id')->on('elections')->onDelete('cascade');
            $table->integer('format_version');
            $table->mediumText('result_blob');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('result_snapshots');
    }
}
