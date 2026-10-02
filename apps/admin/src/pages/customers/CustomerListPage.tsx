import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Heart,
  Eye,
  Building,
  X,
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  totalLeads: number;
  totalViewings: number;
  totalFavorites: number;
  lastLoginAt?: string;
  createdAt: string;
}

export function CustomerListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Fetch customers
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: async () => {
      const res = await api.get('/customers', {
        params: { page, limit: 15, search: search || undefined },
      });
      return res.data.data;
    },
  });

  // Fetch customer 360 detail
  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ['admin-customer-detail', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const res = await api.get(`/customers/detail/${selectedCustomerId}`);
      return res.data.data;
    },
    enabled: !!selectedCustomerId,
  });

  const customers: Customer[] = data?.customers || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registered Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Directory of client accounts, active enquiries, viewing requests, and saved portfolios.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-sm">Loading customer directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium">No registered customers found</p>
            <p className="text-xs text-gray-400 mt-1">
              Customer accounts are registered when clients verify email OTP or submit enquiries on the website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Active Leads</th>
                  <th className="py-3 px-4 text-center">Viewings</th>
                  <th className="py-3 px-4 text-center">Saved Properties</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{c.name || 'Unnamed Client'}</div>
                      <div className="text-xs text-gray-500">{c.country || 'Global'}</div>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center text-xs text-gray-600 gap-1.5">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center text-xs text-gray-600 gap-1.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {c.totalLeads}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {c.totalViewings}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                        {c.totalFavorites}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(c._id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#004274] hover:text-[#002b4d] bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Profile 360</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {customers.length} of {pagination.total} clients
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer 360 Detail Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {detailData?.customer?.name || 'Customer Profile'}
                </h2>
                <p className="text-xs text-gray-500">
                  Client ID: {selectedCustomerId}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {isDetailLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  {/* Contact Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[11px] text-gray-400 uppercase font-semibold">Email</span>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {detailData?.customer?.email}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[11px] text-gray-400 uppercase font-semibold">Phone</span>
                      <p className="text-sm font-medium text-gray-900">
                        {detailData?.customer?.phone || 'Not provided'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[11px] text-gray-400 uppercase font-semibold">Registered</span>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(detailData?.customer?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Associated Leads */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-[#004274]" />
                      CRM Leads ({detailData?.leads?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {detailData?.leads?.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No leads registered</p>
                      ) : (
                        detailData?.leads?.map((l: any) => (
                          <div
                            key={l._id}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-gray-800">
                                {l.property?.title || 'General Property Enquiry'}
                              </span>
                              <div className="text-gray-500 mt-0.5">
                                Stage: <span className="font-medium text-blue-600">{l.stage?.name || 'Active'}</span> • Source: {l.source?.name || 'Website'}
                              </div>
                            </div>
                            <span className="text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Viewing Appointments */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#004274]" />
                      Viewing Bookings ({detailData?.viewings?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {detailData?.viewings?.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No viewings booked</p>
                      ) : (
                        detailData?.viewings?.map((v: any) => (
                          <div
                            key={v._id}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-gray-800">
                                {v.property?.title || 'Selected Property'}
                              </span>
                              <div className="text-gray-500 mt-0.5">
                                Status: <span className="font-medium capitalize text-emerald-600">{v.status}</span> • Slot: {v.scheduledTime}
                              </div>
                            </div>
                            <span className="text-gray-500 font-medium">
                              {new Date(v.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Saved Properties */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-500" />
                      Saved Portfolio ({detailData?.favorites?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {detailData?.favorites?.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No saved favorites</p>
                      ) : (
                        detailData?.favorites?.map((f: any) => (
                          <div
                            key={f._id}
                            className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3 text-xs"
                          >
                            {f.property?.coverImage && (
                              <img
                                src={f.property.coverImage}
                                alt=""
                                className="h-10 w-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-gray-800 truncate block">
                                {f.property?.title || 'Property'}
                              </span>
                              <span className="text-gray-500">
                                {f.property?.address}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-right">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition"
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
