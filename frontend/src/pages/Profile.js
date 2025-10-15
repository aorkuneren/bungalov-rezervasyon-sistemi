import React, { useState, useEffect, useRef } from 'react';
import { 
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input, { PasswordInput, DateInput, TelInput, EmailInput } from '../components/ui/Input';
import { TabContainer, TabPanel } from '../components/ui/Tabs';
import { FormSection, FormActions, FormField, FormGrid } from '../components/ui/FormGroup';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';

const Profile = ({ user, onLogout }) => {
  // Tab Navigation
  const tabs = [
    { id: 'genel', name: 'Genel Bilgiler', icon: UserIcon },
    { id: 'guvenlik', name: 'Güvenlik', icon: ShieldCheckIcon },
    { id: 'sifre', name: 'Şifre Değiştir', icon: KeyIcon },
    { id: 'logs', name: 'İşlem Geçmişi', icon: ClipboardDocumentListIcon }
  ];

  // State Management
  const [activeTab, setActiveTab] = useState('genel');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activityLogs, setActivityLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [retryCount, setRetryCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [isRateLimited, setIsRateLimited] = useState(false);
  const toast = useToast();
  const searchTimeoutRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birth_date: user?.birth_date || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Load activity logs
  const loadActivityLogs = async (page = currentPage, searchFilters = filters, retryAttempt = 0) => {
    setLoading(true);
    setIsRateLimited(false);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams({
        page: page,
        per_page: 10,
        search: searchFilters.search || '',
        status: searchFilters.status || 'all',
        dateFrom: searchFilters.dateFrom || '',
        dateTo: searchFilters.dateTo || '',
        sort_by: searchFilters.sortBy || 'created_at',
        sort_order: searchFilters.sortOrder || 'desc'
      });

      const response = await fetch(`http://localhost:8000/api/profile/activity-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          setIsRateLimited(true);
          setRetryCount(retryAttempt + 1);
          
          if (retryAttempt < 3) {
            // Retry after exponential backoff
            const delay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
            setTimeout(() => {
              loadActivityLogs(page, searchFilters, retryAttempt + 1);
            }, delay);
            return;
          } else {
            throw new Error('Çok fazla istek gönderildi. Lütfen bir dakika bekleyin.');
          }
        } else if (response.status === 422) {
          const errorData = await response.json();
          console.error('Validation errors:', errorData.errors);
          throw new Error(errorData.message || 'Geçersiz parametreler');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      if (data.success) {
        setActivityLogs(data.logs);
        setPagination(data.pagination);
        setRetryCount(0);
        setIsRateLimited(false);
      } else {
        throw new Error(data.message || 'API error');
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
      if (error.message.includes('Çok fazla istek')) {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'İşlem geçmişi yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load activity logs when tab changes to logs
  useEffect(() => {
    if (activeTab === 'logs') {
      loadActivityLogs(currentPage, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            birth_date: data.user.birth_date || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Profil bilgileri yüklenirken hata oluştu');
      }
    };

    loadProfile();
  }, []); // Empty dependency array - only run once on mount

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Input handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    setFilters(newFilters);
    
    if (field === 'search') {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        if (activeTab === 'logs') {
          setCurrentPage(1);
          loadActivityLogs(1, newFilters);
        }
      }, 1000);
    } else {
      // Immediate load for other filters
      if (activeTab === 'logs') {
        setCurrentPage(1);
        loadActivityLogs(1, newFilters);
      }
    }
  };

  // Get CSRF cookie
  const getCsrfCookie = async () => {
    try {
      await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error getting CSRF cookie:', error);
    }
  };

  // Save profile
  const handleSave = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Get CSRF cookie first
      await getCsrfCookie();
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          console.error('Validation errors:', errorData.errors);
          setErrors(errorData.errors);
          toast.error('Lütfen form hatalarını düzeltin');
          return;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Profil bilgileri başarıyla güncellendi');
        setIsEditing(false);
        // Update user data in parent component if needed
        // Note: onUserUpdate prop is optional
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          toast.error(data.message || 'Profil güncellenirken hata oluştu');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birth_date: user?.birth_date || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  // Update password
  const handlePasswordUpdate = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Get CSRF cookie first
      await getCsrfCookie();
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Şifre başarıyla değiştirildi');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          toast.error(data.message || 'Şifre değiştirilirken hata oluştu');
        }
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Şifre değiştirilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'super_admin': return 'danger';
      case 'admin': return 'info';
      case 'user': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin': return 'Süper Admin';
      case 'admin': return 'Admin';
      case 'user': return 'Kullanıcı';
      default: return 'Bilinmiyor';
    }
  };

  // İşlem türüne göre Türkçe çeviri ve badge rengi
  const getActionInfo = (action) => {
    const actionMap = {
      // Giriş işlemleri
      'login': { 
        text: 'Giriş Yapıldı', 
        variant: 'success',
        description: 'Kullanıcı sisteme giriş yaptı'
      },
      'logout': { 
        text: 'Çıkış Yapıldı', 
        variant: 'info',
        description: 'Kullanıcı sistemden çıkış yaptı'
      },
      'failed_login': { 
        text: 'Hatalı Giriş', 
        variant: 'danger',
        description: 'Geçersiz kimlik bilgileri ile giriş denemesi'
      },
      
      // Şifre işlemleri
      'password_changed': { 
        text: 'Şifre Değiştirildi', 
        variant: 'success',
        description: 'Kullanıcı şifresini değiştirdi'
      },
      'password_reset_requested': { 
        text: 'Şifre Sıfırlama İstendi', 
        variant: 'warning',
        description: 'Kullanıcı şifre sıfırlama talebinde bulundu'
      },
      'password_reset_completed': { 
        text: 'Şifre Sıfırlandı', 
        variant: 'success',
        description: 'Şifre sıfırlama işlemi tamamlandı'
      },
      
      // Profil işlemleri
      'profile_updated': { 
        text: 'Profil Güncellendi', 
        variant: 'success',
        description: 'Kullanıcı profil bilgilerini güncelledi'
      },
      
      // Kullanıcı yönetimi
      'user_created': { 
        text: 'Kullanıcı Oluşturuldu', 
        variant: 'success',
        description: 'Yeni kullanıcı hesabı oluşturuldu'
      },
      'user_updated': { 
        text: 'Kullanıcı Güncellendi', 
        variant: 'info',
        description: 'Kullanıcı bilgileri güncellendi'
      },
      'user_deleted': { 
        text: 'Kullanıcı Silindi', 
        variant: 'danger',
        description: 'Kullanıcı hesabı silindi'
      },
      
      // Sistem işlemleri
      'system_error': { 
        text: 'Sistem Hatası', 
        variant: 'danger',
        description: 'Sistem hatası oluştu'
      },
      'security_alert': { 
        text: 'Güvenlik Uyarısı', 
        variant: 'warning',
        description: 'Güvenlik uyarısı tetiklendi'
      },
      
      // Varsayılan
      'default': { 
        text: action || 'Bilinmeyen İşlem', 
        variant: 'secondary',
        description: 'İşlem detayı bulunamadı'
      }
    };
    
    return actionMap[action] || actionMap['default'];
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Başarılı';
      case 'error': return 'Hata';
      case 'warning': return 'Uyarı';
      case 'info': return 'Bilgi';
      default: return 'Bilinmiyor';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (activeTab === 'logs') {
      loadActivityLogs(page, filters);
    }
  };

  // Render General Info Tab
  const renderGeneralInfo = () => (
    <div className="space-y-6">
      <FormSection
        title="Kişisel Bilgiler"
        description="Hesap bilgilerinizi buradan düzenleyebilirsiniz"
      >
        <FormGrid columns={2}>
          <FormField
            label="Ad Soyad"
            required
            error={errors.name}
          >
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ad Soyad girin"
              disabled={!isEditing}
              error={errors.name}
            />
          </FormField>

          <FormField
            label="E-posta"
            required
            error={errors.email}
          >
            <EmailInput
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="E-posta adresi girin"
              disabled={!isEditing}
              error={errors.email}
            />
          </FormField>

          <FormField
            label="Telefon"
            error={errors.phone}
          >
            <TelInput
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Telefon numarası girin"
              disabled={!isEditing}
              error={errors.phone}
            />
          </FormField>

          <FormField
            label="Doğum Tarihi"
            error={errors.birth_date}
          >
            <DateInput
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
              disabled={!isEditing}
              error={errors.birth_date}
            />
          </FormField>
        </FormGrid>

        <FormField
          label="Rol"
        >
          <div className="flex items-center space-x-2">
            <Badge variant={getRoleBadgeVariant(user?.role)}>
              {getRoleDisplayName(user?.role)}
            </Badge>
            <span className="text-sm text-gray-500">
              (Rol değiştirilemez)
            </span>
          </div>
        </FormField>

        <FormActions>
          {!isEditing ? (
            <Button
              variant="primary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
            >
              Düzenle
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={handleCancel}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                variant="success"
                icon={<CheckIcon className="w-4 h-4" />}
                onClick={handleSave}
                loading={loading}
              >
                Kaydet
              </Button>
            </>
          )}
        </FormActions>
      </FormSection>
    </div>
  );

  // Render Security Info Tab
  const renderSecurityInfo = () => (
    <div className="space-y-6">
      <FormSection
        title="Güvenlik Bilgileri"
        description="Hesap güvenliğinizle ilgili bilgiler"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Son Giriş</p>
                <p className="text-sm text-gray-500">
                  {user?.last_login_at 
                    ? new Date(user.last_login_at).toLocaleString('tr-TR')
                    : 'Bilinmiyor'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Toplam Giriş</p>
                <p className="text-sm text-gray-500">
                  {user?.login_count || 0} kez
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <KeyIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Şifre Son Değişiklik</p>
                <p className="text-sm text-gray-500">
                  {user?.password_changed_at 
                    ? new Date(user.password_changed_at).toLocaleString('tr-TR')
                    : 'Bilinmiyor'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">İki Faktörlü Doğrulama</p>
                <p className="text-sm text-gray-500">
                  <Badge variant="secondary">Devre Dışı</Badge>
                </p>
              </div>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );

  // Render Password Change Tab
  const renderPasswordChange = () => (
    <div className="space-y-6">
      <FormSection
        title="Şifre Değiştir"
        description="Hesap güvenliğiniz için güçlü bir şifre kullanın"
      >
        <div className="max-w-md space-y-4">
          <FormField
            label="Mevcut Şifre"
            required
            error={errors.currentPassword}
          >
            <PasswordInput
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Mevcut şifrenizi girin"
              error={errors.currentPassword}
            />
          </FormField>

          <FormField
            label="Yeni Şifre"
            required
            error={errors.newPassword}
            helperText="En az 8 karakter, büyük harf, küçük harf ve sayı içermeli"
          >
            <PasswordInput
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Yeni şifrenizi girin"
              error={errors.newPassword}
            />
          </FormField>

          <FormField
            label="Yeni Şifre Tekrar"
            required
            error={errors.confirmPassword}
          >
            <PasswordInput
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Yeni şifrenizi tekrar girin"
              error={errors.confirmPassword}
            />
          </FormField>

          <FormActions>
            <Button
              variant="success"
              icon={<KeyIcon className="w-4 h-4" />}
              onClick={handlePasswordUpdate}
              loading={loading}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              Şifreyi Güncelle
            </Button>
          </FormActions>
        </div>
      </FormSection>
    </div>
  );

  // Render Activity Logs Tab
  const renderActivityLogs = () => (
    <div className="space-y-6">
      <FormSection
        title="İşlem Geçmişi"
        description="Hesabınızda yapılan tüm işlemlerin kaydı"
      >
        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Arama">
              <Input
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="İşlem ara..."
                leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
              />
            </FormField>

            <FormField label="Durum">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="all">Tümü</option>
                <option value="success">Başarılı</option>
                <option value="error">Hata</option>
                <option value="warning">Uyarı</option>
                <option value="info">Bilgi</option>
              </select>
            </FormField>

            <FormField label="Sıralama">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="created_at-desc">En Yeni</option>
                <option value="created_at-asc">En Eski</option>
                <option value="action-desc">İşlem A-Z</option>
                <option value="action-asc">İşlem Z-A</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Activity Logs List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">
                {isRateLimited ? `Yeniden deneniyor... (${retryCount}/3)` : 'Yükleniyor...'}
              </p>
              {isRateLimited && (
                <p className="mt-1 text-sm text-yellow-600">
                  Çok fazla istek gönderildi. Otomatik olarak yeniden deneniyor...
                </p>
              )}
            </div>
          ) : activityLogs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlem Türü
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlem Detayı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Adresi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activityLogs.map((log) => {
                      const actionInfo = getActionInfo(log.action);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={actionInfo.variant}>
                              {actionInfo.text}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {actionInfo.description}
                            </div>
                            {log.metadata && log.metadata.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {log.metadata.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusBadgeVariant(log.status)}>
                              {getStatusText(log.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.ip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString('tr-TR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.total > pagination.per_page && (
                <div className="px-6 py-3 border-t border-gray-200">
                  <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={handlePageChange}
                    onPreviousPage={() => handlePageChange(pagination.current_page - 1)}
                    onNextPage={() => handlePageChange(pagination.current_page + 1)}
                    startIndex={(pagination.current_page - 1) * pagination.per_page}
                    endIndex={pagination.current_page * pagination.per_page}
                    showInfo={true}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.per_page}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz işlem geçmişi bulunmuyor</p>
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <p className="mt-2 text-gray-600">
          Hesap bilgilerinizi yönetin ve güvenlik ayarlarınızı düzenleyin
        </p>
      </div>

      <TabContainer
        items={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        tabClassName="border-b border-gray-200 p-4"
        contentClassName="p-6"
      >
        <TabPanel tabId="genel" activeTab={activeTab}>
          {renderGeneralInfo()}
        </TabPanel>

        <TabPanel tabId="guvenlik" activeTab={activeTab}>
          {renderSecurityInfo()}
        </TabPanel>

        <TabPanel tabId="sifre" activeTab={activeTab}>
          {renderPasswordChange()}
        </TabPanel>

        <TabPanel tabId="logs" activeTab={activeTab}>
          {renderActivityLogs()}
        </TabPanel>
      </TabContainer>
    </div>
  );
};

export default Profile;