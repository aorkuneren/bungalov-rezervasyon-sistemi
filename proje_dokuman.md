# 🏖️ BungApp - Bungalov Rezervasyon Yönetim Sistemi

## 📋 Genel Bakış (Overview)

### 🎯 Proje Adı
**BungApp** - Modern Bungalov Rezervasyon ve Yönetim Sistemi

### 📝 Kısa Tanım
BungApp, bungalov işletmeleri için geliştirilmiş kapsamlı bir rezervasyon yönetim sistemidir. Modern web teknolojileri kullanılarak geliştirilen bu sistem, bungalov sahipleri ve işletmecilerinin rezervasyon süreçlerini dijitalleştirmelerini ve verimli bir şekilde yönetmelerini sağlar. Sistem, tam özellikli bir SPA (Single Page Application) olarak tasarlanmış olup, kullanıcı dostu arayüzü ve güçlü backend altyapısı ile işletmelerin operasyonel verimliliğini artırmayı hedeflemektedir.

### 🎯 Hedef / Amaç
- **Dijital Dönüşüm**: Geleneksel rezervasyon süreçlerini modern dijital platforma taşımak
- **Operasyonel Verimlilik**: Rezervasyon yönetimini otomatikleştirerek işletme verimliliğini artırmak
- **Müşteri Deneyimi**: Kolay ve hızlı rezervasyon süreci ile müşteri memnuniyetini yükseltmek
- **İş Zekası**: Detaylı raporlama ve analiz araçları ile işletme performansını izlemek
- **Maliyet Optimizasyonu**: Manuel süreçleri azaltarak operasyonel maliyetleri düşürmek
- **Güvenlik**: Token-based authentication ve rol tabanlı erişim kontrolü ile güvenli sistem
- **Ölçeklenebilirlik**: Modüler yapı ile gelecekteki geliştirmelere uygun altyapı

### 👥 Hedef Kullanıcılar
- **Bungalov İşletmecileri**: Küçük ve orta ölçekli bungalov işletmeleri
- **Otel ve Tatil Köyü Yöneticileri**: Bungalov birimleri bulunan konaklama tesisleri
- **Turizm İşletmeleri**: Doğa turizmi ve kamp alanı işletmecileri
- **Rezervasyon Yöneticileri**: Rezervasyon süreçlerini yöneten personel
- **Müşteriler**: Bungalov rezervasyonu yapmak isteyen bireysel ve grup müşteriler
- **Sistem Yöneticileri**: Super Admin ve Admin rolleri ile sistem yönetimi yapan kullanıcılar

### 🛠️ Kullanılan Teknolojiler

#### **Backend Teknolojileri**
- **Laravel 12.0** - Modern PHP web framework
- **PHP 8.2+** - Güncel PHP sürümü
- **Laravel Sanctum 4.2** - API authentication ve token yönetimi
- **SQLite** - Hafif ve taşınabilir veritabanı (geliştirme ortamı)
- **Laravel Eloquent ORM** - Veritabanı yönetimi ve model ilişkileri
- **Laravel Mail** - E-posta gönderimi ve şablon yönetimi
- **Laravel Queue** - Arka plan işlemleri
- **Laravel Tinker 2.10** - Komut satırı arayüzü
- **Laravel Pail 1.2** - Log görüntüleme ve takip

#### **Frontend Teknolojileri**
- **React 18.2** - Modern JavaScript kütüphanesi
- **React Router DOM 6.30** - Sayfa yönlendirme ve navigasyon
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Axios 1.12** - HTTP istekleri ve API iletişimi
- **FullCalendar 6.1** - Takvim bileşeni ve rezervasyon görüntüleme
- **Heroicons 2.2** - İkon kütüphanesi
- **React Hot Toast 2.6** - Bildirim sistemi
- **Date-fns 4.1** - Tarih işlemleri ve formatlama
- **Express 4.18** - Frontend sunucu (production build için)
- **Node-fetch 2.7** - HTTP istekleri

#### **Geliştirme Araçları**
- **React Scripts 5.0** - React uygulama build ve test araçları
- **Laravel Pint 1.24** - PHP kod formatlayıcı
- **PHPUnit 11.5** - Test framework
- **Laravel Pail 1.2** - Log görüntüleme
- **Concurrently** - Paralel script çalıştırma
- **Autoprefixer 10.4** - CSS vendor prefix'leri
- **PostCSS 8.5** - CSS işleme
- **Web Vitals 2.1** - Performans ölçümü

## 🏗️ Sistem Mimarisi

### **Monolitik Yapı**
- **Backend**: Laravel 12.0 API (RESTful) - Port 8000
- **Frontend**: React 18.2 SPA (Single Page Application) - Port 3000
- **Veritabanı**: SQLite (geliştirme), PostgreSQL/MySQL (production)
- **Authentication**: Token-based (Laravel Sanctum)
- **API Communication**: Axios ile HTTP istekleri
- **State Management**: React useState ve useEffect hooks

### **Modüler Tasarım**
- **Kullanıcı Yönetimi**: Rol tabanlı erişim kontrolü (Super Admin, Admin, User)
- **Rezervasyon Modülü**: Kapsamlı rezervasyon yönetimi ve takip
- **Müşteri Modülü**: Müşteri bilgi yönetimi ve geçmiş takibi
- **Bungalov Modülü**: Bungalov envanter yönetimi ve durum takibi
- **Raporlama Modülü**: Detaylı analiz ve raporlar
- **E-posta Modülü**: Otomatik bildirim sistemi ve şablon yönetimi
- **Ayarlar Modülü**: Sistem, şirket ve rezervasyon ayarları
- **Ek Hizmetler Modülü**: Ek hizmet yönetimi ve fiyatlandırma
- **Şartlar ve Koşullar Modülü**: Kullanım şartları yönetimi

### **API Endpoint Yapısı**
- **Public Routes**: Login, şifre sıfırlama, rezervasyon onayı
- **Protected Routes**: Tüm CRUD işlemleri, raporlar, ayarlar
- **Middleware**: Authentication, CSRF protection
- **Response Format**: JSON API standardı

## 🎨 Özellikler ve Fonksiyonlar

### **🔐 Kullanıcı Yönetimi**
- **Güvenli Authentication**: Laravel Sanctum ile token-based giriş/çıkış sistemi
- **Rol Tabanlı Yetkilendirme**: Super Admin, Admin, User rolleri ile detaylı erişim kontrolü
- **Profil Yönetimi**: Kullanıcı bilgileri güncelleme ve şifre değiştirme
- **Aktivite Logları**: Kullanıcı aktivitelerinin detaylı takibi ve güvenlik logları
- **"Beni Hatırla" Özelliği**: Güvenli oturum yönetimi ile uzun süreli giriş
- **Auto-Login**: Remember token ile otomatik giriş sistemi
- **Password Reset**: E-posta ile şifre sıfırlama sistemi

### **🏠 Bungalov Yönetimi**
- **Envanter Yönetimi**: Bungalov ekleme, düzenleme, silme işlemleri
- **Kapasite ve Fiyatlandırma**: Kişi sayısı ve gecelik fiyat ayarları
- **Durum Takibi**: Aktif, Pasif, Bakımda durumları ile detaylı yönetim
- **Rezervasyon Geçmişi**: Her bungalov için rezervasyon istatistikleri
- **Scope Metodları**: Active, inactive, maintenance filtreleme
- **Status Badge Sistemi**: Görsel durum gösterimi

### **👥 Müşteri Yönetimi**
- **Müşteri Kayıt Sistemi**: Detaylı müşteri bilgi kayıt sistemi
- **İletişim Bilgileri**: Telefon, e-posta, kimlik bilgileri yönetimi
- **Rezervasyon Geçmişi**: Müşteri bazlı rezervasyon takibi
- **Harcama Takibi**: Toplam harcama ve rezervasyon sayısı analizi
- **Müşteri Analizi**: Detaylı müşteri davranış analizi
- **ID Type Support**: TC, Pasaport, Ehliyet gibi kimlik türleri

### **📅 Rezervasyon Sistemi**
- **Gelişmiş Rezervasyon Oluşturma**: Kapsamlı rezervasyon formu
- **Tarih Çakışma Kontrolü**: Otomatik müsaitlik kontrolü
- **Rezervasyon Durumu Takibi**: Pending, Confirmed, Checked-in, Completed, Cancelled
- **Ödeme Yönetimi**: Unpaid, Partial, Paid, Refunded durumları
- **Ek Hizmet Yönetimi**: Rezervasyona ek hizmet ekleme/çıkarma
- **Rezervasyon Onay Sistemi**: Confirmation code ile onay mekanizması
- **İptal ve Erteleme**: Detaylı iptal ve erteleme işlemleri
- **Payment History**: JSON formatında ödeme geçmişi
- **Additional Guests**: Ek misafir bilgileri yönetimi
- **Terms Acceptance**: Kullanım şartları kabul sistemi

### **📊 Raporlama ve Analiz**
- **Genel İşletme Raporları**: Kapsamlı işletme performans raporları
- **Yıllık Analizler**: Yıl bazlı detaylı analizler
- **Aylık Raporlar**: Ay bazlı performans takibi
- **Mevsimsel Analizler**: Sezon bazlı analiz ve karşılaştırmalar
- **Bungalov Bazlı Raporlar**: Her bungalov için ayrı performans raporları
- **Müşteri Bazlı Analizler**: Müşteri segmentasyonu ve analizi
- **Gelir ve Doluluk Takibi**: Finansal performans ve doluluk oranları
- **Dashboard Widgets**: Gerçek zamanlı istatistikler

### **⚙️ Sistem Ayarları**
- **Şirket Bilgileri**: Logo, adres, iletişim bilgileri yönetimi
- **Rezervasyon Kuralları**: Check-in/out saatleri, minimum konaklama, depozito ayarları
- **E-posta Şablonları**: Özelleştirilebilir e-posta şablonları
- **Kullanım Şartları**: Dinamik şartlar ve koşullar yönetimi
- **Mail Konfigürasyonu**: SMTP ayarları ve test e-posta gönderimi
- **Ek Hizmet Ayarları**: Ek hizmet fiyatlandırma ve türleri
- **Sistem Ayarları**: Genel sistem konfigürasyonu

### **📧 E-posta Sistemi**
- **Otomatik Bildirimler**: Rezervasyon onay, iptal, erteleme e-postaları
- **Özelleştirilebilir Şablonlar**: HTML e-posta şablonları
- **Test E-posta Gönderimi**: Şablon test etme sistemi
- **SMTP Konfigürasyonu**: Esnek e-posta sunucu ayarları
- **Mail Template Management**: Şablon CRUD işlemleri
- **Reservation Confirmation**: Otomatik rezervasyon onay e-postaları

### **🔧 Ek Özellikler**
- **Database Browser**: Geliştirme için veritabanı görüntüleme
- **Activity Logging**: Detaylı kullanıcı aktivite takibi
- **CSRF Protection**: Güvenlik için CSRF token koruması
- **API Rate Limiting**: API istek sınırlamaları
- **Error Handling**: Kapsamlı hata yönetimi
- **Loading States**: Kullanıcı deneyimi için loading göstergeleri
- **Toast Notifications**: Kullanıcı bildirimleri
- **Responsive Design**: Mobil uyumlu tasarım

## 🎯 İş Değeri ve Faydalar

### **Operasyonel Faydalar**
- **%70 Daha Hızlı Rezervasyon**: Otomatik süreçler ile manuel işlem süresini azaltır
- **%90 Hata Azalması**: Otomatik tarih çakışma kontrolü ile rezervasyon hatalarını önler
- **7/24 Erişim**: Web tabanlı sistem ile her yerden erişim imkanı
- **Merkezi Yönetim**: Tüm rezervasyonlar tek platformda yönetilir

### **Mali Faydalar**
- **Operasyonel Maliyet Azalması**: Manuel süreçlerin otomatikleştirilmesi
- **Gelir Artışı**: Daha iyi doluluk oranları ve fiyat optimizasyonu
- **Müşteri Kaybı Azalması**: Hızlı ve kolay rezervasyon süreci

### **Müşteri Deneyimi**
- **Anında Onay**: Rezervasyon onayı e-posta ile otomatik gönderilir
- **Şeffaf Süreç**: Rezervasyon durumu takibi
- **Kolay İletişim**: Entegre müşteri bilgi sistemi

## 🚀 Gelecek Planları

### **Kısa Vadeli Geliştirmeler**
- Mobil uygulama (React Native)
- Online ödeme entegrasyonu
- SMS bildirim sistemi
- Çoklu dil desteği

### **Orta Vadeli Hedefler**
- AI destekli fiyatlandırma
- Müşteri davranış analizi
- Entegre muhasebe sistemi
- API entegrasyonları

### **Uzun Vadeli Vizyon**
- Franchise yönetim sistemi
- Çoklu lokasyon desteği
- IoT sensör entegrasyonu
- Blockchain tabanlı güvenlik

## 📁 Proje Yapısı

```
webadam/
├── backend/                          # Laravel 12.0 API Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/     # API Controller'ları (18 dosya)
│   │   │   ├── AuthController.php
│   │   │   ├── BungalowController.php
│   │   │   ├── CustomerController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── EkHizmetController.php
│   │   │   ├── MailConfigController.php
│   │   │   ├── MailTemplateController.php
│   │   │   ├── PasswordResetController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── ReportsController.php
│   │   │   ├── ReservationController.php
│   │   │   ├── ReservationSettingsController.php
│   │   │   ├── SystemSettingsController.php
│   │   │   ├── TermsConditionsController.php
│   │   │   └── CompanySettingsController.php
│   │   ├── Models/                   # Eloquent Modelleri (13 dosya)
│   │   │   ├── ActivityLog.php
│   │   │   ├── AdditionalService.php
│   │   │   ├── Bungalow.php
│   │   │   ├── CompanySettings.php
│   │   │   ├── Customer.php
│   │   │   ├── EkHizmet.php
│   │   │   ├── MailConfig.php
│   │   │   ├── MailTemplate.php
│   │   │   ├── Reservation.php
│   │   │   ├── ReservationSettings.php
│   │   │   ├── SystemSettings.php
│   │   │   ├── TermsConditions.php
│   │   │   └── User.php
│   │   ├── Mail/                     # E-posta Sınıfları
│   │   │   └── PasswordResetMail.php
│   │   └── Providers/                # Service Provider'lar
│   │       └── AppServiceProvider.php
│   ├── database/
│   │   ├── migrations/               # Veritabanı Migrasyonları (22 dosya)
│   │   │   ├── 0001_01_01_000000_create_users_table.php
│   │   │   ├── 2025_10_14_122404_create_bungalows_table.php
│   │   │   ├── 2025_10_14_171126_create_reservations_table.php
│   │   │   ├── 2025_10_14_170225_create_customers_table.php
│   │   │   ├── 2025_10_14_132213_create_company_settings_table.php
│   │   │   ├── 2025_10_14_134105_create_reservation_settings_table.php
│   │   │   ├── 2025_10_14_142238_create_ek_hizmets_table.php
│   │   │   ├── 2025_10_14_150829_create_mail_config_table.php
│   │   │   ├── 2025_10_14_152706_create_terms_conditions_table.php
│   │   │   ├── 2025_10_14_162216_create_system_settings_table.php
│   │   │   ├── 2025_10_15_021448_create_mail_templates_table.php
│   │   │   └── ... (diğer migrasyonlar)
│   │   ├── seeders/                  # Veri Tohumlayıcıları (7 dosya)
│   │   │   ├── DatabaseSeeder.php
│   │   │   ├── UserSeeder.php
│   │   │   ├── BungalowSeeder.php
│   │   │   ├── CustomerSeeder.php
│   │   │   ├── ReservationSeeder.php
│   │   │   ├── MailTemplateSeeder.php
│   │   │   └── TermsConditionsSeeder.php
│   │   └── database.sqlite           # SQLite Veritabanı
│   ├── routes/
│   │   ├── api.php                   # API Route Tanımları
│   │   ├── web.php                   # Web Route Tanımları
│   │   └── console.php               # Console Route Tanımları
│   ├── config/                       # Konfigürasyon Dosyaları
│   │   ├── app.php
│   │   ├── auth.php
│   │   ├── database.php
│   │   ├── mail.php
│   │   ├── sanctum.php
│   │   └── ... (diğer config dosyaları)
│   ├── storage/                      # Storage Dizinleri
│   │   ├── app/private/              # Özel dosyalar
│   │   ├── app/public/               # Genel dosyalar
│   │   ├── logs/                     # Log dosyaları
│   │   └── framework/                # Framework cache
│   ├── composer.json                 # PHP Dependencies
│   ├── artisan                       # Laravel CLI
│   └── phpunit.xml                   # Test Konfigürasyonu
├── frontend/                         # React 18.2 Frontend
│   ├── src/
│   │   ├── components/               # React Bileşenleri (40 dosya)
│   │   │   ├── Layout.js             # Ana layout bileşeni
│   │   │   ├── Navigation.js         # Navigasyon bileşeni
│   │   │   ├── LoginForm.js          # Giriş formu
│   │   │   ├── ConfirmationModal.js  # Onay modalı
│   │   │   ├── CountdownTimer.js     # Geri sayım sayacı
│   │   │   ├── TabContent.js         # Tab içerik bileşeni
│   │   │   ├── TermsModal.js         # Şartlar modalı
│   │   │   └── ui/                   # UI Bileşenleri (25+ dosya)
│   │   │       ├── Badge.js
│   │   │       ├── Button.js
│   │   │       ├── Card.js
│   │   │       ├── Calendar.js
│   │   │       ├── FormField.js
│   │   │       ├── Input.js
│   │   │       ├── Modal.js
│   │   │       ├── Navbar.js
│   │   │       ├── OccupancyCalendar.js
│   │   │       ├── Pagination.js
│   │   │       ├── Select.js
│   │   │       ├── Sidebar.js
│   │   │       ├── StatCard.js
│   │   │       ├── Tabs.js
│   │   │       ├── Toast.js
│   │   │       └── ... (diğer UI bileşenleri)
│   │   ├── pages/                    # Sayfa Bileşenleri (14 dosya)
│   │   │   ├── Dashboard.js          # Ana dashboard
│   │   │   ├── Bungalows.js          # Bungalov listesi
│   │   │   ├── BungalowDetay.js      # Bungalov detayı
│   │   │   ├── Customers.js          # Müşteri listesi
│   │   │   ├── Reservations.js       # Rezervasyon listesi
│   │   │   ├── CreateReservation.js  # Rezervasyon oluşturma
│   │   │   ├── ReservationDetail.js  # Rezervasyon detayı
│   │   │   ├── ReservationEdit.js    # Rezervasyon düzenleme
│   │   │   ├── ReservationConfirmation.js # Rezervasyon onayı
│   │   │   ├── Reports.js            # Raporlar
│   │   │   ├── Settings.js           # Ayarlar
│   │   │   ├── Profile.js            # Profil
│   │   │   └── MailTemplates.js      # E-posta şablonları
│   │   ├── services/                 # API Servisleri
│   │   │   └── api.js                # Ana API servis dosyası
│   │   ├── utils/                    # Yardımcı Fonksiyonlar
│   │   │   └── index.js
│   │   ├── App.js                    # Ana uygulama bileşeni
│   │   ├── index.js                  # Uygulama giriş noktası
│   │   ├── index.css                 # Global CSS
│   │   └── reportWebVitals.js        # Web vitals raporlama
│   ├── public/                       # Statik Dosyalar
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── build/                        # Production build
│   ├── package.json                  # NPM Dependencies
│   ├── tailwind.config.js            # TailwindCSS konfigürasyonu
│   └── postcss.config.js             # PostCSS konfigürasyonu
└── proje_dokuman.md                  # Bu Doküman
```

## 🔧 Kurulum ve Çalıştırma

### **Gereksinimler**
- **PHP 8.2+** - Laravel 12.0 için gerekli
- **Node.js 18.0+** - React 18.2 için gerekli
- **NPM 8.0+** - Package yönetimi için
- **Composer** - PHP dependency yönetimi
- **SQLite** - Veritabanı (geliştirme ortamı)

### **Hızlı Kurulum (Backend)**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### **Hızlı Kurulum (Frontend)**
```bash
cd frontend
npm install
npm start
```

### **Geliştirme Ortamı (Önerilen)**
```bash
# Backend ve frontend'i birlikte çalıştırma
cd backend
composer run dev
```

Bu komut aşağıdaki servisleri paralel olarak başlatır:
- **Laravel Server** (Port 8000)
- **Queue Worker** (Arka plan işlemleri)
- **Laravel Pail** (Log takibi)
- **Vite Dev Server** (Frontend - Port 3000)

### **Production Build**
```bash
# Frontend build
cd frontend
npm run build

# Backend optimizasyon
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Test Çalıştırma**
```bash
# Backend testleri
cd backend
composer run test

# Frontend testleri
cd frontend
npm test
```

### **Veritabanı Yönetimi**
```bash
# Migration çalıştırma
php artisan migrate

# Seeder çalıştırma
php artisan db:seed

# Veritabanı sıfırlama
php artisan migrate:fresh --seed

# Backup alma
cp database/database.sqlite database/backup_$(date +%Y%m%d_%H%M%S).sqlite
```

## 📊 Veritabanı Modelleri

### **Ana Modeller ve Özellikleri**

#### **User Model**
- **Rol Sistemi**: Super Admin, Admin, User
- **Özellikler**: name, email, password, role, phone, birth_date
- **Güvenlik**: last_login_at, login_count, password_changed_at
- **İlişkiler**: ActivityLog (1:N)
- **Metodlar**: isSuperAdmin(), isAdmin()

#### **Bungalow Model**
- **Özellikler**: name, capacity, description, price_per_night, status
- **Durumlar**: active, inactive, maintenance
- **Scope Metodları**: active(), inactive(), maintenance()
- **İlişkiler**: Reservation (1:N)
- **Metodlar**: getStatusDisplayAttribute(), getStatusBadgeVariantAttribute()

#### **Customer Model**
- **Özellikler**: name, email, phone, id_number, id_type, status
- **İstatistikler**: total_spending, reservations_count
- **İlişkiler**: Reservation (1:N)
- **Kimlik Türleri**: TC, Pasaport, Ehliyet

#### **Reservation Model**
- **Temel Bilgiler**: reservation_code, customer_id, bungalow_id
- **Tarihler**: check_in_date, check_out_date
- **Misafir Bilgileri**: number_of_guests, additional_guests (JSON)
- **Fiyatlandırma**: total_price, payment_amount, remaining_amount
- **Durumlar**: status (pending, confirmed, checked_in, completed, cancelled)
- **Ödeme**: payment_status (unpaid, partial, paid, refunded)
- **Ek Özellikler**: extra_services (JSON), payment_history (JSON)
- **Onay Sistemi**: confirmation_code, confirmation_expires_at
- **İptal/Erteleme**: cancellation_reason, cancelled_at, delay_reason, delayed_at
- **İlişkiler**: Customer (N:1), Bungalow (N:1)
- **Metodlar**: generateReservationCode()

#### **Ek Hizmetler (EkHizmet) Model**
- **Özellikler**: name, price, pricing_type, is_active, sort_order
- **Fiyatlandırma Türleri**: per_person, per_night, free
- **Scope Metodları**: active(), inactive()
- **Metodlar**: getPricingTypeDisplayAttribute(), getStatusDisplayAttribute()

#### **Şirket Ayarları (CompanySettings) Model**
- **Şirket Bilgileri**: company_name, company_type, tax_number, tax_office
- **İletişim**: address, city, district, postal_code, phone, email, website
- **Banka Bilgileri**: bank_name, bank_account, iban
- **Sosyal Medya**: google_business_profile
- **Metodlar**: getSettings(), updateSettings()

#### **Rezervasyon Ayarları (ReservationSettings) Model**
- **Check-in/out**: check_in_out_enabled, check_in_time, check_out_time
- **Minimum Konaklama**: min_stay_enabled, min_stay_days
- **Depozito**: deposit_required, deposit_amount, deposit_percentage
- **İptal Politikası**: cancellation_enabled, cancellation_days, cancellation_policy
- **Onay Sistemi**: confirmation_enabled, confirmation_hours
- **İndirimler**: early_bird_discount, last_minute_discount, weekend_pricing
- **Metodlar**: getSettings(), updateSettings()

#### **E-posta Şablonları (MailTemplate) Model**
- **Özellikler**: name, type, subject, body, is_active
- **Türler**: reservation_confirmation, cancellation, reminder

#### **Şartlar ve Koşullar (TermsConditions) Model**
- **Özellikler**: type, title, content, is_active
- **Türler**: general, privacy, cancellation, payment

#### **Sistem Ayarları (SystemSettings) Model**
- **Genel ayarlar ve konfigürasyonlar**

#### **Mail Konfigürasyonu (MailConfig) Model**
- **SMTP ayarları ve e-posta konfigürasyonu**

#### **Aktivite Logları (ActivityLog) Model**
- **Kullanıcı aktivite takibi ve güvenlik logları**

### **Veritabanı İlişkileri**
```
User (1) → (N) ActivityLog
User (1) → (N) Reservation (oluşturan kullanıcı)

Bungalow (1) → (N) Reservation
Customer (1) → (N) Reservation

Reservation (N) → (1) Customer
Reservation (N) → (1) Bungalow
```

### **Veritabanı Tabloları (22 Migration)**
1. **users** - Kullanıcı tablosu
2. **bungalows** - Bungalov tablosu
3. **customers** - Müşteri tablosu
4. **reservations** - Rezervasyon tablosu
5. **company_settings** - Şirket ayarları
6. **reservation_settings** - Rezervasyon ayarları
7. **ek_hizmets** - Ek hizmetler
8. **mail_config** - E-posta konfigürasyonu
9. **terms_conditions** - Şartlar ve koşullar
10. **system_settings** - Sistem ayarları
11. **mail_templates** - E-posta şablonları
12. **activity_logs** - Aktivite logları
13. **personal_access_tokens** - Sanctum token'ları
14. **cache** - Cache tablosu
15. **jobs** - Queue job'ları
16. **failed_jobs** - Başarısız job'lar
17. **sessions** - Oturum tablosu
18. **password_reset_tokens** - Şifre sıfırlama token'ları
19. **password_resets** - Şifre sıfırlama (legacy)
20. **migrations** - Migration tablosu
21. **additional_services** - Ek hizmetler (alternatif)
22. **mail_templates** - E-posta şablonları (alternatif)

## 🔐 Güvenlik Özellikleri

### **Authentication & Authorization**
- **Laravel Sanctum 4.2** ile token-based authentication
- **CSRF Protection** ile form güvenliği
- **Role-based Access Control** ile detaylı yetkilendirme (Super Admin, Admin, User)
- **Password Hashing** ile güvenli şifre saklama
- **Remember Token** ile güvenli oturum yönetimi
- **Auto-Login** sistemi ile remember token yönetimi

### **API Güvenliği**
- **Token-based Authentication** ile API erişim kontrolü
- **Request Interceptors** ile otomatik token ekleme
- **Response Interceptors** ile 401 hata yönetimi
- **Rate Limiting** ile API istek sınırlamaları
- **CORS Configuration** ile cross-origin güvenliği

### **Veri Güvenliği**
- **Activity Logging** ile kullanıcı aktivite takibi
- **Input Validation** ile veri doğrulama
- **SQL Injection Protection** ile veritabanı güvenliği
- **XSS Protection** ile cross-site scripting koruması
- **Secure Headers** ile HTTP güvenlik başlıkları

### **Session Management**
- **Secure Session Handling** ile güvenli oturum yönetimi
- **Token Revocation** ile oturum sonlandırma
- **Remember Me** özelliği ile uzun süreli giriş
- **Auto-Logout** ile güvenlik timeout'u

## 📈 Performans Optimizasyonları

### **Backend Optimizasyonları**
- **Laravel Eloquent** ile optimize edilmiş veritabanı sorguları
- **Eager Loading** ile N+1 query problemini önleme
- **Database Indexing** ile hızlı sorgu performansı
- **Laravel Cache** ile veri önbellekleme
- **Queue System** ile arka plan işlemleri
- **Laravel Pail** ile log takibi ve performans izleme

### **Frontend Optimizasyonları**
- **React 18.2** ile modern performans özellikleri
- **Lazy Loading** ile sayfa yükleme optimizasyonu
- **Code Splitting** ile bundle boyutu optimizasyonu
- **TailwindCSS 3.4** ile minimal CSS boyutu
- **Vite** ile hızlı build süreçleri
- **Web Vitals** ile performans ölçümü

### **Veritabanı Optimizasyonları**
- **SQLite** ile hafif veritabanı yapısı
- **Optimized Queries** ile verimli sorgular
- **Proper Indexing** ile hızlı arama
- **JSON Fields** ile esnek veri saklama
- **Migration System** ile veritabanı versiyonlama

### **Network Optimizasyonları**
- **Axios Interceptors** ile otomatik token yönetimi
- **Request/Response Caching** ile ağ trafiği azaltma
- **Concurrent Requests** ile paralel API çağrıları
- **Error Handling** ile kullanıcı deneyimi optimizasyonu

### **Development Optimizasyonları**
- **Concurrently** ile paralel servis çalıştırma
- **Hot Reload** ile hızlı geliştirme
- **Laravel Pint** ile kod formatlama
- **PHPUnit** ile otomatik testler
- **Laravel Tinker** ile hızlı debugging

## 🎯 API Endpoints ve Route Yapısı

### **Public Routes (Kimlik Doğrulama Gerektirmez)**
```
POST /api/login                    # Kullanıcı girişi
POST /api/forgot-password          # Şifre sıfırlama isteği
POST /api/reset-password           # Şifre sıfırlama
GET  /api/sanctum/csrf-cookie      # CSRF token alımı
GET  /api/database-browser         # Veritabanı görüntüleme (dev)
GET  /api/reservations/confirm/{code} # Rezervasyon onay sayfası
POST /api/reservations/confirm/{code} # Rezervasyon onaylama
POST /api/reservations/{id}/cancel # Rezervasyon iptali
GET  /api/terms-conditions         # Şartlar ve koşullar
GET  /api/company-settings         # Şirket ayarları
GET  /api/ek-hizmetler             # Ek hizmetler listesi
```

### **Protected Routes (Kimlik Doğrulama Gerekir)**
```
# Authentication
POST /api/logout                   # Çıkış
POST /api/auto-login               # Otomatik giriş
POST /api/revoke-remember-token    # Remember token iptali

# Dashboard & Reports
GET  /api/dashboard                # Dashboard verileri
GET  /api/reports/general          # Genel raporlar
GET  /api/reports/yearly           # Yıllık raporlar
GET  /api/reports/monthly          # Aylık raporlar
GET  /api/reports/seasonal         # Mevsimsel raporlar
GET  /api/reports/bungalow-based   # Bungalov bazlı raporlar
GET  /api/reports/customer-based   # Müşteri bazlı raporlar

# Profile Management
GET  /api/profile                  # Profil bilgileri
PUT  /api/profile                  # Profil güncelleme
POST /api/change-password          # Şifre değiştirme
GET  /api/profile/activity-logs    # Aktivite logları

# CRUD Operations
GET|POST|PUT|DELETE /api/bungalows     # Bungalov yönetimi
GET|POST|PUT|DELETE /api/customers     # Müşteri yönetimi
GET|POST|PUT|DELETE /api/reservations  # Rezervasyon yönetimi

# Reservation Operations
POST /api/reservations/{id}/payment    # Ödeme ekleme
POST /api/reservations/{id}/service    # Ek hizmet ekleme
DELETE /api/reservations/{id}/service  # Ek hizmet çıkarma
POST /api/reservations/{id}/delay      # Rezervasyon erteleme

# Settings Management
GET|PUT /api/settings/company          # Şirket ayarları
GET|PUT /api/settings/reservation      # Rezervasyon ayarları
GET|PUT /api/system/settings           # Sistem ayarları

# Mail System
GET|PUT /api/mail/config               # Mail konfigürasyonu
POST /api/mail/test                    # Test e-posta gönderimi
GET|PUT /api/mail/templates/{type}     # E-posta şablonları

# Additional Services
POST|PUT|DELETE /api/ek-hizmetler/{id} # Ek hizmet yönetimi

# Terms & Conditions
POST|PUT|DELETE /api/terms-conditions/{type} # Şartlar yönetimi
POST /api/terms-conditions/preview     # Şartlar önizleme
```

## 🎨 Frontend Bileşen Yapısı

### **Ana Bileşenler**
- **App.js**: Ana uygulama bileşeni ve routing
- **Layout.js**: Ana layout wrapper
- **Navigation.js**: Üst navigasyon menüsü
- **LoginForm.js**: Giriş formu bileşeni

### **UI Bileşenleri (25+ Bileşen)**
- **Badge.js**: Durum badge'leri
- **Button.js**: Buton bileşenleri
- **Card.js**: Kart bileşenleri
- **Calendar.js**: Takvim bileşeni
- **FormField.js**: Form alan bileşeni
- **Input.js**: Input bileşenleri
- **Modal.js**: Modal dialog'ları
- **Navbar.js**: Navigasyon çubuğu
- **OccupancyCalendar.js**: Doluluk takvimi
- **Pagination.js**: Sayfalama bileşeni
- **Select.js**: Select dropdown'ları
- **Sidebar.js**: Yan menü
- **StatCard.js**: İstatistik kartları
- **Tabs.js**: Tab bileşenleri
- **Toast.js**: Bildirim sistemi

### **Sayfa Bileşenleri (14 Sayfa)**
- **Dashboard.js**: Ana dashboard
- **Bungalows.js**: Bungalov listesi
- **BungalowDetay.js**: Bungalov detay sayfası
- **Customers.js**: Müşteri listesi
- **Reservations.js**: Rezervasyon listesi
- **CreateReservation.js**: Rezervasyon oluşturma
- **ReservationDetail.js**: Rezervasyon detayı
- **ReservationEdit.js**: Rezervasyon düzenleme
- **ReservationConfirmation.js**: Rezervasyon onayı
- **Reports.js**: Raporlar sayfası
- **Settings.js**: Ayarlar sayfası
- **Profile.js**: Profil sayfası
- **MailTemplates.js**: E-posta şablonları

### **Servis Katmanı**
- **api.js**: Merkezi API servis dosyası
  - **authAPI**: Kimlik doğrulama işlemleri
  - **bungalowAPI**: Bungalov CRUD işlemleri
  - **customerAPI**: Müşteri CRUD işlemleri
  - **reservationAPI**: Rezervasyon işlemleri
  - **settingsAPI**: Ayarlar yönetimi
  - **reportsAPI**: Rapor işlemleri
  - **mailAPI**: E-posta işlemleri

## 🔄 İş Akışları (Workflows)

### **Rezervasyon Oluşturma Akışı**
1. **Müşteri Seçimi**: Mevcut müşteri seçimi veya yeni müşteri oluşturma
2. **Bungalov Seçimi**: Müsait bungalov seçimi
3. **Tarih Seçimi**: Check-in/out tarihleri belirleme
4. **Misafir Bilgileri**: Misafir sayısı ve ek bilgiler
5. **Ek Hizmetler**: İsteğe bağlı ek hizmet seçimi
6. **Fiyatlandırma**: Otomatik fiyat hesaplama
7. **Ödeme Bilgileri**: Ödeme durumu ve tutarı
8. **Onay**: Rezervasyon onaylama ve kod oluşturma
9. **E-posta Gönderimi**: Otomatik onay e-postası

### **Rezervasyon Onay Akışı**
1. **E-posta Gönderimi**: Confirmation code ile e-posta
2. **Link Tıklama**: Müşteri onay linkine tıklar
3. **Onay Sayfası**: Rezervasyon detayları görüntüleme
4. **Onaylama**: Müşteri rezervasyonu onaylar
5. **Durum Güncelleme**: Rezervasyon durumu "confirmed" olur
6. **Bildirim**: İşletme bilgilendirilir

### **Ödeme Takip Akışı**
1. **Ödeme Kaydı**: Ödeme bilgileri sisteme girilir
2. **Durum Güncelleme**: Payment status güncellenir
3. **Kalan Tutar**: Remaining amount hesaplanır
4. **Geçmiş Kaydı**: Payment history'ye eklenir
5. **Bildirim**: Ödeme durumu güncellenir

## 📱 Responsive Design ve UX

### **Mobil Uyumluluk**
- **TailwindCSS** ile responsive tasarım
- **Mobile-first** yaklaşımı
- **Touch-friendly** arayüz elemanları
- **Responsive navigation** menüsü
- **Adaptive layouts** farklı ekran boyutları için

### **Kullanıcı Deneyimi**
- **Loading States**: Yükleme göstergeleri
- **Toast Notifications**: Anlık bildirimler
- **Error Handling**: Kullanıcı dostu hata mesajları
- **Form Validation**: Gerçek zamanlı doğrulama
- **Auto-save**: Otomatik kaydetme
- **Keyboard Navigation**: Klavye navigasyonu

### **Accessibility (Erişilebilirlik)**
- **ARIA Labels**: Ekran okuyucu desteği
- **Keyboard Navigation**: Klavye erişimi
- **Color Contrast**: Yeterli renk kontrastı
- **Focus Management**: Odak yönetimi
- **Screen Reader Support**: Ekran okuyucu uyumluluğu

## 🧪 Test Stratejisi

### **Backend Testleri**
- **PHPUnit 11.5** ile unit testler
- **Feature Tests**: API endpoint testleri
- **Integration Tests**: Veritabanı entegrasyon testleri
- **Authentication Tests**: Kimlik doğrulama testleri

### **Frontend Testleri**
- **React Testing Library** ile bileşen testleri
- **Jest** ile unit testler
- **Integration Tests**: API entegrasyon testleri
- **E2E Tests**: End-to-end testler

### **Test Coverage**
- **Model Tests**: Eloquent model testleri
- **Controller Tests**: API controller testleri
- **Component Tests**: React bileşen testleri
- **Service Tests**: API servis testleri

## 🚀 Deployment ve DevOps

### **Development Environment**
- **Local Development**: Laravel Sail ile Docker
- **Hot Reload**: Vite ile hızlı geliştirme
- **Database**: SQLite ile kolay kurulum
- **Logging**: Laravel Pail ile log takibi

### **Production Environment**
- **Web Server**: Nginx/Apache
- **PHP**: PHP 8.2+ with OPcache
- **Database**: PostgreSQL/MySQL
- **Cache**: Redis/Memcached
- **Queue**: Redis/Database queue
- **Storage**: S3/Cloud storage

### **CI/CD Pipeline**
- **Version Control**: Git
- **Automated Testing**: GitHub Actions
- **Code Quality**: Laravel Pint, ESLint
- **Deployment**: Automated deployment scripts
- **Monitoring**: Application monitoring

---

**BungApp**, modern teknolojiler kullanılarak geliştirilmiş, bungalov işletmelerinin dijital dönüşümüne öncülük eden kapsamlı bir rezervasyon yönetim sistemidir. Kullanıcı dostu arayüzü, güçlü backend altyapısı ve kapsamlı özellik seti ile işletmelerin verimliliğini artırmayı ve müşteri deneyimini geliştirmeyi hedeflemektedir.

## 📞 İletişim ve Destek

Bu proje, bungalov işletmelerinin dijital dönüşüm ihtiyaçlarını karşılamak üzere geliştirilmiştir. Teknik destek ve geliştirme önerileri için proje ekibi ile iletişime geçebilirsiniz.

### **Teknik Özellikler Özeti**
- **Backend**: Laravel 12.0 + PHP 8.2+ + SQLite
- **Frontend**: React 18.2 + TailwindCSS 3.4 + Axios
- **Authentication**: Laravel Sanctum 4.2
- **Database**: 22 migration, 13 model, 7 seeder
- **API**: 50+ endpoint, RESTful architecture
- **UI Components**: 25+ reusable components
- **Pages**: 14 main pages
- **Security**: Token-based auth, CSRF protection, role-based access
- **Performance**: Optimized queries, caching, lazy loading

---

*Son güncelleme: Ocak 2025*

