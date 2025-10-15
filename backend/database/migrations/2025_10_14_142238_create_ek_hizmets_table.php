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
        Schema::create('ek_hizmets', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Hizmet Adı
            $table->decimal('price', 10, 0); // Fiyat (decimal yok)
            $table->enum('pricing_type', ['per_person', 'per_night', 'free'])->default('per_person'); // Fiyatlandırma Türü
            $table->boolean('is_active')->default(true); // Durum (Aktif/Pasif)
            $table->integer('sort_order')->default(0); // Sıralama
            $table->timestamps();
            
            // Indexes
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ek_hizmets');
    }
};
