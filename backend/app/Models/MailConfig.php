<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MailConfig extends Model
{
    protected $table = 'mail_config';

    protected $fillable = [
        'host',
        'port',
        'username',
        'password',
        'encryption',
        'from_address',
        'from_name',
        'email_notifications',
        'whatsapp_notifications',
    ];

    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'email_notifications' => 'boolean',
            'whatsapp_notifications' => 'boolean',
        ];
    }

    // Hidden attributes
    protected $hidden = [
        'password', // Şifreyi API'de gösterme
    ];
}

