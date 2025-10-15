<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\TermsConditions;
use App\Models\CompanySettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TermsConditionsController extends Controller
{
    /**
     * Get all terms and conditions
     */
    public function index()
    {
        try {
            $terms = TermsConditions::orderBy('sort_order')->get();
            
            // Get company settings for dynamic variables
            $companySettings = CompanySettings::getSettings();
            
            // Process each term to replace variables
            $processedTerms = $terms->map(function ($term) use ($companySettings) {
                $processedContent = $this->replaceVariables($term->content, $companySettings);
                $termArray = $term->toArray();
                $termArray['content'] = $processedContent;
                return $termArray;
            });
            
            return response()->json([
                'success' => true,
                'data' => $processedTerms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Şartlar ve kurallar alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get terms and conditions by type
     */
    public function show(Request $request, $type)
    {
        try {
            $terms = TermsConditions::where('type', $type)->first();
            
            if (!$terms) {
                return response()->json([
                    'success' => false,
                    'message' => 'Şartlar ve kurallar bulunamadı'
                ], 404);
            }

            // Get company settings for dynamic variables
            $companySettings = CompanySettings::getSettings();
            
            // Get reservation if confirmation code is provided
            $reservation = null;
            if ($request->has('confirmation_code')) {
                $reservation = \App\Models\Reservation::where('confirmation_code', $request->confirmation_code)
                    ->with(['customer', 'bungalow'])
                    ->first();
            }
            
            // Replace dynamic variables in content
            $processedContent = $this->replaceVariables($terms->content, $companySettings, $reservation);
            
            // Create a copy of terms with processed content
            $processedTerms = $terms->toArray();
            $processedTerms['content'] = $processedContent;

            return response()->json([
                'success' => true,
                'data' => $processedTerms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Şartlar ve kurallar alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Replace dynamic variables in content
     */
    private function replaceVariables($content, $companySettings, $reservation = null)
    {
        $variables = [
            'companyName' => $companySettings->company_name ?? 'Şirket Adı',
            'companyAddress' => $companySettings->address ?? 'Şirket Adresi',
            'companyEmail' => $companySettings->email ?? 'info@example.com',
            'companyPhone' => $companySettings->phone ?? '+90 (XXX) XXX XX XX',
            'companyWebsite' => $companySettings->website ?? 'https://example.com',
            'companyCity' => $companySettings->city ?? 'İl',
            'companyDistrict' => $companySettings->district ?? 'İlçe',
            'companyPostalCode' => $companySettings->postal_code ?? 'Posta Kodu',
            'companyTaxNumber' => $companySettings->tax_number ?? 'Vergi No',
            'companyTaxOffice' => $companySettings->tax_office ?? 'Vergi Dairesi',
            'companyBankName' => $companySettings->bank_name ?? 'Banka Adı',
            'companyBankAccount' => $companySettings->bank_account ?? 'Hesap No',
            'companyIban' => $companySettings->iban ?? 'IBAN',
            'companyLocation' => trim(($companySettings->address ?? '') . ', ' . ($companySettings->postal_code ?? '') . ' ' . ($companySettings->district ?? '') . '/' . ($companySettings->city ?? ''), ', '),
        ];

        // Add reservation-specific variables if reservation is provided
        if ($reservation) {
            $reservationVariables = [
                'customerName' => $reservation->customer->name ?? 'Misafir Adı',
                'roomType' => $reservation->bungalow->name ?? 'Bungalov Tipi',
                'checkInDate' => $reservation->check_in_date ? date('d.m.Y', strtotime($reservation->check_in_date)) : 'Giriş Tarihi',
                'checkOutDate' => $reservation->check_out_date ? date('d.m.Y', strtotime($reservation->check_out_date)) : 'Çıkış Tarihi',
                'totalAmount' => $reservation->total_price ? number_format($reservation->total_price, 0, ',', '.') : 'Toplam Tutar',
                'reservationNumber' => $reservation->reservation_code ?? 'Rezervasyon No',
                'checkInTime' => '14:00',
                'checkOutTime' => '11:00',
                'customerEmail' => $reservation->customer->email ?? 'Misafir E-posta',
                'customerPhone' => $reservation->customer->phone ?? 'Misafir Telefon',
            ];
            
            $variables = array_merge($variables, $reservationVariables);
        }

        // Replace variables in content (both {{key}} and {key} formats)
        foreach ($variables as $key => $value) {
            // Replace {{key}} format
            $content = str_replace("{{$key}}", $value, $content);
            // Replace {key} format
            $content = str_replace("{$key}", $value, $content);
        }

        // Also replace any remaining hardcoded values that might be in single braces
        $hardcodedReplacements = [
            '{Aden Bungalov}' => $companySettings->company_name ?? 'Aden Bungalov',
            '{İlmiye Mah. İlmiye2 Sok. No.12}' => $companySettings->address ?? 'İlmiye Mah. İlmiye2 Sok. No.12',
            '{info@adenbungalov.com}' => $companySettings->email ?? 'info@adenbungalov.com',
            '{905347989798}' => $companySettings->phone ?? '905347989798',
            '{https://www.adenbungalov.com}' => $companySettings->website ?? 'https://www.adenbungalov.com',
            '{https://www.adenbungalov.com/}' => $companySettings->website ?? 'https://www.adenbungalov.com',
            '{İlmiye Mah. İlmiye2 Sok. No.12, 54600 Sapanca/Sakarya}' => trim(($companySettings->address ?? '') . ', ' . ($companySettings->postal_code ?? '') . ' ' . ($companySettings->district ?? '') . '/' . ($companySettings->city ?? ''), ', '),
            '{14:00}' => '14:00',
            '{11:00}' => '11:00',
        ];

        // Add reservation-specific hardcoded replacements if reservation is provided
        if ($reservation) {
            $reservationHardcodedReplacements = [
                '{' . $reservation->reservation_code . '}' => $reservation->reservation_code,
                '{' . ($reservation->check_in_date ? date('d.m.Y', strtotime($reservation->check_in_date)) : '') . '}' => $reservation->check_in_date ? date('d.m.Y', strtotime($reservation->check_in_date)) : '',
                '{' . ($reservation->check_out_date ? date('d.m.Y', strtotime($reservation->check_out_date)) : '') . '}' => $reservation->check_out_date ? date('d.m.Y', strtotime($reservation->check_out_date)) : '',
                '{' . ($reservation->total_price ? number_format($reservation->total_price, 0, ',', '.') : '') . '}' => $reservation->total_price ? number_format($reservation->total_price, 0, ',', '.') : '',
                '{' . ($reservation->customer->name ?? '') . '}' => $reservation->customer->name ?? '',
                '{' . ($reservation->bungalow->name ?? '') . '}' => $reservation->bungalow->name ?? '',
                '{' . ($reservation->customer->email ?? '') . '}' => $reservation->customer->email ?? '',
                '{' . ($reservation->customer->phone ?? '') . '}' => $reservation->customer->phone ?? '',
            ];
            
            $hardcodedReplacements = array_merge($hardcodedReplacements, $reservationHardcodedReplacements);
        }

        foreach ($hardcodedReplacements as $placeholder => $replacement) {
            $content = str_replace($placeholder, $replacement, $content);
        }

        return $content;
    }

    /**
     * Create or update terms and conditions
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:kiralama_sartlari,iptal_politikasi,kullanim_kosullari,kvkk,gizlilik_politikasi',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $terms = TermsConditions::updateOrCreate(
                ['type' => $request->type],
                [
                    'title' => $request->title,
                    'content' => $request->content,
                    'is_active' => $request->boolean('is_active', true),
                    'sort_order' => $request->integer('sort_order', 0),
                ]
            );

            // Activity log
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'terms_conditions_updated',
                'description' => "Şartlar ve kurallar güncellendi: {$terms->type_display}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Şartlar ve kurallar başarıyla kaydedildi',
                'data' => $terms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Şartlar ve kurallar kaydedilirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update terms and conditions
     */
    public function update(Request $request, $type)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $terms = TermsConditions::where('type', $type)->first();
            
            if (!$terms) {
                return response()->json([
                    'success' => false,
                    'message' => 'Şartlar ve kurallar bulunamadı'
                ], 404);
            }

            $terms->update([
                'title' => $request->title,
                'content' => $request->content,
                'is_active' => $request->boolean('is_active', true),
                'sort_order' => $request->integer('sort_order', 0),
            ]);

            // Activity log
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'terms_conditions_updated',
                'description' => "Şartlar ve kurallar güncellendi: {$terms->type_display}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Şartlar ve kurallar başarıyla güncellendi',
                'data' => $terms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Şartlar ve kurallar güncellenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete terms and conditions
     */
    public function destroy($type)
    {
        try {
            $terms = TermsConditions::where('type', $type)->first();
            
            if (!$terms) {
                return response()->json([
                    'success' => false,
                    'message' => 'Şartlar ve kurallar bulunamadı'
                ], 404);
            }

            $typeDisplay = $terms->type_display;
            $terms->delete();

            // Activity log
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'terms_conditions_deleted',
                'description' => "Şartlar ve kurallar silindi: {$typeDisplay}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Şartlar ve kurallar başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Şartlar ve kurallar silinirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preview template with variables
     */
    public function preview(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:kiralama_sartlari,iptal_politikasi,kullanim_kosullari,kvkk,gizlilik_politikasi',
            'content' => 'required|string',
            'variables' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $content = $request->content;
            $variables = $request->get('variables', []);

            // Default variables
            $defaultVariables = [
                'companyName' => 'Şirket Adı',
                'companyAddress' => 'Şirket Adresi',
                'companyEmail' => 'info@example.com',
                'companyPhone' => '+90 (XXX) XXX XX XX',
                'companyWebsite' => 'https://example.com',
                'customerName' => 'Misafir Adı',
                'roomType' => 'Bungalov Tipi',
                'checkInDate' => '01.01.2024',
                'checkOutDate' => '03.01.2024',
                'totalAmount' => '1.000',
                'reservationNumber' => 'RES-2024-001',
                'checkInTime' => '14:00',
                'checkOutTime' => '12:00',
                'companyLocation' => 'İl/İlçe',
            ];

            // Merge with provided variables
            $allVariables = array_merge($defaultVariables, $variables);

            // Replace variables in content
            foreach ($allVariables as $key => $value) {
                $content = str_replace("{{$key}}", $value, $content);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'preview' => $content,
                    'variables_used' => $allVariables
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Önizleme oluşturulurken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }
}
