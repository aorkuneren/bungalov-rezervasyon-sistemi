<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\MailTemplate;

class MailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Rezervasyon Onay Maili',
                'type' => 'reservation_confirmation',
                'subject' => 'Rezervasyon Onayı - {{bungalow_name}}',
                'body' => $this->getReservationConfirmationTemplate(),
                'is_active' => true
            ]
        ];

        foreach ($templates as $template) {
            MailTemplate::updateOrCreate(
                ['type' => $template['type']],
                $template
            );
        }
    }

    private function getReservationConfirmationTemplate()
    {
        return '
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rezervasyon Onayı</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f8f9fa;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo-container {
            margin-bottom: 20px;
        }
        .logo {
            max-width: 120px;
            max-height: 60px;
            width: auto;
            height: auto;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.8;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 24px;
            color: #1a1a1a;
        }
        .success-message {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        .success-message h2 {
            color: #1a1a1a;
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
        }
        .success-message p {
            color: #6c757d;
            margin: 0;
            font-size: 14px;
        }
        .details-card {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 24px;
            margin: 24px 0;
        }
        .details-card h3 {
            color: #1a1a1a;
            margin: 0 0 20px 0;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f1f3f4;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 500;
            color: #6c757d;
            flex: 1;
            font-size: 14px;
        }
        .detail-value {
            color: #1a1a1a;
            font-weight: 500;
            flex: 1;
            text-align: right;
            font-size: 14px;
        }
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #1a1a1a;
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            letter-spacing: 0.5px;
            transition: background-color 0.2s ease;
        }
        .cta-button:hover {
            background-color: #333333;
        }
        .warning-box {
            background-color: #fff8e1;
            border: 1px solid #ffecb3;
            border-radius: 6px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
        }
        .warning-box h4 {
            color: #1a1a1a;
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
        }
        .warning-box p {
            color: #6c757d;
            margin: 0;
            font-size: 13px;
        }
        .contact-section {
            text-align: center;
            margin: 32px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 6px;
        }
        .contact-section h4 {
            color: #1a1a1a;
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
        }
        .contact-section p {
            color: #6c757d;
            margin: 0;
            font-size: 13px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 0 0 16px 0;
            color: #1a1a1a;
            font-size: 14px;
            font-weight: 500;
        }
        .company-info {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e9ecef;
        }
        .company-info p {
            margin: 4px 0;
            font-size: 12px;
            color: #6c757d;
        }
        .company-info a {
            color: #1a1a1a;
            text-decoration: none;
        }
        .company-info a:hover {
            text-decoration: underline;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
            }
            .detail-value {
                text-align: left;
                margin-top: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="{{companyLogo}}" alt="{{companyName}}" class="logo" />
            </div>
            <h1>Rezervasyon Onayı</h1>
            <p>Bungalov Rezervasyon Sistemi</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Sayın <strong>{{customer_name}}</strong>,
            </div>
            
            <div class="success-message">
                <h2>Rezervasyonunuz Başarıyla Oluşturulmuştur</h2>
                <p>Rezervasyon detaylarınız aşağıda yer almaktadır.</p>
            </div>
            
            <div class="details-card">
                <h3>Rezervasyon Detayları</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Bungalov</span>
                    <span class="detail-value">{{bungalow_name}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Giriş Tarihi</span>
                    <span class="detail-value">{{check_in_date}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Çıkış Tarihi</span>
                    <span class="detail-value">{{check_out_date}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Misafir Sayısı</span>
                    <span class="detail-value">{{guest_count}} kişi</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Toplam Tutar</span>
                    <span class="detail-value" style="font-weight: 600;">{{total_price}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Rezervasyon Kodu</span>
                    <span class="detail-value" style="font-family: monospace; background-color: #f1f3f4; padding: 4px 8px; border-radius: 4px;">{{reservation_code}}</span>
                </div>
            </div>
            
            <div class="cta-section">
                <h3 style="color: #1a1a1a; margin-bottom: 12px; font-size: 16px; font-weight: 600;">Rezervasyonunuzu Onaylayın</h3>
                <p style="color: #6c757d; margin-bottom: 20px; font-size: 14px;">Rezervasyonunuzu aktif hale getirmek için aşağıdaki butona tıklayın:</p>
                <a href="{{confirmation_link}}" class="cta-button">Rezervasyonu Onayla</a>
            </div>
            
            <div class="warning-box">
                <h4>Önemli Uyarı</h4>
                <p><strong>Onay süresi: {{confirmation_hours}} saat</strong><br>
                Bu süre içinde onaylanmayan rezervasyonlar otomatik olarak iptal edilir.</p>
            </div>
            
            <div class="contact-section">
                <h4>İletişim</h4>
                <p>Herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>İyi günler dileriz!</p>
            <div class="company-info">
                <p><strong>{{companyName}}</strong></p>
                <p>{{companyAddress}}</p>
                <p>{{companyEmail}}</p>
                <p>{{companyPhone}}</p>
                <p><a href="{{companyWebsite}}">{{companyWebsite}}</a></p>
                <p><a href="{{companyGoogleProfile}}">Google Profilimiz</a></p>
            </div>
        </div>
    </div>
</body>
</html>';
    }
}
