import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  List,
  MapPin,
  User,
  Phone,
  X,
} from 'lucide-react';
import { useViewingCalendar, useUpdateViewingStatus, Viewing } from '../../hooks/useViewings';

export function ViewingCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate calendar boundaries for the current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Fetch range: cover whole visible calendar grid
  const rangeFrom = new Date(year, month - 1, 20).toISOString();
  const rangeTo = new Date(year, month + 1, 10).toISOString();

  const { data: viewings = [] } = useViewingCalendar(rangeFrom, rangeTo);
  const updateStatusMutation = useUpdateViewingStatus();

  // Map viewings by date string YYYY-MM-DD
  const viewingsByDate = useMemo(() => {
    const map: Record<string, Viewing[]> = {};
    for (const v of viewings) {
      if (!v.scheduledDate) continue;
      const dStr = new Date(v.scheduledDate).toISOString().split('T')[0];
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(v);
    }
    return map;
  }, [viewings]);

  // Generate grid days
  const calendarDays = useMemo(() => {
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const startDay = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDays = lastDayOfMonth.getDate();

    // Previous month padding
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      const dStr = d.toISOString().split('T')[0];
      days.push({ date: d, dateStr: dStr, isCurrentMonth: false, isToday: false });
    }

    // Current month days
    const todayStr = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
      });
    }

    // Next month padding (complete grid to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({ date: d, dateStr: dStr, isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [year, month, firstDayOfMonth, lastDayOfMonth]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Viewing Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visual schedule of upcoming property tours, site visits, and key turnovers.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/viewings"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <List className="w-4 h-4 mr-2 text-primary" />
            Table List View
          </Link>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 border rounded-md hover:bg-gray-50 text-gray-600 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 border rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 border rounded-md hover:bg-gray-50 text-gray-600 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 ml-2">{monthName}</h2>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
            Confirmed
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5" />
            Requested
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-1.5" />
            Completed
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center py-2.5 text-xs font-semibold text-gray-600">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
          {calendarDays.map((cell, idx) => {
            const dayViewings = viewingsByDate[cell.dateStr] || [];

            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 transition-colors flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-gray-50/50 text-gray-400'
                    : cell.isToday
                    ? 'bg-blue-50/30'
                    : 'bg-white hover:bg-gray-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      cell.isToday
                        ? 'bg-primary text-white'
                        : cell.isCurrentMonth
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {dayViewings.length > 0 && (
                    <span className="text-[10px] font-bold text-gray-400">
                      {dayViewings.length} {dayViewings.length === 1 ? 'viewing' : 'viewings'}
                    </span>
                  )}
                </div>

                {/* Day Viewings Cards */}
                <div className="space-y-1 overflow-y-auto max-h-[85px]">
                  {dayViewings.map((v) => {
                    const st = (v.status || '').toUpperCase();
                    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (st === 'CONFIRMED') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (st === 'COMPLETED') badgeColor = 'bg-gray-50 text-gray-600 border-gray-200';
                    if (st === 'CANCELLED') badgeColor = 'bg-red-50 text-red-600 border-red-200';

                    return (
                      <button
                        key={v._id}
                        onClick={() => setSelectedViewing(v)}
                        className={`w-full text-left p-1 rounded border text-[11px] font-medium leading-tight truncate block ${badgeColor} hover:shadow-xs transition`}
                      >
                        <span className="font-bold mr-1">{v.scheduledTime}</span>
                        <span>{v.property?.title || 'Property'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viewing Detail Modal / Drawer */}
      {selectedViewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedViewing(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              {selectedViewing.property?.coverImage ? (
                <img
                  src={selectedViewing.property.coverImage}
                  alt=""
                  className="w-16 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <MapPin className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {selectedViewing.property?.title}
                </h3>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  {selectedViewing.property?.city || 'Location unset'}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-md text-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-white border">
                  {selectedViewing.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Date & Time</span>
                <span className="font-medium text-xs text-gray-800">
                  {new Date(selectedViewing.scheduledDate).toLocaleDateString()} at{' '}
                  {selectedViewing.scheduledTime} ({selectedViewing.duration || 30} mins)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Client</span>
                <span className="font-medium text-xs text-gray-800 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  {selectedViewing.customer?.name || 'Walk-in'}
                </span>
              </div>
              {selectedViewing.customer?.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Phone</span>
                  <a
                    href={`tel:${selectedViewing.customer.phone}`}
                    className="text-xs text-primary font-medium flex items-center hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    {selectedViewing.customer.phone}
                  </a>
                </div>
              )}
              {selectedViewing.notes && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500 block mb-0.5">Notes:</span>
                  <p className="text-xs text-gray-700 italic">{selectedViewing.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              {selectedViewing.status?.toUpperCase() === 'REQUESTED' && (
                <button
                  onClick={() => {
                    updateStatusMutation.mutate({
                      id: selectedViewing._id,
                      status: 'CONFIRMED',
                    });
                    setSelectedViewing(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700"
                >
                  Confirm Appointment
                </button>
              )}
              {selectedViewing.status?.toUpperCase() === 'CONFIRMED' && (
                <button
                  onClick={() => {
                    updateStatusMutation.mutate({
                      id: selectedViewing._id,
                      status: 'COMPLETED',
                    });
                    setSelectedViewing(null);
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-xs font-semibold hover:bg-black"
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => setSelectedViewing(null)}
                className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
