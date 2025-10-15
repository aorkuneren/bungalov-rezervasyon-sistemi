<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ReservationSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationSettingsController extends Controller
{
    /**
     * Get reservation settings
     */
    public function index()
    {
        try {
            $settings = ReservationSettings::getSettings();
            
            // Transform deposit_amount to integer
            $settingsData = $settings->toArray();
            if (isset($settingsData['deposit_amount'])) {
                $settingsData['deposit_amount'] = (int) $settingsData['deposit_amount'];
            }
            
            return response()->json([
                'success' => true,
                'data' => $settingsData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon ayarları yüklenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update reservation settings
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'check_in_out_enabled' => 'nullable|boolean',
                'check_in_time' => 'nullable|date_format:H:i',
                'check_out_time' => 'nullable|date_format:H:i',
                'min_stay_enabled' => 'nullable|boolean',
                'min_stay_days' => 'nullable|integer|min:1|max:30',
                'deposit_required' => 'nullable|boolean',
                'deposit_amount' => 'nullable|numeric|min:0|max:999999.99',
                'deposit_percentage' => 'nullable|integer|min:0|max:100',
                'cancellation_enabled' => 'nullable|boolean',
                'cancellation_days' => 'nullable|integer|min:0|max:365',
                'cancellation_policy' => 'nullable|in:flexible,moderate,strict',
                'confirmation_enabled' => 'nullable|boolean',
                'confirmation_hours' => 'nullable|integer|min:1|max:168', // 1 saat - 1 hafta
                'early_bird_discount' => 'nullable|integer|min:0|max:100',
                'last_minute_discount' => 'nullable|integer|min:0|max:100',
                'weekend_pricing' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $settings = ReservationSettings::updateSettings($request->all());

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'reservation_settings_updated',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'updated_fields' => array_keys($request->all())
                ]
            ]);

            // Transform deposit_amount to integer
            $settingsData = $settings->toArray();
            if (isset($settingsData['deposit_amount'])) {
                $settingsData['deposit_amount'] = (int) $settingsData['deposit_amount'];
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon ayarları başarıyla güncellendi',
                'data' => $settingsData
            ]);
        } catch (\Exception $e) {
            // Log error
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'reservation_settings_update_failed',
                'status' => 'error',
                'ip' => $request->ip(),
                'metadata' => [
                    'error' => $e->getMessage()
                ]
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon ayarları güncellenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
