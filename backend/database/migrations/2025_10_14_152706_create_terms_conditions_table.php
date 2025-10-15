<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('terms_conditions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', [
                'kiralama_sartlari',
                'iptal_politikasi', 
                'kullanim_kosullari',
                'kvkk',
                'gizlilik_politikasi'
            ]); // Template türü
            $table->string('title'); // Template başlığı
            $table->longText('content'); // Template içeriği (HTML)
            $table->boolean('is_active')->default(true); // Aktif/Pasif
            $table->integer('sort_order')->default(0); // Sıralama
            $table->timestamps();
            
            // Indexes
            $table->index('type');
            $table->index('is_active');
            $table->index('sort_order');
            $table->unique('type'); // Her türden sadece bir tane olabilir
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terms_conditions');
    }
};
