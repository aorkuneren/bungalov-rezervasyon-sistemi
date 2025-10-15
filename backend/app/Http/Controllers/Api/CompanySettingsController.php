<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CompanySettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanySettingsController extends Controller
{
    /**
     * Get company settings
     */
    public function index()
    {
        try {
            $settings = CompanySettings::getSettings();
            
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Firma bilgileri yüklenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update company settings
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'company_name' => 'nullable|string|max:255',
                'company_type' => 'nullable|in:limited,anonim,kollektif,komandit,sahis',
                'tax_number' => 'nullable|string|max:20',
                'tax_office' => 'nullable|string|max:255',
                'logo_path' => 'nullable|string|max:500',
                'address' => 'nullable|string|max:1000',
                'city' => 'nullable|string|max:100',
                'district' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:10',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'website' => 'nullable|url|max:255',
                'bank_name' => 'nullable|string|max:255',
                'bank_account' => 'nullable|string|max:50',
                'iban' => 'nullable|string|max:34',
                'google_business_profile' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $settings = CompanySettings::updateSettings($request->all());

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'company_settings_updated',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'updated_fields' => array_keys($request->all())
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Firma bilgileri başarıyla güncellendi',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            // Log error
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'company_settings_update_failed',
                'status' => 'error',
                'ip' => $request->ip(),
                'metadata' => [
                    'error' => $e->getMessage()
                ]
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Firma bilgileri güncellenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload company logo
     */
    public function uploadLogo(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('logo');
            $filename = 'company_logo_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Debug: Dosya bilgilerini logla
            \Log::info('Logo upload debug', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'filename' => $filename,
                'is_valid' => $file->isValid(),
                'error' => $file->getError()
            ]);
            
            // Dosyayı doğrudan public klasörüne kaydet
            $targetPath = storage_path('app/public/' . $filename);
            $file->move(storage_path('app/public/'), $filename);
            
            // Debug: Yükleme sonucunu logla
            \Log::info('File upload result', [
                'target_path' => $targetPath,
                'exists' => file_exists($targetPath),
                'size' => file_exists($targetPath) ? filesize($targetPath) : 0
            ]);
            
            $path = 'public/' . $filename;

            // Update company settings with logo path
            $settings = CompanySettings::getSettings();
            $settings->logo_path = $path;
            $settings->save();

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'company_logo_uploaded',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'logo_path' => $path
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logo başarıyla yüklendi',
                'data' => [
                    'logo_path' => $path,
                    'logo_url' => asset('storage/' . str_replace('public/', '', $path))
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logo yüklenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove company logo
     */
    public function removeLogo(Request $request)
    {
        try {
            $settings = CompanySettings::getSettings();
            
            if ($settings->logo_path) {
                // Eski logo dosyasını sil
                $logoPath = storage_path('app/' . $settings->logo_path);
                if (file_exists($logoPath)) {
                    unlink($logoPath);
                }
                
                // Veritabanından logo path'i kaldır
                $settings->logo_path = null;
                $settings->save();
                
                // Log activity
                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'action' => 'company_logo_removed',
                    'status' => 'success',
                    'ip' => $request->ip(),
                    'metadata' => [
                        'old_logo_path' => $settings->logo_path
                    ]
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Logo başarıyla kaldırıldı'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Kaldırılacak logo bulunamadı'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logo kaldırılırken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
