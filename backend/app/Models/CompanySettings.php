<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySettings extends Model
{
    protected $fillable = [
        'company_name',
        'company_type',
        'tax_number',
        'tax_office',
        'logo_path',
        'address',
        'city',
        'district',
        'postal_code',
        'phone',
        'email',
        'website',
        'bank_name',
        'bank_account',
        'iban',
        'google_business_profile',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the first company settings record (singleton pattern)
     */
    public static function getSettings()
    {
        return static::first() ?? new static();
    }

    /**
     * Update or create company settings
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
