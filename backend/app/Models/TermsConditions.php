<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TermsConditions extends Model
{
    protected $table = 'terms_conditions';

    protected $fillable = [
        'type',
        'title',
        'content',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function getTypeDisplayAttribute(): string
    {
        return match($this->type) {
            'kiralama_sartlari' => 'Kiralama Şartları ve Sözleşmesi',
            'iptal_politikasi' => 'Rezervasyon İptal Politikası',
            'kullanim_kosullari' => 'Kullanım Koşulları',
            'kvkk' => 'Kişisel Verilerin Korunması Hakkında Aydınlatma Metni (KVKK)',
            'gizlilik_politikasi' => 'Gizlilik Politikası',
            default => 'Bilinmiyor'
        };
    }

    public function getStatusDisplayAttribute(): string
    {
        return $this->is_active ? 'Aktif' : 'Pasif';
    }

    public function getStatusBadgeVariantAttribute(): string
    {
        return $this->is_active ? 'success' : 'secondary';
    }
}
