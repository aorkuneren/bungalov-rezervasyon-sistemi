<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'id_number',
        'id_type',
        'status',
        'total_spending',
        'reservations_count'
    ];

    protected function casts(): array
    {
        return [
            'total_spending' => 'decimal:2',
            'reservations_count' => 'integer',
        ];
    }

    // Rezervasyonlar ile ilişki
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
