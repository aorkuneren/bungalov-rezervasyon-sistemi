<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SystemSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SystemSettingsController extends Controller
{
    /**
     * Get system settings
     */
    public function index()
    {
        try {
            $settings = SystemSettings::getSystemSettings();

            return response()->json([
                'success' => true,
                'data' => [
                    'auto_backup' => $settings->auto_backup,
                    'backup_frequency' => $settings->backup_frequency,
                    'backup_time' => $settings->backup_time,
                    'backup_location' => $settings->backup_location,
                    'backup_email_notification' => $settings->backup_email_notification,
                    'session_timeout' => $settings->session_timeout,
                    'max_login_attempts' => $settings->max_login_attempts,
                    'ip_restriction' => $settings->ip_restriction,
                    'auto_cache_clear' => $settings->auto_cache_clear,
                    'log_retention' => $settings->log_retention,
                    'detailed_logging' => $settings->detailed_logging,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sistem ayarları alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update system settings
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'auto_backup' => 'boolean',
            'backup_frequency' => 'in:daily,weekly,monthly',
            'backup_time' => 'date_format:H:i',
            'backup_location' => 'string|max:255',
            'backup_email_notification' => 'boolean',
            'session_timeout' => 'integer|min:5|max:1440',
            'max_login_attempts' => 'integer|min:3|max:10',
            'ip_restriction' => 'boolean',
            'auto_cache_clear' => 'boolean',
            'log_retention' => 'integer|min:1|max:365',
            'detailed_logging' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $settings = SystemSettings::getSystemSettings();
            
            // Sadece gönderilen alanları güncelle
            if ($request->has('auto_backup')) {
                $settings->auto_backup = $request->auto_backup;
            }
            if ($request->has('backup_frequency')) {
                $settings->backup_frequency = $request->backup_frequency;
            }
            if ($request->has('backup_time')) {
                $settings->backup_time = $request->backup_time;
            }
            if ($request->has('backup_location')) {
                $settings->backup_location = $request->backup_location;
            }
            if ($request->has('backup_email_notification')) {
                $settings->backup_email_notification = $request->backup_email_notification;
            }
            if ($request->has('session_timeout')) {
                $settings->session_timeout = $request->session_timeout;
            }
            if ($request->has('max_login_attempts')) {
                $settings->max_login_attempts = $request->max_login_attempts;
            }
            if ($request->has('ip_restriction')) {
                $settings->ip_restriction = $request->ip_restriction;
            }
            if ($request->has('auto_cache_clear')) {
                $settings->auto_cache_clear = $request->auto_cache_clear;
            }
            if ($request->has('log_retention')) {
                $settings->log_retention = $request->log_retention;
            }
            if ($request->has('detailed_logging')) {
                $settings->detailed_logging = $request->detailed_logging;
            }
            
            $settings->save();

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Sistem Ayarları Güncelleme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => ['updated_fields' => array_keys($request->all())],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sistem ayarları başarıyla güncellendi',
                'data' => [
                    'auto_backup' => $settings->auto_backup,
                    'backup_frequency' => $settings->backup_frequency,
                    'backup_time' => $settings->backup_time,
                    'backup_location' => $settings->backup_location,
                    'backup_email_notification' => $settings->backup_email_notification,
                    'session_timeout' => $settings->session_timeout,
                    'max_login_attempts' => $settings->max_login_attempts,
                    'ip_restriction' => $settings->ip_restriction,
                    'auto_cache_clear' => $settings->auto_cache_clear,
                    'log_retention' => $settings->log_retention,
                    'detailed_logging' => $settings->detailed_logging,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sistem ayarları güncellenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }
}
