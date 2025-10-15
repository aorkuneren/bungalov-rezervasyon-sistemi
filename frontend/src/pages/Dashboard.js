import React, { useState, useEffect } from 'react';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ui/Toast';
import { dashboardAPI } from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Dashboard verilerini yükle
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboardData();
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        toast(response.data.message || 'Dashboard verileri yüklenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
      toast('Dashboard verileri yüklenirken hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Tarih formatla
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Saat formatla
  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Para formatla
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price || 0);
  };

  // Rezervasyon durumu badge'i
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Beklemede' },
      confirmed: { color: 'blue', text: 'Onaylandı' },
      checked_in: { color: 'green', text: 'Giriş Yapıldı' },
      checked_out: { color: 'gray', text: 'Çıkış Yapıldı' },
      cancelled: { color: 'red', text: 'İptal Edildi' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Badge variant={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Dashboard verileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  const { statistics, today_check_ins, today_check_outs, upcoming_reservations } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="mt-2 text-gray-600">
          Bungalov işletmenizin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Toplam Rezervasyon */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Rezervasyon</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total_reservations}</p>
            </div>
          </div>
        </div>

        {/* Aktif Rezervasyon */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktif Rezervasyon</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.active_reservations}</p>
            </div>
          </div>
        </div>

        {/* Toplam Müşteri */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total_customers}</p>
            </div>
          </div>
        </div>

        {/* Bu Ay Gelir */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bu Ay Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺{formatPrice(statistics.monthly_revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bungalov Durumu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Dolu Bungalov</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.occupied_bungalows}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Boş Bungalov</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.available_bungalows}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bugünün Rezervasyonları ve Yaklaşan Rezervasyonlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bugünün Girişleri */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <ArrowRightIcon className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Bugünün Girişleri</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">{today_check_ins.length} rezervasyon</p>
          </div>
          <div className="p-6">
            {today_check_ins.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Bugün giriş yapacak rezervasyon bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {today_check_ins.map((reservation) => (
                  <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{reservation.customer.name}</h4>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reservation.bungalow.name}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatTime(reservation.check_in_date)}
                          </span>
                          <span>₺{formatPrice(reservation.total_price)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => navigate(`/reservations/${reservation.id}`)}
                        className="ml-4"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bugünün Çıkışları */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <ArrowLeftIcon className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Bugünün Çıkışları</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">{today_check_outs.length} rezervasyon</p>
          </div>
          <div className="p-6">
            {today_check_outs.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Bugün çıkış yapacak rezervasyon bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {today_check_outs.map((reservation) => (
                  <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{reservation.customer.name}</h4>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reservation.bungalow.name}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatTime(reservation.check_out_date)}
                          </span>
                          <span>₺{formatPrice(reservation.total_price)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => navigate(`/reservations/${reservation.id}`)}
                        className="ml-4"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Yaklaşan Rezervasyonlar */}
      <div className="mt-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Yaklaşan Rezervasyonlar</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reservations')}
              >
                Tümünü Gör
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Gelecek 7 gün içindeki rezervasyonlar</p>
          </div>
          <div className="p-6">
            {upcoming_reservations.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Yaklaşan rezervasyon bulunmuyor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Müşteri
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bungalov
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarihler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcoming_reservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{reservation.customer.name}</div>
                            <div className="text-sm text-gray-500">{reservation.customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reservation.bungalow.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(reservation.check_in_date)} - {formatDate(reservation.check_out_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reservation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₺{formatPrice(reservation.total_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => navigate(`/reservations/${reservation.id}`)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Görüntüle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;