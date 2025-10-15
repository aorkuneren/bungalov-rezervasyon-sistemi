import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  NoSymbolIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ui/Toast';
import { customerAPI, reservationAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { FormActions, FormField, FormGrid } from '../components/ui/FormGroup';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Tooltip from '../components/ui/Tooltip';

const Customers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerReservations, setCustomerReservations] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Müşteri form state
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    id_type: 'tc',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  // API'den müşterileri yükle
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCustomers({
        search: searchTerm,
        status: statusFilter
      });
      
      if (response.data.success) {
        let customersList = response.data.data;
        
        // Sorting
        if (sortBy === 'name') {
          customersList.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        } else if (sortBy === 'spending') {
          customersList.sort((a, b) => (b.total_spending || 0) - (a.total_spending || 0));
        } else if (sortBy === 'reservations') {
          customersList.sort((a, b) => (b.reservations_count || 0) - (a.reservations_count || 0));
        }
        
        setCustomers(response.data.data);
        setFilteredCustomers(customersList);
      } else {
        toast(response.data.message || 'Müşteriler yüklenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      toast('Müşteriler yüklenirken hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortBy, toast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customerData.name.trim()) {
      newErrors.name = 'Müşteri adı gereklidir';
    }

    if (!customerData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!customerData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }

    if (!customerData.id_number.trim()) {
      newErrors.id_number = 'Kimlik numarası gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast('Lütfen tüm zorunlu alanları doldurun', { type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...customerData
      };

      let response;
      if (editingCustomer) {
        response = await customerAPI.updateCustomer(editingCustomer.id, payload);
        if (response.data.success) {
          toast('Müşteri başarıyla güncellendi', { type: 'success' });
        }
      } else {
        response = await customerAPI.createCustomer(payload);
        if (response.data.success) {
          toast('Müşteri başarıyla eklendi', { type: 'success' });
        }
      }

      setShowModal(false);
      setEditingCustomer(null);
      setCustomerData({
        name: '',
        email: '',
        phone: '',
        id_number: '',
        id_type: 'tc',
        status: 'active'
      });
      setErrors({});
      loadCustomers();
    } catch (error) {
      console.error('Müşteri kaydedilirken hata:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast(errorMessages[0] || 'Müşteri kaydedilirken hata oluştu', { type: 'error' });
      } else {
        toast(error.response?.data?.message || 'Müşteri kaydedilirken hata oluştu', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setCustomerData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      id_number: customer.id_number || '',
      id_type: customer.id_type || 'tc',
      status: customer.status || 'active'
    });
    setErrors({});
    setShowModal(true);
  };

  const handleToggleBan = (customer) => {
    setSelectedCustomer(customer);
    setConfirmAction({
      type: 'ban',
      title: customer.status === 'active' ? 'Müşteriyi Banla' : 'Müşteri Banını Kaldır',
      message: `"${customer.name}" isimli müşteriyi ${customer.status === 'active' ? 'banlamak' : 'banını kaldırmak'} istediğinize emin misiniz?`,
      confirmText: customer.status === 'active' ? 'Banla' : 'Banı Kaldır',
      confirmClass: customer.status === 'active' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
    });
    setShowConfirmModal(true);
  };

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setConfirmAction({
      type: 'delete',
      title: 'Müşteriyi Sil',
      message: `"${customer.name}" isimli müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      confirmClass: 'bg-red-600 hover:bg-red-700'
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedCustomer || !confirmAction) return;

    try {
      setLoading(true);
      let response;

      if (confirmAction.type === 'ban') {
        const newStatus = selectedCustomer.status === 'active' ? 'banned' : 'active';
        response = await customerAPI.updateCustomer(selectedCustomer.id, {
          ...selectedCustomer,
          status: newStatus
        });
        
        if (response.data.success) {
          toast(`Müşteri başarıyla ${newStatus === 'banned' ? 'banlandı' : 'banı kaldırıldı'}`, { type: 'success' });
        }
      } else if (confirmAction.type === 'delete') {
        response = await customerAPI.deleteCustomer(selectedCustomer.id);
        
        if (response.data.success) {
          toast('Müşteri başarıyla silindi', { type: 'success' });
        }
      }

      if (response && response.data.success) {
        setShowConfirmModal(false);
        setSelectedCustomer(null);
        setConfirmAction(null);
        loadCustomers();
      } else {
        toast(response?.data?.message || 'İşlem başarısız oldu', { type: 'error' });
      }
    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      toast(error.response?.data?.message || 'İşlem sırasında hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer) => {
    try {
      setLoading(true);
      setSelectedCustomer(customer);
      
      // Müşterinin rezervasyonlarını yükle
      const response = await reservationAPI.getReservations({ customer_id: customer.id });
      if (response.data.success) {
        setCustomerReservations(response.data.data || []);
      }
      
      setShowDetailModal(true);
    } catch (error) {
      console.error('Müşteri detayları yüklenirken hata:', error);
      toast('Müşteri detayları yüklenirken hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReservation = (customer) => {
    navigate(`/reservations/create?customer=${customer.id}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setCustomerData({
      name: '',
      email: '',
      phone: '',
      id_number: '',
      id_type: 'tc',
      status: 'active'
    });
    setErrors({});
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomer(null);
    setCustomerReservations([]);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedCustomer(null);
    setConfirmAction(null);
  };

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // İstatistikler
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const bannedCustomers = customers.filter(c => c.status === 'banned').length;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price || 0);
  };

  const getReservationStatusBadge = (status) => {
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Aktif' },
      inactive: { variant: 'secondary', text: 'Pasif' },
      banned: { variant: 'danger', text: 'Banlı' }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
              <p className="mt-2 text-gray-500">Müşterileri görüntüle, düzenle ve yönet</p>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Yeni Müşteri
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
                <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Aktif Müşteri</p>
                <p className="text-3xl font-bold text-gray-900">{activeCustomers}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Banlı Müşteri</p>
                <p className="text-3xl font-bold text-gray-900">{bannedCustomers}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Arama ve Filtreler</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Müşteri adı, email veya telefon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={MagnifyingGlassIcon}
            />
            
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'all', label: 'Tüm Durumlar' },
                { value: 'active', label: 'Aktif' },
                { value: 'banned', label: 'Banlı' }
              ]}
            />
            
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={[
                { value: '', label: 'Sıralama Yok' },
                { value: 'name', label: 'Ada Göre' },
                { value: 'reservations', label: 'Rezervasyon Sayısına Göre' },
                { value: 'spending', label: 'Harcamaya Göre' }
              ]}
            />
          </div>
        </div>

        {/* Müşteri Listesi */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">{filteredCustomers.length} müşteri bulundu</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MÜŞTERİ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İLETİŞİM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DURUM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REZERVASYON
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TOPLAM HARCAMA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Yükleniyor...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">Henüz müşteri bulunmuyor</p>
                      <p className="text-gray-400 text-sm mb-4">İlk müşterinizi ekleyerek başlayın</p>
                      <Button
                        onClick={() => setShowModal(true)}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Yeni Müşteri Ekle
                      </Button>
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.id_type === 'tc' ? 'TC: ' : 'Pasaport: '}
                              {customer.id_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {customer.reservations_count || 0} rezervasyon
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          ₺{formatPrice(customer.total_spending)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Tooltip content="Rezervasyon Ekle">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleAddReservation(customer)}
                              className="h-8 w-8 p-0 flex items-center justify-center"
                              disabled={customer.status === 'banned'}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Detay">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleViewDetails(customer)}
                              className="h-8 w-8 p-0 flex items-center justify-center"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Düzenle">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleEdit(customer)}
                              className="h-8 w-8 p-0 flex items-center justify-center"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content={customer.status === 'active' ? 'Banla' : 'Banı Kaldır'}>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleToggleBan(customer)}
                              className={`h-8 w-8 p-0 flex items-center justify-center ${
                                customer.status === 'active' 
                                  ? 'text-orange-600 hover:bg-orange-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {customer.status === 'active' ? (
                                <NoSymbolIcon className="h-4 w-4" />
                              ) : (
                                <CheckIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </Tooltip>
                          <Tooltip content="Sil">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleDelete(customer)}
                              className="h-8 w-8 p-0 flex items-center justify-center text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} / {filteredCustomers.length} sonuç
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Önceki
                  </Button>
                  <span className="text-sm text-gray-700">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Müşteri Ekleme/Düzenleme Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          size="lg"
        >
          <div className="space-y-6">
            <FormGrid columns={2}>
              <FormField 
                label="Müşteri Adı" 
                required
                error={errors.name}
                className="col-span-2"
              >
                <Input
                  placeholder="Müşteri adını girin"
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                />
              </FormField>

              <FormField
                label="E-posta"
                required
                error={errors.email}
              >
                <Input
                  type="email"
                  placeholder="ornek@email.com"
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
              </FormField>

              <FormField
                label="Telefon"
                required
                error={errors.phone}
              >
                <Input
                  type="tel"
                  placeholder="0555 123 45 67"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                />
              </FormField>

              <FormField
                label="Kimlik Tipi"
                required
              >
                <Select
                  value={customerData.id_type}
                  onChange={(value) => handleInputChange('id_type', value)}
                  options={[
                    { value: 'tc', label: 'TC Kimlik' },
                    { value: 'passport', label: 'Pasaport' }
                  ]}
                />
              </FormField>

              <FormField
                label="Kimlik Numarası"
                required
                error={errors.id_number}
              >
                <Input
                  placeholder={customerData.id_type === 'tc' ? '12345678901' : 'U12345678'}
                  value={customerData.id_number}
                  onChange={(e) => handleInputChange('id_number', e.target.value)}
                  error={errors.id_number}
                />
              </FormField>

              <FormField
                label="Durum"
                required
              >
                <Select
                  value={customerData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={[
                    { value: 'active', label: 'Aktif' },
                    { value: 'banned', label: 'Banlı' }
                  ]}
                />
              </FormField>
            </FormGrid>
          </div>

          <FormActions className="mt-4">
            <Button
              variant="outline"
              onClick={handleCloseModal}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={!customerData.name || !customerData.email || !customerData.phone || !customerData.id_number}
            >
              {editingCustomer ? 'Güncelle' : 'Kaydet'}
            </Button>
          </FormActions>
        </Modal>

        {/* Detay Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          title="Müşteri Detayları"
          size="xl"
        >
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Müşteri Bilgileri */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Kişisel Bilgiler
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">E-posta</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kimlik</label>
                    <div className="mt-1">
                      <p className="text-sm text-gray-900">
                        {selectedCustomer.id_type === 'tc' ? 'TC: ' : 'Pasaport: '}
                        {selectedCustomer.id_number}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Durum</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kayıt Tarihi</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(selectedCustomer.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Toplam Rezervasyon</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedCustomer.reservations_count || 0}
                      </p>
                    </div>
                    <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Toplam Harcama</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₺{formatPrice(selectedCustomer.total_spending)}
                      </p>
                    </div>
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Rezervasyon Geçmişi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2" />
                  Rezervasyon Geçmişi
                </h3>
                {customerReservations.length > 0 ? (
                  <div className="space-y-3">
                    {customerReservations.map((reservation) => (
                      <div key={reservation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {reservation.reservation_code}
                            </span>
                            <Badge 
                              variant={
                                reservation.status === 'confirmed' ? 'success' :
                                reservation.status === 'pending' ? 'secondary' :
                                reservation.status === 'cancelled' ? 'danger' : 'primary'
                              }
                              size="xs"
                            >
                              {reservation.status === 'confirmed' ? 'Onaylandı' :
                               reservation.status === 'pending' ? 'Beklemede' :
                               reservation.status === 'cancelled' ? 'İptal' : 'Tamamlandı'}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            ₺{parseFloat(reservation.total_price).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span>Bungalov: {reservation.bungalow?.name || 'N/A'}</span>
                            <span>Misafir: {reservation.number_of_guests} kişi</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span>Giriş: {new Date(reservation.check_in_date).toLocaleDateString('tr-TR')}</span>
                            <span>Çıkış: {new Date(reservation.check_out_date).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 mb-2">Henüz rezervasyon bulunmuyor</p>
                    <p className="text-gray-400 text-sm">Bu müşteri için rezervasyon eklenmemiş</p>
                  </div>
                )}
              </div>

              <FormActions className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseDetailModal}
                >
                  Kapat
                </Button>
                <Button
                  onClick={() => {
                    handleCloseDetailModal();
                    handleEdit(selectedCustomer);
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              </FormActions>
            </div>
          )}
        </Modal>

        {/* Onay Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={handleCloseConfirmModal}
          title={confirmAction?.title || 'Onay Gerekli'}
          size="sm"
        >
          {confirmAction && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    {confirmAction.message}
                  </p>
                </div>
              </div>

              <FormActions className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseConfirmModal}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  loading={loading}
                  className={`text-white ${confirmAction.confirmClass}`}
                >
                  {confirmAction.confirmText}
                </Button>
              </FormActions>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Customers;
