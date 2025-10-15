import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HomeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ui/Toast';
import { bungalowAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input, { NumberInput } from '../components/ui/Input';
import { FormActions, FormField, FormGrid } from '../components/ui/FormGroup';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Tooltip from '../components/ui/Tooltip';

const Bungalows = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bungalows, setBungalows] = useState([]);
  const [filteredBungalows, setFilteredBungalows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBungalow, setEditingBungalow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [bungalowToDelete, setBungalowToDelete] = useState(null);

  // Bungalov form state
  const [bungalowData, setBungalowData] = useState({
    name: '',
    description: '',
    capacity: '',
    price_per_night: '',
    status: 'active'
  });

  // API'den bungalovları yükle
  const loadBungalows = async () => {
    try {
      setLoading(true);
      const response = await bungalowAPI.getBungalows({
        search: searchTerm,
        status: statusFilter,
        capacity: capacityFilter,
        sort_by: sortBy
      });
      
      if (response.data.success && response.data.data) {
        setBungalows(response.data.data);
        setFilteredBungalows(response.data.data);
      } else {
        console.error('Bungalov API Response Error:', response.data);
        toast(response.data?.message || 'Bungalovlar yüklenirken hata oluştu', { type: 'error' });
        setBungalows([]);
        setFilteredBungalows([]);
      }
    } catch (error) {
      console.error('Bungalovlar yüklenirken hata:', error);
      toast('Bungalovlar yüklenirken hata oluştu', { type: 'error' });
      setBungalows([]);
      setFilteredBungalows([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadBungalows();
  }, []);

  useEffect(() => {
    loadBungalows();
  }, [searchTerm, statusFilter, capacityFilter, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (field, value) => {
    setBungalowData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const data = {
        name: bungalowData.name,
        description: bungalowData.description,
        capacity: parseInt(bungalowData.capacity),
        price_per_night: parseFloat(bungalowData.price_per_night),
        status: bungalowData.status
      };
      
      if (editingBungalow) {
        // Güncelleme
        const response = await bungalowAPI.updateBungalow(editingBungalow.id, data);
        if (response.data.success) {
          toast('Bungalov başarıyla güncellendi', { type: 'success' });
          loadBungalows(); // Listeyi yenile
        } else {
          throw new Error(response.data.message);
        }
      } else {
        // Yeni ekleme
        const response = await bungalowAPI.createBungalow(data);
        if (response.data.success) {
          toast('Bungalov başarıyla eklendi', { type: 'success' });
          loadBungalows(); // Listeyi yenile
        } else {
          throw new Error(response.data.message);
        }
      }
      
      setShowModal(false);
      setEditingBungalow(null);
      setBungalowData({
        name: '',
        description: '',
        capacity: '',
        price_per_night: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Bungalov kaydetme hatası:', error);
      toast(error.response?.data?.message || 'İşlem sırasında hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bungalow) => {
    setEditingBungalow(bungalow);
    setBungalowData({
      name: bungalow.name,
      description: bungalow.description || '',
      capacity: bungalow.capacity.toString(),
      price_per_night: bungalow.price_per_night.toString(),
      status: bungalow.status
    });
    setShowModal(true);
  };

  const handleDelete = (bungalow) => {
    setBungalowToDelete(bungalow);
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const confirmActionHandler = async () => {
    if (confirmAction === 'delete' && bungalowToDelete) {
      try {
        setLoading(true);
        const response = await bungalowAPI.deleteBungalow(bungalowToDelete.id);
        if (response.data.success) {
          toast('Bungalov başarıyla silindi', { type: 'success' });
          loadBungalows(); // Listeyi yenile
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Bungalov silme hatası:', error);
        toast(error.response?.data?.message || 'Bungalov silinirken hata oluştu', { type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    
    // Modal'ı kapat
    setShowConfirmModal(false);
    setConfirmAction(null);
    setBungalowToDelete(null);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setBungalowToDelete(null);
  };

  const handleView = (bungalow) => {
    // Bungalov detay sayfasına yönlendirme
    navigate(`/bungalows/${bungalow.id}`);
  };

  const handleAddReservation = (bungalow) => {
    // Rezervasyon ekleme sayfasına yönlendirme
    navigate(`/reservations/create?bungalow=${bungalow.id}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Aktif' },
      inactive: { variant: 'secondary', text: 'Pasif' },
      maintenance: { variant: 'warning', text: 'Bakımda' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };


  // Sayfalama hesaplamaları
  const totalPages = Math.ceil((bungalows || []).length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBungalows = (bungalows || []).slice(startIndex, endIndex);

  // İstatistikler
  const totalBungalows = (bungalows || []).length;
  const activeBungalows = (bungalows || []).filter(b => b.status === 'active').length;
  const averagePrice = (bungalows || []).length > 0 
    ? Math.round((bungalows || []).reduce((sum, b) => sum + parseFloat(b.price_per_night), 0) / (bungalows || []).length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bungalov Yönetimi</h1>
              <p className="mt-2 text-gray-500">Bungalovları görüntüle, düzenle ve yönet</p>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Yeni Bungalov
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Toplam Bungalov</p>
                <p className="text-3xl font-bold text-gray-900">{totalBungalows}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <HomeIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Aktif Bungalov</p>
                <p className="text-3xl font-bold text-gray-900">{activeBungalows}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ortalama Fiyat</p>
                <p className="text-3xl font-bold text-gray-900">₺{averagePrice}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Bungalov adı veya açıklama ara..."
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
                { value: 'inactive', label: 'Pasif' },
                { value: 'maintenance', label: 'Bakımda' }
              ]}
            />
            
            <Select
              value={capacityFilter}
              onChange={(value) => setCapacityFilter(value)}
              options={[
                { value: 'all', label: 'Tüm Kapasiteler' },
                { value: '2', label: '2 Kişi' },
                { value: '4', label: '4 Kişi' },
                { value: '6', label: '6 Kişi' },
                { value: '8', label: '8 Kişi' }
              ]}
            />
            
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={[
                { value: '', label: 'Sıralama Yok' },
                { value: 'name', label: 'Ada Göre' },
                { value: 'price_per_night', label: 'Fiyata Göre' },
                { value: 'capacity', label: 'Kapasiteye Göre' }
              ]}
            />
          </div>
        </div>

        {/* Bungalov Listesi */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">{(bungalows || []).length} bungalov bulundu</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BUNGALOV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KAPASİTE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GECELİK FİYAT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DURUM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AKTİF REZERVASYON
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İŞLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(currentBungalows || []).map((bungalow) => (
                  <tr key={bungalow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bungalow.name}</div>
                        <div className="text-sm text-gray-500">{bungalow.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {bungalow.capacity} kişi
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{bungalow.price_per_night}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(bungalow.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bungalow.reservations_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Rezervasyon Ekle">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleAddReservation(bungalow)}
                            className="h-8 w-8 p-0 flex items-center justify-center"
                          >
                            <PlusIcon className="h-full w-full" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Görüntüle">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleView(bungalow)}
                            className="h-8 w-8 p-0 flex items-center justify-center"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Düzenle">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEdit(bungalow)}
                            className="h-8 w-8 p-0 flex items-center justify-center"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Sil">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDelete(bungalow)}
                            className="h-8 w-8 p-0 flex items-center justify-center text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {startIndex + 1}-{Math.min(endIndex, (filteredBungalows || []).length)} / {(filteredBungalows || []).length} sonuç
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

        {/* Bungalov Ekleme/Düzenleme Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingBungalow(null);
            setBungalowData({
              name: '',
              description: '',
              capacity: '',
              price_per_night: '',
              status: 'active',
              poolType: 'round',
              poolFeature: 'standard'
            });
          }}
          title={editingBungalow ? 'Bungalov Düzenle' : 'Yeni Bungalov Ekle'}
          size="lg"
        >
          <div className="space-y-6">
            <FormGrid columns={2}>
              <FormField label="Bungalov Adı" required>
                <Input
                  value={bungalowData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Bungalov adını girin"
                />
              </FormField>
              
              <FormField label="Kapasite" required>
                <Input
                  type="number"
                  value={bungalowData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder="Kişi sayısı"
                  min="1"
                  max="20"
                />
              </FormField>
            </FormGrid>

            <FormField label="Açıklama">
              <Textarea
                value={bungalowData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Bungalov açıklaması"
                rows={3}
              />
            </FormField>

            <FormGrid columns={2}>
              <FormField label="Gecelik Fiyat" required>
                <NumberInput
                  value={bungalowData.price_per_night}
                  onChange={(e) => handleInputChange('price_per_night', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </FormField>
              
              <FormField label="Durum" required>
                <Select
                  value={bungalowData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={[
                    { value: 'active', label: 'Aktif' },
                    { value: 'inactive', label: 'Pasif' },
                    { value: 'maintenance', label: 'Bakımda' }
                  ]}
                />
              </FormField>
            </FormGrid>

          </div>

          <FormActions className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingBungalow(null);
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={!bungalowData.name || !bungalowData.capacity || !bungalowData.price_per_night}
            >
              {editingBungalow ? 'Güncelle' : 'Kaydet'}
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
              {confirmAction === 'delete' && 'Bungalov Sil'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmAction === 'delete' && 
                `${bungalowToDelete?.name} bungalovunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
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
    </div>
  );
};

export default Bungalows;
