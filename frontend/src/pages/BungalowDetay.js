import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PencilIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  Button, 
  Card, 
  Badge, 
  Modal, 
  FormField, 
  Input, 
  Textarea, 
  Select, 
  FormActions,
  Tooltip,
  useToast
} from '../components/ui';
import { bungalowAPI, reservationAPI } from '../services/api';

const BungalowDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, success, error } = useToast();
  
  const [bungalow, setBungalow] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [filteredReservations, setFilteredReservations] = useState([]);

  useEffect(() => {
    loadBungalow();
    loadReservations();
  }, [id]);

  // Debug: editData değişikliklerini takip et
  useEffect(() => {
    console.log('editData güncellendi:', editData);
  }, [editData]);


  // Filter reservations
  useEffect(() => {
    let filtered = [...reservations];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.reservation_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    // Tarih filtresi
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(reservation => {
        switch (dateFilter) {
          case 'today':
            return reservation.check_in_date === today;
          case 'thisWeek':
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return reservation.check_in_date >= weekStart.toISOString().split('T')[0] && 
                   reservation.check_in_date <= weekEnd.toISOString().split('T')[0];
          case 'thisMonth':
            const monthStart = new Date();
            monthStart.setDate(1);
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            return reservation.check_in_date >= monthStart.toISOString().split('T')[0] && 
                   reservation.check_in_date <= monthEnd.toISOString().split('T')[0];
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
            return (a.customer?.name || '').localeCompare(b.customer?.name || '');
          case 'checkIn':
            return new Date(a.check_in_date) - new Date(b.check_in_date);
          case 'totalPrice':
            return (b.total_price || 0) - (a.total_price || 0);
          case 'status':
            return (a.status || '').localeCompare(b.status || '');
          default:
            return 0;
        }
      });
    } else {
      // Varsayılan sıralama: ID'ye göre
      filtered.sort((a, b) => a.id - b.id);
    }

    setFilteredReservations(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [reservations, searchTerm, statusFilter, dateFilter, sortBy]);

  const loadBungalow = async () => {
    try {
      setLoading(true);
      const response = await bungalowAPI.getBungalow(id);
      if (response.data.success) {
        setBungalow(response.data.bungalow);
        setEditData(response.data.bungalow);
      } else {
        error('Bungalov yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Bungalov yükleme hatası:', error);
      error('Bungalov yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const response = await reservationAPI.getReservations({ bungalow_id: id });
      
      if (response.data.success) {
        setReservations(response.data.data);
      } else {
        console.error('Rezervasyonlar yüklenirken hata:', response.data.message);
        setReservations([]);
      }
    } catch (error) {
      console.error('Rezervasyonlar yükleme hatası:', error);
      setReservations([]);
    }
  };

  const handleEdit = () => {
    if (bungalow) {
      console.log('Mevcut bungalov verisi:', bungalow);
      setEditData({ ...bungalow }); // Güncel bungalov verisini editData'ya set et
      console.log('EditData set edildi:', { ...bungalow });
    }
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      setSaving(true);
      console.log('Güncellenecek veri:', editData);
      const response = await bungalowAPI.updateBungalow(id, editData);
      console.log('API yanıtı:', response.data);
      if (response.data.success) {
        setBungalow(response.data.bungalow);
        setShowEditModal(false);
        success('Bungalov başarıyla güncellendi');
      } else {
        error('Bungalov güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Bungalov güncelleme hatası:', error);
      error('Bungalov güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      const response = await bungalowAPI.deleteBungalow(id);
      if (response.data.success) {
        success('Bungalov başarıyla silindi');
        navigate('/bungalows');
      } else {
        error('Bungalov silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Bungalov silme hatası:', error);
      error('Bungalov silinirken hata oluştu');
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddReservation = () => {
    navigate(`/reservations/create?bungalow=${id}`);
  };

  const handleViewReservation = (reservationId) => {
    navigate(`/reservations/${reservationId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Aktif' },
      inactive: { variant: 'secondary', text: 'Pasif' },
      maintenance: { variant: 'warning', text: 'Bakımda' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getReservationStatusBadge = (status) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('tr-TR', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price || 0);
  };

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Bungalov yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!bungalow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bungalov Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Aradığınız bungalov bulunamadı veya silinmiş olabilir.</p>
          <Button onClick={() => navigate('/bungalows')}>
            Bungalovlara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/bungalows')} 
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Bungalovlara Dön
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bungalow.name}</h1>
              <p className="mt-2 text-gray-500">Bungalov Detayları</p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(bungalow.status)}
              <div className="flex items-center gap-2">
                <Tooltip content="Düzenle">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Rezervasyon Ekle">
                  <Button
                    size="sm"
                    onClick={handleAddReservation}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Sil">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Bungalov Bilgileri */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Genel Bilgiler */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Genel Bilgiler
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Bungalov Adı</label>
                <p className="text-sm text-gray-900">{bungalow.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Durum</label>
                <div className="mt-1">
                  {getStatusBadge(bungalow.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Açıklama</label>
                <p className="text-sm text-gray-900">{bungalow.description || 'Açıklama bulunmuyor'}</p>
              </div>
            </div>
          </Card>

          {/* Kapasite ve Fiyat */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Kapasite ve Fiyat
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Kapasite</label>
                <p className="text-sm text-gray-900">{bungalow.capacity} kişi</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Günlük Fiyat</label>
                <p className="text-sm text-gray-900">₺{formatPrice(bungalow.price_per_night)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Toplam Rezervasyon</label>
                <p className="text-sm text-gray-900">{reservations.length} rezervasyon</p>
              </div>
            </div>
          </Card>

          {/* İstatistikler */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              İstatistikler
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Aktif Rezervasyonlar</label>
                <p className="text-sm text-gray-900">
                  {reservations.filter(r => ['confirmed', 'checked_in'].includes(r.status)).length}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tamamlanan Rezervasyonlar</label>
                <p className="text-sm text-gray-900">
                  {reservations.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">İptal Edilen Rezervasyonlar</label>
                <p className="text-sm text-gray-900">
                  {reservations.filter(r => r.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Rezervasyon Listesi */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              Rezervasyonlar
            </h3>
            <Button
              size="sm"
              onClick={handleAddReservation}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Yeni Rezervasyon
            </Button>
          </div>

          {/* Arama ve Filtreler */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Arama ve Filtreler</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Rezervasyon kodu, müşteri adı veya email ara..."
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
                  { value: 'checked_in', label: 'Giriş Yaptı' },
                  { value: 'completed', label: 'Tamamlandı' },
                  { value: 'cancelled', label: 'İptal Edildi' }
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

          {/* Sonuç Sayısı */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">{filteredReservations.length} rezervasyon bulundu</p>
          </div>

          {currentReservations.length > 0 ? (
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
                  {currentReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reservation.reservation_code || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reservation.customer?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{reservation.customer?.email || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{reservation.customer?.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">Giriş: {formatDate(reservation.check_in_date)}</div>
                          <div className="text-gray-500">Çıkış: {formatDate(reservation.check_out_date)}</div>
                          <div className="text-xs text-gray-400">Misafir: {reservation.guest_count || 1} kişi</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getReservationStatusBadge(reservation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(reservation.payment_status, reservation.remaining_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Tooltip content="Detaylar">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReservation(reservation.id)}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Rezervasyon Yok</h3>
              <p className="text-gray-500 mb-4">Bu bungalov için henüz rezervasyon yapılmamış.</p>
              <Button onClick={handleAddReservation}>
                <PlusIcon className="h-4 w-4 mr-2" />
                İlk Rezervasyonu Ekle
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{startIndex + 1}</span>
                    {' '}-{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredReservations.length)}</span>
                    {' '}arası, toplam{' '}
                    <span className="font-medium">{filteredReservations.length}</span>
                    {' '}sonuçtan
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-l-md"
                    >
                      Önceki
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditData({}); // Modal kapandığında editData'yı temizle
          }}
          title="Bungalov Düzenle"
          size="md"
        >
          <div className="space-y-4">
            <FormField label="Bungalov Adı" required>
              <Input
                value={editData.name || ''}
                onChange={(e) => {
                  console.log('Name değişti:', e.target.value);
                  setEditData({ ...editData, name: e.target.value });
                }}
                placeholder="Bungalov adını girin"
              />
            </FormField>

            <FormField label="Açıklama">
              <Textarea
                value={editData.description || ''}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Bungalov açıklamasını girin"
                rows={3}
              />
            </FormField>

            <FormField label="Kapasite" required>
              <Input
                type="number"
                value={editData.capacity || ''}
                onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) })}
                placeholder="Kişi sayısı"
                min="1"
                max="20"
              />
            </FormField>

            <FormField label="Günlük Fiyat" required>
              <Input
                type="number"
                value={editData.price_per_night || ''}
                onChange={(e) => setEditData({ ...editData, price_per_night: parseFloat(e.target.value) })}
                placeholder="Günlük fiyat"
                min="0"
                step="0.01"
              />
            </FormField>

            <FormField label="Durum" required>
              <Select
                value={editData.status || bungalow?.status || ''}
                onChange={(value) => {
                  console.log('Status değişti:', value);
                  setEditData({ ...editData, status: value });
                }}
                options={[
                  { value: '', label: 'Durum Seçin' },
                  { value: 'active', label: 'Aktif' },
                  { value: 'inactive', label: 'Pasif' },
                  { value: 'maintenance', label: 'Bakımda' }
                ]}
              />
            </FormField>

            <FormActions>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditData({}); // İptal edildiğinde editData'yı temizle
                }}
                disabled={saving}
              >
                İptal
              </Button>
              <Button
                onClick={handleEditSubmit}
                loading={saving}
              >
                Kaydet
              </Button>
            </FormActions>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Bungalov Sil"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>"{bungalow.name}"</strong> isimli bungalovu silmek istediğinize emin misiniz? 
                  Bu işlem geri alınamaz ve bungalovla ilgili tüm rezervasyonlar etkilenebilir.
                </p>
              </div>
            </div>

            <FormActions>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
              >
                İptal
              </Button>
              <Button
                onClick={handleDelete}
                loading={saving}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sil
              </Button>
            </FormActions>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BungalowDetay;
