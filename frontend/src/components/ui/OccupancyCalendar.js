import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const OccupancyCalendar = ({ 
  bungalowId, 
  reservations = [], 
  onDateClick,
  className = '' 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Takvim verilerini hesapla
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    // Ayın ilk gününün hafta içi (0 = Pazar)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // 6 hafta (42 gün) göster
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      
      // Bu tarihte rezervasyon var mı kontrol et
      const dayReservations = reservations.filter(res => {
        const checkIn = new Date(res.checkInDate);
        const checkOut = new Date(res.checkOutDate);
        return current >= checkIn && current < checkOut;
      });
      
      const isOccupied = dayReservations.length > 0;
      const isCheckIn = reservations.some(res => res.checkInDate === dateStr);
      const isCheckOut = reservations.some(res => res.checkOutDate === dateStr);
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth,
        isToday,
        isOccupied,
        isCheckIn,
        isCheckOut,
        reservations: dayReservations
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, reservations]);

  // Ay ve yıl değiştirme
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Gün tıklama
  const handleDateClick = (day) => {
    if (onDateClick) {
      onDateClick(day);
    }
  };

  // Doluluk oranını hesapla
  const occupancyRate = useMemo(() => {
    const currentMonthDays = calendarData.filter(day => day.isCurrentMonth);
    const occupiedDays = currentMonthDays.filter(day => day.isOccupied).length;
    return currentMonthDays.length > 0 ? Math.round((occupiedDays / currentMonthDays.length) * 100) : 0;
  }, [calendarData]);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Takvim Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Doluluk Takvimi</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">Dolu</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-sm text-gray-600">Giriş</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-600">Çıkış</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Doluluk Oranı: <span className="font-semibold text-gray-900">{occupancyRate}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Takvim Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Gün başlıkları */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Takvim günleri */}
        {calendarData.map((day, index) => {
          const getDayClasses = () => {
            let classes = 'p-2 text-center text-sm cursor-pointer transition-colors rounded-md ';
            
            if (!day.isCurrentMonth) {
              classes += 'text-gray-300 ';
            } else if (day.isToday) {
              classes += 'bg-blue-100 text-blue-900 font-semibold ';
            } else {
              classes += 'text-gray-900 ';
            }
            
            if (day.isOccupied) {
              classes += 'bg-green-100 border border-green-300 ';
            }
            
            if (day.isCheckIn) {
              classes += 'bg-blue-100 border border-blue-300 ';
            }
            
            if (day.isCheckOut) {
              classes += 'bg-red-100 border border-red-300 ';
            }
            
            if (day.isCurrentMonth && !day.isOccupied && !day.isCheckIn && !day.isCheckOut) {
              classes += 'hover:bg-gray-100 ';
            }
            
            return classes;
          };

          return (
            <div
              key={index}
              className={getDayClasses()}
              onClick={() => handleDateClick(day)}
              title={
                day.reservations.length > 0 
                  ? `${day.reservations.length} rezervasyon` 
                  : 'Boş'
              }
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Alt bilgi */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Bu ay toplam {calendarData.filter(day => day.isCurrentMonth).length} gün
          </div>
          <div>
            Dolu günler: {calendarData.filter(day => day.isCurrentMonth && day.isOccupied).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyCalendar;
