<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EkHizmet extends Model
{
    protected $fillable = [
        'name',
        'price',
        'pricing_type',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Scope for active services
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for inactive services
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Get pricing type display name
     */
    public function getPricingTypeDisplayAttribute(): string
    {
        return match($this->pricing_type) {
            'per_person' => 'Kişi Başı',
            'per_night' => 'Gecelik',
            'free' => 'Ücretsiz',
            default => 'Bilinmiyor'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return $this->is_active ? 'Aktif' : 'Pasif';
    }

    /**
     * Get status badge variant
     */
    public function getStatusBadgeVariantAttribute(): string
    {
        return $this->is_active ? 'success' : 'secondary';
    }
}
