import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, parseISO, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const Calendar = ({ 
  selectedDates, 
  onDateSelect, 
  occupiedDates = [], 
  minDate = null,
  maxDate = null,
  className = ''
}) => {
  const [events, setEvents] = useState([]);

  // Dolu tarihleri event olarak ekle
  useEffect(() => {
    const occupiedEvents = occupiedDates.map(date => ({
      id: `occupied-${date}`,
      start: date,
      end: date,
      display: 'background',
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      classNames: ['occupied-date']
    }));

    setEvents(occupiedEvents);
  }, [occupiedDates]);

  // Tarih seçimi
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    const today = new Date().toISOString().split('T')[0];
    
    // Geçmiş tarihleri seçmeyi engelle
    if (clickedDate < today) {
      return;
    }

    // Dolu tarihleri seçmeyi engelle
    if (occupiedDates.includes(clickedDate)) {
      return;
    }

    if (!selectedDates.start) {
      // İlk tarih seçimi
      onDateSelect({ start: clickedDate, end: null });
    } else if (!selectedDates.end) {
      // İkinci tarih seçimi
      if (clickedDate > selectedDates.start) {
        // Geçerli tarih aralığı
        onDateSelect({ start: selectedDates.start, end: clickedDate });
      } else if (clickedDate < selectedDates.start) {
        // Yeni başlangıç tarihi
        onDateSelect({ start: clickedDate, end: null });
      } else {
        // Aynı tarih - seçimi sıfırla
        onDateSelect({ start: null, end: null });
      }
    } else {
      // Yeni seçim başlat
      onDateSelect({ start: clickedDate, end: null });
    }
  };

  // Seçili tarih aralığını event olarak ekle
  useEffect(() => {
    if (selectedDates.start && selectedDates.end) {
      const selectionEvent = {
        id: 'date-selection',
        start: selectedDates.start,
        end: addDays(parseISO(selectedDates.end), 1).toISOString().split('T')[0],
        display: 'background',
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        classNames: ['selected-date-range']
      };

      setEvents(prev => [
        ...prev.filter(event => event.id !== 'date-selection'),
        selectionEvent
      ]);
    } else if (selectedDates.start) {
      const selectionEvent = {
        id: 'date-selection',
        start: selectedDates.start,
        end: addDays(parseISO(selectedDates.start), 1).toISOString().split('T')[0],
        display: 'background',
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        classNames: ['selected-date-range']
      };

      setEvents(prev => [
        ...prev.filter(event => event.id !== 'date-selection'),
        selectionEvent
      ]);
    }
  }, [selectedDates]);

  // Tarih aralığındaki dolu günleri kontrol et
  const hasOccupiedDatesInRange = (start, end) => {
    if (!start || !end) return false;
    
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
      const dateStr = date.toISOString().split('T')[0];
      if (occupiedDates.includes(dateStr)) {
        return true;
      }
    }
    return false;
  };

  // Gece sayısını hesapla
  const calculateNights = () => {
    if (selectedDates.start && selectedDates.end) {
      return differenceInDays(parseISO(selectedDates.end), parseISO(selectedDates.start));
    }
    return 0;
  };

  return (
    <div className={`calendar-container ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Tarih Seçimi</h3>
          {selectedDates.start && selectedDates.end && (
            <div className="text-sm text-gray-600">
              {calculateNights()} gece
            </div>
          )}
        </div>
        
        {selectedDates.start && selectedDates.end && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-800">
              <strong>Seçilen Tarihler:</strong> {format(parseISO(selectedDates.start), 'dd MMMM yyyy', { locale: tr })} - {format(parseISO(selectedDates.end), 'dd MMMM yyyy', { locale: tr })}
            </div>
            {hasOccupiedDatesInRange(selectedDates.start, selectedDates.end) && (
              <div className="text-sm text-red-600 mt-1">
                ⚠️ Seçilen tarih aralığında dolu günler bulunmaktadır
              </div>
            )}
          </div>
        )}
      </div>

      <div className="calendar-legend mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Seçili Tarihler</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Dolu Tarihler</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Müsait Tarihler</span>
          </div>
        </div>
      </div>

      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          locale="tr"
          firstDay={1} // Pazartesi ile başla
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          events={events}
          height="auto"
          dayCellContent={(info) => {
            const dateStr = info.date.toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            const isPast = dateStr < today;
            const isOccupied = occupiedDates.includes(dateStr);
            
            return (
              <div className={`day-cell ${isPast ? 'past-day' : ''} ${isOccupied ? 'occupied-day' : ''}`}>
                {info.dayNumberText}
              </div>
            );
          }}
          eventContent={(info) => {
            if (info.event.display === 'background') {
              return null;
            }
            return info.event.title;
          }}
          validRange={{
            start: minDate || new Date().toISOString().split('T')[0],
            end: maxDate
          }}
          dayCellClassNames={(info) => {
            const dateStr = info.date.toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            const classes = [];
            
            if (dateStr < today) {
              classes.push('past-date');
            }
            
            if (occupiedDates.includes(dateStr)) {
              classes.push('occupied-date');
            }
            
            return classes;
          }}
        />
      </div>

      <style jsx>{`
        .calendar-container {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }
        
        .calendar-wrapper {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .day-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-weight: 500;
        }
        
        .past-day {
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .occupied-day {
          color: #ef4444;
          cursor: not-allowed;
        }
        
        :global(.fc-daygrid-day.past-date) {
          background-color: #f9fafb;
          color: #9ca3af;
        }
        
        :global(.fc-daygrid-day.occupied-date) {
          background-color: #fef2f2;
          color: #ef4444;
        }
        
        :global(.fc-daygrid-day:hover:not(.past-date):not(.occupied-date)) {
          background-color: #eff6ff;
        }
        
        :global(.fc-daygrid-day.fc-day-today) {
          background-color: #dbeafe;
          border: 2px solid #3b82f6;
        }
        
        :global(.fc-event.occupied-date) {
          background-color: #ef4444;
          border-color: #dc2626;
        }
        
        :global(.fc-event.selected-date-range) {
          background-color: #3b82f6;
          border-color: #2563eb;
        }
        
        :global(.fc-toolbar-title) {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        
        :global(.fc-button) {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
        }
        
        :global(.fc-button:hover) {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        :global(.fc-button:disabled) {
          background-color: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
        }
        
        :global(.fc-daygrid-day-number) {
          font-weight: 500;
          color: #374151;
        }
        
        :global(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
          color: #1d4ed8;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
