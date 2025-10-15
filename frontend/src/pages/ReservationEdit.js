import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { reservationAPI, bungalowAPI, customerAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input, { DateInput, TelInput, EmailInput } from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import NumberInput from '../components/ui/NumberInput';
import FormField from '../components/ui/FormField';
import FormGrid from '../components/ui/FormGrid';
import FormActions from '../components/ui/FormActions';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  HomeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ReservationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [bungalows, setBungalows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    customer: {
      name: '',
      email: '',
      phone: '',
      id_number: '',
      id_type: 'tc'
    },
    bungalow_id: '',
    check_in_date: '',
    check_out_date: '',
    number_of_guests: 1,
    total_price: 0,
    status: 'pending',
    payment_status: 'unpaid',
    payment_amount: 0,
    notes: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reservation data
      const reservationResponse = await reservationAPI.getReservation(id);
      if (reservationResponse.data.success) {
        const resData = reservationResponse.data.data;
        setReservation(resData);
        
        // Set form data
        setFormData({
          customer_id: resData.customer_id || '',
          customer: {
            name: resData.customer?.name || '',
            email: resData.customer?.email || '',
            phone: resData.customer?.phone || '',
            id_number: resData.customer?.id_number || '',
            id_type: resData.customer?.id_type || 'tc'
          },
          bungalow_id: resData.bungalow_id || '',
          check_in_date: resData.check_in_date || '',
          check_out_date: resData.check_out_date || '',
          number_of_guests: resData.number_of_guests || 1,
          total_price: resData.total_price || 0,
          status: resData.status || 'pending',
          payment_status: resData.payment_status || 'unpaid',
          payment_amount: resData.payment_amount || 0,
          notes: resData.notes || ''
        });
      }

      // Load bungalows
      const bungalowsResponse = await bungalowAPI.getBungalows();
      if (bungalowsResponse.data.success) {
        setBungalows(bungalowsResponse.data.data);
      }

      // Load customers
      const customersResponse = await customerAPI.getCustomers();
      if (customersResponse.data.success) {
        setCustomers(customersResponse.data.data);
      }

    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast('Veriler yüklenirken hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer.name.trim()) {
      newErrors['customer.name'] = 'Müşteri adı gereklidir';
    }
    if (!formData.customer.email.trim()) {
      newErrors['customer.email'] = 'E-posta adresi gereklidir';
    }
    if (!formData.customer.phone.trim()) {
      newErrors['customer.phone'] = 'Telefon numarası gereklidir';
    }
    if (!formData.bungalow_id) {
      newErrors.bungalow_id = 'Bungalov seçimi gereklidir';
    }
    if (!formData.check_in_date) {
      newErrors.check_in_date = 'Giriş tarihi gereklidir';
    }
    if (!formData.check_out_date) {
      newErrors.check_out_date = 'Çıkış tarihi gereklidir';
    }
    if (formData.check_in_date && formData.check_out_date && 
        new Date(formData.check_in_date) >= new Date(formData.check_out_date)) {
      newErrors.check_out_date = 'Çıkış tarihi giriş tarihinden sonra olmalıdır';
    }
    if (!formData.number_of_guests || formData.number_of_guests < 1) {
      newErrors.number_of_guests = 'Misafir sayısı en az 1 olmalıdır';
    }
    if (!formData.total_price || formData.total_price <= 0) {
      newErrors.total_price = 'Toplam fiyat 0\'dan büyük olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast('Lütfen tüm gerekli alanları doldurun', { type: 'error' });
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        customer_id: formData.customer_id,
        customer: formData.customer,
        bungalow_id: formData.bungalow_id,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        number_of_guests: formData.number_of_guests,
        total_price: formData.total_price,
        status: formData.status,
        payment_status: formData.payment_status,
        payment_amount: formData.payment_amount,
        notes: formData.notes
      };

      const response = await reservationAPI.updateReservation(id, updateData);
      if (response.data.success) {
        toast('Rezervasyon başarıyla güncellendi', { type: 'success' });
        navigate(`/reservations/${id}`);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Rezervasyon güncelleme hatası:', error);
      toast(error.response?.data?.message || 'Rezervasyon güncellenirken hata oluştu', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(true);
  };

  const confirmCancel = () => {
    navigate(`/reservations/${id}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', text: 'Beklemede' },
      confirmed: { variant: 'success', text: 'Onaylandı' },
      checked_in: { variant: 'warning', text: 'Giriş Yaptı' },
      completed: { variant: 'primary', text: 'Tamamlandı' },
      cancelled: { variant: 'danger', text: 'İptal Edildi' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      unpaid: { variant: 'danger', text: 'Ödenmedi' },
      partial: { variant: 'warning', text: 'Kısmi Ödeme' },
      paid: { variant: 'success', text: 'Ödendi' }
    };
    
    const config = statusConfig[status] || statusConfig.unpaid;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Rezervasyon yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Rezervasyon Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Aradığınız rezervasyon mevcut değil.</p>
          <Button onClick={() => navigate('/reservations')}>
            Rezervasyonlara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/reservations/${id}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Geri
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Düzenle</h1>
                <p className="mt-2 text-gray-500">Rezervasyon bilgilerini güncelleyin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(reservation.status)}
              {getPaymentStatusBadge(reservation.payment_status)}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Müşteri Bilgileri</h2>
              </div>
              
              <FormGrid cols={2}>
                <FormField label="Müşteri Seçimi">
                  <Select
                    value={formData.customer_id}
                    onChange={(value) => handleInputChange('customer_id', value)}
                    options={[
                      { value: '', label: 'Yeni Müşteri Oluştur' },
                      ...customers.map(customer => ({
                        value: customer.id,
                        label: `${customer.name} (${customer.email})`
                      }))
                    ]}
                  />
                </FormField>
                
                <FormField label="Kimlik Türü">
                  <Select
                    value={formData.customer.id_type}
                    onChange={(value) => handleInputChange('customer.id_type', value)}
                    options={[
                      { value: 'tc', label: 'TC Kimlik' },
                      { value: 'passport', label: 'Pasaport' }
                    ]}
                  />
                </FormField>
              </FormGrid>

              <FormGrid cols={2}>
                <FormField label="Ad Soyad" required error={errors['customer.name']}>
                  <Input
                    value={formData.customer.name}
                    onChange={(e) => handleInputChange('customer.name', e.target.value)}
                    placeholder="Müşteri adı ve soyadı"
                  />
                </FormField>
                
                <FormField label="E-posta" required error={errors['customer.email']}>
                  <EmailInput
                    value={formData.customer.email}
                    onChange={(e) => handleInputChange('customer.email', e.target.value)}
                    placeholder="ornek@email.com"
                  />
                </FormField>
              </FormGrid>

              <FormGrid cols={2}>
                <FormField label="Telefon" required error={errors['customer.phone']}>
                  <TelInput
                    value={formData.customer.phone}
                    onChange={(e) => handleInputChange('customer.phone', e.target.value)}
                    placeholder="+90 555 123 4567"
                  />
                </FormField>
                
                <FormField label="Kimlik Numarası">
                  <Input
                    value={formData.customer.id_number}
                    onChange={(e) => handleInputChange('customer.id_number', e.target.value)}
                    placeholder="TC Kimlik veya Pasaport No"
                  />
                </FormField>
              </FormGrid>
            </div>
          </Card>

          {/* Bungalov ve Tarih Bilgileri */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <HomeIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Bungalov ve Tarih Bilgileri</h2>
              </div>
              
              <FormGrid cols={2}>
                <FormField label="Bungalov" required error={errors.bungalow_id}>
                  <Select
                    value={formData.bungalow_id}
                    onChange={(value) => handleInputChange('bungalow_id', value)}
                    options={[
                      { value: '', label: 'Bungalov seçin' },
                      ...bungalows.map(bungalow => ({
                        value: bungalow.id,
                        label: `${bungalow.name} (${bungalow.capacity} kişi)`
                      }))
                    ]}
                  />
                </FormField>
                
                <FormField label="Misafir Sayısı" required error={errors.number_of_guests}>
                  <Input
                    type="number"
                    value={formData.number_of_guests}
                    onChange={(e) => handleInputChange('number_of_guests', parseInt(e.target.value))}
                    placeholder="1"
                    min="1"
                    max="20"
                  />
                </FormField>
              </FormGrid>

              <FormGrid cols={2}>
                <FormField label="Giriş Tarihi" required error={errors.check_in_date}>
                  <DateInput
                    value={formData.check_in_date}
                    onChange={(e) => handleInputChange('check_in_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormField>
                
                <FormField label="Çıkış Tarihi" required error={errors.check_out_date}>
                  <DateInput
                    value={formData.check_out_date}
                    onChange={(e) => handleInputChange('check_out_date', e.target.value)}
                    min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                  />
                </FormField>
              </FormGrid>
            </div>
          </Card>

          {/* Fiyat ve Ödeme Bilgileri */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Fiyat ve Ödeme Bilgileri</h2>
              </div>
              
              <FormGrid cols={2}>
                <FormField label="Toplam Fiyat" required error={errors.total_price}>
                  <NumberInput
                    value={formData.total_price}
                    onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </FormField>
                
                <FormField label="Ödeme Durumu">
                  <Select
                    value={formData.payment_status}
                    onChange={(value) => handleInputChange('payment_status', value)}
                    options={[
                      { value: 'unpaid', label: 'Ödenmedi' },
                      { value: 'partial', label: 'Kısmi Ödeme' },
                      { value: 'paid', label: 'Ödendi' }
                    ]}
                  />
                </FormField>
              </FormGrid>

              <FormGrid cols={2}>
                <FormField label="Ödenen Tutar">
                  <NumberInput
                    value={formData.payment_amount}
                    onChange={(e) => handleInputChange('payment_amount', parseFloat(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </FormField>
                
                <FormField label="Rezervasyon Durumu">
                  <Select
                    value={formData.status}
                    onChange={(value) => handleInputChange('status', value)}
                    options={[
                      { value: 'pending', label: 'Beklemede' },
                      { value: 'confirmed', label: 'Onaylandı' },
                      { value: 'checked_in', label: 'Giriş Yaptı' },
                      { value: 'completed', label: 'Tamamlandı' },
                      { value: 'cancelled', label: 'İptal Edildi' }
                    ]}
                  />
                </FormField>
              </FormGrid>
            </div>
          </Card>

          {/* Notlar */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Notlar</h2>
              </div>
              
              <FormField label="Rezervasyon Notları">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Rezervasyon ile ilgili özel notlar..."
                  rows={4}
                />
              </FormField>
            </div>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving}
          >
            Değişiklikleri Kaydet
          </Button>
        </div>

        {/* Onay Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Değişiklikleri Kaydetmeden Çık"
          size="sm"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Değişiklikleri Kaydetmeden Çık
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Yaptığınız değişiklikler kaydedilmeyecek. Devam etmek istediğinizden emin misiniz?
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                İptal
              </Button>
              <Button
                variant="danger"
                onClick={confirmCancel}
              >
                Çık
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ReservationEdit;