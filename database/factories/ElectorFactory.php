<?php

namespace Database\Factories;

use App\Models\Election;
use App\Models\Elector;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Elector>
 */
class ElectorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'election_id' => Election::factory(),
        ];
    }
}
