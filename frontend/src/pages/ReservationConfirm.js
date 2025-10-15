import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationAPI, settingsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CalendarIcon, 
  UserIcon, 
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ReservationConfirm = () => {
  const { confirmationCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [settings, setSettings] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (confirmationCode) {
      loadReservation();
      loadSettings();
    }
  }, [confirmationCode]);

  // Countdown timer için effect
  useEffect(() => {
    if (!reservation || !reservation.confirmation_expires_at) return;

    const updateTimer = () => {
      const now = new Date();
      const expiresAt = new Date(reservation.confirmation_expires_at);
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, total: diff });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getReservationByConfirmationCode(confirmationCode);
      
      if (response.data.success) {
        setReservation(response.data.data);
      } else {
        setError('Rezervasyon bulunamadı');
      }
    } catch (error) {
      console.error('Rezervasyon yüklenirken hata:', error);
      setError('Rezervasyon yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getPublicSettings();
      if (response.data && response.data.success && response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const handleConfirmReservation = async () => {
    if (!termsAccepted) {
      toast('Lütfen şartları ve kuralları onaylayın', { type: 'error' });
      return;
    }

    try {
      setConfirming(true);
      const response = await reservationAPI.confirmReservation(confirmationCode);
      
      if (response.data.success) {
        toast('Rezervasyon başarıyla onaylandı!', { type: 'success' });
        setReservation(prev => ({ ...prev, status: 'confirmed' }));
      } else {
        toast('Rezervasyon onaylanırken bir hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Rezervasyon onaylanırken hata:', error);
      toast('Rezervasyon onaylanırken bir hata oluştu', { type: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return '';
    const date = new Date(dateString);
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return Math.round(price).toLocaleString('tr-TR');
  };

  const processContent = (content) => {
    if (!content) return 'İçerik bulunmuyor.';
    
    // Adres bilgisini oluştur
    const fullAddress = settings ? 
      `${settings.address || ''}, ${settings.postal_code || ''} ${settings.district || ''}/${settings.city || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') : 
      '';
    
    // Template değişkenlerini değiştir
    let processedContent = content
      .replace(/\{\{companyName\}\}/g, settings?.company_name || '')
      .replace(/\{\{companyEmail\}\}/g, settings?.email || '')
      .replace(/\{\{companyPhone\}\}/g, settings?.phone || '')
      .replace(/\{\{companyWebsite\}\}/g, settings?.website || '')
      .replace(/\{\{companyAddress\}\}/g, fullAddress)
      .replace(/\{\{customerName\}\}/g, reservation?.customer?.name || '')
      .replace(/\{\{checkInDate\}\}/g, reservation?.check_in_date ? formatDate(reservation.check_in_date) : '')
      .replace(/\{\{checkOutDate\}\}/g, reservation?.check_out_date ? formatDate(reservation.check_out_date) : '')
      .replace(/\{\{checkInTime\}\}/g, settings?.check_in_time ? settings.check_in_time.substring(11, 16) : '14:00')
      .replace(/\{\{checkOutTime\}\}/g, settings?.check_out_time ? settings.check_out_time.substring(11, 16) : '11:00')
      .replace(/\{\{roomType\}\}/g, reservation?.bungalow?.name || '')
      .replace(/\{\{totalAmount\}\}/g, reservation?.total_price ? formatPrice(reservation.total_price) + ' ₺' : '')
      .replace(/\{\{reservationNumber\}\}/g, reservation?.reservation_code || '');
    
    // HTML içeriği zaten hazır olduğu için sadece template değişkenlerini değiştirdik
    // Ekstra HTML işleme yapmıyoruz çünkü içerik zaten HTML formatında
    
    return processedContent;
  };

  const termsList = [
    {
      id: 'rental_terms',
      title: 'Kiralama Şartları ve Sözleşmesi',
      content: processContent(settings?.terms_and_conditions)
    },
    {
      id: 'cancellation_policy',
      title: 'İptal Politikası',
      content: processContent(settings?.cancellation_policy)
    },
    {
      id: 'usage_terms',
      title: 'Kullanım Koşulları',
      content: processContent(settings?.usage_terms)
    },
    {
      id: 'kvkk',
      title: 'KVKK Aydınlatma Metni',
      content: processContent(settings?.kvkk_text)
    },
    {
      id: 'privacy_policy',
      title: 'Gizlilik Bildirimi',
      content: processContent(settings?.privacy_policy)
    }
  ];

  const handleTermClick = (term) => {
    setSelectedTerm(term);
    setShowTermsModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Onaylandı</Badge>;
      case 'pending':
        return <Badge variant="secondary">Beklemede</Badge>;
      case 'checked_in':
        return <Badge variant="warning">Giriş Yaptı</Badge>;
      case 'completed':
        return <Badge variant="primary">Tamamlandı</Badge>;
      case 'cancelled':
        return <Badge variant="danger">İptal Edildi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge variant="success">Ödendi</Badge>;
      case 'partial':
        return <Badge variant="warning">Kısmi Ödendi</Badge>;
      case 'unpaid':
      case 'pending':
        return <Badge variant="danger">Ödenmedi</Badge>;
      default:
        return <Badge variant="danger">Ödenmedi</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Rezervasyon yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Rezervasyon Bulunamadı
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Aradığınız rezervasyon bulunamadı veya geçersiz onay kodu.'}
          </p>
        </Card>
      </div>
    );
  }

  const isExpired = reservation.confirmation_expires_at && 
    new Date(reservation.confirmation_expires_at) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-80 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rezervasyon Onayı
          </h1>
          <p className="text-gray-600">
            Rezervasyon kodunuz: <span className="font-mono font-semibold">{reservation.reservation_code}</span>
          </p>
        </div>

        {/* Countdown Timer */}
        {reservation.status === 'pending' && reservation.confirmation_expires_at && (
          <>
            {isExpired ? (
              <Card className="mb-6 border-red-200 bg-red-50">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-red-800 font-semibold">Onay Süresi Dolmuş</h3>
                    <p className="text-red-600 text-sm">
                      Bu rezervasyonun onay süresi dolmuştur. Lütfen yeni bir rezervasyon oluşturun.
                    </p>
                  </div>
                </div>
              </Card>
            ) : timeRemaining && (
              <Card className={`mb-6 ${
                timeRemaining.total < 1800000 ? 'border-red-200 bg-red-50' : 
                timeRemaining.total < 3600000 ? 'border-yellow-200 bg-yellow-50' : 
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <ClockIcon className={`h-6 w-6 mr-3 ${
                      timeRemaining.total < 1800000 ? 'text-red-500' : 
                      timeRemaining.total < 3600000 ? 'text-yellow-500' : 
                      'text-blue-500'
                    }`} />
                    <div>
                      <h3 className={`font-semibold ${
                        timeRemaining.total < 1800000 ? 'text-red-800' : 
                        timeRemaining.total < 3600000 ? 'text-yellow-800' : 
                        'text-blue-800'
                      }`}>
                        Bu Rezervasyonu Onaylamak İçin Süreniz Var
                      </h3>
                      <p className={`text-sm ${
                        timeRemaining.total < 1800000 ? 'text-red-600' : 
                        timeRemaining.total < 3600000 ? 'text-yellow-600' : 
                        'text-blue-600'
                      }`}>
                        Lütfen aşağıdaki süre dolmadan rezervasyonunuzu onaylayın
                      </p>
                    </div>
                  </div>
                  
                  {/* Countdown Display */}
                  <div className="flex items-center space-x-2">
                    {timeRemaining.hours > 0 && (
                      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${
                        timeRemaining.total < 1800000 ? 'bg-red-100 border-2 border-red-300' : 
                        timeRemaining.total < 3600000 ? 'bg-yellow-100 border-2 border-yellow-300' : 
                        'bg-blue-100 border-2 border-blue-300'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          timeRemaining.total < 1800000 ? 'text-red-700' : 
                          timeRemaining.total < 3600000 ? 'text-yellow-700' : 
                          'text-blue-700'
                        }`}>
                          {String(timeRemaining.hours).padStart(2, '0')}
                        </span>
                        <span className={`text-xs ${
                          timeRemaining.total < 1800000 ? 'text-red-600' : 
                          timeRemaining.total < 3600000 ? 'text-yellow-600' : 
                          'text-blue-600'
                        }`}>
                          Saat
                        </span>
                      </div>
                    )}
                    <span className={`text-2xl font-bold ${
                      timeRemaining.total < 1800000 ? 'text-red-700' : 
                      timeRemaining.total < 3600000 ? 'text-yellow-700' : 
                      'text-blue-700'
                    }`}>:</span>
                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${
                      timeRemaining.total < 1800000 ? 'bg-red-100 border-2 border-red-300' : 
                      timeRemaining.total < 3600000 ? 'bg-yellow-100 border-2 border-yellow-300' : 
                      'bg-blue-100 border-2 border-blue-300'
                    }`}>
                      <span className={`text-2xl font-bold ${
                        timeRemaining.total < 1800000 ? 'text-red-700' : 
                        timeRemaining.total < 3600000 ? 'text-yellow-700' : 
                        'text-blue-700'
                      }`}>
                        {String(timeRemaining.minutes).padStart(2, '0')}
                      </span>
                      <span className={`text-xs ${
                        timeRemaining.total < 1800000 ? 'text-red-600' : 
                        timeRemaining.total < 3600000 ? 'text-yellow-600' : 
                        'text-blue-600'
                      }`}>
                        Dakika
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${
                      timeRemaining.total < 1800000 ? 'text-red-700' : 
                      timeRemaining.total < 3600000 ? 'text-yellow-700' : 
                      'text-blue-700'
                    }`}>:</span>
                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${
                      timeRemaining.total < 1800000 ? 'bg-red-100 border-2 border-red-300' : 
                      timeRemaining.total < 3600000 ? 'bg-yellow-100 border-2 border-yellow-300' : 
                      'bg-blue-100 border-2 border-blue-300'
                    }`}>
                      <span className={`text-2xl font-bold ${
                        timeRemaining.total < 1800000 ? 'text-red-700' : 
                        timeRemaining.total < 3600000 ? 'text-yellow-700' : 
                        'text-blue-700'
                      }`}>
                        {String(timeRemaining.seconds).padStart(2, '0')}
                      </span>
                      <span className={`text-xs ${
                        timeRemaining.total < 1800000 ? 'text-red-600' : 
                        timeRemaining.total < 3600000 ? 'text-yellow-600' : 
                        'text-blue-600'
                      }`}>
                        Saniye
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rezervasyon Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* Genel Bilgiler */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-6 w-6 mr-2" />
                Rezervasyon Detayları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rezervasyon Kodu
                  </label>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {reservation.reservation_code}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(reservation.status)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giriş Tarihi
                  </label>
                  <p className="text-gray-900">
                    {formatDateTime(reservation.check_in_date, '14:00')}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Çıkış Tarihi
                  </label>
                  <p className="text-gray-900">
                    {formatDateTime(reservation.check_out_date, '11:00')}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gece Sayısı
                  </label>
                  <p className="text-gray-900">
                    {calculateNights(reservation.check_in_date, reservation.check_out_date)} gece
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Misafir Sayısı
                  </label>
                  <p className="text-gray-900">
                    {reservation.number_of_guests} kişi
                  </p>
                </div>
              </div>
            </Card>

            {/* Bungalov Bilgileri */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HomeIcon className="h-6 w-6 mr-2" />
                Bungalov Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bungalov Adı
                  </label>
                  <p className="text-gray-900">{reservation.bungalow?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasite
                  </label>
                  <p className="text-gray-900">{reservation.bungalow?.capacity} kişi</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <p className="text-gray-900">{reservation.bungalow?.description || 'Açıklama bulunmuyor'}</p>
                </div>
              </div>
            </Card>

            {/* Müşteri Bilgileri */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-6 w-6 mr-2" />
                Müşteri Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <p className="text-gray-900">{reservation.customer?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <p className="text-gray-900">{reservation.customer?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <p className="text-gray-900">{reservation.customer?.phone}</p>
                </div>
                
                {reservation.customer?.id_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {reservation.customer?.id_type === 'tc' ? 'TC Kimlik No' : 'Pasaport No'}
                    </label>
                    <p className="text-gray-900">{reservation.customer?.id_number}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Konaklayacak Kişiler */}
            {reservation.residents && reservation.residents.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Konaklayacak Kişiler
                </h2>
                
                <div className="space-y-4">
                  {reservation.residents.map((resident, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Kişi {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ad Soyad
                          </label>
                          <p className="text-gray-900">{resident.name}</p>
                        </div>
                        
                        {resident.id_number && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {resident.id_type === 'tc' ? 'TC Kimlik No' : 'Pasaport No'}
                            </label>
                            <p className="text-gray-900">{resident.id_number}</p>
                          </div>
                        )}
                        
                        {resident.phone && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Telefon
                            </label>
                            <p className="text-gray-900">{resident.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Ödeme Bilgileri ve Onay */}
          <div className="space-y-6">
            {/* Fiyat Bilgileri */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                Fiyat Bilgileri
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Fiyat:</span>
                  <span className="font-semibold text-gray-900">
                    ₺{formatPrice(reservation.total_price)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Onay Butonu */}
            {reservation.status === 'pending' && !isExpired && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Rezervasyonu Onayla
                </h2>
                
                {/* Şartlar ve Kurallar Listesi */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Şartlar ve Kurallar
                  </h3>
                  
                  <div className="space-y-2">
                    {termsList.map((term) => (
                      <button
                        key={term.id}
                        onClick={() => handleTermClick(term)}
                        className="w-full text-left p-1 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-700 hover:text-blue-500">
                          {term.title}
                        </span>
                       
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Yukarıdaki şartları ve kuralları okudum, onaylıyorum.
                      </span>
                    </label>
                  </div>
                </div>
                
                <Button
                  onClick={handleConfirmReservation}
                  loading={confirming}
                  variant="primary"
                  className="w-full"
                  disabled={!termsAccepted}
                >
                  {confirming ? 'Onaylanıyor...' : 'Rezervasyonu Onayla'}
                </Button>
              </Card>
            )}

            {/* Notlar */}
            {reservation.notes && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Notlar
                </h2>
                <p className="text-gray-600">{reservation.notes}</p>
              </Card>
            )}
          </div>
        </div>

        {/* Şartlar ve Kurallar Modal */}
        {showTermsModal && selectedTerm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTerm.title}
                </h3>
                <button
                  onClick={() => {
                    setShowTermsModal(false);
                    setSelectedTerm(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div 
                  className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg"
                  style={{
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: `
                      <style>
                        .terms-content h2 { 
                          font-size: 1.5rem; 
                          font-weight: 700; 
                          margin: 0 0 1.5rem 0; 
                          color: #1f2937; 
                          border-bottom: 2px solid #e5e7eb;
                          padding-bottom: 0.5rem;
                        }
                        .terms-content h3 { 
                          font-size: 1.25rem; 
                          font-weight: 600; 
                          margin: 2rem 0 1rem 0; 
                          color: #374151; 
                        }
                        .terms-content p { 
                          margin-bottom: 1rem; 
                          line-height: 1.6;
                        }
                        .terms-content br { 
                          margin-bottom: 0.5rem; 
                        }
                        .terms-content strong { 
                          font-weight: 600; 
                          color: #1f2937; 
                        }
                        .terms-content a { 
                          color: #3b82f6; 
                          text-decoration: underline; 
                        }
                        .terms-content a:hover { 
                          color: #1d4ed8; 
                        }
                      </style>
                      <div class="terms-content">${selectedTerm.content}</div>
                    `
                  }}
                />
              </div>
              
              <div className="flex justify-end p-6 border-t bg-gray-50">
                <Button
                  onClick={() => {
                    setShowTermsModal(false);
                    setSelectedTerm(null);
                  }}
                  variant="primary"
                >
                  Kapat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationConfirm;
