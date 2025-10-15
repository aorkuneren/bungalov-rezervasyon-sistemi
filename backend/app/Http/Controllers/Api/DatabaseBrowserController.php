<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseBrowserController extends Controller
{
    /**
     * Get all database tables data for browser
     */
    public function getDatabaseData()
    {
        try {
            $data = [
                'users' => $this->getUsersData(),
                'activity_logs' => $this->getActivityLogsData(),
                'bungalows' => $this->getBungalowsData(),
                'company_settings' => $this->getCompanySettingsData(),
                'reservation_settings' => $this->getReservationSettingsData(),
                'password_reset_tokens' => $this->getPasswordResetTokensData(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'timestamp' => now()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Veritabanı verileri yüklenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getUsersData()
    {
        return DB::table('users')
            ->select('id', 'name', 'email', 'role', 'is_deletable', 'last_login_at', 'login_count')
            ->orderBy('id')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_deletable' => (bool) $user->is_deletable,
                    'last_login_at' => $user->last_login_at,
                    'login_count' => $user->login_count,
                ];
            });
    }

    private function getActivityLogsData()
    {
        return DB::table('activity_logs')
            ->join('users', 'activity_logs.user_id', '=', 'users.id')
            ->select(
                'activity_logs.id',
                'users.name as user_name',
                'activity_logs.action',
                'activity_logs.status',
                'activity_logs.ip',
                'activity_logs.created_at'
            )
            ->orderBy('activity_logs.id', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user_name,
                    'action' => $this->getActionDisplayName($log->action),
                    'status' => $log->status,
                    'ip' => $log->ip,
                    'created_at' => $log->created_at,
                ];
            });
    }

    private function getBungalowsData()
    {
        return DB::table('bungalows')
            ->select('id', 'name', 'capacity', 'description', 'price_per_night', 'status', 'created_at')
            ->orderBy('id')
            ->get()
            ->map(function ($bungalow) {
                return [
                    'id' => $bungalow->id,
                    'name' => $bungalow->name,
                    'capacity' => $bungalow->capacity . ' kişi',
                    'description' => $bungalow->description,
                    'price_per_night' => '₺' . number_format($bungalow->price_per_night, 0, ',', '.'),
                    'status' => $this->getStatusDisplayName($bungalow->status),
                    'created_at' => $bungalow->created_at,
                ];
            });
    }

    private function getCompanySettingsData()
    {
        return DB::table('company_settings')
            ->select('*')
            ->first();
    }

    private function getReservationSettingsData()
    {
        return DB::table('reservation_settings')
            ->select('*')
            ->first();
    }

    private function getPasswordResetTokensData()
    {
        return DB::table('password_reset_tokens')
            ->select('email', 'token', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    private function getActionDisplayName($action)
    {
        $actions = [
            'login' => 'Giriş Yapıldı',
            'logout' => 'Çıkış Yapıldı',
            'login_failed' => 'Hatalı Giriş',
            'password_changed' => 'Şifre Değiştirildi',
            'password_reset_requested' => 'Şifre Sıfırlama İstendi',
            'password_reset_completed' => 'Şifre Sıfırlandı',
            'company_settings_updated' => 'Firma Ayarları Güncellendi',
            'reservation_settings_updated' => 'Rezervasyon Ayarları Güncellendi',
            'bungalow_created' => 'Bungalov Oluşturuldu',
            'bungalow_updated' => 'Bungalov Güncellendi',
            'bungalow_deleted' => 'Bungalov Silindi',
        ];

        return $actions[$action] ?? $action;
    }

    private function getStatusDisplayName($status)
    {
        $statuses = [
            'active' => 'Aktif',
            'inactive' => 'Pasif',
            'maintenance' => 'Bakımda',
        ];

        return $statuses[$status] ?? $status;
    }
}
