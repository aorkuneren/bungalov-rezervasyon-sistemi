<?php

namespace Database\Seeders;

use App\Models\Bungalow;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BungalowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bungalows = [
            [
                'name' => 'Aden 1',
                'capacity' => 4,
                'description' => 'Deniz manzaralı lüks bungalov',
                'price_per_night' => 500,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 2',
                'capacity' => 6,
                'description' => 'Aile için geniş bungalov',
                'price_per_night' => 750,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 3',
                'capacity' => 2,
                'description' => 'Romantik çift bungalovu',
                'price_per_night' => 400,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 4',
                'capacity' => 4,
                'description' => 'Orman manzaralı bungalov',
                'price_per_night' => 450,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 5',
                'capacity' => 3,
                'description' => 'Havuz manzaralı bungalov',
                'price_per_night' => 600,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 6',
                'capacity' => 2,
                'description' => 'Tek kişilik konforlu bungalov',
                'price_per_night' => 300,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 7',
                'capacity' => 8,
                'description' => 'Büyük grup bungalovu',
                'price_per_night' => 1000,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 8',
                'capacity' => 4,
                'description' => 'Villa tarzı lüks bungalov',
                'price_per_night' => 800,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 9',
                'capacity' => 2,
                'description' => 'Minimalist tasarım bungalov',
                'price_per_night' => 350,
                'status' => 'active'
            ],
            [
                'name' => 'Aden 10',
                'capacity' => 5,
                'description' => 'Geniş aile bungalovu',
                'price_per_night' => 650,
                'status' => 'active'
            ]
        ];

        foreach ($bungalows as $bungalowData) {
            Bungalow::create($bungalowData);
        }
    }
}
