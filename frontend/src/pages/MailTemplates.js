import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { mailTemplateAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { 
  EnvelopeIcon, 
  PencilIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MailTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editData, setEditData] = useState({
    subject: '',
    body: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await mailTemplateAPI.getTemplates();
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Template yükleme hatası:', error);
      toast('Template\'ler yüklenirken hata oluştu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditData({
      subject: template.subject,
      body: template.body
    });
    setShowEditModal(true);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleSave = async () => {
    if (!editData.subject.trim() || !editData.body.trim()) {
      toast('Konu ve içerik alanları zorunludur', { type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const response = await mailTemplateAPI.updateTemplate(selectedTemplate.type, editData);
      if (response.data.success) {
        toast('Template başarıyla güncellendi', { type: 'success' });
        setShowEditModal(false);
        loadTemplates();
      } else {
        toast(response.data.message || 'Template güncellenirken hata oluştu', { type: 'error' });
      }
    } catch (error) {
      console.error('Template güncelleme hatası:', error);
      toast(error.response?.data?.message || 'Template güncellenirken hata oluştu', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getTemplateTypeLabel = (type) => {
    const labels = {
      'reservation_confirmation': 'Rezervasyon Onay Maili',
      'reservation_reminder': 'Rezervasyon Hatırlatma Maili',
      'payment_confirmation': 'Ödeme Onay Maili',
      'cancellation_notification': 'İptal Bildirimi Maili'
    };
    return labels[type] || type;
  };

  const getTemplateTypeIcon = (type) => {
    const icons = {
      'reservation_confirmation': '✅',
      'reservation_reminder': '⏰',
      'payment_confirmation': '💳',
      'cancellation_notification': '❌'
    };
    return icons[type] || '📧';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Template'ler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mail Template'leri</h1>
              <p className="mt-2 text-gray-600">
                Müşterilere gönderilen e-posta template'lerini yönetin
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
            >
              ← Geri Dön
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {getTemplateTypeIcon(template.type)}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getTemplateTypeLabel(template.type)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {template.name}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.is_active ? 'Aktif' : 'Pasif'}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Konu:</strong> {template.subject}
                </p>
                <div className="text-sm text-gray-500 line-clamp-3">
                  {template.body.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePreview(template)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Önizle
                </Button>
                <Button
                  onClick={() => handleEdit(template)}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Template bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Henüz hiç mail template'i oluşturulmamış.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`${selectedTemplate?.name} - Önizleme`}
        size="lg"
      >
        {selectedTemplate && (
          <div className="p-6">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Konu:</h4>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                {selectedTemplate.subject}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">İçerik:</h4>
              <div 
                className="border rounded p-4 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`${selectedTemplate?.name} - Düzenle`}
        size="lg"
      >
        {selectedTemplate && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konu
                </label>
                <Input
                  value={editData.subject}
                  onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                  placeholder="E-posta konusu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İçerik (HTML)
                </label>
                <textarea
                  value={editData.body}
                  onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                  placeholder="E-posta içeriği (HTML formatında)"
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h5 className="text-sm font-medium text-blue-900 mb-2">
                  Kullanılabilir Değişkenler:
                </h5>
                <div className="text-xs text-blue-800 space-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <h6 className="font-semibold text-blue-900 mb-1">Rezervasyon Bilgileri:</h6>
                      <p><code>{'{{customer_name}}'}</code> - Müşteri adı</p>
                      <p><code>{'{{bungalow_name}}'}</code> - Bungalov adı</p>
                      <p><code>{'{{check_in_date}}'}</code> - Giriş tarihi</p>
                      <p><code>{'{{check_out_date}}'}</code> - Çıkış tarihi</p>
                      <p><code>{'{{guest_count}}'}</code> - Misafir sayısı</p>
                      <p><code>{'{{total_price}}'}</code> - Toplam tutar</p>
                      <p><code>{'{{reservation_code}}'}</code> - Rezervasyon kodu</p>
                      <p><code>{'{{confirmation_link}}'}</code> - Onay linki</p>
                      <p><code>{'{{confirmation_hours}}'}</code> - Onay süresi (saat)</p>
                    </div>
                    <div>
                      <h6 className="font-semibold text-blue-900 mb-1">Şirket Bilgileri:</h6>
                      <p><code>{'{{companyName}}'}</code> - Şirket adı</p>
                      <p><code>{'{{companyAddress}}'}</code> - Tam adres</p>
                      <p><code>{'{{companyEmail}}'}</code> - E-posta</p>
                      <p><code>{'{{companyPhone}}'}</code> - Telefon</p>
                      <p><code>{'{{companyWebsite}}'}</code> - Web sitesi</p>
                      <p><code>{'{{companyLogo}}'}</code> - Logo yolu</p>
                      <p><code>{'{{companyGoogleProfile}}'}</code> - Google işletme profili</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                disabled={saving}
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                İptal
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MailTemplates;
