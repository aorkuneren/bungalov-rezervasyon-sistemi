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
        Schema::create('reservation_settings', function (Blueprint $table) {
            $table->id();
            
            // Giriş Çıkış Saati
            $table->boolean('check_in_out_enabled')->default(true);
            $table->time('check_in_time')->default('14:00');
            $table->time('check_out_time')->default('11:00');
            
            // Minimum Konaklama
            $table->boolean('min_stay_enabled')->default(false);
            $table->integer('min_stay_days')->default(1);
            
            // Kapora Bedeli
            $table->boolean('deposit_required')->default(true);
            $table->decimal('deposit_amount', 10, 2)->default(3000.00);
            $table->integer('deposit_percentage')->default(30);
            
            // İptal/İade Kuralı
            $table->boolean('cancellation_enabled')->default(true);
            $table->integer('cancellation_days')->default(7);
            $table->enum('cancellation_policy', ['flexible', 'moderate', 'strict'])->default('flexible');
            
            // Rezervasyon Onay Süresi
            $table->boolean('confirmation_enabled')->default(true);
            $table->integer('confirmation_hours')->default(24);
            
            // İndirim Ayarları
            $table->integer('early_bird_discount')->default(0);
            $table->integer('last_minute_discount')->default(0);
            $table->boolean('weekend_pricing')->default(false);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_settings');
    }
};
