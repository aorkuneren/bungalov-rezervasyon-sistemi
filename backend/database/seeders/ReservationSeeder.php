<?php

namespace Database\Seeders;

use App\Models\Reservation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reservations = [
            [
                'reservation_code' => 'RES20241014001',
                'customer_id' => 4, // Ayşe Özkan
                'bungalow_id' => 1, // Aden 1
                'check_in_date' => '2024-10-20',
                'check_out_date' => '2024-10-25',
                'number_of_guests' => 2,
                'total_price' => 2500.00,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'payment_amount' => 2500.00,
                'remaining_amount' => 0.00,
                'notes' => 'Deniz manzaralı bungalov tercih edildi'
            ],
            [
                'reservation_code' => 'RES20241014002',
                'customer_id' => 5, // John Smith
                'bungalow_id' => 2, // Aden 2
                'check_in_date' => '2024-10-22',
                'check_out_date' => '2024-10-28',
                'number_of_guests' => 4,
                'total_price' => 4500.00,
                'status' => 'pending',
                'payment_status' => 'partial',
                'payment_amount' => 1500.00,
                'remaining_amount' => 3000.00,
                'notes' => 'Aile rezervasyonu - 2 yetişkin, 2 çocuk'
            ],
            [
                'reservation_code' => 'RES20241014003',
                'customer_id' => 6, // Maria Garcia
                'bungalow_id' => 3, // Aden 3
                'check_in_date' => '2024-10-25',
                'check_out_date' => '2024-10-30',
                'number_of_guests' => 2,
                'total_price' => 2800.00,
                'status' => 'checked_in',
                'payment_status' => 'paid',
                'payment_amount' => 2800.00,
                'remaining_amount' => 0.00,
                'notes' => 'Balayı rezervasyonu'
            ],
            [
                'reservation_code' => 'RES20241014004',
                'customer_id' => 8, // Zeynep Arslan
                'bungalow_id' => 4, // Aden 4
                'check_in_date' => '2024-10-18',
                'check_out_date' => '2024-10-21',
                'number_of_guests' => 3,
                'total_price' => 1950.00,
                'status' => 'completed',
                'payment_status' => 'paid',
                'payment_amount' => 1950.00,
                'remaining_amount' => 0.00,
                'notes' => 'Hafta sonu kaçamağı'
            ],
            [
                'reservation_code' => 'RES20241014005',
                'customer_id' => 9, // Can Özdemir
                'bungalow_id' => 5, // Aden 5
                'check_in_date' => '2024-10-30',
                'check_out_date' => '2024-11-05',
                'number_of_guests' => 2,
                'total_price' => 3600.00,
                'status' => 'confirmed',
                'payment_status' => 'unpaid',
                'payment_amount' => 0.00,
                'remaining_amount' => 3600.00,
                'notes' => 'Giriş tarihinde ödeme yapılacak'
            ],
            [
                'reservation_code' => 'RES20241014006',
                'customer_id' => 4, // Ayşe Özkan
                'bungalow_id' => 6, // Aden 6
                'check_in_date' => '2024-11-10',
                'check_out_date' => '2024-11-15',
                'number_of_guests' => 1,
                'total_price' => 1200.00,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'payment_amount' => 0.00,
                'remaining_amount' => 1200.00,
                'notes' => 'Tek kişilik rezervasyon'
            ],
            [
                'reservation_code' => 'RES20241014007',
                'customer_id' => 5, // John Smith
                'bungalow_id' => 7, // Aden 7
                'check_in_date' => '2024-11-20',
                'check_out_date' => '2024-11-25',
                'number_of_guests' => 6,
                'total_price' => 5500.00,
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'payment_amount' => 0.00,
                'remaining_amount' => 0.00,
                'notes' => 'Müşteri tarafından iptal edildi'
            ],
            [
                'reservation_code' => 'RES20241014008',
                'customer_id' => 6, // Maria Garcia
                'bungalow_id' => 8, // Aden 8
                'check_in_date' => '2024-12-01',
                'check_out_date' => '2024-12-08',
                'number_of_guests' => 2,
                'total_price' => 4200.00,
                'status' => 'confirmed',
                'payment_status' => 'partial',
                'payment_amount' => 2100.00,
                'remaining_amount' => 2100.00,
                'notes' => 'Yılbaşı rezervasyonu - %50 peşin ödendi'
            ]
        ];

        foreach ($reservations as $reservationData) {
            Reservation::create($reservationData);
        }
    }
}
