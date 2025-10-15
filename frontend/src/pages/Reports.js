import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ui/Toast';
import { reportsAPI, bungalowAPI, customerAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [reportData, setReportData] = useState(null);
  const [bungalows, setBungalows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    start_date: new Date().getFullYear() + '-01-01',
    end_date: new Date().getFullYear() + '-12-31',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    bungalow_id: '',
    customer_id: ''
  });

  // Load bungalows and customers for filters
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [bungalowsRes, customersRes] = await Promise.all([
          bungalowAPI.getBungalows(),
          customerAPI.getCustomers()
        ]);
        
        if (bungalowsRes.data.success) {
          setBungalows(bungalowsRes.data.data);
        }
        
        if (customersRes.data.success) {
          setCustomers(customersRes.data.data);
        }
      } catch (error) {
        console.error('Filter data yüklenirken hata:', error);
      }
    };
    
    loadFilterData();
  }, []);

  // Load report data
  const loadReportData = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeTab) {
        case 'general':
          response = await reportsAPI.getGeneralReport({
            start_date: filters.start_date,
            end_date: filters.end_date
          });
          break;
        case 'yearly':
          response = await reportsAPI.getYearlyReport({
            year: filters.year
          });
          break;
        case 'seasonal':
          response = await reportsAPI.getSeasonalReport({
            year: filters.year
          });
          break;
        case 'monthly':
          response = await reportsAPI.getMonthlyReport({
            year: filters.year,
            month: filters.month
          });
          break;
        case 'bungalow':
          response = await reportsAPI.getBungalowBasedReport({
            start_date: filters.start_date,
            end_date: filters.end_date,
            bungalow_id: filters.bungalow_id || undefined
          });
          break;
        case 'customer':
          response = await reportsAPI.getCustomerBasedReport({
            start_date: filters.start_date,
            end_date: filters.end_date,
            customer_id: filters.customer_id || undefined
          });
          break;
        default:
          return;
      }

      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        toast(response.data.message || 'Rapor yüklenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Rapor yüklenirken hata:', error);
      toast('Rapor yüklenirken hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [activeTab, filters]);

  // Format functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatPercentage = (value) => {
    return (value || 0).toFixed(1) + '%';
  };

  // Tab configuration
  const tabs = [
    { id: 'general', name: 'Genel Raporlama', icon: ChartBarIcon },
    { id: 'yearly', name: 'Yıllık Raporlama', icon: CalendarDaysIcon },
    { id: 'seasonal', name: 'Sezonluk Raporlama', icon: CalendarIcon },
    { id: 'monthly', name: 'Aylık Raporlama', icon: CalendarDaysIcon },
    { id: 'bungalow', name: 'Bungalov Bazlı', icon: BuildingOfficeIcon },
    { id: 'customer', name: 'Müşteri Bazlı', icon: UsersIcon }
  ];

  // Render report content based on active tab
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center py-8">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Rapor verisi bulunamadı</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return renderGeneralReport();
      case 'yearly':
        return renderYearlyReport();
      case 'seasonal':
        return renderSeasonalReport();
      case 'monthly':
        return renderMonthlyReport();
      case 'bungalow':
        return renderBungalowReport();
      case 'customer':
        return renderCustomerReport();
      default:
        return null;
    }
  };

  const renderGeneralReport = () => {
    const { summary, top_performers } = reportData || {};
    
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Rezervasyon</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.total_reservations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{formatPrice(summary?.total_revenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Ödeme</p>
                <p className="text-2xl font-bold text-gray-900">₺{formatPrice(summary?.total_payments)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kalan Borç</p>
                <p className="text-2xl font-bold text-gray-900">₺{formatPrice(summary?.remaining_debt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">En Popüler Bungalov</h3>
            {top_performers?.most_popular_bungalow ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {top_performers.most_popular_bungalow.bungalow?.name || 'Bilinmeyen'}
                </p>
                <p className="text-sm text-gray-500">
                  {top_performers.most_popular_bungalow.reservation_count} rezervasyon
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Veri bulunamadı</p>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Rezervasyon Yapan Müşteri</h3>
            {top_performers?.top_customer ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {top_performers.top_customer.customer?.name || 'Bilinmeyen'}
                </p>
                <p className="text-sm text-gray-500">
                  {top_performers.top_customer.reservation_count} rezervasyon
                </p>
                <p className="text-sm text-gray-500">
                  ₺{formatPrice(top_performers.top_customer.total_spent)} harcama
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Veri bulunamadı</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderYearlyReport = () => {
    const { monthly_data, yearly_summary } = reportData || {};
    
    return (
      <div className="space-y-6">
        {/* Yearly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Toplam Rezervasyon</p>
            <p className="text-2xl font-bold text-gray-900">{yearly_summary?.total_reservations || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
            <p className="text-2xl font-bold text-gray-900">₺{formatPrice(yearly_summary?.total_revenue)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Toplam Ödeme</p>
            <p className="text-2xl font-bold text-gray-900">₺{formatPrice(yearly_summary?.total_payments)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Ortalama Doluluk</p>
            <p className="text-2xl font-bold text-gray-900">{formatPercentage(yearly_summary?.average_occupancy_rate)}</p>
          </div>
        </div>

        {/* Monthly Data Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Aylık Detaylar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezervasyon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gelir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doluluk</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(monthly_data || []).map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.month_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {month.reservations_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{formatPrice(month.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{formatPrice(month.payments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(month.occupancy_rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSeasonalReport = () => {
    const { seasonal_data } = reportData || {};
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(seasonal_data || []).map((season) => (
            <div key={season.season} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{season.season_name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Rezervasyon:</span>
                  <span className="text-sm font-medium text-gray-900">{season.reservations_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Gelir:</span>
                  <span className="text-sm font-medium text-gray-900">₺{formatPrice(season.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ödeme:</span>
                  <span className="text-sm font-medium text-gray-900">₺{formatPrice(season.payments)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Doluluk:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPercentage(season.occupancy_rate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    const { monthly_summary, daily_data } = reportData || {};
    
    return (
      <div className="space-y-6">
        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Toplam Rezervasyon</p>
            <p className="text-2xl font-bold text-gray-900">{monthly_summary?.total_reservations || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
            <p className="text-2xl font-bold text-gray-900">₺{formatPrice(monthly_summary?.total_revenue)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Toplam Ödeme</p>
            <p className="text-2xl font-bold text-gray-900">₺{formatPrice(monthly_summary?.total_payments)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Doluluk Oranı</p>
            <p className="text-2xl font-bold text-gray-900">{formatPercentage(monthly_summary?.occupancy_rate)}</p>
          </div>
        </div>

        {/* Daily Data Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Günlük Detaylar</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezervasyon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gelir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(daily_data || []).map((day) => (
                  <tr key={day.day} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.reservations_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{formatPrice(day.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{formatPrice(day.payments)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderBungalowReport = () => {
    const { bungalow_data } = reportData || {};
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bungalov Performans Raporu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bungalov</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezervasyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gelir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan Borç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doluluk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ort. Kalış</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(bungalow_data || []).map((bungalow) => (
                <tr key={bungalow.bungalow_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bungalow.bungalow_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bungalow.reservations_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{formatPrice(bungalow.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{formatPrice(bungalow.total_payments)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{formatPrice(bungalow.remaining_debt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage(bungalow.occupancy_rate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bungalow.average_stay_duration.toFixed(1)} gün
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomerReport = () => {
    const { customer_data } = reportData || {};
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Müşteri Performans Raporu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezervasyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Harcama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan Borç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ort. Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Rezervasyon</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(customer_data || []).map((customer) => (
                <tr key={customer.customer_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.customer_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{customer.customer_email}</div>
                      <div className="text-sm text-gray-500">{customer.customer_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.reservations_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{formatPrice(customer.total_spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{formatPrice(customer.total_paid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{formatPrice(customer.remaining_debt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{formatPrice(customer.average_reservation_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(customer.last_reservation_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
            <p className="mt-2 text-gray-600">
              İşletmenizin detaylı raporlarını buradan görüntüleyebilirsiniz.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtreler
            </Button>
            <Button
              variant="primary"
              onClick={() => {/* Export functionality */}}
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Rapor Filtreleri" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yıl</label>
              <Input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ay</label>
              <Select
                value={filters.month}
                onChange={(value) => setFilters({...filters, month: parseInt(value)})}
                options={[
                  { value: 1, label: 'Ocak' },
                  { value: 2, label: 'Şubat' },
                  { value: 3, label: 'Mart' },
                  { value: 4, label: 'Nisan' },
                  { value: 5, label: 'Mayıs' },
                  { value: 6, label: 'Haziran' },
                  { value: 7, label: 'Temmuz' },
                  { value: 8, label: 'Ağustos' },
                  { value: 9, label: 'Eylül' },
                  { value: 10, label: 'Ekim' },
                  { value: 11, label: 'Kasım' },
                  { value: 12, label: 'Aralık' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bungalov</label>
              <Select
                value={filters.bungalow_id}
                onChange={(value) => setFilters({...filters, bungalow_id: value})}
                options={[
                  { value: '', label: 'Tüm Bungalovlar' },
                  ...bungalows.map(bungalow => ({
                    value: bungalow.id,
                    label: bungalow.name
                  }))
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri</label>
              <Select
                value={filters.customer_id}
                onChange={(value) => setFilters({...filters, customer_id: value})}
                options={[
                  { value: '', label: 'Tüm Müşteriler' },
                  ...customers.map(customer => ({
                    value: customer.id,
                    label: customer.name
                  }))
                ]}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowFilters(false)}>
            İptal
          </Button>
          <Button variant="primary" onClick={() => setShowFilters(false)}>
            Uygula
          </Button>
        </div>
      </Modal>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
