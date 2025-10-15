<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationSettings extends Model
{
    protected $fillable = [
        'check_in_out_enabled',
        'check_in_time',
        'check_out_time',
        'min_stay_enabled',
        'min_stay_days',
        'deposit_required',
        'deposit_amount',
        'deposit_percentage',
        'cancellation_enabled',
        'cancellation_days',
        'cancellation_policy',
        'confirmation_enabled',
        'confirmation_hours',
        'early_bird_discount',
        'last_minute_discount',
        'weekend_pricing',
    ];

    protected function casts(): array
    {
        return [
            'check_in_out_enabled' => 'boolean',
            'check_in_time' => 'datetime:H:i',
            'check_out_time' => 'datetime:H:i',
            'min_stay_enabled' => 'boolean',
            'min_stay_days' => 'integer',
            'deposit_required' => 'boolean',
            'deposit_amount' => 'decimal:0',
            'deposit_percentage' => 'integer',
            'cancellation_enabled' => 'boolean',
            'cancellation_days' => 'integer',
            'confirmation_enabled' => 'boolean',
            'confirmation_hours' => 'integer',
            'early_bird_discount' => 'integer',
            'last_minute_discount' => 'integer',
            'weekend_pricing' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the first reservation settings record (singleton pattern)
     */
    public static function getSettings()
    {
        return static::first() ?? new static();
    }

    /**
     * Update or create reservation settings
     */
    public static function updateSettings(array $data)
    {
        $settings = static::first();
        
        if ($settings) {
            $settings->update($data);
            return $settings;
        } else {
            return static::create($data);
        }
    }
}
