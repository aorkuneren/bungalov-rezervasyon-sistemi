<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\MailConfig;
use App\Models\MailTemplate;
use App\Models\CompanySettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class MailConfigController extends Controller
{
    /**
     * Get mail configuration
     */
    public function index()
    {
        try {
            $config = MailConfig::first();
            
            if (!$config) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Mail ayarları bulunamadı'
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'host' => $config->host,
                    'port' => $config->port,
                    'username' => $config->username,
                    'encryption' => $config->encryption,
                    'from_address' => $config->from_address,
                    'from_name' => $config->from_name,
                    'email_notifications' => $config->email_notifications,
                    'whatsapp_notifications' => $config->whatsapp_notifications,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mail ayarları alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update mail configuration
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'host' => 'required|string|max:255',
            'port' => 'required|integer',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string',
            'encryption' => 'required|in:tls,ssl,none',
            'from_address' => 'required|email|max:255',
            'from_name' => 'required|string|max:255',
            'email_notifications' => 'boolean',
            'whatsapp_notifications' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $config = MailConfig::firstOrNew();
            
            $config->host = $request->host;
            $config->port = $request->port;
            $config->username = $request->username;
            $config->encryption = $request->encryption;
            $config->from_address = $request->from_address;
            $config->from_name = $request->from_name;
            $config->email_notifications = $request->boolean('email_notifications', true);
            $config->whatsapp_notifications = $request->boolean('whatsapp_notifications', true);
            
            // Şifre sadece girilmişse güncelle
            if ($request->filled('password')) {
                $config->password = encrypt($request->password);
            }
            
            $config->save();

            // Activity log
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'mail_config_updated',
                'description' => 'Mail ayarları güncellendi',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mail ayarları başarıyla güncellendi',
                'data' => [
                    'host' => $config->host,
                    'port' => $config->port,
                    'username' => $config->username,
                    'encryption' => $config->encryption,
                    'from_address' => $config->from_address,
                    'from_name' => $config->from_name,
                    'email_notifications' => $config->email_notifications,
                    'whatsapp_notifications' => $config->whatsapp_notifications,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mail ayarları güncellenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send test email
     */
    public function sendTestEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $config = MailConfig::first();
            
            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mail ayarları bulunamadı. Lütfen önce mail ayarlarını yapılandırın.'
                ], 404);
            }

            // SMTP ayarlarını dinamik olarak yapılandır
            config([
                'mail.mailers.smtp.host' => $config->host,
                'mail.mailers.smtp.port' => $config->port,
                'mail.mailers.smtp.username' => $config->username,
                'mail.mailers.smtp.password' => decrypt($config->password),
                'mail.mailers.smtp.encryption' => $config->encryption === 'none' ? null : $config->encryption,
                'mail.from.address' => $config->from_address,
                'mail.from.name' => $config->from_name,
            ]);

            // Test email gönder
            Mail::raw('Bu bir test e-postasıdır. Mail ayarlarınız başarıyla çalışıyor!', function ($message) use ($request, $config) {
                $message->to($request->email)
                    ->subject('Test E-postası - ' . $config->from_name);
            });

            // Activity log
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'test_email_sent',
                'description' => 'Test e-postası gönderildi: ' . $request->email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Test e-postası başarıyla gönderildi!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Test e-postası gönderilirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send reservation confirmation email
     */
    public function sendReservationConfirmation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reservation_id' => 'required|exists:reservations,id',
            'customer_email' => 'required|email',
            'customer_name' => 'required|string',
            'bungalow_name' => 'required|string',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date',
            'total_price' => 'required|numeric',
            'confirmation_code' => 'required|string',
            'confirmation_link' => 'required|url',
            'confirmation_hours' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $config = MailConfig::first();
            $companySettings = CompanySettings::first();
            
            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mail ayarları bulunamadı. Lütfen önce mail ayarlarını yapılandırın.'
                ], 404);
            }

            // Rezervasyonu veritabanından çek
            $reservation = \App\Models\Reservation::findOrFail($request->reservation_id);

            // SMTP ayarlarını dinamik olarak yapılandır
            config([
                'mail.mailers.smtp.host' => $config->host,
                'mail.mailers.smtp.port' => $config->port,
                'mail.mailers.smtp.username' => $config->username,
                'mail.mailers.smtp.password' => decrypt($config->password),
                'mail.mailers.smtp.encryption' => $config->encryption === 'none' ? null : $config->encryption,
                'mail.from.address' => $config->from_address,
                'mail.from.name' => $config->from_name,
            ]);

            // Get mail template
            $template = MailTemplate::where('type', 'reservation_confirmation')
                ->where('is_active', true)
                ->first();

            if ($template) {
                // Use template with placeholders
                $subject = $this->replacePlaceholders($template->subject, $request, $companySettings, $reservation);
                $body = $this->replacePlaceholders($template->body, $request, $companySettings, $reservation);
                
                Mail::html($body, function ($mail) use ($request, $config, $subject) {
                    $mail->to($request->customer_email)
                        ->subject($subject);
                });
            } else {
                // Fallback to simple email content
                $subject = 'Rezervasyon Onayı - ' . $request->bungalow_name;
                $message = "
                    Sayın {$request->customer_name},
                    
                    Rezervasyonunuz başarıyla oluşturulmuştur.
                    
                    Rezervasyon Detayları:
                    - Bungalov: {$request->bungalow_name}
                    - Giriş Tarihi: {$request->check_in_date}
                    - Çıkış Tarihi: {$request->check_out_date}
                    - Toplam Tutar: ₺{$request->total_price}
                    
                    Rezervasyonunuzu onaylamak için aşağıdaki linke tıklayın:
                    {$request->confirmation_link}
                    
                    Onay süresi: {$request->confirmation_hours} saat
                    
                    İyi günler dileriz.
                ";

                Mail::raw($message, function ($mail) use ($request, $config, $subject) {
                    $mail->to($request->customer_email)
                        ->subject($subject);
                });
            }

            // Activity log
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'reservation_confirmation_email_sent',
                'description' => 'Rezervasyon onay maili gönderildi: ' . $request->customer_email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon onay maili başarıyla gönderildi!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon onay maili gönderilirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Replace placeholders in template
     */
    private function replacePlaceholders($content, $request, $companySettings, $reservation = null)
    {
        // Şirket adresini birleştir
        $companyAddress = '';
        if ($companySettings) {
            $addressParts = array_filter([
                $companySettings->address,
                $companySettings->postal_code,
                $companySettings->district,
                $companySettings->city
            ]);
            $companyAddress = implode(' ', $addressParts);
        }

        $placeholders = [
            // Rezervasyon bilgileri
            '{{customer_name}}' => $request->customer_name,
            '{{bungalow_name}}' => $request->bungalow_name,
            '{{check_in_date}}' => \Carbon\Carbon::parse($request->check_in_date)->format('d.m.Y'),
            '{{check_out_date}}' => \Carbon\Carbon::parse($request->check_out_date)->format('d.m.Y'),
            '{{guest_count}}' => $request->guest_count ?? 1,
            '{{total_price}}' => '₺' . number_format($request->total_price, 0, ',', '.'),
            '{{reservation_code}}' => $reservation ? $reservation->reservation_code : ($request->reservation_code ?? 'N/A'),
            '{{confirmation_link}}' => $request->confirmation_link,
            '{{confirmation_hours}}' => $request->confirmation_hours,
            
            // Şirket bilgileri - yeni placeholder'lar
            '{{companyName}}' => $companySettings->company_name ?? 'Bungalov Rezervasyon Sistemi',
            '{{companyAddress}}' => $companyAddress,
            '{{companyEmail}}' => $companySettings->email ?? '',
            '{{companyPhone}}' => $companySettings->phone ?? '',
            '{{companyWebsite}}' => $companySettings->website ?? '',
            '{{companyLogo}}' => $companySettings->logo_path ?? '',
            '{{companyGoogleProfile}}' => $companySettings->google_business_profile ?? '',
            
            // Eski placeholder'lar (geriye uyumluluk için)
            '{{company_name}}' => $companySettings->company_name ?? 'Bungalov Rezervasyon Sistemi',
            '{{company_email}}' => $companySettings->email ?? '',
            '{{company_phone}}' => $companySettings->phone ?? '',
            '{{company_website}}' => $companySettings->website ?? '',
        ];

        return str_replace(array_keys($placeholders), array_values($placeholders), $content);
    }
}

