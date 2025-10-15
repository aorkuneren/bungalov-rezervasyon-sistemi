import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { bungalowAPI, customerAPI, reservationAPI, settingsAPI, mailAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input, { DateInput, NumberInput, TelInput, EmailInput } from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import FormActions from '../components/ui/FormActions';
import Textarea from '../components/ui/Textarea';
import SimpleCalendar from '../components/ui/SimpleCalendar';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  HomeIcon,
  CalendarDaysIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const CreateReservation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [loading, setLoading] = useState(false);
  const [bungalowsLoading, setBungalowsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState(null);

  // Bungalov state
  const [bungalows, setBungalows] = useState([]);
  const [filteredBungalows, setFilteredBungalows] = useState([]);

  // Müşteri state
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Rezervasyon verileri (takvim için)
  const [occupiedReservations, setOccupiedReservations] = useState([]);


  // Rezervasyon form state
  const [reservationData, setReservationData] = useState({
    // Adım 1: Bungalov seçimi
    bungalowId: '',
    bungalowName: '',
    
    // Adım 2: Tarih ve fiyat
    checkIn: '',
    checkOut: '',
    guests: 1,
    nights: 0,
    basePrice: 0,
    totalPrice: 0,
    manualPrice: 0,
    useManualPrice: false,
    
    // Adım 3: Müşteri bilgileri
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerIdNumber: '',
    customerIdType: 'tc', // 'tc' veya 'passport'
    isNewCustomer: false,
    
    // Konaklayacak kişiler
    additionalGuests: [],
    
    // Adım 4: Onay
    notes: '',
    confirmationHours: 24
  });

  // Adım 1: Bungalov seçimi state
  const [selectedBungalow, setSelectedBungalow] = useState(null);
  const [bungalowSearch, setBungalowSearch] = useState('');

  // Adım 2: Tarih seçimi state
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null
  });
  const [occupiedDates, setOccupiedDates] = useState([]);

  // Adım 3: Müşteri seçimi state
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Konaklayacak kişiler state
  const [newAdditionalGuest, setNewAdditionalGuest] = useState({
    name: '',
    idNumber: '',
    idType: 'tc',
    phone: ''
  });

  // Residents state (yeni tablo için)
  const [residents, setResidents] = useState([]);

  // Adım 4: Onay state
  const [confirmationLink, setConfirmationLink] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Kopyala');
  const [settings, setSettings] = useState({ 
    confirmationHours: 24,
    confirmationEnabled: false,
    defaultDepositAmount: 0,
    checkInTime: '14:00',
    checkOutTime: '11:00'
  });


  // Bungalovları yükle
  const loadBungalows = async () => {
    try {
      setBungalowsLoading(true);
      const response = await bungalowAPI.getBungalows({ status: 'active' });
      
      if (response.data.success) {
        setBungalows(response.data.data);
        setFilteredBungalows(response.data.data);
      } else {
        toastError(response.data.message || 'Bungalovlar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Bungalovlar yüklenirken hata:', error);
      toastError('Bungalovlar yüklenirken hata oluştu');
    } finally {
      setBungalowsLoading(false);
    }
  };

  // Müşterileri yükle
  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getCustomers();
      
      if (response.data.success) {
        setCustomers(response.data.data);
        setFilteredCustomers(response.data.data);
      } else {
        toastError(response.data.message || 'Müşteriler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      toastError('Müşteriler yüklenirken hata oluştu');
    }
  };

  // Rezervasyon verilerini yükle (takvim için)
  const loadReservations = async () => {
    if (!selectedBungalow) return; // Bungalov seçilmediyse rezervasyon yükleme
    
    try {
      const response = await reservationAPI.getReservations();
      
      if (response.data.success) {
        // Backend'den gelen veriyi frontend formatına dönüştür ve seçili bungalov'a filtrele
        // İptal edilen rezervasyonları hariç tut
        const transformedReservations = response.data.data
          .filter(reservation => 
            reservation.bungalow_id === selectedBungalow.id && 
            reservation.status !== 'cancelled'
          )
          .map(reservation => ({
            id: reservation.id,
            reservationCode: reservation.reservation_code,
            customerName: reservation.customer?.name || '',
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
            createdAt: reservation.created_at,
            updatedAt: reservation.updated_at
          }));
        
        setOccupiedReservations(transformedReservations);
      }
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
    }
  };

  // Mock occupied dates - Backend entegrasyonu sonrası değiştirilecek
  useEffect(() => {
    setOccupiedDates([
      '2025-01-15', '2025-01-16', '2025-01-17',
      '2025-01-20', '2025-01-21',
      '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28'
    ]);
  }, []);

  // Bungalovları yükle
  useEffect(() => {
    loadBungalows();
  }, []);

  // Müşterileri yükle
  useEffect(() => {
    loadCustomers();
  }, []);

  // Rezervasyon verilerini yükle (bungalov seçildiğinde)
  useEffect(() => {
    if (selectedBungalow) {
      loadReservations();
    } else {
      setOccupiedReservations([]); // Bungalov seçilmediyse rezervasyonları temizle
    }
  }, [selectedBungalow]);

  // Sistem ayarlarını yükle
  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getReservationSettings();
      if (response.data && response.data.success && response.data.data) {
        const settingsData = response.data.data;
        setSettings(prev => ({
          ...prev,
          defaultDepositAmount: parseFloat(settingsData.deposit_amount || 0),
          checkInTime: settingsData.check_in_time || '14:00',
          checkOutTime: settingsData.check_out_time || '11:00',
          confirmationEnabled: settingsData.confirmation_enabled || false,
          confirmationHours: settingsData.confirmation_hours || 24
        }));

        // Eğer confirmation_enabled true ise, confirmation_hours'u varsayılan değer olarak ayarla
        if (settingsData.confirmation_enabled) {
          setReservationData(prev => ({
            ...prev,
            confirmationHours: settingsData.confirmation_hours || 24
          }));
        }
        
      } else {
        // API yanıtı başarısız ise varsayılan değerleri kullan
        setSettings(prev => ({
          ...prev,
          defaultDepositAmount: 0,
          checkInTime: '14:00',
          checkOutTime: '11:00',
          confirmationEnabled: false,
          confirmationHours: 24
        }));
      }
    } catch (error) {
      console.error('Sistem ayarları yüklenirken hata:', error);
      // Hata durumunda varsayılan değerleri kullan
      setSettings(prev => ({
        ...prev,
        defaultDepositAmount: 0,
        checkInTime: '14:00',
        checkOutTime: '11:00',
        confirmationEnabled: false,
        confirmationHours: 24
      }));
    }
  };

  // Sistem ayarlarını yükle
  useEffect(() => {
    loadSettings();
  }, []);

  // Kopyala butonu işlevi
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(confirmationLink);
      setCopyButtonText('Kopyalandı');
      setTimeout(() => {
        setCopyButtonText('Kopyala');
      }, 2000); // 2 saniye sonra eski haline döndür
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      toastError('Kopyalama işlemi başarısız oldu');
    }
  };

  // URL parametresinden bungalov seçimi
  useEffect(() => {
    const bungalowId = searchParams.get('bungalow');
    if (bungalowId && bungalows.length > 0) {
      const bungalow = bungalows.find(b => b.id === parseInt(bungalowId));
      if (bungalow) {
        handleBungalowSelect(bungalow);
        setCurrentStep(2); // Bungalov seçildiyse 2. adıma geç
      }
    }
  }, [searchParams, bungalows]);

  // Bungalov arama filtresi
  useEffect(() => {
    if (bungalowSearch) {
      const filtered = bungalows.filter(bungalow =>
        bungalow.name.toLowerCase().includes(bungalowSearch.toLowerCase()) ||
        (bungalow.description && bungalow.description.toLowerCase().includes(bungalowSearch.toLowerCase()))
      );
      setFilteredBungalows(filtered);
    } else {
      setFilteredBungalows(bungalows);
    }
  }, [bungalowSearch, bungalows]);

  // Müşteri arama filtresi
  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone.includes(customerSearch)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearch, customers]);

  // Fiyat hesaplama
  useEffect(() => {
    if (reservationData.bungalowId && reservationData.nights > 0) {
      const bungalow = bungalows.find(b => b.id === parseInt(reservationData.bungalowId));
      if (bungalow) {
        const basePrice = (bungalow.price_per_night || 0) * reservationData.nights;
        setReservationData(prev => ({
          ...prev,
          basePrice,
          totalPrice: prev.useManualPrice ? prev.manualPrice : basePrice
        }));
      }
    }
  }, [reservationData.bungalowId, reservationData.nights, reservationData.useManualPrice, reservationData.manualPrice, bungalows]);

  // Gece sayısı hesaplama
  useEffect(() => {
    if (reservationData.checkIn && reservationData.checkOut) {
      const startDate = new Date(reservationData.checkIn);
      const endDate = new Date(reservationData.checkOut);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setReservationData(prev => ({ ...prev, nights: diffDays }));
    }
  }, [reservationData.checkIn, reservationData.checkOut]);

  // Misafir sayısına göre residents array'ini otomatik güncelle
  useEffect(() => {
    const guestCount = reservationData.guests || 0;
    const currentResidentsCount = residents.length;
    
    if (guestCount > 0) {
      // Misafir sayısından 1 çıkar (müşteri hariç)
      const additionalGuestsNeeded = guestCount - 1;
      
      if (additionalGuestsNeeded > currentResidentsCount) {
        // Eksik olan misafir alanlarını ekle
        const newResidents = [];
        for (let i = currentResidentsCount; i < additionalGuestsNeeded; i++) {
          newResidents.push({
            name: '',
            idNumber: '',
            idType: 'tc',
            phone: '',
            customerId: null,
            isRequired: true // Zorunlu alan olduğunu belirtmek için
          });
        }
        setResidents(prev => [...prev, ...newResidents]);
      } else if (additionalGuestsNeeded < currentResidentsCount) {
        // Fazla olan misafir alanlarını kaldır
        setResidents(prev => prev.slice(0, additionalGuestsNeeded));
      }
    } else {
      // Misafir sayısı 0 ise tüm residents'ları temizle
      setResidents([]);
    }
  }, [reservationData.guests]);

  // Adım ilerleme
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Bungalov seçimi
  const handleBungalowSelect = (bungalow) => {
    setSelectedBungalow(bungalow);
    setReservationData(prev => ({
      ...prev,
      bungalowId: bungalow.id,
      bungalowName: bungalow.name,
      basePrice: bungalow.price_per_night || 0
    }));
  };

  // Müşteri seçimi
  const handleCustomerSelect = (customer) => {
    // Banlı müşteri kontrolü
    if (customer.status === 'banned') {
      toastError('Bu müşteri banlanmış durumda. Rezervasyon oluşturamazsınız.');
      return;
    }
    
    setReservationData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      isNewCustomer: false
    }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  // Yeni müşteri modu
  const handleNewCustomer = () => {
    setReservationData(prev => ({
      ...prev,
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerIdNumber: '',
      customerIdType: 'tc',
      isNewCustomer: true
    }));
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  // Konaklayacak kişi ekleme
  const handleAddAdditionalGuest = () => {
    if (newAdditionalGuest.name && newAdditionalGuest.idNumber && newAdditionalGuest.phone) {
      const newResident = {
        name: newAdditionalGuest.name,
        idNumber: newAdditionalGuest.idNumber,
        idType: newAdditionalGuest.idType,
        phone: newAdditionalGuest.phone,
        customerId: null // Ek misafirler için customer_id null
      };
      
      setResidents(prev => [...prev, newResident]);
      
      // Eski additionalGuests'i de güncelle (geriye dönük uyumluluk için)
      setReservationData(prev => ({
        ...prev,
        additionalGuests: [...prev.additionalGuests, { ...newAdditionalGuest }]
      }));
      
      setNewAdditionalGuest({
        name: '',
        idNumber: '',
        idType: 'tc',
        phone: ''
      });
    }
  };

  // Konaklayacak kişi silme
  const handleRemoveAdditionalGuest = (index) => {
    setResidents(prev => prev.filter((_, i) => i !== index));
    
    // Eski additionalGuests'i de güncelle (geriye dönük uyumluluk için)
    setReservationData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((_, i) => i !== index)
    }));
  };

  // Resident bilgilerini güncelle
  const handleUpdateResident = (index, field, value) => {
    setResidents(prev => prev.map((resident, i) => 
      i === index ? { ...resident, [field]: value } : resident
    ));
  };

  // Rezervasyon oluşturma
  const handleCreateReservation = async () => {
    // Çift tıklamayı engelle
    if (loading) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Aynı tarihlerde rezervasyon olup olmadığını kontrol et
      const existingReservation = occupiedReservations.find(reservation => {
        const resCheckIn = new Date(reservation.check_in_date);
        const resCheckOut = new Date(reservation.check_out_date);
        const newCheckIn = new Date(reservationData.checkIn);
        const newCheckOut = new Date(reservationData.checkOut);
        
        // Tarih çakışması kontrolü (iptal edilen rezervasyonlar zaten filtrelenmiş)
        return (newCheckIn < resCheckOut && newCheckOut > resCheckIn) && 
               reservation.bungalow_id === parseInt(reservationData.bungalowId);
      });
      
      if (existingReservation) {
        toastError('Bu tarihlerde zaten bir rezervasyon bulunmaktadır. Lütfen farklı tarihler seçin.');
        setLoading(false);
        return;
      }
      
      // Müşteri ID'sini belirle
      let customerId;
      
      if (reservationData.isNewCustomer) {
        // Yeni müşteri oluştur - önce validasyon yap
        const missingFields = [];
        if (!reservationData.customerName || reservationData.customerName.trim() === '') {
          missingFields.push('Müşteri Adı Soyadı');
        }
        if (!reservationData.customerEmail || reservationData.customerEmail.trim() === '') {
          missingFields.push('E-posta');
        }
        if (!reservationData.customerPhone || reservationData.customerPhone.trim() === '') {
          missingFields.push('Telefon No');
        }
        // TC Kimlik No/Pasaport No artık zorunlu değil
        
        if (missingFields.length > 0) {
          toastError(`Lütfen şu alanları doldurun: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }
        
        const customerData = {
          name: reservationData.customerName.trim(),
          email: reservationData.customerEmail.trim(),
          phone: reservationData.customerPhone.trim(),
          id_number: reservationData.customerIdNumber && reservationData.customerIdNumber.trim() !== '' ? reservationData.customerIdNumber.trim() : null,
          id_type: reservationData.customerIdType || 'tc'
        };
        
        const customerResponse = await customerAPI.createCustomer(customerData);
        
        if (customerResponse.data.success) {
          customerId = customerResponse.data.data.id;
        } else {
          // Backend validation errors'ı göster
          if (customerResponse.data.errors) {
            const errorMessages = Object.values(customerResponse.data.errors).flat();
            toastError('Müşteri oluşturma hatası: ' + errorMessages.join(', '));
          } else {
            toastError(customerResponse.data.message || 'Müşteri oluşturulamadı');
          }
          setLoading(false);
          return;
        }
      } else {
        customerId = parseInt(reservationData.customerId);
      }

      // Rezervasyon verilerini hazırla
      const reservationPayload = {
        customer_id: customerId,
        bungalow_id: parseInt(reservationData.bungalowId),
        check_in_date: reservationData.checkIn,
        check_out_date: reservationData.checkOut,
        number_of_guests: reservationData.guests,
        total_price: reservationData.totalPrice,
        payment_amount: 0, // Kapora işlemi "Ödeme Ekle" ile yapılacak
        remaining_amount: reservationData.totalPrice, // Kalan tutar = toplam tutar
        notes: reservationData.notes,
        confirmation_hours: reservationData.confirmationHours
      };

      const response = await reservationAPI.createReservation(reservationPayload);
      
      if (response.data.success) {
        // Rezervasyon ID'sini sakla
        setCreatedReservationId(response.data.data.id);
        
        // Public onay linki oluştur
        const link = `${window.location.origin}/confirm/${response.data.data.confirmation_code}`;
        setConfirmationLink(link);
        
        // Müşteriye rezervasyon onay maili gönder
        try {
          // Seçili müşteriyi bul
          const selectedCustomer = reservationData.isNewCustomer 
            ? null 
            : customers.find(customer => customer.id === parseInt(reservationData.customerId));
          
          const mailData = {
            reservation_id: response.data.data.id,
            customer_email: reservationData.isNewCustomer ? reservationData.customerEmail : selectedCustomer?.email,
            customer_name: reservationData.isNewCustomer ? reservationData.customerName : selectedCustomer?.name,
            bungalow_name: selectedBungalow?.name,
            check_in_date: reservationData.checkIn,
            check_out_date: reservationData.checkOut,
            total_price: reservationData.totalPrice,
            confirmation_code: response.data.data.confirmation_code,
            confirmation_link: link,
            confirmation_hours: reservationData.confirmationHours
          };
          
          const mailResponse = await mailAPI.sendReservationConfirmation(mailData);
          
          if (mailResponse.data.success) {
            toastSuccess('Rezervasyon başarıyla oluşturuldu ve onay maili gönderildi!');
          } else {
            console.error('Mail gönderme hatası:', mailResponse.data.message);
            toastWarning('Rezervasyon oluşturuldu ancak mail gönderilemedi: ' + mailResponse.data.message);
          }
        } catch (mailError) {
          console.error('Mail gönderme hatası:', mailError);
          toastWarning('Rezervasyon oluşturuldu ancak mail gönderilemedi. Lütfen manuel olarak gönderin.');
        }
        
        setShowModal(true);
      } else {
        throw new Error(response.data.message || 'Rezervasyon oluşturulamadı');
      }
      
    } catch (error) {
      console.error('Rezervasyon oluşturma hatası:', error);
      toastError(error.response?.data?.message || 'Rezervasyon oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Adım 1: Bungalov seçimi render
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <HomeIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Bungalov Seçimi</h2>
        <p className="text-gray-500 mt-2">Rezervasyon yapmak istediğiniz bungalovu seçin</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Input
          placeholder="Bungalov ara..."
          value={bungalowSearch}
          onChange={(e) => setBungalowSearch(e.target.value)}
          leftIcon={MagnifyingGlassIcon}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bungalowsLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Bungalovlar yükleniyor...</span>
          </div>
        ) : filteredBungalows.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aktif bungalov bulunamadı</p>
          </div>
        ) : (
          filteredBungalows.map((bungalow) => (
            <div
              key={bungalow.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedBungalow?.id === bungalow.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleBungalowSelect(bungalow)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{bungalow.name}</h3>
                {selectedBungalow?.id === bungalow.id && (
                  <CheckIcon className="h-6 w-6 text-blue-600" />
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{bungalow.description || 'Açıklama bulunmuyor'}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  {bungalow.capacity} kişi
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  ₺{parseFloat(bungalow.price_per_night || 0).toLocaleString()} / gece
                </div>
              </div>
              
              {bungalow.features && bungalow.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {bungalow.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" size="xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Adım 2: Tarih seçimi render
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CalendarDaysIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Tarih ve Fiyat Seçimi</h2>
        <p className="text-gray-500 mt-2">Giriş ve çıkış tarihlerini seçin</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Takvim */}
        <div className="mb-8">
          <SimpleCalendar
            reservations={occupiedReservations}
            selectedDates={selectedDates}
            onDateClick={(day) => {
              if (!day.isCurrentMonth || day.isOccupied) return;
              
              if (!selectedDates.start) {
                // İlk tarih seçimi (giriş tarihi)
                setSelectedDates({ start: day.dateStr, end: null });
                setReservationData(prev => ({
                  ...prev,
                  checkIn: day.dateStr,
                  checkOut: ''
                }));
              } else if (!selectedDates.end) {
                // İkinci tarih seçimi (çıkış tarihi)
                if (day.dateStr >= selectedDates.start) {
                  // Geçerli tarih aralığı (aynı gün de olabilir)
                  setSelectedDates({ start: selectedDates.start, end: day.dateStr });
                  setReservationData(prev => ({
                    ...prev,
                    checkIn: selectedDates.start,
                    checkOut: day.dateStr
                  }));
                } else {
                  // Yeni başlangıç tarihi
                  setSelectedDates({ start: day.dateStr, end: null });
                  setReservationData(prev => ({
                    ...prev,
                    checkIn: day.dateStr,
                    checkOut: ''
                  }));
                }
              } else {
                // Yeni seçim başlat
                setSelectedDates({ start: day.dateStr, end: null });
                setReservationData(prev => ({
                  ...prev,
                  checkIn: day.dateStr,
                  checkOut: ''
                }));
              }
            }}
          />
        </div>

        {/* Tarih ve Misafir Bilgileri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rezervasyon Detayları</h3>
            <div className="space-y-4">
              <DateInput
                label="Giriş Tarihi"
                required
                value={reservationData.checkIn}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  const today = new Date().toISOString().split('T')[0];
                  
                  if (selectedDate < today) {
                    toastError('Geçmiş tarih seçilemez. Lütfen bugün veya gelecek bir tarih seçin.');
                    return;
                  }
                  
                  setReservationData(prev => ({ ...prev, checkIn: selectedDate }));
                  setSelectedDates(prev => ({ ...prev, start: selectedDate, end: null }));
                }}
                min={new Date().toISOString().split('T')[0]}
              />

              <DateInput
                label="Çıkış Tarihi"
                required
                value={reservationData.checkOut}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  const today = new Date().toISOString().split('T')[0];
                  const minDate = reservationData.checkIn || today;
                  
                  if (selectedDate < today) {
                    toastError('Geçmiş tarih seçilemez. Lütfen bugün veya gelecek bir tarih seçin.');
                    return;
                  }
                  
                  if (selectedDate <= reservationData.checkIn) {
                    toastError('Çıkış tarihi giriş tarihinden sonra olmalıdır.');
                    return;
                  }
                  
                  setReservationData(prev => ({ ...prev, checkOut: selectedDate }));
                  setSelectedDates(prev => ({ ...prev, end: selectedDate }));
                }}
                min={reservationData.checkIn || new Date().toISOString().split('T')[0]}
              />

              <Input
                type="number"
                label="Misafir Sayısı"
                required
                value={reservationData.guests}
                onChange={(e) => setReservationData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                min={1}
                max={selectedBungalow?.capacity || 20}
                placeholder="1"
              />
            </div>
          </div>

          {/* Fiyat Hesaplama */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Hesaplama</h3>
            {reservationData.nights > 0 ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gecelik Fiyat:</span>
                    <span className="font-medium">₺{selectedBungalow && selectedBungalow.price_per_night ? parseFloat(selectedBungalow.price_per_night).toLocaleString() : '0'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gece Sayısı:</span>
                    <span className="font-medium">{reservationData.nights} gece</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-gray-600">Hesaplanan Toplam:</span>
                    <span className="font-medium">₺{(reservationData.basePrice || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useManualPrice"
                      checked={reservationData.useManualPrice}
                      onChange={(e) => setReservationData(prev => ({ ...prev, useManualPrice: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="useManualPrice" className="text-sm text-gray-600">
                      Manuel fiyat belirle
                    </label>
                  </div>

                  {reservationData.useManualPrice && (
                    <NumberInput
                      label="Manuel Fiyat"
                      value={reservationData.manualPrice}
                      onChange={(e) => setReservationData(prev => ({ ...prev, manualPrice: parseInt(e.target.value) || 0 }))}
                      min={0}
                      placeholder="₺0"
                    />
                  )}

                  {/* Kapora Bilgisi */}
                  <div className="border-t pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm text-blue-700">
                          Kapora işlemi rezervasyon oluşturulduktan sonra "Ödeme Ekle" ile yapılacaktır.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-lg font-semibold text-gray-900">Toplam Fiyat:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₺{(reservationData.totalPrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <p className="text-yellow-800">
                  Tarih seçimi yaparak fiyat hesaplamasını görüntüleyebilirsiniz
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Adım 3: Müşteri bilgileri render
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Müşteri Bilgileri</h2>
        <p className="text-gray-500 mt-2">Kayıtlı müşteri seçin veya yeni müşteri ekleyin</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {!reservationData.isNewCustomer ? (
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Müşteri Ara"
                placeholder="Müşteri adı, email veya telefon ara..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                leftIcon={MagnifyingGlassIcon}
              />
              
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        customer.status === 'banned' 
                          ? 'bg-red-50 hover:bg-red-100 opacity-60' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.status === 'banned' && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                            Banlı
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleNewCustomer}
                className="w-full"
              >
                Yeni Müşteri Ekle
              </Button>
            </div>

            {/* Seçilen müşteri bilgileri */}
            {reservationData.customerId && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Seçilen Müşteri</h4>
                <div className="text-sm text-green-700">
                  <div className="font-medium">{reservationData.customerName}</div>
                  <div>{reservationData.customerEmail}</div>
                  <div>{reservationData.customerPhone}</div>
                </div>
              </div>
            )}

            {/* Konaklayacak Kişiler - Mevcut Müşteri Seçimi */}
            {reservationData.customerId && residents.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Konaklayacak Kişiler (Müşteri Hariç) 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({residents.length} kişi)
                  </span>
                </h4>
                
                {/* Konaklayacak kişiler form alanları */}
                <div className="space-y-4 mb-4">
                  {residents.map((resident, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">
                          Kişi {index + 1}
                          {resident.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h5>
                        {!resident.isRequired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdditionalGuest(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Ad Soyad"
                          value={resident.name}
                          onChange={(e) => handleUpdateResident(index, 'name', e.target.value)}
                          placeholder="Ad Soyad"
                          required={resident.isRequired}
                        />

                        <Select
                          label="Kimlik Türü"
                          value={resident.idType}
                          onChange={(value) => handleUpdateResident(index, 'idType', value)}
                          options={[
                            { value: 'tc', label: 'TC Kimlik No' },
                            { value: 'passport', label: 'Pasaport No' }
                          ]}
                        />

                        <Input
                          label={resident.idType === 'tc' ? 'TC Kimlik No' : 'Pasaport No'}
                          value={resident.idNumber}
                          onChange={(e) => handleUpdateResident(index, 'idNumber', e.target.value)}
                          placeholder={resident.idType === 'tc' ? '12345678901' : 'A1234567'}
                          maxLength={resident.idType === 'tc' ? 11 : 20}
                        />

                        <TelInput
                          label="Telefon No"
                          value={resident.phone}
                          onChange={(e) => handleUpdateResident(index, 'phone', e.target.value)}
                          placeholder="+90 (5XX) XXX XX XX"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Badge variant="info">Yeni Müşteri</Badge>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Müşteri Bilgileri</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Müşteri Adı Soyadı"
                  required
                  value={reservationData.customerName}
                  onChange={(e) => setReservationData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Ad Soyad"
                />

                <EmailInput
                  label="E-posta"
                  required
                  value={reservationData.customerEmail}
                  onChange={(e) => setReservationData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="email@example.com"
                />

                <TelInput
                  label="Telefon No"
                  required
                  value={reservationData.customerPhone}
                  onChange={(e) => setReservationData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+90 (5XX) XXX XX XX"
                />

                <div className="space-y-2">
                  <Select
                    label="Kimlik Türü"
                    value={reservationData.customerIdType}
                    onChange={(value) => setReservationData(prev => ({ ...prev, customerIdType: value }))}
                    options={[
                      { value: 'tc', label: 'TC Kimlik No' },
                      { value: 'passport', label: 'Pasaport No' }
                    ]}
                  />
                </div>

                <Input
                  label={reservationData.customerIdType === 'tc' ? 'TC Kimlik No' : 'Pasaport No'}
                  value={reservationData.customerIdNumber}
                  onChange={(e) => setReservationData(prev => ({ ...prev, customerIdNumber: e.target.value }))}
                  placeholder={reservationData.customerIdType === 'tc' ? '12345678901' : 'A1234567'}
                  maxLength={reservationData.customerIdType === 'tc' ? 11 : 20}
                />
              </div>
            </div>

            {/* Konaklayacak Kişiler - Yeni Müşteri */}
            {residents.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Konaklayacak Kişiler (Müşteri Hariç) 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({residents.length} kişi)
                  </span>
                </h4>
                
                {/* Konaklayacak kişiler form alanları */}
                <div className="space-y-4 mb-4">
                  {residents.map((resident, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">
                          Kişi {index + 1}
                          {resident.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h5>
                        {!resident.isRequired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdditionalGuest(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Ad Soyad"
                          value={resident.name}
                          onChange={(e) => handleUpdateResident(index, 'name', e.target.value)}
                          placeholder="Ad Soyad"
                          required={resident.isRequired}
                        />

                        <Select
                          label="Kimlik Türü"
                          value={resident.idType}
                          onChange={(value) => handleUpdateResident(index, 'idType', value)}
                          options={[
                            { value: 'tc', label: 'TC Kimlik No' },
                            { value: 'passport', label: 'Pasaport No' }
                          ]}
                        />

                        <Input
                          label={resident.idType === 'tc' ? 'TC Kimlik No' : 'Pasaport No'}
                          value={resident.idNumber}
                          onChange={(e) => handleUpdateResident(index, 'idNumber', e.target.value)}
                          placeholder={resident.idType === 'tc' ? '12345678901' : 'A1234567'}
                          maxLength={resident.idType === 'tc' ? 11 : 20}
                        />

                        <TelInput
                          label="Telefon No"
                          value={resident.phone}
                          onChange={(e) => handleUpdateResident(index, 'phone', e.target.value)}
                          placeholder="+90 (5XX) XXX XX XX"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setReservationData(prev => ({ ...prev, isNewCustomer: false }))}
                className="w-full"
              >
                Kayıtlı Müşteri Seç
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  // Adım 4: Onay render
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ClipboardDocumentCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Rezervasyon Onayı</h2>
        <p className="text-gray-500 mt-2">Rezervasyon detaylarını kontrol edin ve onaylayın</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Rezervasyon Özeti */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rezervasyon Özeti</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Bungalov:</span>
                <div className="font-medium">{reservationData.bungalowName}</div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Tarihler:</span>
                <div className="font-medium">
                  Giriş: {new Date(reservationData.checkIn).toLocaleDateString('tr-TR')} {settings.checkInTime}
                </div>
                <div className="font-medium">
                  Çıkış: {new Date(reservationData.checkOut).toLocaleDateString('tr-TR')} {settings.checkOutTime}
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Misafir Sayısı:</span>
                <div className="font-medium">{reservationData.guests} kişi</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Müşteri:</span>
                <div className="font-medium">{reservationData.customerName}</div>
                <div className="text-sm text-gray-500">{reservationData.customerEmail}</div>
                <div className="text-sm text-gray-500">{reservationData.customerPhone}</div>
                <div className="text-sm text-gray-500">
                  {reservationData.customerIdType === 'tc' ? 'TC' : 'Pasaport'}: {reservationData.customerIdNumber}
                </div>
              </div>

              {residents.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Konaklayacak Kişiler:</span>
                  <div className="space-y-1">
                    {residents.map((resident, index) => (
                      <div key={index} className="text-sm text-gray-500">
                        • {resident.name} ({resident.idType === 'tc' ? 'TC' : 'Pasaport'}: {resident.idNumber})
                        {resident.phone && <span className="ml-2">Tel: {resident.phone}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-sm text-gray-500">Fiyat Bilgileri:</span>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Toplam Fiyat:</span>
                    <span className="font-medium">₺{reservationData.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ödenen Tutar:</span>
                    <span className="font-medium text-green-600">₺0</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-sm font-semibold">Kalan Tutar:</span>
                    <span className="font-bold text-blue-600">₺{reservationData.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onay Süresi */}
        <Input
          type="number"
          label="Onay Süresi (Saat)"
          value={reservationData.confirmationHours}
          onChange={(e) => setReservationData(prev => ({ ...prev, confirmationHours: parseInt(e.target.value) || 24 }))}
          min={1}
          max={168}
          placeholder="24"
          helperText="Müşteri bu süre içinde rezervasyonu onaylamalıdır"
        />

        {/* Notlar */}
        <Textarea
          label="Notlar"
          value={reservationData.notes}
          onChange={(e) => setReservationData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Rezervasyon notları..."
          rows={3}
        />
      </div>
    </div>
  );

  // Adım geçiş kontrolü
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedBungalow !== null;
      case 2:
        return reservationData.checkIn && reservationData.checkOut && reservationData.guests > 0;
      case 3:
        // Müşteri seçimi yapıldıysa veya yeni müşteri bilgileri doldurulduysa
        const customerValid = !reservationData.isNewCustomer 
          ? (reservationData.customerId && reservationData.customerName)
          : (reservationData.customerName && 
             reservationData.customerEmail && 
             reservationData.customerPhone);
        
        // Residents verilerini kontrol et (sadece ad soyad zorunlu)
        const expectedResidentsCount = Math.max(0, (reservationData.guests || 0) - 1);
        
        let residentsValid = true;
        if (expectedResidentsCount > 0) {
          // Misafir sayısı 1'den fazlaysa residents dolu olmalı (sadece name zorunlu)
          residentsValid = residents.length === expectedResidentsCount && 
            residents.every(resident => 
              resident.name && resident.name.trim() !== ''
            );
        } else {
          // Misafir sayısı 1 ise residents boş olmalı
          residentsValid = residents.length === 0;
        }
        
        
        return customerValid && residentsValid;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Rezervasyon</h1>
              <p className="mt-2 text-gray-500">4 adımda rezervasyon oluşturun</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/reservations')}
            >
              Geri Dön
            </Button>
          </div>
        </div>

        {/* Adım Göstergesi */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <CheckIcon className="h-5 w-5" /> : step}
                </div>
                <div className="ml-3 text-sm">
                  <div className={`font-medium ${
                    step <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Bungalov'}
                    {step === 2 && 'Tarih & Fiyat'}
                    {step === 3 && 'Müşteri'}
                    {step === 4 && 'Onay'}
                  </div>
                </div>
                {step < 4 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Adım İçeriği */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Adım Navigasyon */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Önceki
          </Button>

          <div className="flex items-center gap-4">
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Sonraki
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateReservation}
                disabled={!canProceed() || loading}
                loading={loading}
                className="flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                Rezervasyon Oluştur
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Onay Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          // Modal kapandığında otomatik olarak rezervasyon detayına yönlendir
          if (createdReservationId) {
            navigate(`/reservations/${createdReservationId}`);
          }
        }}
        title="Rezervasyon Oluşturuldu!"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <CheckIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Rezervasyon başarıyla oluşturuldu!
            </h3>
            <p className="text-gray-500">
              Müşteriye onay linki gönderildi. Rezervasyon {reservationData.confirmationHours} saat içinde onaylanmalıdır.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Onay Linki:</h4>
            <div className="flex items-center gap-2">
              <Input
                value={confirmationLink}
                readOnly
                className="flex-1 bg-white"
              />
              <Button
                variant="outline"
                size="md"
                onClick={handleCopyLink}
              >
                {copyButtonText}
              </Button>
            </div>
          </div>

          <FormActions>
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                // Modal kapandığında otomatik olarak rezervasyon detayına yönlendir
                if (createdReservationId) {
                  navigate(`/reservations/${createdReservationId}`);
                }
              }}
            >
              Kapat
            </Button>
            <Button
              onClick={() => {
                setShowModal(false);
                if (createdReservationId) {
                  navigate(`/reservations/${createdReservationId}`);
                } else {
                  navigate('/reservations');
                }
              }}
            >
              {createdReservationId ? 'Rezervasyon Detayına Git' : 'Rezervasyonlara Git'}
            </Button>
          </FormActions>
        </div>
      </Modal>
    </div>
  );
};

export default CreateReservation;