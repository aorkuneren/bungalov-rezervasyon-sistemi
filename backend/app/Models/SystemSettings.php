<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSettings extends Model
{
    use HasFactory;

    protected $table = 'system_settings';

    protected $fillable = [
        'auto_backup',
        'backup_frequency',
        'backup_time',
        'backup_location',
        'backup_email_notification',
        'session_timeout',
        'max_login_attempts',
        'ip_restriction',
        'auto_cache_clear',
        'log_retention',
        'detailed_logging',
    ];

    protected function casts(): array
    {
        return [
            'auto_backup' => 'boolean',
            'backup_email_notification' => 'boolean',
            'session_timeout' => 'integer',
            'max_login_attempts' => 'integer',
            'ip_restriction' => 'boolean',
            'auto_cache_clear' => 'boolean',
            'log_retention' => 'integer',
            'detailed_logging' => 'boolean',
            'backup_time' => 'datetime:H:i',
        ];
    }

    // Singleton pattern - tek bir sistem ayarları kaydı
    public static function getSystemSettings()
    {
        return static::firstOrCreate([]);
    }
}
