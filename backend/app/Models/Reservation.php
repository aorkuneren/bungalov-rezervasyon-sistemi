<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_code',
        'customer_id',
        'bungalow_id',
        'check_in_date',
        'check_out_date',
        'number_of_guests',
        'total_price',
        'status',
        'payment_status',
        'payment_amount',
        'payment_history',
        'extra_services',
        'remaining_amount',
        'notes',
        'confirmation_code',
        'confirmation_expires_at',
        'additional_guests',
        'terms_accepted',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
        'delay_reason',
        'delayed_at'
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
            'check_out_date' => 'date',
            'number_of_guests' => 'integer',
            'total_price' => 'decimal:2',
            'payment_amount' => 'decimal:2',
            'payment_history' => 'array',
            'extra_services' => 'array',
            'remaining_amount' => 'decimal:2',
            'confirmation_expires_at' => 'datetime',
            'additional_guests' => 'array',
            'terms_accepted' => 'boolean',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'delayed_at' => 'datetime',
        ];
    }

    // Müşteri ile ilişki
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Bungalov ile ilişki
    public function bungalow()
    {
        return $this->belongsTo(Bungalow::class);
    }

    // Rezervasyon kodu oluştur
    public static function generateReservationCode()
    {
        do {
            $code = 'RES' . date('Ymd') . rand(1000, 9999);
        } while (static::where('reservation_code', $code)->exists());
        
        return $code;
    }

    // Onay kodu oluştur
    public static function generateConfirmationCode()
    {
        do {
            $code = strtoupper(substr(md5(uniqid(rand(), true)), 0, 12));
        } while (static::where('confirmation_code', $code)->exists());
        
        return $code;
    }
}
