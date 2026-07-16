import React, { useState } from 'react';
import { SearchOutlined, LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import NepaliDate from 'nepali-date-converter';

const StudentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new NepaliDate());
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchDate, setSearchDate] = useState('');

  const nepaliMonths = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangshir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];

  const nepaliDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = {
    2080: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2081: [31, 31, 32, 32, 31, 30, 30, 30, 30, 29, 30, 30]
  };

  const events = {
    '2081-07-20': { title: 'Team Meeting', type: 'work' },
    '2081-07-25': { title: 'Birthday Party', type: 'celebration' },
    '2081-07-15': { title: 'Project Deadline', type: 'deadline' },
    '2081-08-15': { title: 'Tihar Festival', type: 'festival' },
    '2081-09-25': { title: 'Christmas', type: 'holiday' },
    '2081-09-30': { title: 'New Year Eve', type: 'holiday' },
    '2081-10-01': { title: 'New Year 2025', type: 'holiday' }
  };

  const eventDotColor = {
    work: 'bg-indigo-500',
    celebration: 'bg-amber-500',
    festival: 'bg-violet-500',
    holiday: 'bg-rose-500',
    deadline: 'bg-orange-500',
  };

  const getDaysInMonth = (bsDate) => {
    const year = bsDate.getYear();
    const month = bsDate.getMonth();
    return daysInMonth[year]?.[month] || daysInMonth[2081][month];
  };

  const generateCalendarDays = () => {
    const year = currentDate.getYear();
    const month = currentDate.getMonth();
    const startDay = new NepaliDate(year, month, 1).getDay();
    const totalDays = getDaysInMonth(currentDate);

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(new NepaliDate(year, month, i));
    }
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new NepaliDate();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getYear() === today.getYear();
  };

  const getUpcomingEvents = () => {
    const today = new NepaliDate();
    return Object.entries(events)
      .map(([date, event]) => ({ date, ...event }))
      .filter(event => {
        const [year, month, day] = event.date.split('-').map(Number);
        const eventDate = new NepaliDate(year, month - 1, day);
        return eventDate.valueOf() >= today.valueOf();
      })
      .sort((a, b) => {
        const [yearA, monthA, dayA] = a.date.split('-').map(Number);
        const [yearB, monthB, dayB] = b.date.split('-').map(Number);
        return new NepaliDate(yearA, monthA - 1, dayA).valueOf() -
               new NepaliDate(yearB, monthB - 1, dayB).valueOf();
      })
      .slice(0, 3);
  };

  const compareDates = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getYear() === date2.getYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const handleSearch = () => {
    const [year, month, day] = searchDate.split('-').map(Number);
    if (year && month && day) {
      setCurrentDate(new NepaliDate(year, month - 1, day));
      setSelectedDate(new NepaliDate(year, month - 1, day));
    }
  };

  const selectedEventKey = selectedDate &&
    `${selectedDate.getYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
      {/* Calendar */}
      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200 md:p-6">
        <div className="flex flex-col gap-4 pb-4 mb-6 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarOutlined className="text-lg text-indigo-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900">Nepali calendar</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchOutlined className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
              <input
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="YYYY-MM-DD"
                aria-label="Search date"
                className="py-2 pr-3 text-sm border rounded-lg w-36 border-slate-200 pl-9 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-40"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-3 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            >
              Go
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setCurrentDate(new NepaliDate(currentDate.getYear(), currentDate.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="p-2 transition-colors rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <LeftOutlined />
          </button>
          <h3 className="text-base font-semibold text-slate-900">
            {nepaliMonths[currentDate.getMonth()]} {currentDate.getYear()}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentDate(new NepaliDate(currentDate.getYear(), currentDate.getMonth() + 1, 1))}
            aria-label="Next month"
            className="p-2 transition-colors rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RightOutlined />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {nepaliDays.map(day => (
            <div key={day} className="py-1.5 text-center text-xs font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays().map((date, index) => {
            const key = date && `${date.getYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const event = key && events[key];
            const today = isToday(date);
            const selected = compareDates(selectedDate, date);
            return (
              <button
                key={index}
                type="button"
                onClick={() => date && setSelectedDate(date)}
                disabled={!date}
                aria-current={today ? 'date' : undefined}
                aria-pressed={selected}
                className={`
                  relative aspect-square rounded-lg p-1 text-center transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${!date ? 'invisible' : ''}
                  ${today ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-700 hover:bg-slate-100'}
                  ${selected && !today ? 'ring-2 ring-indigo-400' : ''}
                `}
              >
                {date && (
                  <>
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    {event && (
                      <span
                        className={`absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                          today ? 'bg-white' : eventDotColor[event.type] || 'bg-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-6">
        <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Upcoming events</h3>
          <div className="space-y-2">
            {getUpcomingEvents().length === 0 && (
              <p className="text-sm text-slate-400">No upcoming events</p>
            )}
            {getUpcomingEvents().map((event, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 p-3 transition-colors border rounded-lg border-slate-100 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <span className={`h-1.5 w-1.5 rounded-full ${eventDotColor[event.type] || 'bg-slate-400'}`} />
                  {event.title}
                </span>
                <span className="text-xs text-slate-500">{event.date}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedDate && selectedEventKey && events[selectedEventKey] && (
          <div className="p-5 border border-indigo-100 rounded-xl bg-indigo-50">
            <p className="mb-1 text-xs font-medium tracking-wide text-indigo-500 uppercase">Selected date</p>
            <h4 className="text-base font-semibold text-slate-900">
              {events[selectedEventKey].title}
            </h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCalendar;