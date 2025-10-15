import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import TermsModal from '../components/TermsModal';
import CountdownTimer from '../components/CountdownTimer';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ReservationConfirmation = () => {
  const { confirmationCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [termsConditions, setTermsConditions] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    if (confirmationCode) {
      setLoading(true);
      // Load all data in parallel for better performance
      Promise.all([
        loadReservation(),
        loadTermsConditions(),
        loadCompanySettings()
      ]).finally(() => {
        setLoading(false);
      }).catch(error => {
        console.error('Error loading initial data:', error);
        setLoading(false);
      });
    }
  }, [confirmationCode]);

  const loadReservation = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/reservations/confirm/${confirmationCode}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // 410 Gone - Onay süresi dolmuş
      if (response.status === 410) {
        setError('Bu rezervasyonun onay süresi dolmuştur. Rezervasyon otomatik olarak iptal edilmiştir.');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setReservation(data.data);
      } else {
        setError(data.message || 'Rezervasyon bulunamadı');
      }
    } catch (error) {
      // 410 hatası dışındaki hataları logla
      if (!error.message?.includes('410')) {
        console.error('Rezervasyon yüklenirken hata:', error);
      }
      setError('Rezervasyon yüklenirken bir hata oluştu');
    }
  };

  const loadTermsConditions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/terms-conditions', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setTermsConditions(data.data.filter(term => term.is_active));
      }
    } catch (error) {
      console.error('Kurallar ve şartlar yüklenirken hata:', error);
    }
  };

  const loadCompanySettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/company-settings', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setCompanySettings(data.data);
      }
    } catch (error) {
      console.error('Firma bilgileri yüklenirken hata:', error);
    }
  };

  const handleOpenTermsModal = async (term) => {
    try {
      // Load the term with reservation-specific variables
      const response = await fetch(`http://localhost:8000/api/terms-conditions/${term.type}?confirmation_code=${confirmationCode}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedTerm(data.data);
        setShowTermsModal(true);
      } else {
        // Fallback to original term if API fails
        setSelectedTerm(term);
        setShowTermsModal(true);
      }
    } catch (error) {
      console.error('Terms yüklenirken hata:', error);
      // Fallback to original term if API fails
      setSelectedTerm(term);
      setShowTermsModal(true);
    }
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
    setSelectedTerm(null);
  };

  const handleTimerExpire = async () => {
    try {
      // Rezervasyonu iptal et
      const response = await fetch(`http://localhost:8000/api/reservations/${reservation.id}/cancel`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Onay süresi doldu'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReservation(data.data);
        toast('Rezervasyon onay süresi dolduğu için otomatik olarak iptal edildi', { type: 'warning' });
      } else {
        console.error('Rezervasyon iptal edilirken hata:', data.message);
      }
    } catch (error) {
      console.error('Rezervasyon iptal edilirken hata:', error);
    }
  };

  const confirmReservation = async () => {
    if (!termsAccepted) {
      toast('Lütfen kurallar ve şartları kabul edin', { type: 'error' });
      return;
    }

    try {
      setConfirming(true);
      const response = await fetch(`http://localhost:8000/api/reservations/confirm/${confirmationCode}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          terms_accepted: true
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReservation(data.data);
        toast('Rezervasyonunuz başarıyla onaylandı!', { type: 'success' });
      } else {
        toast(data.message || 'Rezervasyon onaylanırken bir hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Rezervasyon onaylanırken hata:', error);
      toast('Rezervasyon onaylanırken bir hata oluştu', { type: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  // WhatsApp helper functions
  const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Add country code if not present
    if (digits.startsWith('90')) {
      return digits;
    } else if (digits.startsWith('0')) {
      return '90' + digits.substring(1);
    } else {
      return '90' + digits;
    }
  };

  const createWhatsAppLink = useMemo(() => {
    const phone = formatPhoneNumber(companySettings?.phone);
    if (!phone) return null;

    // Use actual reservation code, not confirmation code
    const reservationCode = reservation?.reservation_code;
    

    if (reservationCode) {
      let message;
      if (reservation?.check_in_date) {
        message = `Merhaba! Rezervasyon kodum: ${reservationCode}. Rezervasyonum hakkında bilgi almak istiyorum. Giriş tarihi: ${formatDate(reservation.check_in_date)}. Teşekkürler!`;
      } else {
        message = `Merhaba! Rezervasyon kodum: ${reservationCode}. Rezervasyonum hakkında bilgi almak istiyorum. Teşekkürler!`;
      }
      
      const encodedMessage = encodeURIComponent(message);
      console.log('Message:', message);
      console.log('Encoded message:', encodedMessage);
      return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
    }
    
    // If no reservation data available, use simple link with generic message
    const genericMessage = `Merhaba, rezervasyonumu tekrar oluşturmak istiyorum.`;
    const encodedGenericMessage = encodeURIComponent(genericMessage);
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedGenericMessage}`;
  }, [companySettings?.phone, reservation, confirmationCode]);

  const handleWhatsAppClick = () => {
    if (createWhatsAppLink) {
      console.log('WhatsApp Link:', createWhatsAppLink);
      window.open(createWhatsAppLink, '_blank');
    } else {
      toast('Telefon numarası bulunamadı', { type: 'error' });
    }
  };

  const getStatusBadge = useMemo(() => {
    return (status) => {
      switch (status) {
        case 'confirmed':
          return <Badge variant="success">Onaylandı</Badge>;
        case 'pending':
          return <Badge variant="warning">Onay Bekliyor</Badge>;
        case 'cancelled':
          return <Badge variant="danger">İptal Edildi</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    };
  }, []);

  const reservationStatus = useMemo(() => {
    if (!reservation) return { isExpired: false, isConfirmed: false, canConfirm: false };
    
    const isExpired = reservation.confirmation_expires_at && 
      new Date(reservation.confirmation_expires_at) < new Date();
    const isConfirmed = reservation.status === 'confirmed';
    const canConfirm = !isConfirmed && !isExpired && reservation.status === 'pending';
    
    return { isExpired, isConfirmed, canConfirm };
  }, [reservation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Rezervasyon bilgileri yükleniyor...</p>
          <p className="mt-2 text-xs text-gray-400">Kod: {confirmationCode}</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Onay süresi dolmuş durumu için özel UI
    const isExpired = error.includes('onay süresi dolmuş');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            {isExpired ? (
              <>
                <ClockIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Onay Süresi Doldu</h1>
                <p className="text-sm text-gray-600 mb-2">
                  Bu rezervasyonun onay süresi dolduğu için otomatik olarak iptal edilmiştir.
                </p>
                
                  <Button onClick={handleWhatsAppClick}>
                    WhatsApp ile İletişime Geç
                  </Button>
              </>
            ) : (
              <>
                <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Hata</h1>
                <p className="text-gray-600 mb-6">{error}</p>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Rezervasyon Bulunamadı</h1>
            <p className="text-gray-600 mb-6">Bu onay kodu ile rezervasyon bulunamadı.</p>
            <Button onClick={() => navigate('/')}>
              Ana Sayfaya Dön
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { isExpired, isConfirmed, canConfirm } = reservationStatus;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {canConfirm && reservation.confirmation_expires_at && (
          <div className="mb-8">
            <CountdownTimer 
              expiresAt={reservation.confirmation_expires_at}
              onExpire={handleTimerExpire}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Rezervasyon Detayları */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Rezervasyon Detayları
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rezervasyon Kodu</label>
                    <p className="text-lg font-bold text-gray-900">{reservation.reservation_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Giriş Tarihi</label>
                    <p className="text-sm text-gray-900">{formatDate(reservation.check_in_date)} 14:00</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gece Sayısı</label>
                    <p className="text-sm text-gray-900">
                      {Math.ceil((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / (1000 * 60 * 60 * 24))} gece
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Durum</label>
                    <div className="mt-1">
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Çıkış Tarihi</label>
                    <p className="text-sm text-gray-900">{formatDate(reservation.check_out_date)} 11:00</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Misafir Sayısı</label>
                    <p className="text-sm text-gray-900">{reservation.number_of_guests} kişi</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bungalov Bilgileri */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Bungalov Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bungalov Adı</label>
                    <p className="text-sm text-gray-900">{reservation.bungalow?.name || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Açıklama</label>
                    <p className="text-sm text-gray-900">{reservation.bungalow?.description || 'Sadece Bahçeli'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kapasite</label>
                    <p className="text-sm text-gray-900">{reservation.bungalow?.capacity || 2} kişi</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Müşteri Bilgileri */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Müşteri Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                    <p className="text-sm text-gray-900">{reservation.customer?.name || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p className="text-sm text-gray-900">{reservation.customer?.phone || 'Belirtilmemiş'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">E-posta</label>
                    <p className="text-sm text-gray-900">{reservation.customer?.email || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">TC Kimlik No</label>
                    <p className="text-sm text-gray-900">{reservation.customer?.id_number || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Fiyat Bilgileri */}
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Fiyat Bilgileri
                </h2>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{formatPrice(reservation.total_price)}</p>
                </div>
              </Card>

              {/* Rezervasyonu Onayla */}
              {canConfirm && (
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Rezervasyonu Onayla
                  </h2>
                  
                  {/* Terms and Conditions */}
                  {termsConditions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Şartlar ve Kurallar</h3>
                      <div className="space-y-3 mb-4">
                        {termsConditions.map((term, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleOpenTermsModal(term)}
                            className="group flex items-center w-full text-left text-sm text-gray-700 hover:text-black transition-all duration-200 "
                          >
                            <span className="flex-1 font-medium">{term.title}</span>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex items-start space-x-3 mb-4">
                        <input
                          type="checkbox"
                          id="terms-acceptance"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms-acceptance" className="text-sm text-gray-700 cursor-pointer">
                          Yukarıdaki şartları ve kuralları okudum, onaylıyorum.
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={confirmReservation}
                    loading={confirming}
                    disabled={!termsAccepted}
                    className="w-full py-3"
                  >
                    {confirming ? 'Onaylanıyor...' : 'Rezervasyonu Onayla'}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages for Non-Confirmable States */}
        {!canConfirm && (
          <Card className="mt-6">
            <div className="text-center">
              {isConfirmed ? (
                <div className="flex flex-col items-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-lg text-green-600 font-semibold mb-2">Rezervasyonunuz Onaylandı!</p>
                  <p className="text-gray-600 mb-4">
                    Onay tarihi: {formatDate(reservation.confirmed_at)}
                  </p>
                  {getStatusBadge(reservation.status)}
                </div>
              ) : isExpired || reservation.status === 'cancelled' ? (
                <div className="flex flex-col items-center">
                  <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
                  <p className="text-lg text-red-600 font-semibold mb-2">
                    {reservation.status === 'cancelled' ? 'Rezervasyon İptal Edildi' : 'Onay Süresi Dolmuş'}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {reservation.status === 'cancelled' 
                      ? 'Bu rezervasyon iptal edilmiştir.'
                      : `Onay süresi: ${formatDate(reservation.confirmation_expires_at)}`
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    Lütfen rezervasyonunuzu yeniden oluşturun veya bizimle iletişime geçin.
                  </p>
                  {getStatusBadge(reservation.status)}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mb-4" />
                  <p className="text-lg text-yellow-600 font-semibold mb-2">Beklenmeyen Durum</p>
                  <p className="text-gray-600 mb-4">
                    Rezervasyon durumu: {reservation.status}
                  </p>
                  {getStatusBadge(reservation.status)}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Notlar */}
        {reservation.notes && (
          <Card className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notlar</h2>
            <p className="text-gray-700">{reservation.notes}</p>
          </Card>
        )}
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={handleCloseTermsModal}
        selectedTerm={selectedTerm}
      />
    </div>
  );
};

export default ReservationConfirmation;
