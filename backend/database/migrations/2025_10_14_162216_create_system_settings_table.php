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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            
            // Yedekleme Ayarları
            $table->boolean('auto_backup')->default(false);
            $table->enum('backup_frequency', ['daily', 'weekly', 'monthly'])->default('daily');
            $table->time('backup_time')->default('02:00');
            $table->string('backup_location')->default('/backups');
            $table->boolean('backup_email_notification')->default(true);
            
            // Güvenlik Ayarları
            $table->integer('session_timeout')->default(30); // dakika
            $table->integer('max_login_attempts')->default(5);
            $table->boolean('ip_restriction')->default(false);
            
            // Cache Yönetimi
            $table->boolean('auto_cache_clear')->default(false);
            
            // Log Yönetimi
            $table->integer('log_retention')->default(30); // gün
            $table->boolean('detailed_logging')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
