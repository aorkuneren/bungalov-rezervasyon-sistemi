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
        Schema::create('bungalows', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Bungalov Adı
            $table->integer('capacity'); // Kapasite (kişi sayısı)
            $table->text('description')->nullable(); // Açıklama
            $table->decimal('price_per_night', 10, 2); // Gecelik Fiyat
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active'); // Durum
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bungalows');
    }
};
