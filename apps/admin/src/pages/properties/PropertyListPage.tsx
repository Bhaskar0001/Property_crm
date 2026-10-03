import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperties, useTogglePublishProperty, useDeleteProperty } from '../../hooks/useProperties';
import { useCountries, usePropertyTypes, usePropertyStatuses } from '../../hooks/useAdminConfig';
import { Plus, Search, Image as ImageIcon, FileText, Edit, Trash2 } from 'lucide-react';

export function PropertyListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [status, setStatus] = useState('');
  const [published, setPublished] = useState('');

  const { data: propertiesResponse, isLoading } = useProperties({
    page,
    limit: 10,
    search: search || undefined,
    country: country || undefined,
    propertyType: propertyType || undefined,
    status: status || undefined,
    isPublished: published === 'true' ? true : published === 'false' ? false : undefined,
  });

  const { data: countriesData } = useCountries();
  const { data: propertyTypesData } = usePropertyTypes();
  const { data: statusesData } = usePropertyStatuses();

  const countries = Array.isArray(countriesData) ? countriesData : (countriesData as any)?.data || [];
  const propertyTypes = Array.isArray(propertyTypesData) ? propertyTypesData : (propertyTypesData as any)?.data || [];
  const statuses = Array.isArray(statusesData) ? statusesData : (statusesData as any)?.data || [];

  const togglePublish = useTogglePublishProperty();
  const deleteProperty = useDeleteProperty();

  const properties = Array.isArray(propertiesResponse?.data)
    ? propertiesResponse.data
    : Array.isArray(propertiesResponse)
    ? propertiesResponse
    : [];
  const pagination = propertiesResponse?.pagination;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">Manage listings, publication status, media, and legal documents.</p>
        </div>
        <Link
          to="/properties/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#004274] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00335a] transition"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, ref, address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
            />
          </div>

          {/* Country */}
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
          >
            <option value="">All Countries</option>
            {(countries || []).map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Property Type */}
          <select
            value={propertyType}
            onChange={(e) => {
              setPropertyType(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
          >
            <option value="">All Types</option>
            {(propertyTypes || []).map((t: any) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
          >
            <option value="">All Statuses</option>
            {(statuses || []).map((s: any) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          {/* Published */}
          <select
            value={published}
            onChange={(e) => {
              setPublished(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
          >
            <option value="">All Publication</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>
        </div>
      </div>

      {/* Property Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No properties found matching criteria.</p>
            <Link to="/properties/new" className="mt-3 inline-block text-sm text-[#004274] font-semibold hover:underline">
              Create your first property listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p: any) => (
                  <tr key={p._id} className="hover:bg-gray-50/80 transition">
                    {/* Title & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                          {p.coverImage ? (
                            <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <Link to={`/properties/${p._id}/edit`} className="font-semibold text-gray-900 hover:text-[#004274]">
                            {p.title}
                          </Link>
                          <div className="text-xs text-gray-500 mt-0.5">Ref: {p.internalReference || p.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                        {p.propertyType?.name || 'Property'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {p.priceOnRequest ? (
                        <span className="text-xs text-gray-500 italic">Price on request</span>
                      ) : p.price ? (
                        `${p.currency?.symbol || '€'}${Number(p.price).toLocaleString()}`
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-gray-600">
                      <div>{p.city || p.region || '—'}</div>
                      <div className="text-xs text-gray-400">{p.country?.name}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-xs"
                        style={{ backgroundColor: p.status?.color || '#4B5563' }}
                      >
                        {p.status?.name || 'Draft'}
                      </span>
                    </td>

                    {/* Publish Switch */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePublish.mutate({ id: p._id, isPublished: !p.isPublished })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          p.isPublished ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            p.isPublished ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/properties/${p._id}/media`}
                          title="Media & Documents"
                          className="p-1.5 text-gray-500 hover:text-[#004274] hover:bg-gray-100 rounded-lg transition"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/properties/${p._id}/media?tab=documents`}
                          title="Documents"
                          className="p-1.5 text-gray-500 hover:text-[#004274] hover:bg-gray-100 rounded-lg transition"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/properties/${p._id}/edit`}
                          title="Edit"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete/archive this property?')) {
                              deleteProperty.mutate(p._id);
                            }
                          }}
                          title="Delete"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing page <span className="font-semibold text-gray-900">{page}</span> of{' '}
              <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
