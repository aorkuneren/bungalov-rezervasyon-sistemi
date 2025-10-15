# Bungalov Rezervasyon Sistemi

Modern ve kullanıcı dostu bungalov rezervasyon yönetim sistemi.

## 🚀 Özellikler

### 📊 Dashboard
- Genel bakış ve istatistikler
- Bugünün giriş/çıkış rezervasyonları
- Yaklaşan rezervasyonlar
- Bungalov doluluk durumu

### 🏠 Bungalov Yönetimi
- Bungalov listesi ve detayları
- Rezervasyon geçmişi
- Doluluk takibi

### 📅 Rezervasyon Sistemi
- Yeni rezervasyon oluşturma
- Rezervasyon düzenleme ve iptal etme
- Rezervasyon erteleme
- Ek hizmet yönetimi
- Ödeme takibi

### 👥 Müşteri Yönetimi
- Müşteri kayıtları
- Toplam harcama takibi
- Rezervasyon geçmişi

### 📈 Raporlama
- Genel raporlama
- Yıllık raporlama
- Sezonluk raporlama
- Aylık raporlama
- Bungalov bazlı raporlama
- Müşteri bazlı raporlama

### 📧 Mail Sistemi
- Rezervasyon onay mailleri
- HTML mail template'leri
- Dinamik placeholder'lar

### ⚙️ Ayarlar
- Şirket bilgileri
- Mail konfigürasyonu
- Sistem ayarları

## 🛠️ Teknolojiler

### Backend
- **Laravel 11** - PHP Framework
- **SQLite** - Veritabanı
- **Sanctum** - API Authentication
- **Carbon** - Tarih işlemleri

### Frontend
- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **Heroicons** - İkonlar
- **React Router** - Routing

## 📦 Kurulum

### Gereksinimler
- PHP 8.1+
- Node.js 16+
- Composer
- NPM/Yarn

### Backend Kurulumu
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```

## 🗄️ Veritabanı

Sistem SQLite veritabanı kullanır. Ana veritabanı dosyası:
- `backend/database/database.sqlite`

### Yedekleme
```bash
cp backend/database/database.sqlite backend/database/database_backup_$(date +%Y%m%d_%H%M%S).sqlite
```

## 📁 Proje Yapısı

```
webadam/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Mail/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - Giriş
- `POST /api/logout` - Çıkış

### Dashboard
- `GET /api/dashboard` - Dashboard verileri

### Rezervasyonlar
- `GET /api/reservations` - Rezervasyon listesi
- `POST /api/reservations` - Yeni rezervasyon
- `PUT /api/reservations/{id}` - Rezervasyon güncelle
- `DELETE /api/reservations/{id}` - Rezervasyon sil
- `POST /api/reservations/{id}/delay` - Rezervasyon ertele

### Bungalovlar
- `GET /api/bungalows` - Bungalov listesi
- `GET /api/bungalows/{id}` - Bungalov detayı

### Müşteriler
- `GET /api/customers` - Müşteri listesi
- `POST /api/customers` - Yeni müşteri
- `PUT /api/customers/{id}` - Müşteri güncelle

### Raporlar
- `GET /api/reports/general` - Genel rapor
- `GET /api/reports/yearly` - Yıllık rapor
- `GET /api/reports/seasonal` - Sezonluk rapor
- `GET /api/reports/monthly` - Aylık rapor
- `GET /api/reports/bungalow-based` - Bungalov bazlı rapor
- `GET /api/reports/customer-based` - Müşteri bazlı rapor

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd frontend
npm run build
```

## 📝 Geliştirme Notları

- Sistem responsive tasarıma sahiptir
- API authentication Sanctum ile yapılır
- Mail template'leri veritabanında saklanır
- Rezervasyon kodları otomatik oluşturulur
- Tüm işlemler activity log'da kaydedilir

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir.

## 👨‍💻 Geliştirici

Bungalov Rezervasyon Sistemi - 2025
