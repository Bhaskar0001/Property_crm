import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  CalendarDays,
  Search,
  Check,
  RotateCcw,
  X,
  UserX,
  Phone,
  Mail,
} from 'lucide-react';
import {
  useViewings,
  useCreateViewing,
  useUpdateViewingStatus,
  Viewing,
} from '../../hooks/useViewings';
import { useProperties } from '../../hooks/useProperties';

export function ViewingListPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: 'complete' | 'reschedule' | 'cancel' | null;
    viewing: Viewing | null;
  }>({ type: null, viewing: null });

  // Form inputs for modals
  const [feedbackInput, setFeedbackInput] = useState('');
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00');

  // Booking form state
  const [bookForm, setBookForm] = useState({
    propertyId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    scheduledDate: '',
    scheduledTime: '11:00',
    duration: 30,
    notes: '',
  });

  const { data, isLoading } = useViewings({
    status: statusFilter === 'all' ? undefined : statusFilter,
    from: fromDate || undefined,
    to: toDate || undefined,
    page,
    limit: 20,
  });

  const { data: propertiesData } = useProperties({ limit: 100 });
  const properties = propertiesData?.data || [];

  const createViewingMutation = useCreateViewing();
  const updateStatusMutation = useUpdateViewingStatus();

  const viewings = data?.viewings || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  // Filter client-side by search
  const filteredViewings = viewings.filter((v) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.property?.title?.toLowerCase().includes(term) ||
      v.customer?.name?.toLowerCase().includes(term) ||
      v.customer?.email?.toLowerCase().includes(term) ||
      v.property?.city?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmed
          </span>
        );
      case 'REQUESTED':
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 mr-1" /> Requested
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <Check className="w-3.5 h-3.5 mr-1" /> Completed
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Rescheduled
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelled
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <UserX className="w-3.5 h-3.5 mr-1" /> No-Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleConfirm = (viewing: Viewing) => {
    updateStatusMutation.mutate({
      id: viewing._id,
      status: 'CONFIRMED',
    });
  };

  const handleNoShow = (viewing: Viewing) => {
    if (window.confirm('Mark this customer as No-Show for this appointment?')) {
      updateStatusMutation.mutate({
        id: viewing._id,
        status: 'NO_SHOW',
      });
    }
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.viewing) return;

    if (actionModal.type === 'complete') {
      updateStatusMutation.mutate(
        {
          id: actionModal.viewing._id,
          status: 'COMPLETED',
          feedback: feedbackInput,
        },
        {
          onSuccess: () => {
            setActionModal({ type: null, viewing: null });
            setFeedbackInput('');
          },
        }
      );
    } else if (actionModal.type === 'cancel') {
      updateStatusMutation.mutate(
        {
          id: actionModal.viewing._id,
          status: 'CANCELLED',
          cancelReason: cancelReasonInput,
        },
        {
          onSuccess: () => {
            setActionModal({ type: null, viewing: null });
            setCancelReasonInput('');
          },
        }
      );
    } else if (actionModal.type === 'reschedule') {
      if (!rescheduleDate) {
        alert('Please select a new date');
        return;
      }
      updateStatusMutation.mutate(
        {
          id: actionModal.viewing._id,
          status: 'RESCHEDULED',
          rescheduledDate: rescheduleDate,
          rescheduledTime: rescheduleTime,
        },
        {
          onSuccess: () => {
            setActionModal({ type: null, viewing: null });
            setRescheduleDate('');
          },
        }
      );
    }
  };

  const handleCreateViewing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.propertyId || !bookForm.scheduledDate) {
      alert('Please fill in required fields: Property and Scheduled Date');
      return;
    }

    createViewingMutation.mutate(bookForm, {
      onSuccess: () => {
        setIsBookModalOpen(false);
        setBookForm({
          propertyId: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          scheduledDate: '',
          scheduledTime: '11:00',
          duration: 30,
          notes: '',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Viewing Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage physical and virtual property viewings, inspections, and customer feedback.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/viewings/calendar"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <CalendarDays className="w-4 h-4 mr-2 text-primary" />
            Calendar View
          </Link>
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book Viewing
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          {[
            { id: 'all', label: 'All Viewings' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'REQUESTED', label: 'Requested' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'RESCHEDULED', label: 'Rescheduled' },
            { id: 'CANCELLED', label: 'Cancelled' },
            { id: 'NO_SHOW', label: 'No Show' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Date Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by property, customer, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Viewings List Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading viewings...</div>
        ) : filteredViewings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-900">No viewings found</p>
            <p className="text-sm text-gray-500 mt-1">
              There are no viewing appointments matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advisor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredViewings.map((viewing) => (
                  <tr key={viewing._id} className="hover:bg-gray-50 transition-colors">
                    {/* Property */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {viewing.property?.coverImage ? (
                          <img
                            src={viewing.property.coverImage}
                            alt=""
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate max-w-xs">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {viewing.property?.title || 'Unknown Property'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                            {viewing.property?.city || viewing.property?.area || 'Location unset'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 flex items-center">
                          <User className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {viewing.customer?.name || 'Walk-in / Inquirer'}
                        </p>
                        {viewing.customer?.phone && (
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {viewing.customer.phone}
                          </p>
                        )}
                        {viewing.customer?.email && (
                          <p className="text-xs text-gray-400 flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {viewing.customer.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(viewing.scheduledDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1 text-primary" />
                        {viewing.scheduledTime} ({viewing.duration || 30} mins)
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(viewing.status)}
                      {viewing.feedback && (
                        <p className="text-xs text-gray-500 mt-1 italic truncate max-w-xs">
                          "{viewing.feedback}"
                        </p>
                      )}
                      {viewing.cancelReason && (
                        <p className="text-xs text-red-500 mt-1 truncate max-w-xs">
                          {viewing.cancelReason}
                        </p>
                      )}
                    </td>

                    {/* Advisor */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {viewing.assignedTo ? (
                        <span className="font-medium text-gray-800">{viewing.assignedTo.name}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      {viewing.status?.toUpperCase() === 'REQUESTED' && (
                        <button
                          onClick={() => handleConfirm(viewing)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                        >
                          Confirm
                        </button>
                      )}
                      {viewing.status?.toUpperCase() === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => setActionModal({ type: 'complete', viewing })}
                            className="px-2.5 py-1 bg-gray-800 text-white rounded hover:bg-black transition"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'reschedule', viewing })}
                            className="px-2.5 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleNoShow(viewing)}
                            className="px-2.5 py-1 border border-purple-300 text-purple-700 rounded hover:bg-purple-50 transition"
                          >
                            No Show
                          </button>
                        </>
                      )}
                      {['REQUESTED', 'CONFIRMED'].includes(viewing.status?.toUpperCase()) && (
                        <button
                          onClick={() => setActionModal({ type: 'cancel', viewing })}
                          className="px-2.5 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book Viewing Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Book Property Viewing</h2>
            <form onSubmit={handleCreateViewing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Property *
                </label>
                <select
                  required
                  value={bookForm.propertyId}
                  onChange={(e) => setBookForm({ ...bookForm, propertyId: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">-- Choose a property --</option>
                  {properties.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.city || 'No City'}) - {p.price ? `€${p.price.toLocaleString()}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Conroy"
                    value={bookForm.customerName}
                    onChange={(e) => setBookForm({ ...bookForm, customerName: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client Phone</label>
                  <input
                    type="text"
                    placeholder="+353 87 123 4567"
                    value={bookForm.customerPhone}
                    onChange={(e) => setBookForm({ ...bookForm, customerPhone: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Email</label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={bookForm.customerEmail}
                  onChange={(e) => setBookForm({ ...bookForm, customerEmail: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookForm.scheduledDate}
                    onChange={(e) => setBookForm({ ...bookForm, scheduledDate: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={bookForm.scheduledTime}
                    onChange={(e) => setBookForm({ ...bookForm, scheduledTime: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (Min)</label>
                  <select
                    value={bookForm.duration}
                    onChange={(e) => setBookForm({ ...bookForm, duration: Number(e.target.value) })}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Key lockbox code, access details or buyer requirements..."
                  value={bookForm.notes}
                  onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createViewingMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                >
                  {createViewingMutation.isPending ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Dialog (Complete, Reschedule, Cancel) */}
      {actionModal.type && actionModal.viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setActionModal({ type: null, viewing: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {actionModal.type === 'complete' && (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Mark Viewing Completed</h3>
                <p className="text-sm text-gray-500">
                  Record buyer feedback or vendor notes for {actionModal.viewing.property?.title}.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Client Feedback & Observations
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Client loved the light and garden. Mentioned submitting offer shortly."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActionModal({ type: null, viewing: null })}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700"
                  >
                    Save & Mark Complete
                  </button>
                </div>
              </form>
            )}

            {actionModal.type === 'reschedule' && (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Reschedule Viewing</h3>
                <p className="text-sm text-gray-500">
                  Select a new date and time for {actionModal.viewing.property?.title}.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">New Date *</label>
                    <input
                      type="date"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">New Time</label>
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md p-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActionModal({ type: null, viewing: null })}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600"
                  >
                    Reschedule Appointment
                  </button>
                </div>
              </form>
            )}

            {actionModal.type === 'cancel' && (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 text-red-600">Cancel Viewing</h3>
                <p className="text-sm text-gray-500">
                  Provide reason for cancelling viewing on {actionModal.viewing.property?.title}.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cancellation Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Client withdrew interest / Vendor unavailable."
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActionModal({ type: null, viewing: null })}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
