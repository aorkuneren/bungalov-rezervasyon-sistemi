<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Admin - Silinemez
        User::create([
            'name' => 'Super Admin',
            'email' => 'info@aorkuneren.com',
            'password' => Hash::make('A0rkuneren'),
            'role' => 'super_admin',
            'is_deletable' => false,
            'email_verified_at' => now(),
        ]);

        // Admin
        User::create([
            'name' => 'Admin',
            'email' => 'info@adenbungalov.com',
            'password' => Hash::make('AdenBungalov.2025'),
            'role' => 'admin',
            'is_deletable' => true,
            'email_verified_at' => now(),
        ]);
    }
}
