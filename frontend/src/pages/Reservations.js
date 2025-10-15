import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { reservationAPI, bungalowAPI, customerAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Tooltip from '../components/ui/Tooltip';
import FormField from '../components/ui/FormField';
import FormGrid from '../components/ui/FormGrid';
import FormActions from '../components/ui/FormActions';
import Textarea from '../components/ui/Textarea';
import NumberInput from '../components/ui/NumberInput';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Reservations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bungalowFilter, setBungalowFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  // Rezervasyon form state
  const [reservationData, setReservationData] = useState({
    customerId: '',
    bungalowId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    totalPrice: 0,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentAmount: 0,
    notes: ''
  });

  // Bungalovlar ve müşteriler state
  const [bungalows, setBungalows] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Load reservations
  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getReservations({
        search: searchTerm,
        status: statusFilter,
        bungalow_id: bungalowFilter
      });
      
      if (response.data.success && response.data.data) {
        // Backend'den gelen veriyi frontend formatına dönüştür
        const transformedReservations = response.data.data.map(reservation => ({
          id: reservation.id,
          reservationCode: reservation.reservation_code,
          customerName: reservation.customer?.name || '',
          customerEmail: reservation.customer?.email || '',
          customerPhone: reservation.customer?.phone || '',
          bungalowId: reservation.bungalow_id,
          bungalowName: reservation.bungalow?.name || '',
          checkInDate: reservation.check_in_date,
          checkOutDate: reservation.check_out_date,
          guests: reservation.number_of_guests,
          totalPrice: parseFloat(reservation.total_price),
          status: reservation.status,
          paymentStatus: reservation.payment_status,
          paymentAmount: parseFloat(reservation.payment_amount || 0),
          remainingAmount: parseFloat(reservation.remaining_amount || 0),
          notes: reservation.notes || '',
          additionalGuests: reservation.additional_guests || [],
          confirmationCode: reservation.confirmation_code,
          confirmationExpiresAt: reservation.confirmation_expires_at,
          createdAt: reservation.created_at
        }));
        
        setReservations(transformedReservations);
        setFilteredReservations(transformedReservations);
      } else {
        console.error('API Response Error:', response.data);
        toast(response.data?.message || 'Rezervasyonlar yüklenirken hata oluştu', { type: 'error' });
        setReservations([]);
        setFilteredReservations([]);
      }
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
      toast('Rezervasyonlar yüklenirken hata oluştu', { type: 'error' });
      setReservations([]);
      setFilteredReservations([]);
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, statusFilter, bungalowFilter]);

  // Load bungalows
  const loadBungalows = useCallback(async () => {
    try {
      const response = await bungalowAPI.getBungalows();
      if (response.data.success && response.data.data) {
        setBungalows(response.data.data);
      } else {
        console.error('Bungalov API Response Error:', response.data);
        setBungalows([]);
      }
    } catch (error) {
      console.error('Bungalovlar yüklenirken hata:', error);
      setBungalows([]);
    }
  }, []);

  // Load customers
  const loadCustomers = useCallback(async () => {
    try {
      const response = await customerAPI.getCustomers();
      if (response.data.success && response.data.data) {
        setCustomers(response.data.data);
      } else {
        console.error('Customer API Response Error:', response.data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      setCustomers([]);
    }
  }, []);

  // Filter reservations
  const filterReservations = useCallback(() => {
    let filtered = [...reservations];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.bungalowName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    // Bungalov filtresi
    if (bungalowFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.bungalowId === parseInt(bungalowFilter));
    }

    // Tarih filtresi
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(reservation => {
        switch (dateFilter) {
          case 'today':
            return reservation.checkInDate === today;
          case 'thisWeek':
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return reservation.checkInDate >= weekStart.toISOString().split('T')[0] && 
                   reservation.checkInDate <= weekEnd.toISOString().split('T')[0];
          case 'thisMonth':
            const monthStart = new Date();
            monthStart.setDate(1);
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            return reservation.checkInDate >= monthStart.toISOString().split('T')[0] && 
                   reservation.checkInDate <= monthEnd.toISOString().split('T')[0];
          default:
            return true;
        }
      });
    }

    // Sıralama
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'guestName':
            return a.customerName.localeCompare(b.customerName);
          case 'checkIn':
            return new Date(a.checkInDate) - new Date(b.checkInDate);
          case 'totalPrice':
            return b.totalPrice - a.totalPrice;
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
    } else {
      // Varsayılan sıralama: ID'ye göre
      filtered.sort((a, b) => a.id - b.id);
    }

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, bungalowFilter, dateFilter, sortBy]);

  // Load reservations on mount
  useEffect(() => {
    loadReservations();
    loadBungalows();
    loadCustomers();
  }, [loadReservations, loadBungalows, loadCustomers]);

  // Filter when dependencies change
  useEffect(() => {
    filterReservations();
  }, [filterReservations]);

  // Calculate statistics
  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setReservationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save reservation
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Backend'e gönderilecek veri formatını hazırla
      const apiData = {
        customer_id: parseInt(reservationData.customerId),
        bungalow_id: parseInt(reservationData.bungalowId),
        check_in_date: reservationData.checkIn,
        check_out_date: reservationData.checkOut,
        number_of_guests: parseInt(reservationData.guests),
        total_price: parseFloat(reservationData.totalPrice),
        status: reservationData.status,
        payment_status: reservationData.paymentStatus || 'unpaid',
        payment_amount: parseFloat(reservationData.paymentAmount || 0),
        notes: reservationData.notes
      };

      if (editingReservation) {
        // Update existing reservation
        const response = await reservationAPI.updateReservation(editingReservation.id, apiData);
        if (response.data.success) {
          toast('Rezervasyon başarıyla güncellendi', { type: 'success' });
          loadReservations(); // Rezervasyonları yeniden yükle
        } else {
          toast(response.data.message || 'Rezervasyon güncellenirken hata oluştu', { type: 'error' });
        }
      } else {
        // Add new reservation
        const response = await reservationAPI.createReservation(apiData);
        if (response.data.success) {
          toast('Rezervasyon başarıyla eklendi', { type: 'success' });
          loadReservations(); // Rezervasyonları yeniden yükle
        } else {
          toast(response.data.message || 'Rezervasyon eklenirken hata oluştu', { type: 'error' });
        }
      }
      
      setShowModal(false);
      setEditingReservation(null);
      setReservationData({
        customerId: '',
        bungalowId: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        totalPrice: 0,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentAmount: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Rezervasyon kaydetme hatası:', error);
      toast('İşlem sırasında hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit reservation
  const handleEdit = (reservation) => {
    navigate(`/reservations/${reservation.id}/edit`);
  };

  // Handle delete reservation
  const handleDelete = (reservation) => {
    setReservationToDelete(reservation);
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const confirmActionHandler = async () => {
    if (confirmAction === 'delete' && reservationToDelete) {
      try {
        setLoading(true);
        const response = await reservationAPI.deleteReservation(reservationToDelete.id);
        if (response.data.success) {
          toast('Rezervasyon başarıyla silindi', { type: 'success' });
          loadReservations(); // Rezervasyonları yeniden yükle
        } else {
          toast(response.data.message || 'Rezervasyon silinirken hata oluştu', { type: 'error' });
        }
      } catch (error) {
        console.error('Rezervasyon silme hatası:', error);
        toast('Rezervasyon silinirken hata oluştu', { type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    
    // Modal'ı kapat
    setShowConfirmModal(false);
    setConfirmAction(null);
    setReservationToDelete(null);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setReservationToDelete(null);
  };

  // Handle view reservation
  const handleView = (reservation) => {
    navigate(`/reservations/${reservation.id}`);
  };

  // Get status badge
  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('tr-TR', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
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

    return (
      <Badge variant={config.variant} size="xs">
        {config.text}
      </Badge>
    );
  };

  // Get payment status badge component
  const getPaymentStatusBadge = (paymentStatus, remainingAmount) => {
    const paymentConfig = {
      paid: { variant: 'success', text: 'Ödendi' },
      partial: { variant: 'warning', text: 'Kısmi Ödendi' },
      unpaid: { variant: 'danger', text: 'Ödenmedi' },
      refunded: { variant: 'secondary', text: 'İade Edildi' }
    };

    const config = paymentConfig[paymentStatus] || paymentConfig.unpaid;
    const remaining = parseFloat(remainingAmount || 0);

    return (
      <div className="flex flex-col">
        <Badge variant={config.variant} size="xs">
          {config.text}
        </Badge>
        {(paymentStatus === 'unpaid' || paymentStatus === 'partial') && remaining > 0 && (
          <div className="text-xs text-red-600 font-medium mt-1">
            ₺{remaining.toLocaleString()} kalan
          </div>
        )}
      </div>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
              <p className="mt-2 text-gray-500">Rezervasyonları görüntüle, düzenle ve yönet</p>
            </div>
            <Button
              onClick={() => navigate('/reservations/create')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Yeni Rezervasyon
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Toplam Rezervasyon</p>
                <p className="text-3xl font-bold text-gray-900">{totalReservations}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Beklemede</p>
                <p className="text-3xl font-bold text-gray-900">{pendingReservations}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Onaylandı</p>
                <p className="text-3xl font-bold text-gray-900">{confirmedReservations}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Müşteri adı, email veya bungalov ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={MagnifyingGlassIcon}
              />
            </div>
            
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'all', label: 'Tüm Durumlar' },
                { value: 'pending', label: 'Beklemede' },
                { value: 'confirmed', label: 'Onaylandı' },
                { value: 'cancelled', label: 'İptal Edildi' },
                { value: 'completed', label: 'Tamamlandı' }
              ]}
            />
            
            <Select
              value={bungalowFilter}
              onChange={(value) => setBungalowFilter(value)}
              options={[
                { value: 'all', label: 'Tüm Bungalovlar' },
                ...(bungalows || []).map(bungalow => ({
                  value: bungalow.id.toString(),
                  label: bungalow.name
                }))
              ]}
            />
            
            <Select
              value={dateFilter}
              onChange={(value) => setDateFilter(value)}
              options={[
                { value: 'all', label: 'Tüm Tarihler' },
                { value: 'today', label: 'Bugün' },
                { value: 'thisWeek', label: 'Bu Hafta' },
                { value: 'thisMonth', label: 'Bu Ay' }
              ]}
            />
            
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value)}
            options={[
              { value: '', label: 'Sıralama Yok' },
              { value: 'guestName', label: 'Müşteri Adına Göre' },
              { value: 'checkIn', label: 'Giriş Tarihine Göre' },
              { value: 'totalPrice', label: 'Fiyata Göre' },
              { value: 'status', label: 'Duruma Göre' }
            ]}
          />
        </div>
      </div>

        {/* Rezervasyon Listesi */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">{filteredReservations.length} rezervasyon bulundu</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REZERVASYON KODU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MÜŞTERİ BİLGİLERİ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BUNGALOV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TARİH & MİSAFİR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DURUMU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ÖDEME DURUMU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(currentReservations || []).map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reservation.reservationCode || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.customerName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{reservation.customerEmail || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{reservation.customerPhone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reservation.bungalowName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">Giriş: {formatDate(reservation.checkInDate)}</div>
                        <div className="text-gray-500">Çıkış: {formatDate(reservation.checkOutDate)}</div>
                        <div className="text-xs text-gray-400">Misafir: {reservation.guests} kişi</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(reservation.paymentStatus, reservation.remainingAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Detaylar">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(reservation)}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Düzenle">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(reservation)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Sil">
                          <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(reservation)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredReservations.length)}</span> arası, toplam <span className="font-medium">{filteredReservations.length}</span> sonuç
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-l-md"
                    >
                      Önceki
                    </Button>
                    {Array.from({ length: totalPages || 0 }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="rounded-none"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-r-md"
                  >
                    Sonraki
                  </Button>
                </nav>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Reservation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingReservation(null);
          setReservationData({
            customerId: '',
            bungalowId: '',
            checkIn: '',
            checkOut: '',
            guests: 1,
            totalPrice: 0,
            status: 'pending',
            paymentStatus: 'unpaid',
            paymentAmount: 0,
            notes: ''
          });
        }}
        title={editingReservation ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}
        size="lg"
      >
        <FormGrid cols={2}>
          <FormField label="Müşteri" required>
            <Select
              value={reservationData.customerId}
              onChange={(value) => handleInputChange('customerId', value)}
              options={[
                { value: '', label: 'Müşteri seçin' },
                ...(customers || []).map(customer => ({
                  value: customer.id.toString(),
                  label: `${customer.name} (${customer.email})`
                }))
              ]}
            />
          </FormField>

          <FormField label="Bungalov" required>
            <Select
              value={reservationData.bungalowId}
              onChange={(value) => handleInputChange('bungalowId', value)}
              options={[
                { value: '', label: 'Bungalov seçin' },
                ...(bungalows || []).map(bungalow => ({
                  value: bungalow.id.toString(),
                  label: bungalow.name
                }))
              ]}
            />
          </FormField>

          <FormField label="Giriş Tarihi" required>
            <Input
              type="date"
              value={reservationData.checkIn}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
            />
          </FormField>

          <FormField label="Çıkış Tarihi" required>
            <Input
              type="date"
              value={reservationData.checkOut}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
            />
          </FormField>

          <FormField label="Misafir Sayısı" required>
            <NumberInput
              value={reservationData.guests}
              onChange={(value) => handleInputChange('guests', value)}
              min={1}
              max={20}
            />
          </FormField>

          <FormField label="Toplam Fiyat" required>
            <NumberInput
              value={reservationData.totalPrice}
              onChange={(value) => handleInputChange('totalPrice', value)}
              min={0}
              currency
            />
          </FormField>

          <FormField label="Durum">
            <Select
              value={reservationData.status}
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

          <FormField label="Ödeme Durumu">
            <Select
              value={reservationData.paymentStatus}
              onChange={(value) => handleInputChange('paymentStatus', value)}
              options={[
                { value: 'unpaid', label: 'Ödenmedi' },
                { value: 'partial', label: 'Kısmi Ödendi' },
                { value: 'paid', label: 'Ödendi' },
                { value: 'refunded', label: 'İade Edildi' }
              ]}
            />
          </FormField>

          <FormField label="Ödenen Tutar">
            <NumberInput
              value={reservationData.paymentAmount}
              onChange={(value) => handleInputChange('paymentAmount', value)}
              min={0}
              currency
            />
          </FormField>

          <FormField label="Notlar" className="col-span-2">
            <Textarea
              value={reservationData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Rezervasyon notları..."
              rows={3}
            />
          </FormField>
        </FormGrid>

        <FormActions className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowModal(false);
              setEditingReservation(null);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? 'Kaydediliyor...' : (editingReservation ? 'Güncelle' : 'Kaydet')}
          </Button>
        </FormActions>
      </Modal>

      {/* Onay Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        title="İşlemi Onayla"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {confirmAction === 'delete' && 'Rezervasyon Sil'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {confirmAction === 'delete' && 
              `${reservationToDelete?.customerName} rezervasyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
            }
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={closeConfirmModal}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              variant="danger"
              onClick={confirmActionHandler}
              loading={loading}
            >
              {confirmAction === 'delete' && 'Sil'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservations;
