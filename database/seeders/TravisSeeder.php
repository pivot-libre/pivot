<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class TravisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user1 = User::factory()->create([
            'email' => "travis-1@pivot.vote"
        ]);
        $user2 = User::factory()->create([
            'email' => "travis-2@pivot.vote"
        ]);

        $token1 = $user1->createToken('Token Name')->accessToken;
        $token2 = $user2->createToken('Token Name')->accessToken;

        $rootPath = base_path("tests/python");
        $client = Storage::createLocalDriver(['root' => $rootPath]);
        
       $client->put('users.json', json_encode([
            "users" => [
                [
                    'email' => $user1->email,
                    'token' => $token1
                ],[
                    'email' => $user2->email,
                    'token' => $token2
                ],
            ]
        ]));
    }
}