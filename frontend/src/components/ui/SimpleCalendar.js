import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const SimpleCalendar = ({ 
  reservations = [], 
  onDateClick, 
  selectedDates = { start: null, end: null }, 
  initialDate = null,
  excludeReservationId = null, // Bu rezervasyonu "dolu" olarak gösterme
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  // initialDate değiştiğinde currentDate'i güncelle
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  // Ay isimleri
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Gün isimleri
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Takvim verilerini hesapla
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    // Ayın ilk gününün hafta içi (0 = Pazar, 1 = Pazartesi)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
    
    const days = [];
    const current = new Date(startDate);
    
    // 6 hafta (42 gün) göster
    for (let i = 0; i < 42; i++) {
      // Türkiye yerel saatine göre YYYY-MM-DD formatında tarih oluştur
      const year = current.getFullYear();
      const monthStr = String(current.getMonth() + 1).padStart(2, '0');
      const dayStr = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      
      // Bu tarihte rezervasyon var mı kontrol et (excludeReservationId hariç)
      const dayReservations = reservations.filter(res => {
        // Hariç tutulacak rezervasyonu filtrele
        if (excludeReservationId && res.id === excludeReservationId) {
          return false;
        }
        const checkIn = new Date(res.checkInDate);
        const checkOut = new Date(res.checkOutDate);
        return current >= checkIn && current < checkOut;
      });
      
      // Giriş ve çıkış tarihlerini kontrol et (Türkiye yerel saati, excludeReservationId hariç)
      const isCheckIn = reservations.some(res => {
        // Hariç tutulacak rezervasyonu filtrele
        if (excludeReservationId && res.id === excludeReservationId) {
          return false;
        }
        const checkInDate = new Date(res.checkInDate);
        const checkInYear = checkInDate.getFullYear();
        const checkInMonth = String(checkInDate.getMonth() + 1).padStart(2, '0');
        const checkInDay = String(checkInDate.getDate()).padStart(2, '0');
        const checkInDateStr = `${checkInYear}-${checkInMonth}-${checkInDay}`;
        return checkInDateStr === dateStr;
      });
      
      const isCheckOut = reservations.some(res => {
        // Hariç tutulacak rezervasyonu filtrele
        if (excludeReservationId && res.id === excludeReservationId) {
          return false;
        }
        const checkOutDate = new Date(res.checkOutDate);
        const checkOutYear = checkOutDate.getFullYear();
        const checkOutMonth = String(checkOutDate.getMonth() + 1).padStart(2, '0');
        const checkOutDay = String(checkOutDate.getDate()).padStart(2, '0');
        const checkOutDateStr = `${checkOutYear}-${checkOutMonth}-${checkOutDay}`;
        return checkOutDateStr === dateStr;
      });
      
      // Aynı günde giriş ve çıkış yapılabilir (giriş 14:00, çıkış 11:00)
      // Bu yüzden sadece tam olarak dolu olan günleri "dolu" olarak işaretle
      const isOccupied = dayReservations.length > 0 && !isCheckOut;
      
      // Seçili tarih aralığı kontrolü
      const isSelected = selectedDates.start && selectedDates.end && 
        dateStr >= selectedDates.start && dateStr <= selectedDates.end;
      const isStartSelected = selectedDates.start === dateStr;
      const isEndSelected = selectedDates.end === dateStr;
      
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth,
        isToday,
        isOccupied,
        isCheckIn,
        isCheckOut,
        isSelected,
        isStartSelected,
        isEndSelected,
        reservations: dayReservations
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarData = getCalendarData();

  // Ay değiştirme
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Bugüne git
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Tarih tıklama
  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;
    // Sadece tamamen dolu olan günleri engelle (çıkış günleri seçilebilir)
    if (day.isOccupied) return;
    
    // Geçmiş tarihleri engelle
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
    if (day.date < today) return;
    
    if (onDateClick) {
      onDateClick(day);
    }
  };

  // Gün sınıflarını belirle
  const getDayClasses = (day) => {
    let classes = 'relative p-4 text-center text-sm cursor-pointer transition-all duration-200 rounded-md min-h-[40px] flex items-center justify-center ';
    
    // Geçmiş tarih kontrolü
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = day.date < today;
    
    if (!day.isCurrentMonth) {
      classes += 'text-gray-300 cursor-not-allowed ';
    } else if (isPastDate) {
      classes += 'text-gray-400 bg-gray-100 cursor-not-allowed ';
    } else if (day.isToday) {
      classes += 'bg-blue-100 text-blue-900 font-bold border-2 border-blue-500 ';
    } else {
      // Seçilebilir günler için gri arka plan
      classes += 'text-gray-900 bg-gray-50 ';
    }
    
    // Rezervasyon durumları
    if (day.isOccupied) {
      classes += 'bg-red-100 text-red-800 border border-red-300 cursor-not-allowed ';
    }
    
    if (day.isCheckIn) {
      classes += 'bg-red-50 text-red-800 border border-red-300 ';
    }
    
    if (day.isCheckOut) {
      classes += 'bg-red-50 text-red-800 border border-red-300 ';
    }
    
    // Seçili tarih aralığı
    if (day.isSelected) {
      classes += 'bg-green-100 text-green-900 border border-green-300 ';
    }
    
    if (day.isStartSelected || day.isEndSelected) {
      classes += 'bg-green-200 text-green-900 font-bold border-2 border-green-500 ';
    }
    
    // Hover efekti (sadece seçilebilir günler için)
    if (day.isCurrentMonth && !day.isOccupied && !day.isCheckIn && !day.isCheckOut && !isPastDate) {
      classes += 'hover:bg-gray-200 hover:shadow-sm ';
    }
    
    return classes;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Takvim Başlığı */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Bugün
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Gün Başlıkları */}
      <div className="grid grid-cols-7 gap-1 p-4">
        {dayNames.map(day => (
          <div key={day} className="p-4 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Takvim Grid */}
      <div className="grid grid-cols-7 gap-1 p-4">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={getDayClasses(day)}
            onClick={() => handleDateClick(day)}
            title={
              day.reservations.length > 0 
                ? `${day.reservations.length} rezervasyon` 
                : day.isCurrentMonth ? 'Boş' : ''
            }
          >
            <span className="text-sm font-medium">
              {day.date.getDate()}
            </span>
            
            {/* Rezervasyon göstergeleri */}
            {day.isCheckIn && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            {day.isCheckOut && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
            {day.isOccupied && !day.isCheckIn && !day.isCheckOut && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Alt Bilgi */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-gray-600">Seçilebilir</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 text-gray-400 rounded"></div>
            <span className="text-gray-600">Geçmiş</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-50 border border-red-300 rounded"></div>
            <span className="text-gray-600">Giriş</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-50 border border-red-300 rounded"></div>
            <span className="text-gray-600">Çıkış</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Dolu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 border border-green-500 rounded"></div>
            <span className="text-gray-600">Seçili</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendar;
