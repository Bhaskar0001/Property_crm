import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProperties, useTogglePublishProperty, useDeleteProperty, useImportProperties, downloadPropertiesCsv } from '../../hooks/useProperties';
import { useCountries, usePropertyTypes, usePropertyStatuses } from '../../hooks/useAdminConfig';
import { Plus, Search, Image as ImageIcon, FileText, Edit, Trash2, ExternalLink, Download, Upload, CheckCircle2 } from 'lucide-react';
import { useCountryFilter } from '../../context/CountryFilterContext';
import { Modal } from '@/components/common/Modal';

export function PropertyListPage() {
  const { selectedCountryId } = useCountryFilter();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [country, setCountry] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [status, setStatus] = useState('');
  const [published, setPublished] = useState('');

  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== search) {
      setSearch(urlQuery);
    }
  }, [searchParams]);


  const effectiveCountry = selectedCountryId !== 'all' ? selectedCountryId : (country || undefined);

  const { data: propertiesResponse, isLoading } = useProperties({
    page,
    limit: 10,
    search: search || undefined,
    country: effectiveCountry,
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
  const importProperties = useImportProperties();

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadPropertiesCsv({
        country: effectiveCountry,
        propertyType: propertyType || undefined,
        status: status || undefined,
        isPublished: published === 'true' ? true : published === 'false' ? false : undefined,
      });
    } catch (err: any) {
      alert('Failed to export properties CSV: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert('File must contain a header row and at least one data row');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.replace(/^["']|["']$/g, '').trim());
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        return row;
      });

      setImportRows(rows);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (importRows.length === 0) return;
    try {
      const result = await importProperties.mutateAsync(importRows);
      setImportResult(result);
    } catch (err: any) {
      alert('Import failed: ' + (err?.response?.data?.error?.message || err.message));
    }
  };

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
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <Download className="mr-1.5 h-4 w-4 text-gray-500" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => {
              setImportRows([]);
              setImportResult(null);
              setImportModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <Upload className="mr-1.5 h-4 w-4 text-gray-500" />
            Import CSV
          </button>
          <Link
            to="/properties/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#004274] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00335a] transition"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Property
          </Link>
        </div>
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
            value={effectiveCountry || ''}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
          >
            <option value="">{selectedCountryId !== 'all' ? 'Default (Global Filter)' : 'All Countries'}</option>
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
                        <a
                          href={`http://localhost:3000/properties/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Website"
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
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

      {/* Import CSV Modal */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Batch Import Properties (CSV)
          </h3>

          {!importResult ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select CSV File with Property Headers (Title, Price, City, Area, etc.)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {importRows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 font-semibold">
                    Detected {importRows.length} properties to import. Preview (First 3 rows):
                  </div>
                  <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(importRows[0] || {}).slice(0, 5).map((col) => (
                            <th key={col} className="p-1.5 font-bold border-b text-gray-700">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 3).map((r, i) => (
                          <tr key={i} className="border-b">
                            {Object.values(r).slice(0, 5).map((val: any, j) => (
                              <td key={j} className="p-1.5 truncate max-w-[120px] text-gray-600">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importRows.length === 0 || importProperties.isPending}
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {importProperties.isPending ? 'Importing...' : `Confirm & Import (${importRows.length})`}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                Import Complete!
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-xl font-bold text-gray-900">{importResult.total}</div>
                  <div className="text-xs text-gray-500">Total Rows</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <div className="text-xl font-bold text-emerald-600">{importResult.created}</div>
                  <div className="text-xs text-emerald-700 font-semibold">Created</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                  <div className="text-xl font-bold text-amber-600">{importResult.skipped}</div>
                  <div className="text-xs text-amber-700 font-semibold">Skipped / Duplicates</div>
                </div>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-1">
                  <strong>Errors Encountered:</strong>
                  {importResult.errors.slice(0, 3).map((err: string, i: number) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-2 border-t">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
