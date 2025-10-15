import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  BellIcon,
  GlobeAltIcon,
  CircleStackIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ui/Toast';
import { settingsAPI, mailAPI, ekHizmetlerAPI, termsConditionsAPI, systemSettingsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input, { TelInput, EmailInput, NumberInput, DateInput } from '../components/ui/Input';
import { TabContainer, TabPanel } from '../components/ui/Tabs';
import { FormSection, FormActions, FormField, FormGrid } from '../components/ui/FormGroup';
import Badge from '../components/ui/Badge';
import Switch from '../components/ui/Switch';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(() => {
    // localStorage'dan aktif tab'ı al, yoksa 'firma' varsayılan
    return localStorage.getItem('settingsActiveTab') || 'firma';
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { success: toastSuccess, error: toastError } = useToast();

  // Firma Bilgileri State
  const [firmaData, setFirmaData] = useState({
    companyName: '',
    companyType: 'limited',
    taxNumber: '',
    taxOffice: '',
    logo: null,
    logoPreview: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    bankName: '',
    bankAccount: '',
    iban: '',
    googleBusinessProfile: ''
  });

  // Akordion durumları
  const [accordionStates, setAccordionStates] = useState(() => {
    // localStorage'dan akordion durumlarını al
    const savedStates = localStorage.getItem('settingsAccordionStates');
    if (savedStates) {
      return JSON.parse(savedStates);
    }
    // Varsayılan durumlar
    return {
      temelBilgiler: true,
      iletisimBilgileri: false,
      bankaBilgileri: false,
      googleBusiness: false,
      logYonetimi: false,
      yedeklemeAyarlari: false,
      guvenlikAyarlari: false,
      cacheYonetimi: false,
      sistemBilgileri: false
    };
  });


  // Rezervasyon Ayarları State
  const [rezervasyonData, setRezervasyonData] = useState({
    // Giriş Çıkış Saati
    checkInOutEnabled: true,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    
    // Minimum Konaklama
    minStayEnabled: false,
    minStayDays: 1,
    
    // Kapora Bedeli
    depositRequired: true,
    depositAmount: 3000,
    
    // İptal/İade Kuralı
    cancellationEnabled: true,
    cancellationDays: 7,
    
    // Rezervasyon Onay Süresi
    confirmationEnabled: true,
    confirmationHours: 24,
    
    // Eski alanlar (geriye dönük uyumluluk için)
    depositPercentage: 30,
    cancellationPolicy: 'flexible',
    earlyBirdDiscount: 0,
    lastMinuteDiscount: 0,
    weekendPricing: false
  });

  // Ek Hizmetler State
  const [ekHizmetler, setEkHizmetler] = useState([]);

  // Bildirim Ayarları State
  const [bildirimData, setBildirimData] = useState({
    // Bildirim Tercihleri
    emailNotifications: true,
    whatsappNotifications: true,
    
    // Mail Sunucu Ayarları
    mailHost: '',
    mailPort: 587,
    mailUsername: '',
    mailPassword: '',
    mailEncryption: 'tls',
    mailFromAddress: '',
    mailFromName: ''
  });

  // Mail Test State
  const [mailTestData, setMailTestData] = useState({
    testEmail: '',
    isSendingTest: false
  });

  // Mail Config State
  const [mailConfig, setMailConfig] = useState(null);
  const [loadingMailConfig, setLoadingMailConfig] = useState(false);

  // Şartlar ve Kurallar State
  const [termsConditions, setTermsConditions] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isEditingTerm, setIsEditingTerm] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);

  // Sistem Ayarları State
  const [sistemData, setSistemData] = useState({
    autoBackup: false,
    backupFrequency: 'daily',
    backupTime: '02:00',
    backupLocation: '/backups',
    backupEmailNotification: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipRestriction: false,
    autoCacheClear: false,
    logRetention: 30,
    detailedLogging: true
  });

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'sartlar-kurallar') {
      loadTermsConditions();
    } else if (activeTab === 'sistem') {
      loadSistemAyarlari();
    }
  }, [activeTab]);


  // Sistem Ayarları - Load Function
  const loadSistemAyarlari = async () => {
    try {
      const response = await systemSettingsAPI.getSettings();
      if (response.data.success) {
        const backendData = response.data.data;
        // Backend'den gelen snake_case verileri camelCase'e çevir
        // backup_time'ı ISO datetime'dan HH:mm formatına çevir
        let formattedBackupTime = '02:00'; // default
        if (backendData.backup_time) {
          try {
            const date = new Date(backendData.backup_time);
            formattedBackupTime = date.toTimeString().slice(0, 5); // HH:mm formatına çevir
          } catch (e) {
            console.warn('Backup time format error:', e);
          }
        }

        setSistemData({
          autoBackup: backendData.auto_backup,
          backupFrequency: backendData.backup_frequency,
          backupTime: formattedBackupTime,
          backupLocation: backendData.backup_location,
          backupEmailNotification: backendData.backup_email_notification,
          sessionTimeout: backendData.session_timeout,
          maxLoginAttempts: backendData.max_login_attempts,
          ipRestriction: backendData.ip_restriction,
          autoCacheClear: backendData.auto_cache_clear,
          logRetention: backendData.log_retention,
          detailedLogging: backendData.detailed_logging
        });
      }
    } catch (error) {
      console.error('Sistem ayarları yüklenirken hata:', error);
      toastError('Sistem ayarları yüklenirken hata oluştu');
    }
  };

  // Sistem Ayarları - Input Change Handler
  const handleSistemInputChange = (field, value) => {
    setSistemData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Şablon Yönetimi State - KALDIRILDI
  const [templateData, setTemplateData] = useState({
    emailTemplates: {
      reservation_confirmation: {
        name: 'Rezervasyon Onay Maili',
        subject: 'Rezervasyon Onayı - {{companyName}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
            <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="{{companyLogo}}" alt="{{companyName}}" style="max-height: 60px; max-width: 200px; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin: 0;">✅ Rezervasyon Onaylandı</h2>
            </div>
              <p style="font-size: 16px; color: #374151;">Sayın {{customerName}},</p>
              <p style="color: #6b7280; margin-bottom: 25px;">{{companyName}} için yaptığınız rezervasyon başarıyla onaylanmıştır.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">📋 Rezervasyon Detayları</h3>
                <div style="display: grid; gap: 10px;">
                  <div><strong>🔢 Rezervasyon No:</strong> {{reservationNumber}}</div>
                  <div><strong>📅 Giriş Tarihi:</strong> {{checkInDate}}</div>
                  <div><strong>📅 Çıkış Tarihi:</strong> {{checkOutDate}}</div>
                  <div><strong>🏨 Bungalov:</strong> {{bungalowName}}</div>
                  <div><strong>👥 Misafir Sayısı:</strong> {{guestCount}} kişi</div>
                  <div><strong>💰 Toplam Tutar:</strong> {{totalAmount}} ₺</div>
                  <div><strong>💳 Kapora Tutarı:</strong> {{depositAmount}} ₺</div>
                </div>
              </div>
              
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #0369a1; margin-top: 0;">📞 İletişim Bilgileri</h4>
                <div style="display: grid; gap: 8px; color: #0c4a6e;">
                  <div><strong>📍 Adres:</strong> {{companyAddress}}</div>
                  <div><strong>📞 Telefon:</strong> {{companyPhone}}</div>
                  <div><strong>✉️ E-posta:</strong> {{companyEmail}}</div>
                  <div><strong>🌐 Web Sitesi:</strong> {{companyWebsite}}</div>
                </div>
              </div>
              
              <p style="text-align: center; color: #6b7280; margin-top: 30px;">İyi günler dileriz.</p>
              <p style="text-align: center; color: #9ca3af; font-size: 14px;"><strong>{{companyName}} Ekibi</strong></p>
            </div>
          </div>
        `
      },
      upcoming_reservation: {
        name: 'Yaklaşan Rezervasyon Hatırlatması',
        subject: 'Rezervasyonunuz Yaklaşıyor - {{companyName}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
            <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="{{companyLogo}}" alt="{{companyName}}" style="max-height: 60px; max-width: 200px; margin-bottom: 20px;">
                <h2 style="color: #f59e0b; margin: 0;">⏰ Rezervasyonunuz Yaklaşıyor</h2>
            </div>
              <p style="font-size: 16px; color: #374151;">Sayın {{customerName}},</p>
              <p style="color: #6b7280; margin-bottom: 25px;">{{companyName}}'deki rezervasyonunuz {{daysUntilCheckIn}} gün sonra başlayacak.</p>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #92400e; margin-top: 0;">📅 Rezervasyon Bilgileri</h3>
                <div style="display: grid; gap: 10px; color: #92400e;">
                  <div><strong>🔢 Rezervasyon No:</strong> {{reservationNumber}}</div>
                  <div><strong>📅 Giriş Tarihi:</strong> {{checkInDate}}</div>
                  <div><strong>📅 Çıkış Tarihi:</strong> {{checkOutDate}}</div>
                  <div><strong>🏨 Bungalov:</strong> {{bungalowName}}</div>
                  <div><strong>👥 Misafir Sayısı:</strong> {{guestCount}} kişi</div>
            </div>
              </div>
              
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #0369a1; margin-top: 0;">ℹ️ Önemli Bilgiler</h4>
                <div style="color: #0c4a6e;">
                  <p>• Check-in saati: {{checkInTime}}</p>
                  <p>• Check-out saati: {{checkOutTime}}</p>
                  <p>• Gerekli belgeler: Kimlik belgesi</p>
                  <p>• İletişim: {{companyPhone}}</p>
                </div>
              </div>
              
              <p style="text-align: center; color: #6b7280; margin-top: 30px;">Görüşmek üzere!</p>
              <p style="text-align: center; color: #9ca3af; font-size: 14px;"><strong>{{companyName}} Ekibi</strong></p>
            </div>
          </div>
        `
      },
      reservation_delay: {
        name: 'Rezervasyon Erteleme Bildirimi',
        subject: 'Rezervasyon Erteleme - {{companyName}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
            <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="{{companyLogo}}" alt="{{companyName}}" style="max-height: 60px; max-width: 200px; margin-bottom: 20px;">
                <h2 style="color: #dc2626; margin: 0;">⏳ Rezervasyon Erteleme</h2>
              </div>
              <p style="font-size: 16px; color: #374151;">Sayın {{customerName}},</p>
              <p style="color: #6b7280; margin-bottom: 25px;">{{companyName}}'deki rezervasyonunuz ertelenmiştir.</p>
              
              <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #991b1b; margin-top: 0;">📋 Eski Rezervasyon Bilgileri</h3>
                <div style="display: grid; gap: 10px; color: #991b1b;">
                  <div><strong>🔢 Rezervasyon No:</strong> {{reservationNumber}}</div>
                  <div><strong>📅 Eski Giriş:</strong> {{oldCheckInDate}}</div>
                  <div><strong>📅 Eski Çıkış:</strong> {{oldCheckOutDate}}</div>
                  <div><strong>🏨 Bungalov:</strong> {{bungalowName}}</div>
                </div>
              </div>
              
              <div style="background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #15803d; margin-top: 0;">✅ Yeni Rezervasyon Bilgileri</h3>
                <div style="display: grid; gap: 10px; color: #15803d;">
                  <div><strong>📅 Yeni Giriş:</strong> {{newCheckInDate}}</div>
                  <div><strong>📅 Yeni Çıkış:</strong> {{newCheckOutDate}}</div>
                  <div><strong>📝 Erteleme Sebebi:</strong> {{delayReason}}</div>
                </div>
              </div>
              
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #0369a1; margin-top: 0;">📞 İletişim</h4>
                <div style="color: #0c4a6e;">
                  <p>Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.</p>
                  <p><strong>Telefon:</strong> {{companyPhone}}</p>
                  <p><strong>E-posta:</strong> {{companyEmail}}</p>
                </div>
              </div>
              
              <p style="text-align: center; color: #6b7280; margin-top: 30px;">Anlayışınız için teşekkür ederiz.</p>
              <p style="text-align: center; color: #9ca3af; font-size: 14px;"><strong>{{companyName}} Ekibi</strong></p>
            </div>
          </div>
        `
      },
      reservation_cancellation: {
        name: 'Rezervasyon İptal Bildirimi',
        subject: 'Rezervasyon İptali - {{companyName}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
            <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="{{companyLogo}}" alt="{{companyName}}" style="max-height: 60px; max-width: 200px; margin-bottom: 20px;">
                <h2 style="color: #dc2626; margin: 0;">❌ Rezervasyon İptal Edildi</h2>
              </div>
              <p style="font-size: 16px; color: #374151;">Sayın {{customerName}},</p>
              <p style="color: #6b7280; margin-bottom: 25px;">{{companyName}}'deki rezervasyonunuz iptal edilmiştir.</p>
              
              <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #991b1b; margin-top: 0;">📋 İptal Edilen Rezervasyon</h3>
                <div style="display: grid; gap: 10px; color: #991b1b;">
                  <div><strong>🔢 Rezervasyon No:</strong> {{reservationNumber}}</div>
                  <div><strong>📅 Giriş Tarihi:</strong> {{checkInDate}}</div>
                  <div><strong>📅 Çıkış Tarihi:</strong> {{checkOutDate}}</div>
                  <div><strong>🏨 Bungalov:</strong> {{bungalowName}}</div>
                  <div><strong>💰 Toplam Tutar:</strong> {{totalAmount}} ₺</div>
                  <div><strong>📅 İptal Tarihi:</strong> {{cancellationDate}}</div>
                </div>
              </div>
              
              <div style="background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #15803d; margin-top: 0;">💰 İade Bilgileri</h3>
                <div style="color: #15803d;">
                  <p><strong>İade Tutarı:</strong> {{refundAmount}} ₺</p>
                  <p><strong>İade Süreci:</strong> {{refundProcess}}</p>
                  <p><strong>İade Tarihi:</strong> {{refundDate}}</p>
                </div>
              </div>
              
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #0369a1; margin-top: 0;">📞 İletişim</h4>
                <div style="color: #0c4a6e;">
                  <p>Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.</p>
                  <p><strong>Telefon:</strong> {{companyPhone}}</p>
                  <p><strong>E-posta:</strong> {{companyEmail}}</p>
                </div>
              </div>
              
              <p style="text-align: center; color: #6b7280; margin-top: 30px;">Tekrar görüşmek üzere!</p>
              <p style="text-align: center; color: #9ca3af; font-size: 14px;"><strong>{{companyName}} Ekibi</strong></p>
            </div>
          </div>
        `
      },
      reservation_completion: {
        name: 'Rezervasyon Tamamlama Teşekkür Maili',
        subject: 'Teşekkürler - {{companyName}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
            <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="{{companyLogo}}" alt="{{companyName}}" style="max-height: 60px; max-width: 200px; margin-bottom: 20px;">
                <h2 style="color: #16a34a; margin: 0;">🎉 Teşekkürler!</h2>
              </div>
              <p style="font-size: 16px; color: #374151;">Sayın {{customerName}},</p>
              <p style="color: #6b7280; margin-bottom: 25px;">{{companyName}}'de geçirdiğiniz güzel zamanlar için teşekkür ederiz!</p>
              
              <div style="background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #15803d; margin-top: 0;">📋 Tamamlanan Rezervasyon</h3>
                <div style="display: grid; gap: 10px; color: #15803d;">
                  <div><strong>🔢 Rezervasyon No:</strong> {{reservationNumber}}</div>
                  <div><strong>📅 Giriş Tarihi:</strong> {{checkInDate}}</div>
                  <div><strong>📅 Çıkış Tarihi:</strong> {{checkOutDate}}</div>
                  <div><strong>🏨 Bungalov:</strong> {{bungalowName}}</div>
                  <div><strong>👥 Misafir Sayısı:</strong> {{guestCount}} kişi</div>
                </div>
              </div>
              
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #0369a1; margin-top: 0;">⭐ Değerlendirme</h4>
                <div style="color: #0c4a6e;">
                  <p>Deneyiminizi değerlendirmek için aşağıdaki linke tıklayabilirsiniz:</p>
                  <p style="text-align: center; margin: 20px 0;">
                    <a href="{{reviewLink}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Değerlendirme Yap</a>
                  </p>
                </div>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #92400e; margin-top: 0;">🎁 Özel Teklifler</h4>
                <div style="color: #92400e;">
                  <p>Size özel indirim kodları ve erken rezervasyon avantajları için:</p>
                  <p><strong>Web Sitesi:</strong> {{companyWebsite}}</p>
                  <p><strong>E-posta:</strong> {{companyEmail}}</p>
                </div>
              </div>
              
              <p style="text-align: center; color: #6b7280; margin-top: 30px;">Tekrar görüşmek üzere!</p>
              <p style="text-align: center; color: #9ca3af; font-size: 14px;"><strong>{{companyName}} Ekibi</strong></p>
            </div>
          </div>
        `
      }
    },
    whatsappTemplates: {
      reservation_confirmation: {
        name: 'Rezervasyon Onay WhatsApp',
        content: `🎉 *Rezervasyon Onaylandı!*

Merhaba {{customerName}}!

{{companyName}} için yaptığınız rezervasyon başarıyla onaylanmıştır.

📋 *Rezervasyon Detayları:*
🔢 Rezervasyon No: {{reservationNumber}}
📅 Giriş: {{checkInDate}}
📅 Çıkış: {{checkOutDate}}
🏨 Bungalov: {{bungalowName}}
👥 Misafir: {{guestCount}} kişi
💰 Tutar: {{totalAmount}} ₺
💳 Kapora: {{depositAmount}} ₺

📞 *İletişim:*
📍 {{companyAddress}}
📱 {{companyPhone}}
✉️ {{companyEmail}}

İyi günler! 🎊`
      },
      upcoming_reservation: {
        name: 'Yaklaşan Rezervasyon WhatsApp',
        content: `⏰ *Rezervasyonunuz Yaklaşıyor!*

Merhaba {{customerName}}!

{{companyName}}'deki rezervasyonunuz {{daysUntilCheckIn}} gün sonra başlayacak.

📅 *Rezervasyon Bilgileri:*
🔢 Rezervasyon No: {{reservationNumber}}
📅 Giriş: {{checkInDate}}
📅 Çıkış: {{checkOutDate}}
🏨 Bungalov: {{bungalowName}}

ℹ️ *Önemli Bilgiler:*
• Check-in: {{checkInTime}}
• Check-out: {{checkOutTime}}
• Gerekli: Kimlik belgesi

📞 {{companyPhone}}

Görüşmek üzere! 😊`
      },
      reservation_delay: {
        name: 'Rezervasyon Erteleme WhatsApp',
        content: `⏳ *Rezervasyon Erteleme*

Merhaba {{customerName}}!

{{companyName}}'deki rezervasyonunuz ertelenmiştir.

📋 *Eski Rezervasyon:*
🔢 Rezervasyon No: {{reservationNumber}}
📅 Eski Giriş: {{oldCheckInDate}}
📅 Eski Çıkış: {{oldCheckOutDate}}

✅ *Yeni Tarihler:*
📅 Yeni Giriş: {{newCheckInDate}}
📅 Yeni Çıkış: {{newCheckOutDate}}
📝 Sebep: {{delayReason}}

📞 Sorularınız için: {{companyPhone}}

Anlayışınız için teşekkürler! 🙏`
      },
      reservation_cancellation: {
        name: 'Rezervasyon İptal WhatsApp',
        content: `❌ *Rezervasyon İptal Edildi*

Merhaba {{customerName}}!

{{companyName}}'deki rezervasyonunuz iptal edilmiştir.

📋 *İptal Edilen Rezervasyon:*
🔢 Rezervasyon No: {{reservationNumber}}
📅 Giriş: {{checkInDate}}
📅 Çıkış: {{checkOutDate}}
🏨 Bungalov: {{bungalowName}}
💰 Tutar: {{totalAmount}} ₺

💰 *İade Bilgileri:*
💵 İade Tutarı: {{refundAmount}} ₺
📅 İade Tarihi: {{refundDate}}

📞 Sorularınız için: {{companyPhone}}

Tekrar görüşmek üzere! 👋`
      },
      reservation_completion: {
        name: 'Rezervasyon Tamamlama WhatsApp',
        content: `🎉 *Teşekkürler!*

Merhaba {{customerName}}!

{{companyName}}'de geçirdiğiniz güzel zamanlar için teşekkür ederiz!

📋 *Tamamlanan Rezervasyon:*
🔢 Rezervasyon No: {{reservationNumber}}
📅 Giriş: {{checkInDate}}
📅 Çıkış: {{checkOutDate}}
🏨 Bungalov: {{bungalowName}}

⭐ *Değerlendirme:*
Deneyiminizi değerlendirmek için:
{{reviewLink}}

🎁 *Özel Teklifler:*
Web: {{companyWebsite}}
E-posta: {{companyEmail}}

Tekrar görüşmek üzere! 🎊`
      }
    }
  });

  // Şablon düzenleme durumu - KALDIRILDI
  // const [editingTemplate, setEditingTemplate] = useState(null);
  // const [templatePreview, setTemplatePreview] = useState(null);

  // Template değişkenleri için veri hazırlama (firma bilgileri + örnek veriler) - KALDIRILDI
  // const getTemplateData = () => {
  //   return {
  //     // Firma bilgilerinden gelen veriler
  //     companyName: firmaData.companyName || 'WebAdam Otel',
  //     companyEmail: firmaData.email || 'info@webadam.com',
  //     companyPhone: firmaData.phone || '+90 212 555 0123',
  //     companyAddress: firmaData.address || 'İstanbul, Türkiye',
  //     companyWebsite: firmaData.website || 'www.webadam.com',
  //     companyLogo: firmaData.logoPreview || 'https://via.placeholder.com/150x50/2563eb/ffffff?text=LOGO',
  //     
  //     // Örnek müşteri ve rezervasyon verileri
  //     customerName: 'Ahmet Yılmaz',
  //     customerEmail: 'ahmet.yilmaz@email.com',
  //     customerPhone: '+90 555 123 45 67',
  //     checkInDate: '15 Mart 2024',
  //     checkOutDate: '18 Mart 2024',
  //     bungalowName: 'Deluxe Bungalov',
  //     guestCount: '4',
  //     totalAmount: '2.500',
  //     reservationNumber: 'REZ-2024-001',
  //     bookingDate: '10 Mart 2024',
  //     depositAmount: '750',
  //     cancellationDate: '8 Mart 2024',
  //     
  //     // Yeni template değişkenleri
  //     daysUntilCheckIn: '3',
  //     checkInTime: '14:00',
  //     checkOutTime: '11:00',
  //     oldCheckInDate: '15 Mart 2024',
  //     oldCheckOutDate: '18 Mart 2024',
  //     newCheckInDate: '20 Mart 2024',
  //     newCheckOutDate: '23 Mart 2024',
  //     delayReason: 'Hava koşulları nedeniyle',
  //     refundAmount: '2.500',
  //     refundProcess: '5-10 iş günü içinde',
  //     refundDate: '12 Mart 2024',
  //     reviewLink: 'https://example.com/review/REZ-2024-001'
  //   };
  // };

  // Şifre görünürlük durumu
  const [showPassword, setShowPassword] = useState(false);

  // Bildirim & İletişim Akordion State'leri
  const [bildirimAccordionStates, setBildirimAccordionStates] = useState({
    tercihler: true,
    mailSunucu: false
  });

  // Şartlar ve Kurallar State
  const [sartlarData, setSartlarData] = useState({
    kiralamaSartlari: {
      title: 'Kiralama Şartları ve Sözleşmesi',
      content: `
        <h2>Kiralama Şartları ve Sözleşmesi</h2>
        <p>Bu sözleşme, {{companyName}} ile müşteri arasında yapılan kiralama işlemini düzenler.</p>
        
        <h3>1. Genel Hükümler</h3>
        <p>Bu sözleşme, kiralama işleminin tüm koşullarını belirler ve taraflar arasında bağlayıcıdır.</p>
        
        <h3>2. Kiralama Koşulları</h3>
        <ul>
          <li>Minimum kiralama süresi 1 gündür</li>
          <li>Kiralama bedeli önceden belirlenen fiyatlar üzerinden hesaplanır</li>
          <li>Kapora bedeli toplam tutarın %30'u kadardır</li>
        </ul>
        
        <h3>3. Ödeme Koşulları</h3>
        <p>Ödemeler rezervasyon sırasında veya giriş tarihinden önce yapılmalıdır.</p>
        
        <h3>4. Sorumluluklar</h3>
        <p>Müşteri, kiralanan alanı temiz ve düzenli tutmakla yükümlüdür.</p>
      `
    },
    iptalPolitikasi: {
      title: 'İptal Politikası',
      content: `
        <h2>İptal Politikası</h2>
        <p>{{companyName}} iptal politikası aşağıdaki gibidir:</p>
        
        <h3>1. İptal Koşulları</h3>
        <ul>
          <li><strong>7 gün öncesi:</strong> %100 iade</li>
          <li><strong>3-6 gün öncesi:</strong> %50 iade</li>
          <li><strong>0-2 gün öncesi:</strong> İade yok</li>
        </ul>
        
        <h3>2. İptal İşlemi</h3>
        <p>İptal talepleri yazılı olarak {{companyEmail}} adresine gönderilmelidir.</p>
        
        <h3>3. İade Süreci</h3>
        <p>İade işlemleri 5-10 iş günü içinde tamamlanır.</p>
        
        <h3>4. Özel Durumlar</h3>
        <p>Doğal afet, hastalık gibi özel durumlarda esnek yaklaşım sergilenir.</p>
      `
    },
    kullanimKosullari: {
      title: 'Kullanım Koşulları',
      content: `
        <h2>Kullanım Koşulları</h2>
        <p>Bu platformu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız:</p>
        
        <h3>1. Platform Kullanımı</h3>
        <ul>
          <li>Platform sadece yasal amaçlar için kullanılabilir</li>
          <li>Başkalarının haklarını ihlal eden davranışlar yasaktır</li>
          <li>Sahte bilgi vermek yasaktır</li>
        </ul>
        
        <h3>2. Hesap Güvenliği</h3>
        <p>Hesap bilgilerinizi güvenli tutmak sizin sorumluluğunuzdadır.</p>
        
        <h3>3. İçerik Sorumluluğu</h3>
        <p>Yüklediğiniz içeriklerden siz sorumlusunuz.</p>
        
        <h3>4. Hizmet Kesintileri</h3>
        <p>Bakım ve güncelleme çalışmaları sırasında hizmet kesintileri olabilir.</p>
      `
    },
    kvkkAydinlatma: {
      title: 'KVKK Aydınlatma Metni',
      content: `
        <h2>Kişisel Verilerin Korunması Kanunu Aydınlatma Metni</h2>
        <p>{{companyName}} olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma yükümlülüğümüzü yerine getirmekteyiz.</p>
        
        <h3>1. Veri Sorumlusu</h3>
        <p><strong>Şirket:</strong> {{companyName}}<br>
        <strong>Adres:</strong> {{companyAddress}}<br>
        <strong>E-posta:</strong> {{companyEmail}}<br>
        <strong>Telefon:</strong> {{companyPhone}}</p>
        
        <h3>2. Toplanan Kişisel Veriler</h3>
        <ul>
          <li>Kimlik bilgileri (ad, soyad, TC kimlik no)</li>
          <li>İletişim bilgileri (telefon, e-posta, adres)</li>
          <li>Rezervasyon bilgileri</li>
          <li>Ödeme bilgileri</li>
        </ul>
        
        <h3>3. Veri İşleme Amaçları</h3>
        <ul>
          <li>Rezervasyon işlemlerinin gerçekleştirilmesi</li>
          <li>Müşteri hizmetlerinin sunulması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        </ul>
        
        <h3>4. Veri Paylaşımı</h3>
        <p>Kişisel verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmaz.</p>
        
        <h3>5. Veri Sahibinin Hakları</h3>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenen verileriniz hakkında bilgi talep etme</li>
          <li>Verilerin düzeltilmesini isteme</li>
          <li>Verilerin silinmesini isteme</li>
        </ul>
      `
    },
    gizlilikBildirimi: {
      title: 'Gizlilik Bildirimi',
      content: `
        <h2>Gizlilik Bildirimi</h2>
        <p>{{companyName}} olarak, gizliliğinize saygı duyuyor ve kişisel bilgilerinizi korumak için gerekli önlemleri alıyoruz.</p>
        
        <h3>1. Bilgi Toplama</h3>
        <p>Hizmetlerimizi sunabilmek için gerekli olan bilgileri topluyoruz:</p>
        <ul>
          <li>Rezervasyon yaparken verdiğiniz bilgiler</li>
          <li>Web sitesi kullanım verileri</li>
          <li>İletişim geçmişi</li>
        </ul>
        
        <h3>2. Bilgi Kullanımı</h3>
        <p>Toplanan bilgiler şu amaçlarla kullanılır:</p>
        <ul>
          <li>Rezervasyon işlemlerinin gerçekleştirilmesi</li>
          <li>Müşteri hizmetlerinin iyileştirilmesi</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        </ul>
        
        <h3>3. Bilgi Güvenliği</h3>
        <p>Bilgilerinizi korumak için:</p>
        <ul>
          <li>SSL şifreleme kullanıyoruz</li>
          <li>Güvenli sunucular kullanıyoruz</li>
          <li>Düzenli güvenlik güncellemeleri yapıyoruz</li>
        </ul>
        
        <h3>4. Çerezler</h3>
        <p>Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz.</p>
        
        <h3>5. İletişim</h3>
        <p>Gizlilik ile ilgili sorularınız için {{companyEmail}} adresine yazabilirsiniz.</p>
      `
    }
  });

  // Şartlar ve Kurallar Akordion State'leri
  const [sartlarAccordionStates, setSartlarAccordionStates] = useState({
    kiralamaSartlari: true,
    iptalPolitikasi: false,
    kullanimKosullari: false,
    kvkkAydinlatma: false,
    gizlilikBildirimi: false
  });

  // Düzenleme durumu
  const [editingSection, setEditingSection] = useState(null);

  const tabs = [
    { id: 'firma', name: 'Firma Bilgileri', icon: BuildingOfficeIcon },
    { id: 'rezervasyon', name: 'Rezervasyon', icon: DocumentTextIcon },
    { id: 'ek-hizmetler', name: 'Ek Hizmetler', icon: BuildingOfficeIcon },
    { id: 'bildirim-iletisim', name: 'Bildirim & İletişim', icon: BellIcon },
    { id: 'sartlar-kurallar', name: 'Şartlar ve Kurallar', icon: DocumentTextIcon },
    { id: 'sistem', name: 'Sistem', icon: GlobeAltIcon }
  ];

  const handleInputChange = (section, field, value) => {
    if (section === 'firma') {
      setFirmaData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'rezervasyon') {
      setRezervasyonData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'bildirim') {
      setBildirimData(prev => ({ ...prev, [field]: value }));
    } else if (section === 'sistem') {
      setSistemData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleAccordion = (accordionKey) => {
    setAccordionStates(prev => {
      const newStates = {
        ...prev,
        [accordionKey]: !prev[accordionKey]
      };
      // Akordion durumlarını localStorage'a kaydet
      localStorage.setItem('settingsAccordionStates', JSON.stringify(newStates));
      return newStates;
    });
  };


  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Aktif tab'ı localStorage'a kaydet
    localStorage.setItem('settingsActiveTab', tabId);
  };

  // Para birimi formatlama fonksiyonu
  const formatCurrency = (value) => {
    if (!value) return '0';
    const numbers = value.toString().replace(/\D/g, '');
    if (!numbers) return '0';
    
    // Basit binlik ayraç ekleme
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };


  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastError('Logo dosyası 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya türü kontrolü
      if (!file.type.startsWith('image/')) {
        toastError('Lütfen geçerli bir resim dosyası seçin');
        return;
      }

      // Preview oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setFirmaData(prev => ({
          ...prev,
          logo: file,
          logoPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.removeCompanyLogo();
      
      if (response.data.success) {
        setFirmaData(prev => ({
          ...prev,
          logo: null,
          logoPreview: ''
        }));
        toastSuccess('Logo başarıyla kaldırıldı');
      } else {
        toastError(response.data.message || 'Logo kaldırılırken hata oluştu');
      }
    } catch (error) {
      console.error('Logo kaldırma hatası:', error);
      toastError('Logo kaldırılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Ek hizmetleri yükle
  const loadEkHizmetler = async () => {
    try {
      setLoading(true);
      const response = await ekHizmetlerAPI.getEkHizmetler();
      
      if (response.data.success && response.data.data) {
        setEkHizmetler(response.data.data);
      }
    } catch (error) {
      console.error('Error loading ek hizmetler:', error);
      toastError('Ek hizmetler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Yeni ek hizmet ekle
  const addEkHizmet = () => {
    const newHizmet = {
      id: Date.now(), // Geçici ID
      name: '',
      price: 0,
      pricing_type: 'per_person',
      is_active: true,
      sort_order: ekHizmetler.length + 1
    };
    setEkHizmetler(prev => [...prev, newHizmet]);
  };

  // Ek hizmet güncelle
  const updateEkHizmet = (id, field, value) => {
    setEkHizmetler(prev => prev.map(hizmet => 
      hizmet.id === id ? { ...hizmet, [field]: value } : hizmet
    ));
  };

  // Ek hizmet sil
  const removeEkHizmet = async (id) => {
    try {
      // Eğer backend'de kayıtlı bir hizmet ise API'den sil
      // Backend ID'leri genellikle 1-1000 arasında olur, geçici ID'ler çok büyük sayılar olur
      if (typeof id === 'number' && id <= 1000) {
        setLoading(true);
        await ekHizmetlerAPI.deleteEkHizmet(id);
        toastSuccess('Ek hizmet başarıyla silindi');
      } else {
        // Geçici ID'li hizmetler için sadece frontend'den kaldır
        toastSuccess('Ek hizmet kaldırıldı');
      }
      
      // Frontend state'den kaldır
      setEkHizmetler(prev => prev.filter(hizmet => hizmet.id !== id));
    } catch (error) {
      console.error('Error deleting ek hizmet:', error);
      toastError('Ek hizmet silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Ek hizmetleri kaydet
  const handleEkHizmetlerSave = async () => {
    try {
      setLoading(true);
      
      // Yeni eklenen hizmetleri kaydet
      // Backend ID'leri genellikle 1-1000 arasında olur, geçici ID'ler çok büyük sayılar olur
      const newHizmetler = ekHizmetler.filter(hizmet => typeof hizmet.id === 'number' && hizmet.id > 1000);
      const existingHizmetler = ekHizmetler.filter(hizmet => typeof hizmet.id === 'number' && hizmet.id <= 1000);
      
      // Yeni hizmetleri oluştur
      for (const hizmet of newHizmetler) {
        if (hizmet.name.trim()) {
          const response = await ekHizmetlerAPI.createEkHizmet({
            name: hizmet.name,
            price: hizmet.price,
            pricing_type: hizmet.pricing_type,
            is_active: hizmet.is_active,
            sort_order: hizmet.sort_order
          });
          
          if (response.data.success) {
            // Frontend state'i güncelle
            setEkHizmetler(prev => prev.map(h => 
              h.id === hizmet.id ? { ...response.data.data, id: response.data.data.id } : h
            ));
          }
        }
      }
      
      // Mevcut hizmetleri güncelle
      for (const hizmet of existingHizmetler) {
        if (hizmet.name.trim()) {
          await ekHizmetlerAPI.updateEkHizmet(hizmet.id, {
            name: hizmet.name,
            price: hizmet.price,
            pricing_type: hizmet.pricing_type,
            is_active: hizmet.is_active,
            sort_order: hizmet.sort_order
          });
        }
      }
      
      toastSuccess('Ek hizmetler başarıyla kaydedildi');
    } catch (error) {
      console.error('Error saving ek hizmetler:', error);
      toastError('Ek hizmetler kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Bildirim & İletişim için akordion toggle fonksiyonu
  const toggleBildirimAccordion = (section) => {
    setBildirimAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  // Template değişkenlerini gerçek verilerle değiştiren fonksiyon - KALDIRILDI
  // const replaceTemplateVariables = (content, data = null) => {
  //   const templateData = data || getTemplateData();
  //   let replacedContent = content;
  //   
  //   // Tüm template değişkenlerini bul ve değiştir
  //   Object.keys(templateData).forEach(key => {
  //     const regex = new RegExp(`{{${key}}}`, 'g');
  //     replacedContent = replacedContent.replace(regex, templateData[key]);
  //   });
  //   
  //   return replacedContent;
  // };

  // Template önizleme için veri hazırlama - KALDIRILDI
  // const getPreviewTemplate = (template, type) => {
  //   if (type === 'email') {
  //     return {
  //       ...template,
  //       subject: replaceTemplateVariables(template.subject),
  //       content: replaceTemplateVariables(template.content)
  //     };
  //   } else {
  //     return {
  //       ...template,
  //       content: replaceTemplateVariables(template.content)
  //     };
  //   }
  // };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8001/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mailHost: bildirimData.mailHost,
          mailPort: bildirimData.mailPort,
          mailUsername: bildirimData.mailUsername,
          mailPassword: bildirimData.mailPassword,
          mailEncryption: bildirimData.mailEncryption,
          mailFromAddress: bildirimData.mailFromAddress,
          mailFromName: bildirimData.mailFromName
        }),
      });

      if (response.ok) {
        toastSuccess('Test e-postası başarıyla gönderildi');
      } else {
        toastError('Test e-postası gönderilemedi');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toastError('Test e-postası gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Şartlar ve Kurallar için akordion toggle fonksiyonu
  const toggleSartlarAccordion = (section) => {
    setSartlarAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Şartlar ve Kurallar düzenleme fonksiyonları
  const handleSectionEdit = (sectionKey) => {
    setEditingSection(sectionKey);
  };

  const handleSectionSave = (sectionKey, updatedContent) => {
    setSartlarData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        content: updatedContent
      }
    }));
    setEditingSection(null);
    toastSuccess('İçerik başarıyla güncellendi');
  };

  const handleSectionCancel = () => {
    setEditingSection(null);
  };

  // Firma bilgilerini kaydet
  const saveCompanySettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.updateCompanySettings({
        company_name: firmaData.companyName,
        company_type: firmaData.companyType,
        tax_number: firmaData.taxNumber,
        tax_office: firmaData.taxOffice,
        address: firmaData.address,
        city: firmaData.city,
        district: firmaData.district,
        postal_code: firmaData.postalCode,
        phone: firmaData.phone,
        email: firmaData.email,
        website: firmaData.website,
        bank_name: firmaData.bankName,
        bank_account: firmaData.bankAccount,
        iban: firmaData.iban,
        google_business_profile: firmaData.googleBusinessProfile
      });
      
      if (response.data.success) {
        toastSuccess('Firma bilgileri başarıyla güncellendi');
      } else {
        toastError(response.data.message || 'Firma bilgileri güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Firma bilgileri kaydetme hatası:', error);
      toastError('Firma bilgileri kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Rezervasyon ayarlarını yükle
  const loadReservationSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getReservationSettings();
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setRezervasyonData(prev => ({
          ...prev,
          checkInOutEnabled: data.check_in_out_enabled ?? true,
          checkInTime: data.check_in_time || '14:00',
          checkOutTime: data.check_out_time || '11:00',
          minStayEnabled: data.min_stay_enabled ?? false,
          minStayDays: data.min_stay_days || 1,
          depositRequired: data.deposit_required ?? true,
          depositAmount: parseInt(data.deposit_amount) || 3000,
          depositPercentage: data.deposit_percentage || 30,
          cancellationEnabled: data.cancellation_enabled ?? true,
          cancellationDays: data.cancellation_days || 7,
          cancellationPolicy: data.cancellation_policy || 'flexible',
          confirmationEnabled: data.confirmation_enabled ?? true,
          confirmationHours: data.confirmation_hours || 24,
          earlyBirdDiscount: data.early_bird_discount || 0,
          lastMinuteDiscount: data.last_minute_discount || 0,
          weekendPricing: data.weekend_pricing ?? false
        }));
      }
    } catch (error) {
      console.error('Rezervasyon ayarları yükleme hatası:', error);
      toastError('Rezervasyon ayarları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Rezervasyon ayarlarını kaydet
  const saveReservationSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.updateReservationSettings({
        check_in_out_enabled: rezervasyonData.checkInOutEnabled,
        check_in_time: rezervasyonData.checkInTime,
        check_out_time: rezervasyonData.checkOutTime,
        min_stay_enabled: rezervasyonData.minStayEnabled,
        min_stay_days: rezervasyonData.minStayDays,
        deposit_required: rezervasyonData.depositRequired,
        deposit_amount: rezervasyonData.depositAmount,
        deposit_percentage: rezervasyonData.depositPercentage,
        cancellation_enabled: rezervasyonData.cancellationEnabled,
        cancellation_days: rezervasyonData.cancellationDays,
        cancellation_policy: rezervasyonData.cancellationPolicy,
        confirmation_enabled: rezervasyonData.confirmationEnabled,
        confirmation_hours: rezervasyonData.confirmationHours,
        early_bird_discount: rezervasyonData.earlyBirdDiscount,
        last_minute_discount: rezervasyonData.lastMinuteDiscount,
        weekend_pricing: rezervasyonData.weekendPricing
      });
      
      if (response.data.success) {
        toastSuccess('Rezervasyon ayarları başarıyla güncellendi');
      } else {
        toastError(response.data.message || 'Rezervasyon ayarları güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Rezervasyon ayarları kaydetme hatası:', error);
      toastError('Rezervasyon ayarları kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Firma bilgilerini yükle
  const loadCompanySettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getCompanySettings();
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setFirmaData(prev => ({
          ...prev,
          companyName: data.company_name || '',
          companyType: data.company_type || 'limited',
          taxNumber: data.tax_number || '',
          taxOffice: data.tax_office || '',
          logoPreview: data.logo_path ? `http://localhost:8000/storage/${data.logo_path.replace('public/', '')}` : '',
          address: data.address || '',
          city: data.city || '',
          district: data.district || '',
          postalCode: data.postal_code || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          bankName: data.bank_name || '',
          bankAccount: data.bank_account || '',
          iban: data.iban || '',
          googleBusinessProfile: data.google_business_profile || ''
        }));
      }
    } catch (error) {
      console.error('Firma bilgileri yükleme hatası:', error);
      toastError('Firma bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Şartlar ve Kurallar verilerini yükleme fonksiyonu
  const loadSartlarKurallar = async () => {
    try {
      // Şartlar ve kurallar API henüz hazır değil, geçici olarak devre dışı
      // const response = await settingsAPI.getSartlarKurallar();
      
      // if (response.data.success && response.data.data) {
      //   setSartlarData(prev => ({
      //     ...prev,
      //     kiralamaSartlari: {
      //       title: response.data.data.kiralama_sartlari?.title || prev.kiralamaSartlari.title,
      //       content: response.data.data.kiralama_sartlari?.content || prev.kiralamaSartlari.content
      //     },
      //     iptalPolitikasi: {
      //       title: response.data.data.iptal_politikasi?.title || prev.iptalPolitikasi.title,
      //       content: response.data.data.iptal_politikasi?.content || prev.iptalPolitikasi.content
      //     },
      //     kullanimKosullari: {
      //       title: response.data.data.kullanim_kosullari?.title || prev.kullanimKosullari.title,
      //       content: response.data.data.kullanim_kosullari?.content || prev.kullanimKosullari.content
      //     },
      //     kvkkAydinlatma: {
      //     title: response.data.data.kvkk_aydinlatma?.title || prev.kvkkAydinlatma.title,
      //     content: response.data.data.kvkk_aydinlatma?.content || prev.kvkkAydinlatma.content
      //   },
      //   gizlilikBildirimi: {
      //     title: response.data.data.gizlilik_bildirimi?.title || prev.gizlilikBildirimi.title,
      //     content: response.data.data.gizlilik_bildirimi?.content || prev.gizlilikBildirimi.content
      //   }
      // }));
      // }
    } catch (error) {
      console.error('Sartlar kurallar load error:', error);
      // Hata durumunda varsayılan değerler kullanılır
    }
  };

  // HTML içeriğini temizleme fonksiyonu
  const cleanHtmlContent = (html) => {
    if (!html) return '';
    
    return html
      // Boş p etiketlerini kaldır
      .replace(/<p>\s*<\/p>/gi, '')
      // Boş h3 etiketlerini kaldır
      .replace(/<h3>\s*<\/h3>/gi, '')
      // Gereksiz br etiketlerini kaldır (p etiketinden sonra gelen)
      .replace(/<\/p>\s*<br\s*\/?>\s*<p>/gi, '</p><p>')
      // Başlangıçtaki gereksiz br etiketlerini kaldır
      .replace(/^(<br\s*\/?>\s*)+/gi, '')
      // Sondaki gereksiz br etiketlerini kaldır
      .replace(/(<br\s*\/?>\s*)+$/gi, '')
      // Çoklu boşlukları tek boşluğa çevir
      .replace(/\s+/g, ' ')
      // Trim
      .trim();
  };

  // Şartlar ve Kurallar kaydetme fonksiyonu
  const handleSartlarKurallarSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      const requestData = {
        kiralama_sartlari: cleanHtmlContent(sartlarData.kiralamaSartlari.content),
        iptal_politikasi: cleanHtmlContent(sartlarData.iptalPolitikasi.content),
        kullanim_kosullari: cleanHtmlContent(sartlarData.kullanimKosullari.content),
        kvkk_aydinlatma: cleanHtmlContent(sartlarData.kvkkAydinlatma.content),
        gizlilik_bildirimi: cleanHtmlContent(sartlarData.gizlilikBildirimi.content)
      };

      const response = await settingsAPI.saveSartlarKurallar(requestData);
      
      if (response.data.success) {
        toastSuccess('Şartlar ve Kurallar başarıyla kaydedildi');
      } else {
        toastError(response.data.message || 'Kaydetme işlemi başarısız');
      }
    } catch (error) {
      console.error('Sartlar kurallar save error:', error);
      if (error.response?.data?.message) {
        toastError(error.response.data.message);
      } else {
        toastError('Kaydetme işlemi sırasında hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  // Template yükleme fonksiyonu - KALDIRILDI
  // const loadTemplates = async () => {
  //   try {
  //     const response = await templateAPI.getTemplates();
  //     
  //     if (response.data.success && response.data.data) {
  //       setTemplateData(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Template load error:', error);
  //     // Hata durumunda varsayılan şablonlar kullanılır
  //   }
  // };

  // Sayfa yüklendiğinde ayarları çek
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Firma bilgilerini yükle
        await loadCompanySettings();
        
        // Rezervasyon ayarlarını yükle
        await loadReservationSettings();
        
        // Legacy settings API henüz hazır değil, geçici olarak devre dışı
        // const token = localStorage.getItem('auth_token');
        // const response = await fetch('http://localhost:8000/api/settings', {
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //   },
        // });

        // if (response.ok) {
        //   const data = await response.json();
        //   if (data.success && data.settings) {
        //     const settings = data.settings;
            
        //     // Diğer ayarları güncelle (firma bilgileri hariç)
        //     setFirmaData(prev => ({
        //       ...prev,
        //       // Firma bilgileri loadCompanySettings tarafından yüklendi
        //       phone: settings.phone || '',
        //       email: settings.email || '',
        //       website: settings.website || '',
        //       bankName: settings.bank_name || '',
        //       bankAccount: settings.bank_account || '',
        //       iban: settings.iban || '',
        //       googleBusinessProfile: settings.google_business_profile || ''
        //     }));

        //     // Rezervasyon ayarlarını güncelle
        //     setRezervasyonData(prev => ({
        //       ...prev,
        //       // Giriş Çıkış Saati
        //       checkInOutEnabled: settings.check_in_out_enabled ?? true,
        //       checkInTime: settings.check_in_time || '14:00',
        //       checkOutTime: settings.check_out_time || '11:00',
              
        //       // Minimum Konaklama
        //       minStayEnabled: settings.min_stay_enabled ?? false,
        //       minStayDays: settings.min_stay_days ?? 1,
              
        //       // Kapora Bedeli
        //       depositRequired: settings.deposit_required ?? true,
        //       depositAmount: settings.deposit_amount ?? 3000,
              
        //       // İptal/İade Kuralı
        //       cancellationEnabled: settings.cancellation_enabled ?? true,
        //       cancellationDays: settings.cancellation_days ?? 7,
              
        //       // Rezervasyon Onay Süresi
        //       confirmationEnabled: settings.confirmation_enabled ?? true,
        //       confirmationHours: settings.confirmation_hours ?? 24,
              
        //       // Eski alanlar (geriye dönük uyumluluk için)
        //       depositPercentage: settings.deposit_percentage ?? 30,
        //       cancellationPolicy: settings.cancellation_policy || 'flexible',
        //       earlyBirdDiscount: settings.early_bird_discount ?? 0,
        //       lastMinuteDiscount: settings.last_minute_discount ?? 0,
        //       weekendPricing: settings.weekend_pricing ?? false
        //     }));

        //     // Ek hizmetleri ayrı olarak yükle
        //     loadEkHizmetler();
            
        //     // Şartlar ve kuralları yükle
        //     loadSartlarKurallar();
            
        //     // Template'leri yükle - KALDIRILDI
        //     // loadTemplates();

        //     // Bildirim ayarlarını güncelle
        //     setBildirimData(prev => ({
        //       ...prev,
        //       // Bildirim Tercihleri
        //       emailNotifications: settings.email_notifications ?? true,
        //       whatsappNotifications: settings.whatsapp_notifications ?? true,
              
        //       // Mail Sunucu Ayarları
        //       mailHost: settings.mail_host || '',
        //       mailPort: settings.mail_port ?? 587,
        //       mailUsername: settings.mail_username || '',
        //       mailPassword: '', // Güvenlik için şifre her zaman boş gösterilir
        //       mailEncryption: settings.mail_encryption || 'tls',
        //       mailFromAddress: settings.mail_from_address || '',
        //       mailFromName: settings.mail_from_name || ''
        //     }));

        //     // Sistem ayarlarını güncelle
        //     setSistemData(prev => ({
        //       ...prev,
        //       maintenanceMode: settings.maintenance_mode ?? false,
        //       autoBackup: settings.auto_backup ?? true,
        //       backupFrequency: settings.backup_frequency || 'daily',
        //       logRetention: settings.log_retention ?? 30,
        //       dataCleanup: settings.data_cleanup ?? false
        //     }));
        //   }
        // }
      } catch (error) {
        console.error('Error loading settings:', error);
        toastError('Ayarlar yüklenirken hata oluştu');
      }
    };

    loadSettings();
    loadMailConfig();
    loadEkHizmetler();
  }, []);

  // Her tab için ayrı kaydet fonksiyonları
  const handleFirmaSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Önce logo varsa yükle
      if (firmaData.logo) {
        const formData = new FormData();
        formData.append('logo', firmaData.logo);
        
        const logoResponse = await settingsAPI.uploadCompanyLogo(formData);
        if (!logoResponse.data.success) {
          throw new Error(logoResponse.data.message || 'Logo yüklenirken hata oluştu');
        }
        
        // Logo yüklendikten sonra preview'ı güncelle
        if (logoResponse.data.data && logoResponse.data.data.logo_url) {
          setFirmaData(prev => ({
            ...prev,
            logoPreview: logoResponse.data.data.logo_url,
            logo: null // File objesini temizle
          }));
        }
      }
      
      // Firma bilgilerini kaydet
      await saveCompanySettings();
      
    } catch (error) {
      console.error('Firma save error:', error);
      toastError(error.message || 'Firma bilgileri kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRezervasyonSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Rezervasyon ayarlarını kaydet
      await saveReservationSettings();
    } catch (error) {
      console.error('Rezervasyon save error:', error);
      toastError(error.message || 'Rezervasyon ayarları kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };


  const handleBildirimSave = async () => {
    setLoading(true);
    setErrors({});

    // Frontend validasyonu
    const requiredFields = {
      mailHost: 'SMTP Sunucu Adresi',
      mailPort: 'Port',
      mailUsername: 'Kullanıcı Adı',
      mailEncryption: 'Şifreleme',
      mailFromAddress: 'Gönderen E-posta Adresi',
      mailFromName: 'Gönderen Adı'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!bildirimData[field] || bildirimData[field].toString().trim() === '') {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      toastError(`Lütfen şu alanları doldurun: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const response = await mailAPI.updateConfig({
        host: bildirimData.mailHost,
        port: bildirimData.mailPort,
        username: bildirimData.mailUsername,
        password: bildirimData.mailPassword,
        encryption: bildirimData.mailEncryption,
        from_address: bildirimData.mailFromAddress,
        from_name: bildirimData.mailFromName,
        email_notifications: bildirimData.emailNotifications,
        whatsapp_notifications: bildirimData.whatsappNotifications,
      });

      if (response.data.success) {
        toastSuccess('Bildirim ayarları başarıyla kaydedildi');
        // Şifreyi temizle (güvenlik için)
        setBildirimData(prev => ({ ...prev, mailPassword: '' }));
        // Mail config'i yeniden yükle
        loadMailConfig();
      } else {
        toastError(response.data.message || 'Bildirim ayarları kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Bildirim save error:', error);
      if (error.response?.data?.errors) {
        // Backend validasyon hatalarını göster
        const errorMessages = Object.values(error.response.data.errors).flat();
        toastError(`Validasyon hatası: ${errorMessages.join(', ')}`);
      } else if (error.response?.data?.message) {
        toastError(error.response.data.message);
      } else {
        toastError(error.message || 'Bildirim ayarları kaydedilirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mail ayarlarını yükle
  const loadMailConfig = async () => {
    try {
      setLoadingMailConfig(true);
      const response = await mailAPI.getConfig();
      
      if (response.data.success && response.data.data) {
        const config = response.data.data;
        setMailConfig({
          host: config.host,
          port: config.port,
          username: config.username,
          encryption: config.encryption,
          from_address: config.from_address,
          from_name: config.from_name
        });
        
        // Bildirim data'yı da güncelle
        setBildirimData(prev => ({
          ...prev,
          mailHost: config.host,
          mailPort: config.port,
          mailUsername: config.username,
          mailEncryption: config.encryption,
          mailFromAddress: config.from_address,
          mailFromName: config.from_name,
          emailNotifications: config.email_notifications,
          whatsappNotifications: config.whatsapp_notifications,
        }));
      }
    } catch (error) {
      console.error('Mail ayarları yükleme hatası:', error);
    } finally {
      setLoadingMailConfig(false);
    }
  };

  // Test maili gönder
  const handleSendTestEmail = async () => {
    if (!mailTestData.testEmail) {
      toastError('Lütfen test e-posta adresini girin');
      return;
    }

    try {
      setMailTestData(prev => ({ ...prev, isSendingTest: true }));
      
      const response = await mailAPI.sendTestEmail(mailTestData.testEmail);
      
      if (response.data.success) {
        toastSuccess('Test maili başarıyla gönderildi!');
        setMailTestData(prev => ({ ...prev, testEmail: '' }));
      } else {
        console.error('Test mail hatası:', response.data.message);
        toastError(response.data.message || 'Test maili gönderilemedi');
      }
    } catch (error) {
      console.error('Test mail gönderme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Test maili gönderilirken hata oluştu';
      toastError(errorMessage);
    } finally {
      setMailTestData(prev => ({ ...prev, isSendingTest: false }));
    }
  };

  const handleSistemSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Frontend camelCase verileri backend snake_case formatına çevir
      // backend backup_time'ı H:i formatında bekliyor (örn: "02:00")

      const backendData = {
        auto_backup: sistemData.autoBackup,
        backup_frequency: sistemData.backupFrequency,
        backup_time: sistemData.backupTime, // HH:mm formatında gönder (örn: "02:00")
        backup_location: sistemData.backupLocation,
        backup_email_notification: sistemData.backupEmailNotification,
        session_timeout: sistemData.sessionTimeout,
        max_login_attempts: sistemData.maxLoginAttempts,
        ip_restriction: sistemData.ipRestriction,
        auto_cache_clear: sistemData.autoCacheClear,
        log_retention: sistemData.logRetention,
        detailed_logging: sistemData.detailedLogging
      };

      const response = await systemSettingsAPI.updateSettings(backendData);
      
      if (response.data.success) {
        toastSuccess('Sistem ayarları başarıyla kaydedildi');
      } else {
        toastError(response.data.message || 'Sistem ayarları kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Sistem save error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toastError(`Validasyon hatası: ${errorMessages.join(', ')}`);
      } else if (error.response?.data?.message) {
        toastError(error.response.data.message);
      } else {
        toastError('Sistem ayarları kaydedilirken hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCacheClear = async (type) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8001/api/system/cache-clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toastSuccess(`${type === 'all' ? 'Tüm cache' : type + ' cache'} başarıyla temizlendi`);
      } else {
        toastError(data.message || 'Cache temizleme işlemi başarısız');
      }
    } catch (error) {
      console.error('Cache clear error:', error);
      toastError('Cache temizleme işlemi sırasında hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogClear = async () => {
    try {
    setLoading(true);
      
      const response = await fetch(`http://localhost:8001/api/system/log-clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toastSuccess('Eski loglar başarıyla temizlendi');
      } else {
        toastError(data.message || 'Log temizleme işlemi başarısız');
      }
    } catch (error) {
      console.error('Log clear error:', error);
      toastError('Log temizleme işlemi sırasında hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditLogsClear = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8001/api/system/audit-logs-clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          retention_days: sistemData.logRetention
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toastSuccess(data.message);
      } else {
        toastError(data.message || 'Audit log temizleme işlemi başarısız');
      }
    } catch (error) {
      console.error('Audit log clear error:', error);
      toastError('Audit log temizleme işlemi sırasında hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };



  const renderFirmaBilgileri = () => (
    <div className="space-y-6">
      {/* Temel Bilgiler Akordion */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleAccordion('temelBilgiler')}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Temel Bilgiler</h3>
            <p className="text-sm text-gray-500 mt-1">Şirket logosu, adı, türü ve vergi bilgileri</p>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${
              accordionStates.temelBilgiler ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {accordionStates.temelBilgiler && (
          <div className="px-6 pb-6 space-y-6">
        {/* Logo Yükleme Alanı */}
        <FormField label="Şirket Logosu">
          <div className="space-y-4">
            {/* File input her zaman mevcut */}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            
            {firmaData.logoPreview ? (
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={firmaData.logoPreview}
                    alt="Logo Preview"
                    className="p-2 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Logo yüklendi: {firmaData.logo?.name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const fileInput = document.getElementById('logo-upload');
                      if (fileInput) {
                        fileInput.click();
                      } else {
                        console.error('File input not found');
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    Değiştir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer"
                  >
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Logo yüklemek için tıklayın
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG, GIF (Max 5MB)
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </FormField>

        <FormGrid columns={2}>
          <FormField label="Şirket Adı" required>
            <Input
              value={firmaData.companyName}
              onChange={(e) => handleInputChange('firma', 'companyName', e.target.value)}
              placeholder="Şirket adını girin"
            />
          </FormField>
          
          <FormField label="Şirket Türü" required>
            <Select
              value={firmaData.companyType}
              onChange={(value) => handleInputChange('firma', 'companyType', value)}
              options={[
                { value: 'limited', label: 'Limited Şirket' },
                { value: 'sahis', label: 'Şahıs Şirketi' },
                { value: 'anonim', label: 'Anonim Şirket' }
              ]}
            />
          </FormField>
        </FormGrid>

        <FormGrid columns={2}>
          <FormField label="Vergi Numarası" required>
            <Input
              value={firmaData.taxNumber}
              onChange={(e) => handleInputChange('firma', 'taxNumber', e.target.value)}
              placeholder="Vergi numarasını girin"
            />
          </FormField>
          
          <FormField label="Vergi Dairesi" required>
            <Input
              value={firmaData.taxOffice}
              onChange={(e) => handleInputChange('firma', 'taxOffice', e.target.value)}
              placeholder="Vergi dairesini girin"
            />
          </FormField>
        </FormGrid>
          </div>
        )}
      </div>

      {/* İletişim Bilgileri Akordion */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleAccordion('iletisimBilgileri')}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800">İletişim Bilgileri</h3>
            <p className="text-sm text-gray-500 mt-1">Adres, telefon, e-posta ve website bilgileri</p>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${
              accordionStates.iletisimBilgileri ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {accordionStates.iletisimBilgileri && (
          <div className="px-6 pb-6 space-y-6">
        <FormField label="Adres" required>
          <Textarea
            value={firmaData.address}
            onChange={(e) => handleInputChange('firma', 'address', e.target.value)}
            placeholder="Tam adres bilgisi"
            rows={1}
          />
        </FormField>

        <FormGrid columns={3}>
          <FormField label="Şehir" required>
            <Input
              value={firmaData.city}
              onChange={(e) => handleInputChange('firma', 'city', e.target.value)}
              placeholder="Şehir"
            />
          </FormField>
          
          <FormField label="İlçe" required>
            <Input
              value={firmaData.district}
              onChange={(e) => handleInputChange('firma', 'district', e.target.value)}
              placeholder="İlçe"
            />
          </FormField>
          
          <FormField label="Posta Kodu">
            <Input
              value={firmaData.postalCode}
              onChange={(e) => handleInputChange('firma', 'postalCode', e.target.value)}
              placeholder="Posta kodu"
            />
          </FormField>
        </FormGrid>

        <FormGrid columns={2}>
          <FormField label="Telefon" required>
            <TelInput
              value={firmaData.phone}
              onChange={(e) => handleInputChange('firma', 'phone', e.target.value)}
              placeholder="+90 (5XX) XXX XX XX"
            />
          </FormField>
          
          <FormField label="E-posta" required>
            <EmailInput
              value={firmaData.email}
              onChange={(e) => handleInputChange('firma', 'email', e.target.value)}
              placeholder="E-posta adresi"
            />
          </FormField>
        </FormGrid>

        <FormField label="Website">
          <Input
            value={firmaData.website}
            onChange={(e) => handleInputChange('firma', 'website', e.target.value)}
            placeholder="https://example.com"
          />
        </FormField>
          </div>
        )}
      </div>

      {/* Banka Bilgileri Akordion */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleAccordion('bankaBilgileri')}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Banka Bilgileri</h3>
            <p className="text-sm text-gray-500 mt-1">Banka adı, hesap numarası ve IBAN bilgileri</p>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${
              accordionStates.bankaBilgileri ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {accordionStates.bankaBilgileri && (
          <div className="px-6 pb-6 space-y-6">
        <FormGrid columns={2}>
          <FormField label="Banka Adı">
            <Input
              value={firmaData.bankName}
              onChange={(e) => handleInputChange('firma', 'bankName', e.target.value)}
              placeholder="Banka adı"
            />
          </FormField>
          
          <FormField label="Hesap Numarası">
            <Input
              value={firmaData.bankAccount}
              onChange={(e) => handleInputChange('firma', 'bankAccount', e.target.value)}
              placeholder="Hesap numarası"
            />
          </FormField>
        </FormGrid>

        <FormField label="IBAN">
          <Input
            value={firmaData.iban}
            onChange={(e) => handleInputChange('firma', 'iban', e.target.value)}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
          />
        </FormField>
          </div>
        )}
      </div>

      {/* Google Business Profil Akordion */}
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleAccordion('googleBusiness')}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Google Business Profil</h3>
            <p className="text-sm text-gray-500 mt-1">Google Business Profil URL bilgisi</p>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${
              accordionStates.googleBusiness ? 'rotate-180' : ''
            }`} 
          />
        </div>
        
        {accordionStates.googleBusiness && (
          <div className="px-6 pb-6">
        <FormField label="Google Business Profil URL">
          <Input
            value={firmaData.googleBusinessProfile}
            onChange={(e) => handleInputChange('firma', 'googleBusinessProfile', e.target.value)}
            placeholder="https://g.page/your-business"
          />
        </FormField>
          </div>
        )}
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          onClick={handleFirmaSave}
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          Firma Bilgilerini Kaydet
        </Button>
      </div>
    </div>
  );

  const renderRezervasyon = () => (
    <div className="space-y-6">
      {/* Giriş Çıkış Saati Tanımlaması */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Giriş Çıkış Saati Tanımlaması</h3>
            <p className="text-sm text-gray-500 mt-1">Müşterilerin giriş ve çıkış saatlerini belirleyin</p>
          </div>
          <Switch
            checked={rezervasyonData.checkInOutEnabled}
            onChange={(checked) => handleInputChange('rezervasyon', 'checkInOutEnabled', checked)}
          />
        </div>
        
        {rezervasyonData.checkInOutEnabled && (
          <div className="space-y-4">
            <FormGrid columns={2}>
              <FormField label="Check-in Saati">
                <Input
                  type="time"
                  value={rezervasyonData.checkInTime}
                  onChange={(e) => handleInputChange('rezervasyon', 'checkInTime', e.target.value)}
                />
              </FormField>
              
              <FormField label="Check-out Saati">
                <Input
                  type="time"
                  value={rezervasyonData.checkOutTime}
                  onChange={(e) => handleInputChange('rezervasyon', 'checkOutTime', e.target.value)}
                />
              </FormField>
            </FormGrid>
          </div>
        )}
      </div>

      {/* Minimum Konaklama Kuralı */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Minimum Konaklama Kuralı</h3>
            <p className="text-sm text-gray-500 mt-1">Müşterilerin en az kaç gün konaklama yapması gerektiği</p>
          </div>
          <Switch
            checked={rezervasyonData.minStayEnabled}
            onChange={(checked) => handleInputChange('rezervasyon', 'minStayEnabled', checked)}
          />
        </div>
        
        {rezervasyonData.minStayEnabled && (
          <div className="space-y-4">
            <FormField label="Minimum Konaklama Süresi (Gün)">
              <Input
                type="number"
                value={rezervasyonData.minStayDays}
                onChange={(e) => handleInputChange('rezervasyon', 'minStayDays', parseInt(e.target.value))}
                min="1"
                placeholder="1"
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Kapora Bedeli Kuralı */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Kapora Bedeli Kuralı</h3>
            <p className="text-sm text-gray-500 mt-1">Rezervasyon onay sayfasında gösterilecek sabit kapora tutarı</p>
          </div>
          <Switch
            checked={rezervasyonData.depositRequired}
            onChange={(checked) => handleInputChange('rezervasyon', 'depositRequired', checked)}
          />
        </div>
        
        {rezervasyonData.depositRequired && (
          <div className="space-y-4">
            <FormField label="Varsayılan Kapora Tutarı (₺)">
              <NumberInput
                value={rezervasyonData.depositAmount}
                onChange={(e) => handleInputChange('rezervasyon', 'depositAmount', parseInt(e.target.value) || 0)}
                placeholder="3.000"
              />
            </FormField>
            <p className="text-xs text-gray-400">
              Rezervasyon onay sayfasında gösterilecek sabit kapora tutarı: ₺{rezervasyonData.depositAmount ? formatCurrency(rezervasyonData.depositAmount.toString()) : '0'}
            </p>
          </div>
        )}
      </div>

      {/* İptal/İade Kuralı */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">İptal/İade Kuralı</h3>
            <p className="text-sm text-gray-500 mt-1">Giriş yapılacak tarihten kaç gün öncesine kadar iptal edilebilir</p>
          </div>
          <Switch
            checked={rezervasyonData.cancellationEnabled}
            onChange={(checked) => handleInputChange('rezervasyon', 'cancellationEnabled', checked)}
          />
        </div>
        
        {rezervasyonData.cancellationEnabled && (
          <div className="space-y-4">
            <FormField label="İptal Edilebilir Gün Sayısı">
              <Input
                type="number"
                value={rezervasyonData.cancellationDays}
                onChange={(e) => handleInputChange('rezervasyon', 'cancellationDays', parseInt(e.target.value))}
                min="0"
                placeholder="7"
              />
            </FormField>
            <p className="text-xs text-gray-400">
              Giriş tarihinden {rezervasyonData.cancellationDays || 0} gün öncesine kadar iptal edilebilir
            </p>
          </div>
        )}
      </div>

      {/* Rezervasyon Onay Süresi */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Rezervasyon Onay Süresi</h3>
            <p className="text-sm text-gray-500 mt-1">Müşteriye gönderilen onay linkinin geçerlilik süresi</p>
          </div>
          <Switch
            checked={rezervasyonData.confirmationEnabled}
            onChange={(checked) => handleInputChange('rezervasyon', 'confirmationEnabled', checked)}
          />
        </div>
        
        {rezervasyonData.confirmationEnabled && (
          <div className="space-y-4">
            <FormField label="Onay Süresi (Saat)">
              <Input
                type="number"
                value={rezervasyonData.confirmationHours}
                onChange={(e) => handleInputChange('rezervasyon', 'confirmationHours', parseInt(e.target.value))}
                min="1"
                max="168"
                placeholder="24"
              />
            </FormField>
            <p className="text-xs text-gray-400">
              Müşteri {rezervasyonData.confirmationHours || 24} saat içinde rezervasyonu onaylamalıdır
            </p>
          </div>
        )}
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          onClick={handleRezervasyonSave}
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          Rezervasyon Ayarlarını Kaydet
        </Button>
      </div>
    </div>
  );

  const renderEkHizmetler = () => (
    <div className="space-y-6">
      <FormSection 
        title="Ek Hizmetler"
        description="Müşterilere sunabileceğiniz ek hizmetleri yönetin"
        action={
          <Button
            onClick={addEkHizmet}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Hizmet Ekle
          </Button>
        }
      >
        <div className="space-y-4">
          {ekHizmetler.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Henüz ek hizmet eklenmemiş</p>
              <p className="text-xs text-gray-400 mt-1">Yukarıdaki "Hizmet Ekle" butonuna tıklayarak ilk hizmetinizi ekleyin</p>
            </div>
          ) : (
            ekHizmetler.map((hizmet, index) => (
              <div key={hizmet.id} className="bg-gray-50 border border-gray-200 rounded-lg">
                {/* Akordiyon Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={hizmet.is_active}
                        onChange={(checked) => updateEkHizmet(hizmet.id, 'is_active', checked)}
                      />
                      <span className="text-sm font-medium text-gray-700">Aktif</span>
                    </div>
                    <Badge 
                      variant={hizmet.is_active ? "success" : "secondary"}
                      size="sm"
                    >
                      Hizmet #{index + 1}
                    </Badge>
                    <span className="text-sm text-gray-600 font-medium">
                      {hizmet.name || 'İsimsiz Hizmet'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => removeEkHizmet(hizmet.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Sil
                    </Button>
                  </div>
                </div>

                {/* Akordiyon Content - Sadece aktif hizmetlerde göster */}
                {hizmet.is_active && (
                  <div className="px-4 pb-4">
                    <FormGrid columns={3}>
                      <FormField label="Hizmet Adı" required>
                        <Input
                          value={hizmet.name}
                          onChange={(e) => updateEkHizmet(hizmet.id, 'name', e.target.value)}
                          placeholder="Örn: Kahvaltı, Transfer, Spa"
                        />
                      </FormField>
                      
                      <FormField label="Fiyat (₺)">
                        <NumberInput
                          value={hizmet.price}
                          onChange={(e) => updateEkHizmet(hizmet.id, 'price', parseInt(e.target.value))}
                          min="0"
                          step="1"
                          placeholder="0"
                        />
                      </FormField>
                      
                      <FormField label="Fiyatlandırma Türü">
                        <Select
                          value={hizmet.pricing_type}
                          onChange={(value) => updateEkHizmet(hizmet.id, 'pricing_type', value)}
                          options={[
                            { value: 'per_person', label: 'Kişi Başı' },
                            { value: 'per_night', label: 'Gecelik' },
                            { value: 'free', label: 'Ücretsiz' }
                          ]}
                        />
                      </FormField>
                    </FormGrid>

                    {hizmet.pricing_type === 'free' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <CheckIcon className="h-4 w-4 inline mr-1" />
                          Bu hizmet ücretsiz olarak sunulacak
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </FormSection>

      {/* Kaydet Butonu */}
      <FormActions>
        <Button
          onClick={handleEkHizmetlerSave}
          loading={loading}
          className="flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          Ek Hizmetleri Kaydet
        </Button>
      </FormActions>
    </div>
  );

  const renderBildirimIletisim = () => (
    <div className="space-y-6">
      {/* Bildirim Tercihleri */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleBildirimAccordion('tercihler')}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-900">Bildirim Tercihleri</h3>
            <p className="text-sm text-gray-500">Hangi bildirim türlerinin aktif olacağını belirleyin</p>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              bildirimAccordionStates.tercihler ? 'rotate-180' : ''
            }`} 
          />
        </button>
        
        {bildirimAccordionStates.tercihler && (
          <div className="px-6 pb-6 border-t border-gray-200">
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">E-posta Bildirimleri</h4>
                  <p className="text-sm text-gray-500">Rezervasyon onayı, iptal ve sistem bildirimleri</p>
                </div>
                <Switch
                  checked={bildirimData.emailNotifications}
                  onChange={(checked) => handleInputChange('bildirim', 'emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">WhatsApp Bildirimleri</h4>
                  <p className="text-sm text-gray-500">Müşteri iletişimi ve hızlı bildirimler</p>
                </div>
                <Switch
                  checked={bildirimData.whatsappNotifications}
                  onChange={(checked) => handleInputChange('bildirim', 'whatsappNotifications', checked)}
                />
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Mail Sunucu Yapılandırması */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleBildirimAccordion('mailSunucu')}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-900">Mail Sunucu Yapılandırması</h3>
            <p className="text-sm text-gray-500">E-posta gönderimi için SMTP sunucu ayarlarını yapılandırın</p>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              bildirimAccordionStates.mailSunucu ? 'rotate-180' : ''
            }`} 
          />
        </button>
        
        {bildirimAccordionStates.mailSunucu && (
          <div className="px-6 pb-6 border-t border-gray-200">
            <div className="pt-4">
              <FormGrid columns={2}>
                <FormField label="SMTP Sunucu Adresi" required>
                  <Input
                    value={bildirimData.mailHost}
                    onChange={(e) => handleInputChange('bildirim', 'mailHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </FormField>
                
                <FormField label="Port" required>
                  <Input
                    type="number"
                    value={bildirimData.mailPort}
                    onChange={(e) => handleInputChange('bildirim', 'mailPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </FormField>
                
                <FormField label="Kullanıcı Adı" required>
                  <Input
                    value={bildirimData.mailUsername}
                    onChange={(e) => handleInputChange('bildirim', 'mailUsername', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </FormField>
                
                <FormField label="Şifre" required>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={bildirimData.mailPassword}
                      onChange={(e) => handleInputChange('bildirim', 'mailPassword', e.target.value)}
                      placeholder={bildirimData.mailPassword ? "••••••••" : "Yeni şifre girin (boş bırakırsanız mevcut şifre korunur)"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </FormField>
                
                <FormField label="Şifreleme">
                  <Select
                    value={bildirimData.mailEncryption}
                    onChange={(value) => handleInputChange('bildirim', 'mailEncryption', value)}
                    options={[
                      { value: 'tls', label: 'TLS' },
                      { value: 'ssl', label: 'SSL' },
                      { value: 'none', label: 'Şifreleme Yok' }
                    ]}
                  />
                </FormField>
                
                <FormField label="Gönderen E-posta Adresi" required>
                  <Input
                    type="email"
                    value={bildirimData.mailFromAddress}
                    onChange={(e) => handleInputChange('bildirim', 'mailFromAddress', e.target.value)}
                    placeholder="noreply@yourcompany.com"
                  />
                </FormField>
              </FormGrid>

              <div className="mt-4">
                <FormField label="Gönderen Adı">
                  <Input
                    value={bildirimData.mailFromName}
                    onChange={(e) => handleInputChange('bildirim', 'mailFromName', e.target.value)}
                    placeholder="Şirket Adınız"
                  />
                </FormField>
              </div>

       

        {/* Test E-postası Gönderme */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-900 mb-2">Test E-postası Gönder</h5>
                <p className="text-sm text-yellow-700 mb-3">
                  Ayarlarınızı test etmek için test e-postası gönderebilirsiniz.
                </p>
          <div className="flex gap-3">
            <Input
              type="email"
              value={mailTestData.testEmail}
              onChange={(e) => setMailTestData(prev => ({ ...prev, testEmail: e.target.value }))}
              placeholder="Test e-posta adresi girin"
              className="flex-1"
            />
                <Button
              onClick={handleSendTestEmail}
                  variant="outline"
                  size="sm"
              loading={mailTestData.isSendingTest}
              disabled={!mailTestData.testEmail}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
                >
                  Test E-postası Gönder
                </Button>
          </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kaydet Butonu */}
      <FormActions>
        <Button
          onClick={handleBildirimSave}
          loading={loading}
          className="flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          Bildirim Ayarlarını Kaydet
        </Button>
      </FormActions>


    </div>
  );

  const renderSistem = () => (
    <div className="space-y-6">
      {/* Yedekleme Ayarları - Akordion */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <button
            onClick={() => toggleAccordion('yedeklemeAyarlari')}
            className="w-full flex items-center justify-between text-left"
          >
          <div>
              <h3 className="text-lg font-semibold text-gray-900">Yedekleme Ayarları</h3>
              <p className="text-sm text-gray-500">Otomatik yedekleme ve veri koruma ayarları</p>
          </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                accordionStates.yedeklemeAyarlari ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {accordionStates.yedeklemeAyarlari && (
            <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Otomatik Yedekleme</h4>
            <p className="text-sm text-gray-500">Düzenli olarak veri yedekle</p>
          </div>
          <Switch
            checked={sistemData.autoBackup}
            onChange={(checked) => handleSistemInputChange('autoBackup', checked)}
          />
        </div>

        {sistemData.autoBackup && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <FormGrid columns={2}>
          <FormField label="Yedekleme Sıklığı">
            <Select
              value={sistemData.backupFrequency}
              onChange={(value) => handleSistemInputChange('backupFrequency', value)}
              options={[
                { value: 'daily', label: 'Günlük' },
                { value: 'weekly', label: 'Haftalık' },
                { value: 'monthly', label: 'Aylık' }
              ]}
            />
          </FormField>

                  <FormField label="Yedekleme Saati">
          <Input
                      type="time"
                      value={sistemData.backupTime}
                      onChange={(e) => handleSistemInputChange('backupTime', e.target.value)}
          />
        </FormField>
                </FormGrid>
                
                <FormField label="Yedekleme Konumu">
                  <Input
                    type="text"
                    value={sistemData.backupLocation}
                    onChange={(e) => handleSistemInputChange('backupLocation', e.target.value)}
                    placeholder="/backups"
                  />
                </FormField>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">E-posta Bildirimi</h4>
                    <p className="text-sm text-gray-500">Yedekleme tamamlandığında bildirim gönder</p>
      </div>
                  <Switch
                    checked={sistemData.backupEmailNotification}
                    onChange={(checked) => handleSistemInputChange('backupEmailNotification', checked)}
                  />
    </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Güvenlik Ayarları - Akordion */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <button
            onClick={() => toggleAccordion('guvenlikAyarlari')}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Güvenlik Ayarları</h3>
              <p className="text-sm text-gray-500">Sistem güvenliği ve erişim kontrolleri</p>
            </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                accordionStates.guvenlikAyarlari ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {accordionStates.guvenlikAyarlari && (
            <div className="mt-6 space-y-6">
            <FormGrid columns={2}>
              <FormField label="Oturum Süresi (Dakika)">
          <Input
            type="number"
                  value={sistemData.sessionTimeout}
                  onChange={(e) => handleSistemInputChange('sessionTimeout', parseInt(e.target.value))}
                  min="5"
                  max="1440"
          />
        </FormField>
              
              <FormField label="Maksimum Giriş Denemesi">
                <Input
                  type="number"
                  value={sistemData.maxLoginAttempts}
                  onChange={(e) => handleSistemInputChange('maxLoginAttempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
              </FormField>
            </FormGrid>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">IP Kısıtlaması</h4>
                <p className="text-sm text-gray-500">Belirli IP adreslerinden erişimi kısıtla</p>
      </div>
              <Switch
                checked={sistemData.ipRestriction}
                onChange={(checked) => handleSistemInputChange('ipRestriction', checked)}
              />
    </div>
            </div>
          )}
              </div>
            </div>

      {/* Cache Yönetimi - Akordion */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <button
            onClick={() => toggleAccordion('cacheYonetimi')}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cache Yönetimi</h3>
              <p className="text-sm text-gray-500">Sistem performansı için cache ayarları</p>
          </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                accordionStates.cacheYonetimi ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {accordionStates.cacheYonetimi && (
            <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Otomatik Cache Temizleme</h4>
                <p className="text-sm text-gray-500">Düzenli olarak cache'i temizle</p>
              </div>
              <Switch
                checked={sistemData.autoCacheClear}
                onChange={(checked) => handleSistemInputChange('autoCacheClear', checked)}
              />
        </div>

            <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
                size="sm"
                onClick={() => handleCacheClear('all')}
                className="flex items-center gap-2"
          >
                <TrashIcon className="h-4 w-4" />
                Tüm Cache'i Temizle
          </Button>
          
          <Button
            variant="outline"
                size="sm"
                onClick={() => handleCacheClear('config')}
                className="flex items-center gap-2"
          >
                <TrashIcon className="h-4 w-4" />
                Config Cache
          </Button>
          
          <Button
            variant="outline"
                size="sm"
                onClick={() => handleCacheClear('route')}
                className="flex items-center gap-2"
          >
                <TrashIcon className="h-4 w-4" />
                Route Cache
          </Button>
        </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Yönetimi - Akordion */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <button
            onClick={() => toggleAccordion('logYonetimi')}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Log Yönetimi</h3>
              <p className="text-sm text-gray-500">Sistem logları ve kayıt ayarları</p>
            </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                accordionStates.logYonetimi ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {accordionStates.logYonetimi && (
            <div className="mt-6 space-y-6">
        <FormField label="Log Saklama Süresi (Gün)">
          <Input
            type="number"
            value={sistemData.logRetention}
            onChange={(e) => handleSistemInputChange('logRetention', parseInt(e.target.value))}
            min="1"
            max="365"
          />
        </FormField>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Detaylı Loglama</h4>
                  <p className="text-sm text-gray-500">Tüm işlemleri detaylı olarak kaydet</p>
                </div>
                <Switch
                  checked={sistemData.detailedLogging}
                  onChange={(checked) => handleSistemInputChange('detailedLogging', checked)}
                />
              </div>
              
              <div className="space-y-3">
                {/* Audit Logs Bilgi Notu */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Audit Logları Nedir?</h4>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p><strong>Audit Logları:</strong> Kullanıcı aktivitelerini, güvenlik olaylarını ve sistem işlemlerini kaydeden detaylı log kayıtlarıdır.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div>
                            <strong>Kaydedilen İşlemler:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Giriş/Çıkış işlemleri</li>
                              <li>Şifre değişiklikleri</li>
                              <li>Profil güncellemeleri</li>
                              <li>Kullanıcı oluşturma/silme</li>
                              <li>Şüpheli aktiviteler</li>
                            </ul>
                          </div>
                          <div>
                            <strong>Güvenlik Özellikleri:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>IP adresi takibi</li>
                              <li>Tarayıcı bilgileri</li>
                              <li>Zaman damgası</li>
                              <li>İşlem durumu</li>
                              <li>Detaylı metadata</li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                          <strong>⚠️ Dikkat:</strong> Kritik güvenlik logları (şifre değişiklikleri, şüpheli girişler) 1 yıl boyunca korunur. Normal aktivite logları {sistemData.logRetention} gün sonra temizlenir.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
          <Button
            variant="outline"
                    size="sm"
                    onClick={() => handleLogClear()}
                    className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
          >
                    <TrashIcon className="h-4 w-4" />
                    Sistem Logları
          </Button>
          <Button
            variant="outline"
                    size="sm"
                    onClick={() => handleAuditLogsClear()}
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
                    <TrashIcon className="h-4 w-4" />
                    Audit Logları
          </Button>
        </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sistem Bilgileri - Akordion */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <button
            onClick={() => toggleAccordion('sistemBilgileri')}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sistem Bilgileri</h3>
              <p className="text-sm text-gray-500">Uygulama ve sunucu bilgileri</p>
            </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                accordionStates.sistemBilgileri ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {accordionStates.sistemBilgileri && (
            <div className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Uygulama Versiyonu</p>
                <p className="text-gray-600">v1.3.0</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Laravel Versiyonu</p>
                <p className="text-gray-600">11.x</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">PHP Versiyonu</p>
                <p className="text-gray-600">8.2+</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Veritabanı</p>
                <p className="text-gray-600">SQLite</p>
              </div>
            </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kaydet Butonu */}
      <FormActions>
        <Button
          onClick={handleSistemSave}
          loading={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium"
        >
          <CheckIcon className="h-4 w-4" />
          Sistem Ayarlarını Kaydet
        </Button>
      </FormActions>
    </div>
  );


  // Şartlar ve Kurallar - Load Function
  const loadTermsConditions = async () => {
    try {
      setLoadingTerms(true);
      const response = await termsConditionsAPI.getTermsConditions();
      if (response.data.success) {
        setTermsConditions(response.data.data || []);
      }
    } catch (error) {
      console.error('Terms loading error:', error);
      toastError('Şartlar ve kurallar yüklenirken hata oluştu');
    } finally {
      setLoadingTerms(false);
    }
  };

  // Şartlar ve Kurallar - Save Function
  const handleTermSave = async (termData) => {
    try {
      setLoading(true);
      const response = await termsConditionsAPI.updateTermsCondition(termData.type, {
        title: termData.title,
        content: termData.content,
        is_active: termData.is_active,
        sort_order: termData.sort_order
      });

      if (response.data.success) {
        toastSuccess('Şart/Kural başarıyla kaydedildi');
        loadTermsConditions();
        setIsEditingTerm(false);
        setSelectedTerm(null);
      }
    } catch (error) {
      console.error('Term save error:', error);
      toastError(error.response?.data?.message || 'Şart/Kural kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Şartlar ve Kurallar - Render Function
  const renderSartlarKurallar = () => {
    const termTypes = {
      kiralama_sartlari: { label: 'Kiralama Şartları', icon: '', color: 'blue' },
      iptal_politikasi: { label: 'İptal Politikası', icon: '', color: 'orange' },
      kullanim_kosullari: { label: 'Kullanım Koşulları', icon: '', color: 'purple' },
      kvkk: { label: 'KVKK', icon: '', color: 'green' },
      gizlilik_politikasi: { label: 'Gizlilik Politikası', icon: '', color: 'red' }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Şartlar ve Kurallar</h3>
          <p className="text-sm text-gray-600 mb-6">
            Rezervasyon şartları, iptal politikası, kullanım koşulları ve yasal metinleri yönetin.
          </p>

          {loadingTerms ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(termTypes).map(([type, info]) => {
                const term = termsConditions.find(t => t.type === type);
                return (
                  <div
                    key={type}
                    className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{info.icon}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{info.label}</h3>
                            <p className="text-sm text-gray-500">
                              {term ? 'Düzenlenmiş' : 'Henüz tanımlanmamış'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {term && (
                            <Badge variant={term.is_active ? 'success' : 'secondary'}>
                              {term.is_active ? 'Aktif' : 'Pasif'}
                            </Badge>
                          )}
                          <Button
                            onClick={() => {
                              setSelectedTerm(term || { type, title: info.label, content: '', is_active: true, sort_order: 0 });
                              setIsEditingTerm(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <PencilIcon className="h-4 w-4" />
                            {term ? 'Düzenle' : 'Oluştur'}
                          </Button>
                        </div>
                      </div>
                      {term && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div 
                            className="text-sm text-gray-600 line-clamp-2"
                            dangerouslySetInnerHTML={{ 
                              __html: term.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dinamik Değişkenler Bilgi Kutusu */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-3">📋 Kullanılabilir Dinamik Değişkenler</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              {['companyName', 'companyEmail', 'companyPhone', 'companyAddress', 'checkInTime', 'checkOutTime', 'depositAmount', 'cancellationDays'].map(variable => (
                <div key={variable} className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-700">
                  {`{{${variable}}}`}
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-3">
              Bu değişkenleri metinlerinizde kullanarak dinamik içerik oluşturabilirsiniz.
            </p>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditingTerm && selectedTerm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedTerm.id ? 'Düzenle' : 'Oluştur'}: {selectedTerm.title}
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditingTerm(false);
                      setSelectedTerm(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <FormField label="Başlık" required>
                  <Input
                    value={selectedTerm.title}
                    onChange={(e) => setSelectedTerm({ ...selectedTerm, title: e.target.value })}
                    placeholder="Başlık girin"
                  />
                </FormField>

                <FormField label="İçerik" required>
                  <Textarea
                    value={selectedTerm.content}
                    onChange={(e) => setSelectedTerm({ ...selectedTerm, content: e.target.value })}
                    placeholder="İçerik girin (HTML desteklenir, {{değişken}} kullanabilirsiniz)"
                    rows={15}
                  />
                </FormField>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Durum</h4>
                    <p className="text-sm text-gray-500">Şart/Kural aktif mi?</p>
                  </div>
                  <Switch
                    checked={selectedTerm.is_active}
                    onChange={(checked) => setSelectedTerm({ ...selectedTerm, is_active: checked })}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingTerm(false);
                    setSelectedTerm(null);
                  }}
                >
                  İptal
                </Button>
                <Button
                  onClick={() => handleTermSave(selectedTerm)}
                  loading={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Kaydet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'firma':
        return renderFirmaBilgileri();
      case 'rezervasyon':
        return renderRezervasyon();
      case 'ek-hizmetler':
        return renderEkHizmetler();
      case 'bildirim-iletisim':
        return renderBildirimIletisim();
      case 'sartlar-kurallar':
        return renderSartlarKurallar();
      case 'sistem':
        return renderSistem();
      default:
        return renderFirmaBilgileri();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ayarlar</h1>
            <p className="mt-2 text-gray-500">Sistem ayarlarını yönetin</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <nav className="space-y-0.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gray-200 text-gray-800 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-8">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TemplateEditor komponenti - KALDIRILDI
const TemplateEditor = ({ template, type, onSave, onCancel, firmaData }) => {
  const [editedTemplate, setEditedTemplate] = useState(template);
  const [previewMode, setPreviewMode] = useState(false);

  // Template değişkenleri için veri hazırlama (firma bilgileri + örnek veriler)
  const getTemplateData = () => {
    return {
      // Firma bilgilerinden gelen veriler
      companyName: firmaData?.companyName || 'WebAdam Otel',
      companyEmail: firmaData?.email || 'info@webadam.com',
      companyPhone: firmaData?.phone || '+90 212 555 0123',
      companyAddress: firmaData?.address || 'İstanbul, Türkiye',
      companyWebsite: firmaData?.website || 'www.webadam.com',
      
      // Örnek müşteri ve rezervasyon verileri
      customerName: 'Ahmet Yılmaz',
      customerEmail: 'ahmet.yilmaz@email.com',
      customerPhone: '+90 555 123 45 67',
      checkInDate: '15 Mart 2024',
      checkOutDate: '18 Mart 2024',
      roomType: 'Deluxe Oda',
      totalAmount: '2.500',
      reservationNumber: 'REZ-2024-001',
      bookingDate: '10 Mart 2024',
      depositAmount: '750',
      cancellationDate: '8 Mart 2024'
    };
  };

  // Template değişkenlerini gerçek verilerle değiştiren fonksiyon
  const replaceTemplateVariables = (content, data = null) => {
    const templateData = data || getTemplateData();
    let replacedContent = content;
    
    // Tüm template değişkenlerini bul ve değiştir
    Object.keys(templateData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      replacedContent = replacedContent.replace(regex, templateData[key]);
    });
    
    return replacedContent;
  };

  const handleSave = () => {
    onSave(editedTemplate);
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
        <div className="flex space-x-2">
          <Button
            onClick={handlePreview}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {previewMode ? 'Düzenle' : 'Önizle'}
          </Button>
        </div>
      </div>

      {type === 'email' ? (
        <div className="space-y-4">
          <FormField label="Şablon Adı">
            <Input
              value={editedTemplate.name}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
            />
          </FormField>
          
          <FormField label="E-posta Konusu">
            <Input
              value={editedTemplate.subject}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="E-posta konusu..."
            />
          </FormField>
          
          <FormField label="E-posta İçeriği">
            {previewMode ? (
              <div>
                <div 
                  className="border border-gray-200 rounded-lg p-4 min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: replaceTemplateVariables(editedTemplate.content) }}
                />
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600">
                    <strong>Önizleme:</strong> Template değişkenleri örnek verilerle değiştirilmiştir.
                  </p>
                </div>
              </div>
            ) : (
              <Textarea
                value={editedTemplate.content}
                onChange={(e) => setEditedTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                placeholder="HTML içerik..."
                className="font-mono text-sm"
              />
            )}
          </FormField>
        </div>
      ) : (
        <div className="space-y-4">
          <FormField label="Şablon Adı">
            <Input
              value={editedTemplate.name}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
            />
          </FormField>
          
          <FormField label="WhatsApp Mesajı">
            {previewMode ? (
              <div>
                <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50 whitespace-pre-wrap font-mono text-sm">
                  {replaceTemplateVariables(editedTemplate.content)}
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600">
                    <strong>Önizleme:</strong> Template değişkenleri örnek verilerle değiştirilmiştir.
                  </p>
                </div>
              </div>
            ) : (
              <Textarea
                value={editedTemplate.content}
                onChange={(e) => setEditedTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                placeholder="WhatsApp mesajı..."
                className="font-mono text-sm"
              />
            )}
          </FormField>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          onClick={onCancel}
          variant="outline"
        >
          İptal
        </Button>
        <Button
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          Kaydet
        </Button>
      </div>
    </div>
  );
};

// RichTextEditor komponenti
const RichTextEditor = ({ content, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    onSave(editedContent);
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const insertTemplateVariable = (variable) => {
    const textarea = document.getElementById('rich-text-editor');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;
      setEditedContent(newText);
      
      // Cursor pozisyonunu ayarla
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">İçerik Düzenleyici</h4>
        <div className="flex space-x-2">
          <Button
            onClick={handlePreview}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {previewMode ? 'Düzenle' : 'Önizle'}
          </Button>
        </div>
      </div>

      {/* Template Değişkenleri */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Template Değişkenleri</h5>
        <p className="text-xs text-gray-600 mb-3">Aşağıdaki değişkenleri içeriğinize ekleyebilirsiniz:</p>
        <div className="flex flex-wrap gap-2">
          {['companyName', 'companyEmail', 'companyPhone', 'companyAddress', 'companyWebsite', 'customerName', 'checkInDate', 'checkOutDate', 'roomType', 'totalAmount', 'reservationNumber'].map(variable => (
            <button
              key={variable}
              onClick={() => insertTemplateVariable(variable)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {`{{${variable}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik Editörü */}
      {previewMode ? (
        <div>
          <div 
            className="border border-gray-200 rounded-lg p-4 min-h-[400px] bg-white"
            dangerouslySetInnerHTML={{ __html: editedContent }}
          />
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600">
              <strong>Önizleme:</strong> Template değişkenleri örnek verilerle değiştirilmiştir.
            </p>
          </div>
        </div>
      ) : (
        <Textarea
          id="rich-text-editor"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          rows={20}
          placeholder="HTML içerik yazın..."
          className="font-mono text-sm"
        />
      )}

      {/* Formatlama Yardımcıları */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-2">HTML Formatlama Yardımcıları</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <strong>Başlıklar:</strong>
            <div className="mt-1 space-y-1">
              <div><code>&lt;h2&gt;Başlık&lt;/h2&gt;</code></div>
              <div><code>&lt;h3&gt;Alt Başlık&lt;/h3&gt;</code></div>
            </div>
          </div>
          <div>
            <strong>Listeler:</strong>
            <div className="mt-1 space-y-1">
              <div><code>&lt;ul&gt;&lt;li&gt;Madde&lt;/li&gt;&lt;/ul&gt;</code></div>
              <div><code>&lt;ol&gt;&lt;li&gt;Sıralı&lt;/li&gt;&lt;/ol&gt;</code></div>
            </div>
          </div>
          <div>
            <strong>Metin:</strong>
            <div className="mt-1 space-y-1">
              <div><code>&lt;p&gt;Paragraf&lt;/p&gt;</code></div>
              <div><code>&lt;strong&gt;Kalın&lt;/strong&gt;</code></div>
            </div>
          </div>
          <div>
            <strong>Linkler:</strong>
            <div className="mt-1 space-y-1">
              <div><code>&lt;a href="#"&gt;Link&lt;/a&gt;</code></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          onClick={onCancel}
          variant="outline"
        >
          İptal
        </Button>
        <Button
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          Kaydet
        </Button>
      </div>
    </div>
  );
};

// TemplateManager komponenti
const TemplateManager = ({ templateData, onTemplateEdit, onTemplatePreview, onTemplateSave, firmaData, getTemplateData }) => {
  const [activeTab, setActiveTab] = useState('email');
  const [searchTerm, setSearchTerm] = useState('');

  const templateCategories = {
    email: {
      title: 'E-posta Şablonları',
      icon: '📧',
      templates: templateData.emailTemplates
    },
    whatsapp: {
      title: 'WhatsApp Şablonları', 
      icon: '💬',
      templates: templateData.whatsappTemplates
    }
  };

  const filteredTemplates = (templates) => {
    if (!searchTerm) return templates;
    return Object.fromEntries(
      Object.entries(templates).filter(([key, template]) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getTemplateTypeInfo = (templateKey) => {
    const typeMap = {
      reservation_confirmation: { color: 'green', label: 'Onay Maili', icon: '✅' },
      upcoming_reservation: { color: 'yellow', label: 'Yaklaşan Rezervasyon', icon: '⏰' },
      reservation_delay: { color: 'orange', label: 'Erteleme Bildirimi', icon: '⏳' },
      reservation_cancellation: { color: 'red', label: 'İptal Bildirimi', icon: '❌' },
      reservation_completion: { color: 'blue', label: 'Teşekkür Maili', icon: '🎉' }
    };
    return typeMap[templateKey] || { color: 'gray', label: 'Diğer', icon: '📄' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Rezervasyon Şablonları</h4>
          <p className="text-sm text-gray-500">Rezervasyon sürecinin farklı aşamalarında kullanılacak şablonları yönetin</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Şablon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {Object.entries(templateCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(filteredTemplates(templateCategories[activeTab].templates)).map(([key, template]) => {
          const typeInfo = getTemplateTypeInfo(key);
          return (
            <div key={key} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg bg-${typeInfo.color}-500`}>
                    {typeInfo.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{template.name}</h5>
                    <p className="text-sm text-gray-500">{typeInfo.label}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onTemplatePreview(activeTab, key)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Önizle"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onTemplateEdit(activeTab, key)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Template Content Preview */}
              <div className="space-y-3">
                {activeTab === 'email' && template.subject && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Konu:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{template.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">İçerik:</p>
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {activeTab === 'email' ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: template.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                      }} />
                    ) : (
                      template.content.substring(0, 150) + '...'
                    )}
                  </div>
                </div>
              </div>

              {/* Template Status */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">Aktif</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {activeTab === 'email' ? 'E-posta' : 'WhatsApp'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(filteredTemplates(templateCategories[activeTab].templates)).length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Şablon bulunamadı</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Arama kriterlerinize uygun şablon bulunamadı.' : 'Henüz şablon eklenmemiş.'}
          </p>
        </div>
      )}

      {/* Template Variables Info */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-3">📋 Kullanılabilir Template Değişkenleri</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {Object.keys(getTemplateData()).map(variable => (
            <div key={variable} className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-700">
              {`{{${variable}}}`}
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-3">
          Bu değişkenleri şablonlarınızda kullanarak dinamik içerik oluşturabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Settings;
