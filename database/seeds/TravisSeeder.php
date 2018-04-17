<?php


use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TravisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user1 = factory(\App\User::class)->create([
            'email' => "travis-1@pivot.vote"
        ]);
        $user2 = factory(\App\User::class)->create([
            'email' => "travis-2@pivot.vote"
        ]);


    }
}