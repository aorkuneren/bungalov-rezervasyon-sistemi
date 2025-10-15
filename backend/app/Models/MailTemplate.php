<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MailTemplate extends Model
{
    protected $fillable = [
        'name',
        'type',
        'subject',
        'body',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];
}
