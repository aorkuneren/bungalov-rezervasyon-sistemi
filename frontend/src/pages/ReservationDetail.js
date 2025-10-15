import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { reservationAPI, settingsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Input, { NumberInput, DateInput, TelInput, EmailInput } from '../components/ui/Input';
import SimpleCalendar from '../components/ui/SimpleCalendar';
import { FormSection, FormField, FormActions } from '../components/ui/FormGroup';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarDaysIcon,
  UserIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [settings, setSettings] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [ekHizmetler, setEkHizmetler] = useState([]);

  // Form states
  const [reservationData, setReservationData] = useState({
    status: '',
    payment_status: '',
    payment_amount: 0,
    notes: ''
  });

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    id_type: 'tc'
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [serviceData, setServiceData] = useState({
    service_id: '',
    quantity: 1,
    notes: ''
  });

  const [noteData, setNoteData] = useState({
    note: ''
  });

  const [delayData, setDelayData] = useState({
    new_check_in_date: '',
    new_check_out_date: '',
    delay_reason: ''
  });

  // Bungalov rezervasyonları (erteleme modal'ında çakışma kontrolü için)
  const [bungalowReservations, setBungalowReservations] = useState([]);

  // Takvim için seçili tarihler
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null
  });


  useEffect(() => {
    if (id) {
      loadReservation();
      loadSettings();
    }
  }, [id]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getReservation(id);

      if (response.data.success) {
        const data = response.data.data;

        setReservation(data);
        // İptal edilen rezervasyonlar için otomatik not ekle
        let notes = data.notes || '';
        if (data.status === 'cancelled' && data.cancellation_reason && !notes.includes('İptal')) {
          const cancellationNote = `\n\n--- İPTAL BİLGİSİ ---\nİptal Tarihi: ${new Date(data.cancelled_at).toLocaleDateString('tr-TR')}\nİptal Sebebi: ${data.cancellation_reason}`;
          notes = notes + cancellationNote;
        }

        setReservationData({
          status: data.status,
          payment_status: data.payment_status,
          payment_amount: data.payment_amount || 0,
          notes: notes
        });
        setCustomerData({
          name: data.customer?.name || '',
          email: data.customer?.email || '',
          phone: data.customer?.phone || '',
          id_number: data.customer?.id_number || '',
          id_type: data.customer?.id_type || 'tc'
        });
      } else {
        toast('Rezervasyon bulunamadı', { type: 'error' });
        navigate('/reservations');
      }
    } catch (error) {
      console.error('Rezervasyon yüklenirken hata:', error);
      toast('Rezervasyon yüklenirken bir hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Ek hizmetleri yükle
      const servicesResponse = await settingsAPI.getEkHizmetler();
      if (servicesResponse.data.success && servicesResponse.data.data) {
        setEkHizmetler(servicesResponse.data.data);
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const handleRemoveService = (serviceIndex) => {
    const service = reservation.extra_services[serviceIndex];
    setConfirmationData({
      serviceIndex,
      serviceName: service.service_name,
      serviceAmount: service.total_amount
    });
    setShowConfirmationModal(true);
  };

  const confirmRemoveService = async () => {
    if (!confirmationData) return;

    try {
      setSaving(true);
      const response = await reservationAPI.removeService(id, { service_index: confirmationData.serviceIndex });
      
      if (response.data.success) {
        setReservation(response.data.data);
        toast('Ek hizmet başarıyla silindi', { type: 'success' });
      } else {
        toast(response.data.message || 'Ek hizmet silinirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Ek hizmet silme hatası:', error);
      toast('Ek hizmet silinirken hata oluştu', { type: 'error' });
    } finally {
      setSaving(false);
      setShowConfirmationModal(false);
      setConfirmationData(null);
    }
  };

  const loadBungalowReservations = async (bungalowId) => {
    try {
      if (bungalowId) {
        const response = await reservationAPI.getReservations({
          bungalow_id: bungalowId
        });

        if (response.data.success) {
          // CreateReservation.js formatında veri hazırla
          // Mevcut rezervasyonu hariç tut (kendi kendini bloklamasın)
          const activeReservations = response.data.data
            .filter(res => res.status !== 'cancelled' && res.id !== parseInt(id))
            .map(res => ({
              id: res.id,
              reservationCode: res.reservation_code,
              customerName: res.customer?.name || 'Bilinmeyen',
              bungalowId: res.bungalow_id,
              bungalowName: res.bungalow?.name || '',
              checkInDate: res.check_in_date,
              checkOutDate: res.check_out_date,
              guests: res.number_of_guests,
              totalPrice: parseFloat(res.total_price),
              status: res.status,
              paymentStatus: res.payment_status,
              paymentAmount: parseFloat(res.payment_amount || 0),
              remainingAmount: parseFloat(res.remaining_amount || 0),
              notes: res.notes || '',
              additionalGuests: res.additional_guests || [],
              confirmationCode: res.confirmation_code,
              confirmationExpiresAt: res.confirmation_expires_at,
              createdAt: res.created_at,
              updatedAt: res.updated_at,
            }));

          setBungalowReservations(activeReservations);
        }
      }
    } catch (error) {
      console.error('Bungalov rezervasyonları yükleme hatası:', error);
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

  const formatPrice = (price) => {
    if (!price) return '0';
    return Math.round(price).toLocaleString('tr-TR');
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', text: 'Beklemede' },
      confirmed: { variant: 'success', text: 'Onaylandı' },
      checked_in: { variant: 'warning', text: 'Giriş Yaptı' },
      completed: { variant: 'primary', text: 'Tamamlandı' },
      cancelled: { variant: 'danger', text: 'İptal Edildi' }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      unpaid: { variant: 'danger', text: 'Ödenmedi' },
      pending: { variant: 'secondary', text: 'Ödeme Bekliyor' },
      partial: { variant: 'warning', text: 'Kısmi Ödendi' },
      paid: { variant: 'success', text: 'Ödendi' },
      refunded: { variant: 'secondary', text: 'İade Edildi' }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setSaving(true);
      const response = await reservationAPI.updateReservation(id, {
        status: newStatus
      });

      if (response.data.success) {
        setReservation(prev => ({ ...prev, status: newStatus }));
        setReservationData(prev => ({ ...prev, status: newStatus }));
        toast('Rezervasyon durumu güncellendi', { type: 'success' });
      } else {
        toast(response.data.message || 'Durum güncellenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || 'Durum güncellenirken hata oluştu';
      toast(errorMessage, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await reservationAPI.addPayment(id, paymentData);

      if (response.data.success) {
        toast('Ödeme bilgisi eklendi', { type: 'success' });
        setShowPaymentModal(false);
        setPaymentData({
          amount: 0,
          payment_method: 'cash',
          payment_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        loadReservation(); // Rezervasyonu yeniden yükle
      } else {
        toast(response.data.message || 'Ödeme eklenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Ödeme ekleme hatası:', error);
      toast('Ödeme eklenirken hata oluştu', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCustomerUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await reservationAPI.updateCustomer(id, customerData);

      if (response.data.success) {
        toast('Müşteri bilgileri güncellendi', { type: 'success' });
        setShowCustomerModal(false);
        loadReservation(); // Rezervasyonu yeniden yükle
      } else {
        toast(response.data.message || 'Müşteri bilgileri güncellenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      toast('Müşteri bilgileri güncellenirken hata oluştu', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleNotesUpdate = async (e, notesToSave = null) => {
    e.preventDefault();
    try {
      setSaving(true);
      const notesValue = notesToSave !== null ? notesToSave : reservationData.notes;
      const response = await reservationAPI.updateReservation(id, {
        notes: notesValue
      });

      if (response.data.success) {
        toast('Notlar güncellendi', { type: 'success' });
        setShowNotesModal(false);
        setReservation(prev => ({ ...prev, notes: notesValue }));
        if (notesToSave !== null) {
          setReservationData(prev => ({ ...prev, notes: notesValue }));
        }
      } else {
        toast(response.data.message || 'Notlar güncellenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Notlar güncelleme hatası:', error);
      toast('Notlar güncellenirken hata oluştu', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelayReservation = async (e) => {
    e.preventDefault();

    // Tarih seçimi kontrolü
    if (!delayData.new_check_in_date || !delayData.new_check_out_date) {
      toast('Lütfen giriş ve çıkış tarihlerini seçin', { type: 'error' });
      return;
    }

    try {
      setSaving(true);

      const response = await reservationAPI.delayReservation(id, delayData);
      if (response.data.success) {
        toast('Rezervasyon başarıyla ertelendi. Eski tarihler otomatik olarak notlara eklendi.', { type: 'success' });
        
        // Rezervasyonu yeniden yükle
        await loadReservation();
        
        // Yeni tarihleri selectedDates'e set et
        setSelectedDates({
          start: delayData.new_check_in_date,
          end: delayData.new_check_out_date
        });
        
        setShowDelayModal(false);
      } else {
        toast(response.data.message || 'Rezervasyon ertelenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Rezervasyon erteleme hatası:', error);
      toast(error.response?.data?.message || 'Rezervasyon ertelenirken hata oluştu', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rezervasyon yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rezervasyon Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Aradığınız rezervasyon bulunamadı veya silinmiş olabilir.</p>
          <Button onClick={() => navigate('/reservations')}>
            Rezervasyonlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const nights = calculateNights(reservation.check_in_date, reservation.check_out_date);
  const remainingAmount = reservation.total_price - (reservation.payment_amount || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/reservations')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Geri Dön
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Detayları</h1>
              <p className="mt-2 text-gray-500">Rezervasyon Kodu: {reservation.reservation_code}</p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(reservation.status)}
              {getPaymentStatusBadge(reservation.payment_status)}
            </div>
          </div>
        </div>

        {/* 1. Satır - Rezervasyon, Müşteri ve Notlar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Rezervasyon Bilgileri */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              Rezervasyon Bilgileri
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Giriş Tarihi</label>
                  <p className="text-sm text-gray-900">{formatDate(reservation.check_in_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Çıkış Tarihi</label>
                  <p className="text-sm text-gray-900">{formatDate(reservation.check_out_date)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Gece Sayısı</label>
                  <p className="text-sm text-gray-900">{nights} gece</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Misafir Sayısı</label>
                  <p className="text-sm text-gray-900">{reservation.guest_count || 1} kişi</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bungalov</label>
                <p className="text-sm text-gray-900 capitalize">{reservation.bungalow?.name || 'Belirtilmemiş'}</p>
              </div>


              {reservation.confirmation_code && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2">Müşteri Onay Linki</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <a href={`${window.location.origin}/confirm/${reservation.confirmation_code}`} className="text-xs text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {window.location.origin}/confirm/{reservation.confirmation_code}
                    </a>

                  </div>
                </div>
              )}

            </div>
            <h3 className="text-lg font-semibold text-gray-900 my-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Müşteri Bilgileri
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{reservation.customer?.name || 'Belirtilmemiş'}</span>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{reservation.customer?.email || 'Belirtilmemiş'}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{reservation.customer?.phone || 'Belirtilmemiş'}</span>
              </div>
              {reservation.customer?.id_number && (
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {reservation.customer.id_type === 'tc' ? 'TC Kimlik' : 'Pasaport'}: {reservation.customer.id_number}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Fiyat Detayları */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Fiyat Detayları
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Günlük Fiyat:</span>
                <span className="text-sm font-semibold">₺{formatPrice(reservation.bungalow?.price || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gece Sayısı:</span>
                <span className="text-sm font-semibold">{nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Konaklama Tutarı:</span>
                <span className="text-sm font-semibold">₺{formatPrice((reservation.bungalow?.price || 0) * nights)}</span>
              </div>

              {/* Ek Hizmetler */}
              {reservation.extra_services && reservation.extra_services.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Ek Hizmetler:</p>
                  {reservation.extra_services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center mb-1 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          {service.service_name}
                          {service.service_type === 'person' && ` (${service.quantity}x)`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">
                          ₺{formatPrice(service.total_amount)}
                        </span>
                        {reservation.status !== 'cancelled' && (
                          <button
                            onClick={() => handleRemoveService(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Ek hizmeti sil"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-semibold text-gray-900">Toplam Tutar:</span>
                <span className="text-sm font-semibold text-gray-900">₺{formatPrice(reservation.total_price)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="text-sm font-semibold">Ödenen:</span>
                <span className="text-sm font-semibold">₺{formatPrice(reservation.payment_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-red-600 border-t pt-2">
                <span className="text-sm font-semibold">Kalan:</span>
                <span className="text-sm font-semibold">₺{formatPrice(remainingAmount)}</span>
              </div>
            </div>

            {/* Ödeme işlemleri sadece iptal edilmemiş rezervasyonlar için göster */}
            {reservation.status !== 'cancelled' && (
              <div className="space-y-3 mt-4">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full"
                  disabled={remainingAmount <= 0}
                >
                  Ödeme Ekle
                </Button>

                <hr></hr>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Ödeme Geçmişi
                </h3>
                {(reservation.payment_history && reservation.payment_history.length > 0) || (reservation.payment_amount > 0) ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {/* Eski ödemeler için (payment_history olmadan) */}
                    {reservation.payment_amount > 0 && (!reservation.payment_history || reservation.payment_history.length === 0) && (
                      <div className="border-l-4 border-gray-400 bg-gray-50 p-3 rounded-r">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              ₺{formatPrice(reservation.payment_amount)}
                            </p>
                            <p className="text-xs text-gray-600">
                              Eski Kayıt
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {formatDate(reservation.created_at)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Sistem
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 border-t border-gray-200 pt-2">
                          Bu ödeme detaylı geçmiş özelliği eklenmeden önce kaydedilmiş
                        </p>
                      </div>
                    )}

                    {/* Yeni ödemeler (payment_history ile) */}
                    {reservation.payment_history && reservation.payment_history.map((payment, index) => (
                      <div key={index} className="border-l-4 border-green-500 bg-green-50 p-3 rounded-r">
                        <div className="flex col-span-2 justify-between items-center">
                            <p className="text-sm font-semibold text-gray-900">
                              ₺{formatPrice(payment.amount)} 
                              
                            </p>
                            <span className="text-xs text-gray-500">
                              {payment.payment_method === 'cash' && 'Nakit'}
                              {payment.payment_method === 'card' && 'Kredi Kartı'}
                              {payment.payment_method === 'transfer' && 'Havale'}
                              {payment.payment_method === 'other' && 'Diğer'}
                              {payment.notes && ` - ${payment.notes}`}
                            </span>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.payment_date).toLocaleDateString('tr-TR')}
                            </p>
    
                      
                        </div>
                      
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Henüz ödeme yapılmamış
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Rezervasyon Notları */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Rezervasyon Notları
            </h3>
            {reservation.notes ? (
              <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md space-y-2 max-h-48 overflow-y-auto">
                {reservation.notes.split('\n\n').map((note, index) => (
                  <div key={index} className="border-l-2 border-blue-400 pl-3 py-1">
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Henüz not eklenmemiş</p>
              </div>
            )}
          </Card>
        </div>


        {/* 2. Satır - Hızlı İşlemler */}
        <div className="grid grid-rows-1 gap-6">
          {/* Durum Güncelle */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Durum Güncelle
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={reservation.status === status ? 'primary' : 'outline'}
                  onClick={() => handleStatusChange(status)}
                  disabled={saving}
                  className="w-full justify-start"
                >
                  {status === 'pending' && 'Beklemede'}
                  {status === 'confirmed' && 'Onaylandı'}
                  {status === 'checked_in' && 'Giriş Yaptı'}
                  {status === 'completed' && 'Tamamlandı'}
                  {status === 'cancelled' && 'İptal Edildi'}
                </Button>
              ))}
            </div>
          </Card>

          {/* Ek Hizmet Ekle - Sadece iptal edilmemiş rezervasyonlar için göster */}
          {reservation.status !== 'cancelled' && (
            <Card className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Hızlı İşlemler
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => setShowServiceModal(true)}
                  variant="primary"
                  className="w-full"
                  disabled={!ekHizmetler || ekHizmetler.length === 0}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ek Hizmet Ekle
                </Button>
                {(!ekHizmetler || ekHizmetler.length === 0) && (
                  <p className="text-xs text-gray-500 mt-2">
                    Ayarlar sayfasından önce ek hizmet tanımlamalısınız
                  </p>
                )}
                <Button
                  onClick={() => setShowAddNoteModal(true)}
                  variant="primary"
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Not Ekle
                </Button>

                <Button
                  onClick={async () => {
                    setShowDelayModal(true);
                    await loadBungalowReservations(reservation.bungalow_id);
                    
                    // Mevcut tarihleri set et
                    // Tarih formatını YYYY-MM-DD'ye çevir
                    const checkInDate = new Date(reservation.check_in_date).toISOString().split('T')[0];
                    const checkOutDate = new Date(reservation.check_out_date).toISOString().split('T')[0];
                    
                    setDelayData({
                      new_check_in_date: checkInDate,
                      new_check_out_date: checkOutDate,
                      delay_reason: ''
                    });
                    setSelectedDates({
                      start: checkInDate,
                      end: checkOutDate
                    });
                  }}
                  variant="warning"
                  className="w-full"
                  disabled={['completed', 'cancelled'].includes(reservation.status)}
                >
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  Rezervasyonu Ertele
                </Button>
              </div>
              {['completed', 'cancelled'].includes(reservation.status) && (
                <p className="text-xs text-gray-500 mt-2">
                  Tamamlanmış veya iptal edilmiş rezervasyonlar ertelenemez
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Eski Layout Sonu - Modals Başlangıcı */}
        <div style={{ display: 'none' }}>
          {/* Orta Kolon - Rezervasyon Bilgileri */}
          <div className="space-y-6">
            {/* Rezervasyon Bilgileri */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Rezervasyon Bilgileri
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Giriş Tarihi</label>
                    <p className="text-sm text-gray-900">{formatDate(reservation.check_in_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Çıkış Tarihi</label>
                    <p className="text-sm text-gray-900">{formatDate(reservation.check_out_date)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gece Sayısı</label>
                    <p className="text-sm text-gray-900">{nights} gece</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Misafir Sayısı</label>
                    <p className="text-sm text-gray-900">{reservation.guest_count || 1} kişi</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bungalov</label>
                  <p className="text-sm text-gray-900">{reservation.bungalow?.name || 'Belirtilmemiş'}</p>
                </div>
                {reservation.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notlar</label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md space-y-2">
                      {reservation.notes.split('\n\n').map((note, index) => (
                        <div key={index} className="border-l-2 border-blue-400 pl-3 py-1">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Müşteri Bilgileri */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Müşteri Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{reservation.customer?.name || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{reservation.customer?.email || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{reservation.customer?.phone || 'Belirtilmemiş'}</span>
                </div>
                {reservation.customer?.id_number && (
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {reservation.customer.id_type === 'tc' ? 'TC Kimlik' : 'Pasaport'}: {reservation.customer.id_number}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sağ Kolon - Fiyat ve Ödeme Bilgileri */}
          <div className="space-y-6">
            {/* Fiyat Detayları */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Fiyat Detayları
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Günlük Fiyat:</span>
                  <span className="text-sm font-semibold">₺{formatPrice(reservation.bungalow?.price || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gece Sayısı:</span>
                  <span className="text-sm font-semibold">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Konaklama Tutarı:</span>
                  <span className="text-sm font-semibold">₺{formatPrice((reservation.bungalow?.price || 0) * nights)}</span>
                </div>

                {/* Ek Hizmetler */}
                {reservation.extra_services && reservation.extra_services.length > 0 && (
                  <div className="border-t pt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Ek Hizmetler:</p>
                    {reservation.extra_services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center mb-1 pl-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {service.service_name}
                            {service.service_type === 'person' && ` (${service.quantity}x)`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700">
                            ₺{formatPrice(service.total_amount)}
                          </span>
                          {reservation.status !== 'cancelled' && (
                            <button
                              onClick={() => handleRemoveService(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Ek hizmeti sil"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-semibold text-gray-900">Toplam Tutar:</span>
                  <span className="text-sm font-semibold text-gray-900">₺{formatPrice(reservation.total_price)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-sm font-semibold">Ödenen:</span>
                  <span className="text-sm font-semibold">₺{formatPrice(reservation.payment_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-red-600 border-t pt-2">
                  <span className="text-sm font-semibold">Kalan:</span>
                  <span className="text-sm font-semibold">₺{formatPrice(remainingAmount)}</span>
                </div>
              </div>
            </Card>

            {/* Ödeme Geçmişi */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Ödeme Geçmişi
              </h3>
              {(reservation.payment_history && reservation.payment_history.length > 0) || (reservation.payment_amount > 0) ? (
                <div className="space-y-3">
                  {/* Eski ödemeler için (payment_history olmadan) */}
                  {reservation.payment_amount > 0 && (!reservation.payment_history || reservation.payment_history.length === 0) && (
                    <div className="border-l-4 border-gray-400 bg-gray-50 p-3 rounded-r">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            ₺{formatPrice(reservation.payment_amount)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Eski Kayıt
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatDate(reservation.created_at)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Sistem
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 border-t border-gray-200 pt-2">
                        Bu ödeme detaylı geçmiş özelliği eklenmeden önce kaydedilmiş
                      </p>
                    </div>
                  )}

                  {/* Yeni ödemeler (payment_history ile) */}
                  {reservation.payment_history && reservation.payment_history.map((payment, index) => (
                    <div key={index} className="border-l-4 border-green-500 bg-green-50 p-3 rounded-r">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            ₺{formatPrice(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {payment.payment_method === 'cash' && 'Nakit'}
                            {payment.payment_method === 'card' && 'Kredi Kartı'}
                            {payment.payment_method === 'transfer' && 'Havale'}
                            {payment.payment_method === 'other' && 'Diğer'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(payment.payment_date).toLocaleDateString('tr-TR')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {payment.created_by}
                          </p>
                        </div>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-gray-600 mt-1 border-t border-green-200 pt-2">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  Henüz ödeme yapılmamış
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Ödeme Ekleme Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Ekle</h3>
              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4">
                  <FormField label="Ödeme Tutarı">
                    <NumberInput
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </FormField>

                  <FormField label="Ödeme Yöntemi">
                    <select
                      value={paymentData.payment_method}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Nakit</option>
                      <option value="card">Kredi Kartı</option>
                      <option value="transfer">Havale</option>
                      <option value="other">Diğer</option>
                    </select>
                  </FormField>

                  <FormField label="Ödeme Tarihi">
                    <DateInput
                      value={paymentData.payment_date}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                      required
                    />
                  </FormField>

                  <FormField label="Notlar">
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Ödeme ile ilgili notlar..."
                    />
                  </FormField>
                </div>

                <FormActions>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Ödeme Ekle'}
                  </Button>
                </FormActions>
              </form>
            </div>
          </div>
        )}

        {/* Müşteri Düzenleme Modal */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgilerini Düzenle</h3>
              <form onSubmit={handleCustomerUpdate}>
                <div className="space-y-4">
                  <FormField label="Ad Soyad">
                    <Input
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ad Soyad"
                      required
                    />
                  </FormField>

                  <FormField label="E-posta">
                    <EmailInput
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ornek@email.com"
                    />
                  </FormField>

                  <FormField label="Telefon">
                    <TelInput
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="0555 123 45 67"
                    />
                  </FormField>

                  <FormField label="Kimlik Türü">
                    <select
                      value={customerData.id_type}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, id_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="tc">TC Kimlik</option>
                      <option value="passport">Pasaport</option>
                    </select>
                  </FormField>

                  <FormField label="Kimlik Numarası">
                    <Input
                      value={customerData.id_number}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, id_number: e.target.value }))}
                      placeholder={customerData.id_type === 'tc' ? '12345678901' : 'A1234567'}
                    />
                  </FormField>
                </div>

                <FormActions>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomerModal(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Güncelle'}
                  </Button>
                </FormActions>
              </form>
            </div>
          </div>
        )}

        {/* Ek Hizmet Modal */}
        {showServiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ek Hizmet Ekle</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setSaving(true);
                  const response = await reservationAPI.addService(id, {
                    service_id: serviceData.service_id,
                    quantity: serviceData.quantity,
                    notes: serviceData.notes
                  });

                  if (response.data.success) {
                    toast('Ek hizmet başarıyla eklendi', { type: 'success' });
                    setShowServiceModal(false);
                    setServiceData({ service_id: '', quantity: 1, notes: '' });
                    loadReservation(); // Rezervasyonu yeniden yükle
                  } else {
                    toast(response.data.message || 'Ek hizmet eklenirken hata oluştu', { type: 'error' });
                  }
                } catch (error) {
                  console.error('Ek hizmet ekleme hatası:', error);
                  toast('Ek hizmet eklenirken bir hata oluştu', { type: 'error' });
                } finally {
                  setSaving(false);
                }
              }}>
                <div className="space-y-4">
                  <FormField label="Hizmet Seç">
                    <select
                      value={serviceData.service_id}
                      onChange={(e) => setServiceData(prev => ({ ...prev, service_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seçiniz...</option>
                      {ekHizmetler.filter(h => h.is_active).map((hizmet) => (
                        <option key={hizmet.id} value={hizmet.id}>
                          {hizmet.name} - ₺{formatPrice(hizmet.price)}
                          {hizmet.pricing_type === 'per_person' ? ' (Kişi Başı)' : ' (Sabit)'}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {serviceData.service_id && ekHizmetler.find(h => h.id == serviceData.service_id)?.pricing_type === 'per_person' && (
                    <FormField label="Miktar (Kişi Sayısı)">
                      <Input
                        type="number"
                        value={serviceData.quantity}
                        onChange={(e) => setServiceData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        min={1}
                        required
                      />
                    </FormField>
                  )}

                  <FormField label="Not (Opsiyonel)">
                    <Input
                      value={serviceData.notes}
                      onChange={(e) => setServiceData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Hizmet notu..."
                    />
                  </FormField>

                  {serviceData.service_id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900">
                        Toplam Tutar: ₺
                        {formatPrice(
                          (() => {
                            const hizmet = ekHizmetler.find(h => h.id == serviceData.service_id);
                            if (!hizmet) return 0;
                            return hizmet.pricing_type === 'per_person'
                              ? hizmet.price * serviceData.quantity
                              : hizmet.price;
                          })()
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <FormActions className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowServiceModal(false);
                      setServiceData({ service_id: '', quantity: 1, notes: '' });
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Ekleniyor...' : 'Ekle'}
                  </Button>
                </FormActions>
              </form>
            </div>
          </div>
        )}

        {/* Not Ekle Modal */}
        {showAddNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Not Ekle</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                // Add note to existing notes
                const currentNotes = reservationData.notes || '';
                const newNote = `[${new Date().toLocaleString('tr-TR')}] ${noteData.note}`;
                const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote;

                setReservationData(prev => ({ ...prev, notes: updatedNotes }));
                setShowAddNoteModal(false);
                setNoteData({ note: '' });

                // Auto-save
                handleNotesUpdate({ preventDefault: () => { } }, updatedNotes);
              }}>
                <div className="space-y-4">
                  <FormField label="Not">
                    <textarea
                      value={noteData.note}
                      onChange={(e) => setNoteData(prev => ({ ...prev, note: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Notunuzu yazın..."
                      required
                    />
                  </FormField>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600">
                      Not, tarih ve saat damgası ile birlikte rezervasyona eklenecektir.
                    </p>
                  </div>
                </div>

                <FormActions className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddNoteModal(false);
                      setNoteData({ note: '' });
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={saving || !noteData.note.trim()}>
                    {saving ? 'Ekleniyor...' : 'Ekle'}
                  </Button>
                </FormActions>
              </form>
            </div>
          </div>
        )}

        {/* Rezervasyon Ertele Modal */}
        {showDelayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rezervasyon Ertele</h3>
              <form onSubmit={handleDelayReservation}>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Mevcut Tarihler:</strong><br />
                      Giriş: {formatDate(reservation.check_in_date)}<br />
                      Çıkış: {formatDate(reservation.check_out_date)}
                    </p>
                  </div>

                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Yeni Tarih Aralığı Seçin</h4>
                    <p className="text-sm text-gray-600">Giriş ve çıkış tarihlerini takvimden seçin</p>
                  </div>

                  <div className="max-w-4xl mx-auto">



                    <SimpleCalendar
                      reservations={bungalowReservations}
                      selectedDates={selectedDates}
                      initialDate={delayData.new_check_in_date ? new Date(delayData.new_check_in_date) : null}
                      excludeReservationId={parseInt(id)}
                      onDateClick={(day) => {
                        if (!day.isCurrentMonth || day.isOccupied) return;

                        if (!selectedDates.start) {
                          // İlk tarih seçimi (giriş tarihi)
                          setSelectedDates({ start: day.dateStr, end: null });
                          setDelayData(prev => ({
                            ...prev,
                            new_check_in_date: day.dateStr,
                            new_check_out_date: ''
                          }));
                        } else if (!selectedDates.end) {
                          // İkinci tarih seçimi (çıkış tarihi)
                          if (day.dateStr >= selectedDates.start) {
                            // Geçerli tarih aralığı (aynı gün de olabilir)
                            setSelectedDates({ start: selectedDates.start, end: day.dateStr });
                            setDelayData(prev => ({
                              ...prev,
                              new_check_in_date: selectedDates.start,
                              new_check_out_date: day.dateStr
                            }));
                          } else {
                            // Yeni başlangıç tarihi
                            setSelectedDates({ start: day.dateStr, end: null });
                            setDelayData(prev => ({
                              ...prev,
                              new_check_in_date: day.dateStr,
                              new_check_out_date: ''
                            }));
                          }
                        } else {
                          // Yeni seçim başlat
                          setSelectedDates({ start: day.dateStr, end: null });
                          setDelayData(prev => ({
                            ...prev,
                            new_check_in_date: day.dateStr,
                            new_check_out_date: ''
                          }));
                        }
                      }}
                      className="border border-gray-200 rounded-lg p-4"
                    />
                  </div>




                  <FormField label="Erteleme Sebebi">
                    <textarea
                      value={delayData.delay_reason}
                      onChange={(e) => setDelayData(prev => ({ ...prev, delay_reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={1}
                      placeholder="Erteleme sebebini yazın (opsiyonel)..."
                    />
                  </FormField>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      Eski tarihler otomatik olarak rezervasyon notlarına eklenecektir.
                    </p>
                  </div>
                </div>

                <FormActions className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDelayModal(false);
                      setDelayData({
                        new_check_in_date: '',
                        new_check_out_date: '',
                        delay_reason: ''
                      });
                      setSelectedDates({
                        start: null,
                        end: null
                      });
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !delayData.new_check_in_date || !delayData.new_check_out_date}
                    variant="warning"
                  >
                    {saving ? 'Erteleniyor...' : 'Rezervasyonu Ertele'}
                  </Button>
                </FormActions>
              </form>
            </div>
          </div>
        )}

        {/* Notlar Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notlar</h3>
              <form onSubmit={handleNotesUpdate}>
                <div className="space-y-4">
                  <FormField label="Rezervasyon Notları">
                    <textarea
                      value={reservationData.notes}
                      onChange={(e) => setReservationData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                      placeholder="Rezervasyon ile ilgili notlar..."
                    />
                  </FormField>
                </div>

                <FormActions>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNotesModal(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Güncelle'}
                  </Button>
                </FormActions>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setConfirmationData(null);
          }}
          onConfirm={confirmRemoveService}
          title="Ek Hizmeti Sil"
          message={
            confirmationData 
              ? `"${confirmationData.serviceName}" ek hizmetini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
              : "Bu ek hizmeti silmek istediğinizden emin misiniz?"
          }
          confirmText="Evet, Sil"
          cancelText="İptal"
          type="danger"
        />
      </div>
    </div>
  );
};

export default ReservationDetail;