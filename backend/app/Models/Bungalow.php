<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bungalow extends Model
{
    protected $fillable = [
        'name',
        'capacity',
        'description',
        'price_per_night',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price_per_night' => 'decimal:2',
            'capacity' => 'integer',
        ];
    }


    /**
     * Scope a query to only include active bungalows.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive bungalows.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope a query to only include bungalows in maintenance.
     */
    public function scopeMaintenance($query)
    {
        return $query->where('status', 'maintenance');
    }

    /**
     * Get the status display name in Turkish.
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            'active' => 'Aktif',
            'inactive' => 'Pasif',
            'maintenance' => 'Bakımda',
            default => 'Bilinmiyor'
        };
    }

    /**
     * Get the status badge variant for UI.
     */
    public function getStatusBadgeVariantAttribute(): string
    {
        return match($this->status) {
            'active' => 'success',
            'inactive' => 'secondary',
            'maintenance' => 'warning',
            default => 'secondary'
        };
    }

    /**
     * Get the reservations for this bungalow.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the count of active reservations for this bungalow.
     * Only counts pending, confirmed, and checked_in reservations.
     * Excludes cancelled and completed reservations.
     */
    public function getReservationsCountAttribute(): int
    {
        return $this->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->count();
    }
}
