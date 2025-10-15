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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            
            // Temel Firma Bilgileri
            $table->string('company_name')->nullable();
            $table->enum('company_type', ['limited', 'anonim', 'kollektif', 'komandit', 'sahis'])->default('limited');
            $table->string('tax_number')->nullable();
            $table->string('tax_office')->nullable();
            $table->string('logo_path')->nullable();
            
            // Adres Bilgileri
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->string('postal_code')->nullable();
            
            // İletişim Bilgileri
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            
            // Banka Bilgileri
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('iban')->nullable();
            
            // Google Business
            $table->string('google_business_profile')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
