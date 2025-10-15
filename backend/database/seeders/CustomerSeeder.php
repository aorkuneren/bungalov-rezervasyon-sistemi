<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Ahmet Yılmaz',
                'email' => 'ahmet.yilmaz@email.com',
                'phone' => '0555 123 45 67',
                'id_number' => '12345678901',
                'id_type' => 'tc',
                'status' => 'active',
                'total_spending' => 2500.00,
                'reservations_count' => 3
            ],
            [
                'name' => 'Fatma Demir',
                'email' => 'fatma.demir@email.com',
                'phone' => '0555 234 56 78',
                'id_number' => '23456789012',
                'id_type' => 'tc',
                'status' => 'active',
                'total_spending' => 1800.00,
                'reservations_count' => 2
            ],
            [
                'name' => 'Mehmet Kaya',
                'email' => 'mehmet.kaya@email.com',
                'phone' => '0555 345 67 89',
                'id_number' => '34567890123',
                'id_type' => 'tc',
                'status' => 'active',
                'total_spending' => 3200.00,
                'reservations_count' => 4
            ],
            [
                'name' => 'Ayşe Özkan',
                'email' => 'ayse.ozkan@email.com',
                'phone' => '0555 456 78 90',
                'id_number' => '45678901234',
                'id_type' => 'tc',
                'status' => 'inactive',
                'total_spending' => 1200.00,
                'reservations_count' => 1
            ],
            [
                'name' => 'John Smith',
                'email' => 'john.smith@email.com',
                'phone' => '+90 555 567 89 01',
                'id_number' => 'U12345678',
                'id_type' => 'passport',
                'status' => 'active',
                'total_spending' => 4500.00,
                'reservations_count' => 5
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria.garcia@email.com',
                'phone' => '+90 555 678 90 12',
                'id_number' => 'U23456789',
                'id_type' => 'passport',
                'status' => 'active',
                'total_spending' => 2800.00,
                'reservations_count' => 3
            ],
            [
                'name' => 'Ali Veli',
                'email' => 'ali.veli@email.com',
                'phone' => '0555 789 01 23',
                'id_number' => '56789012345',
                'id_type' => 'tc',
                'status' => 'banned',
                'total_spending' => 0.00,
                'reservations_count' => 0
            ],
            [
                'name' => 'Zeynep Arslan',
                'email' => 'zeynep.arslan@email.com',
                'phone' => '0555 890 12 34',
                'id_number' => '67890123456',
                'id_type' => 'tc',
                'status' => 'active',
                'total_spending' => 1950.00,
                'reservations_count' => 2
            ],
            [
                'name' => 'Can Özdemir',
                'email' => 'can.ozdemir@email.com',
                'phone' => '0555 901 23 45',
                'id_number' => '78901234567',
                'id_type' => 'tc',
                'status' => 'active',
                'total_spending' => 3600.00,
                'reservations_count' => 4
            ],
            [
                'name' => 'Elif Şahin',
                'email' => 'elif.sahin@email.com',
                'phone' => '0555 012 34 56',
                'id_number' => '89012345678',
                'id_type' => 'tc',
                'status' => 'inactive',
                'total_spending' => 800.00,
                'reservations_count' => 1
            ]
        ];

        foreach ($customers as $customerData) {
            Customer::create($customerData);
        }
    }
}
