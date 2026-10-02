import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  DollarSign,
  ArrowRight,
  X,
  FileCheck,
  Building,
} from 'lucide-react';
import {
  useOffers,
  useCreateOffer,
  useUpdateOfferStatus,
  Offer,
} from '../../hooks/useOffers';
import { useProperties } from '../../hooks/useProperties';

export function OfferListPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: 'counter' | 'accept' | 'reject' | null;
    offer: Offer | null;
  }>({ type: null, offer: null });

  // Inputs
  const [counterAmountInput, setCounterAmountInput] = useState<number | ''>('');
  const [notesInput, setNotesInput] = useState('');

  // Submit Offer form state
  const [submitForm, setSubmitForm] = useState({
    propertyId: '',
    amount: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    conditions: '',
    notes: '',
  });

  const { data, isLoading } = useOffers({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 20,
  });

  const { data: propertiesData } = useProperties({ limit: 100 });
  const properties = propertiesData?.data || [];

  const createOfferMutation = useCreateOffer();
  const updateStatusMutation = useUpdateOfferStatus();

  const offers = data?.offers || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const stats = data?.stats || {
    total: 0,
    pending: 0,
    countered: 0,
    accepted: 0,
    totalVolume: 0,
  };

  const filteredOffers = offers.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.property?.title?.toLowerCase().includes(term) ||
      o.buyerName?.toLowerCase().includes(term) ||
      o.customer?.name?.toLowerCase().includes(term) ||
      o.buyerEmail?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accepted (Deal Won)
          </span>
        );
      case 'COUNTER_OFFER':
      case 'COUNTERED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Counter Offer
          </span>
        );
      case 'SUBMITTED':
      case 'PENDING':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 mr-1" /> Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Rejected
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Withdrawn
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

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.offer) return;

    if (actionModal.type === 'counter') {
      if (!counterAmountInput || Number(counterAmountInput) <= 0) {
        alert('Please specify a valid counter offer amount');
        return;
      }
      updateStatusMutation.mutate(
        {
          id: actionModal.offer._id,
          status: 'COUNTER_OFFER',
          counterAmount: Number(counterAmountInput),
          notes: notesInput,
        },
        {
          onSuccess: () => {
            setActionModal({ type: null, offer: null });
            setCounterAmountInput('');
            setNotesInput('');
          },
        }
      );
    } else if (actionModal.type === 'accept') {
      updateStatusMutation.mutate(
        {
          id: actionModal.offer._id,
          status: 'ACCEPTED',
          notes: notesInput || 'Offer accepted by vendor.',
        },
        {
          onSuccess: () => {
            setActionModal({ type: null, offer: null });
            setNotesInput('');
          },
        }
      );
    } else if (actionModal.type === 'reject') {
      updateStatusMutation.mutate(
        {
          id: actionModal.offer._id,
          status: 'REJECTED',
          notes: notesInput || 'Offer declined by vendor.',
        },
        {
          onSuccess: () => {
            setActionModal({ type: null, offer: null });
            setNotesInput('');
          },
        }
      );
    }
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.propertyId || !submitForm.amount) {
      alert('Please fill in required fields: Property and Amount');
      return;
    }

    createOfferMutation.mutate(
      {
        propertyId: submitForm.propertyId,
        amount: Number(submitForm.amount),
        buyerName: submitForm.buyerName,
        buyerEmail: submitForm.buyerEmail,
        buyerPhone: submitForm.buyerPhone,
        conditions: submitForm.conditions,
        notes: submitForm.notes,
      },
      {
        onSuccess: () => {
          setIsSubmitModalOpen(false);
          setSubmitForm({
            propertyId: '',
            amount: '',
            buyerName: '',
            buyerEmail: '',
            buyerPhone: '',
            conditions: '',
            notes: '',
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Offers & Negotiations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track purchase offers, counter negotiations, and progression to sales agreed deals.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/offers/deals"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileCheck className="w-4 h-4 mr-2 text-primary" />
            Deal Pipeline
          </Link>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register Offer
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Offers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Counters</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.countered}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agreed Deal Volume</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              €{stats.totalVolume.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'SUBMITTED', label: 'Under Review' },
            { id: 'COUNTER_OFFER', label: 'Counter Offers' },
            { id: 'ACCEPTED', label: 'Accepted (Deals)' },
            { id: 'REJECTED', label: 'Rejected' },
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

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search offers by property title, buyer name, or buyer email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading offers...</div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-900">No offers found</p>
            <p className="text-sm text-gray-500 mt-1">
              There are no offers matching the selected filter criteria.
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
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asking Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offer Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer) => {
                  const symbol = offer.currency?.symbol || '€';
                  const isOverAsking = offer.varianceAmount >= 0;

                  return (
                    <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                      {/* Property */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {offer.property?.coverImage ? (
                            <img
                              src={offer.property.coverImage}
                              alt=""
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                              <Building className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate max-w-xs">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {offer.property?.title || 'Unknown Property'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {offer.property?.city || 'Location unset'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Buyer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">
                            {offer.buyerName || offer.customer?.name || 'Prospective Buyer'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {offer.buyerEmail || offer.customer?.email || 'No email'}
                          </p>
                          {offer.buyerPhone && (
                            <p className="text-xs text-gray-400">{offer.buyerPhone}</p>
                          )}
                        </div>
                      </td>

                      {/* Asking Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {symbol}
                        {offer.askingPrice ? offer.askingPrice.toLocaleString() : 'N/A'}
                      </td>

                      {/* Offer Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {symbol}
                          {offer.amount.toLocaleString()}
                        </div>
                        {offer.counterAmount && (
                          <div className="text-xs text-amber-600 font-semibold">
                            Counter: {symbol}
                            {offer.counterAmount.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Variance */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {offer.askingPrice > 0 ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              isOverAsking
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <TrendingUp
                              className={`w-3 h-3 mr-1 ${!isOverAsking && 'rotate-180'}`}
                            />
                            {isOverAsking ? '+' : ''}
                            {offer.variancePercent}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(offer.status)}
                        {offer.conditions && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            Subject to: {offer.conditions}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                        {['SUBMITTED', 'UNDER_REVIEW', 'COUNTER_OFFER'].includes(
                          (offer.status || '').toUpperCase()
                        ) && (
                          <>
                            <button
                              onClick={() => setActionModal({ type: 'accept', offer })}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                setActionModal({ type: 'counter', offer });
                                setCounterAmountInput(offer.counterAmount || offer.amount);
                              }}
                              className="px-2.5 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition"
                            >
                              Counter
                            </button>
                            <button
                              onClick={() => setActionModal({ type: 'reject', offer })}
                              className="px-2.5 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(offer.status || '').toUpperCase() === 'ACCEPTED' && (
                          <Link
                            to="/offers/deals"
                            className="inline-flex items-center px-2.5 py-1 text-primary hover:underline font-semibold"
                          >
                            View Deal Pipeline <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Register Offer Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Register Formal Offer</h2>
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Property *
                </label>
                <select
                  required
                  value={submitForm.propertyId}
                  onChange={(e) => setSubmitForm({ ...submitForm, propertyId: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">-- Choose a property --</option>
                  {properties.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.title} - Asking: {p.price ? `€${p.price.toLocaleString()}` : 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Offer Amount (€) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 525000"
                  value={submitForm.amount}
                  onChange={(e) => setSubmitForm({ ...submitForm, amount: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Buyer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patrick O'Brien"
                    value={submitForm.buyerName}
                    onChange={(e) => setSubmitForm({ ...submitForm, buyerName: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer Phone</label>
                  <input
                    type="text"
                    placeholder="+353 87 987 6543"
                    value={submitForm.buyerPhone}
                    onChange={(e) => setSubmitForm({ ...submitForm, buyerPhone: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Buyer Email</label>
                <input
                  type="email"
                  placeholder="buyer@example.com"
                  value={submitForm.buyerEmail}
                  onChange={(e) => setSubmitForm({ ...submitForm, buyerEmail: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Conditions / Financing Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subject to loan approval & bank valuation / Cash buyer with proof of funds"
                  value={submitForm.conditions}
                  onChange={(e) => setSubmitForm({ ...submitForm, conditions: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or notes..."
                  value={submitForm.notes}
                  onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOfferMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                >
                  {createOfferMutation.isPending ? 'Registering...' : 'Register Formal Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Dialog (Accept, Counter, Reject) */}
      {actionModal.type && actionModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setActionModal({ type: null, offer: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {actionModal.type === 'accept' && (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-gray-900">Accept Offer</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Accept the offer of{' '}
                  <strong className="text-gray-900">
                    €{actionModal.offer.amount.toLocaleString()}
                  </strong>{' '}
                  for{' '}
                  <strong className="text-gray-900">
                    {actionModal.offer.property?.title}
                  </strong>
                  .
                </p>
                <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200 text-xs text-emerald-800">
                  ⚡ <strong>Automated Actions:</strong> Property status will change to "Sale Agreed /
                  Under Offer", the CRM Lead stage will advance to "Offer Accepted", and the deal will
                  enter the legal conveyancing pipeline.
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Acceptance Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Vendor accepted subject to 21-day contract signing."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActionModal({ type: null, offer: null })}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700"
                  >
                    Confirm Acceptance & Start Deal
                  </button>
                </div>
              </form>
            )}

            {actionModal.type === 'counter' && (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <RotateCcw className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-gray-900">Issue Counter Offer</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Current buyer offer:{' '}
                  <strong>€{actionModal.offer.amount.toLocaleString()}</strong>. Asking price:{' '}
                  <strong>€{actionModal.offer.askingPrice.toLocaleString()}</strong>.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Counter Offer Amount (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={counterAmountInput}
                    onChange={(e) => setCounterAmountInput(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-md p-2 font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Note to Buyer / Negotiation Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Vendor is willing to include kitchen fixtures at this price."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActionModal({ type: null, offer: null })}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600"
                  >
                    Send Counter Offer
                  </button>
                </div>
              </form>
            )}

            {actionModal.type === 'reject' && (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-gray-900">Decline / Reject Offer</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Decline offer of <strong>€{actionModal.offer.amount.toLocaleString()}</strong> for{' '}
                  {actionModal.offer.property?.title}.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reason / Feedback to Buyer
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Offer is significantly below vendor valuation."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActionModal({ type: null, offer: null })}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Decline Offer
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
