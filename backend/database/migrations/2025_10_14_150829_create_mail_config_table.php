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
        Schema::create('mail_config', function (Blueprint $table) {
            $table->id();
            $table->string('host'); // SMTP Host
            $table->integer('port')->default(587); // SMTP Port
            $table->string('username'); // SMTP Username
            $table->text('password'); // SMTP Password (encrypted)
            $table->enum('encryption', ['tls', 'ssl', 'none'])->default('tls'); // Encryption type
            $table->string('from_address'); // From email address
            $table->string('from_name'); // From name
            $table->boolean('email_notifications')->default(true); // Email bildirimler aktif mi?
            $table->boolean('whatsapp_notifications')->default(true); // WhatsApp bildirimler aktif mi?
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mail_config');
    }
};
