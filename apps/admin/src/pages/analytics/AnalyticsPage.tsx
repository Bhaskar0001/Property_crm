import { useState } from 'react';
import {
  BarChart,
  Download,
  Upload,
  Building,
  Users,
  Award,
  Filter,
  Eye,
  MessageCircle,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  usePropertyAnalytics,
  useLeadAnalytics,
  useStaffAnalytics,
  useImportProperties,
  useImportLeads,
  downloadCsvExport,
} from '../../hooks/useAnalytics';

export function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'properties' | 'leads' | 'staff'>('properties');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'properties' | 'leads'>('properties');
  const [rawCsvText, setRawCsvText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);

  const { data: propData, isLoading: isLoadingProps } = usePropertyAnalytics(range);
  const { data: leadData, isLoading: isLoadingLeads } = useLeadAnalytics(range);
  const { data: staffData = [], isLoading: isLoadingStaff } = useStaffAnalytics(range);

  const importPropertiesMutation = useImportProperties();
  const importLeadsMutation = useImportLeads();

  const handleExport = async (type: 'properties' | 'leads') => {
    try {
      await downloadCsvExport(type);
    } catch {
      alert(`Failed to export ${type} data.`);
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawCsvText.trim()) {
      alert('Please paste CSV text or enter records');
      return;
    }

    try {
      const lines = rawCsvText.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must contain a header row and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx];
        });
        return obj;
      });

      if (importType === 'properties') {
        importPropertiesMutation.mutate(rows, {
          onSuccess: (res) => {
            setImportResult(res);
          },
        });
      } else {
        importLeadsMutation.mutate(rows, {
          onSuccess: (res) => {
            setImportResult(res);
          },
        });
      }
    } catch {
      alert('Error parsing CSV input. Please verify formatting.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            <BarChart className="w-6 h-6 mr-2 text-primary" />
            Advanced Analytics & Intelligence
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Property performance, lead conversion funnel, staff leaderboard, and CSV import/export.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Range Selector */}
          <div className="flex items-center space-x-1.5 bg-white border border-gray-300 rounded-md px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="365d">This Year</option>
            </select>
          </div>

          {/* Import / Export Controls */}
          <button
            onClick={() => {
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-md text-xs font-semibold text-gray-700 shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5 mr-1 text-primary" /> Import Data
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleExport('properties')}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-md text-xs font-semibold text-gray-700 shadow-xs transition"
              title="Export properties catalog as CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Properties CSV
            </button>
            <button
              onClick={() => handleExport('leads')}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-md text-xs font-semibold text-gray-700 shadow-xs transition"
              title="Export leads database as CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Leads CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 px-4">
          {[
            { id: 'properties', label: 'Property Intelligence', icon: Building },
            { id: 'leads', label: 'Lead Funnel & Conversion', icon: Users },
            { id: 'staff', label: 'Staff Leaderboard', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-3.5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Property Intelligence */}
        {activeTab === 'properties' && (
          <div className="p-6 space-y-6">
            {isLoadingProps ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading property stats...</div>
            ) : (
              <>
                {/* Categories & Country Distributions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* By Status */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                      Listings by Status
                    </h3>
                    <div className="space-y-2">
                      {propData?.byStatus?.map((s: any) => (
                        <div key={s.name} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{s.name}</span>
                          <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border">
                            {s.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Country */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                      Listings by Country
                    </h3>
                    <div className="space-y-2">
                      {propData?.byCountry?.map((c: any) => (
                        <div key={c.name} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{c.name}</span>
                          <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border">
                            {c.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Property Type */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                      Listings by Asset Type
                    </h3>
                    <div className="space-y-2">
                      {propData?.byType?.map((t: any) => (
                        <div key={t.name} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{t.name}</span>
                          <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border">
                            {t.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Viewed & Top Enquired Properties */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  {/* Top 5 Most Viewed */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                      <Eye className="w-4 h-4 mr-1.5 text-primary" /> Most Viewed Listings
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {propData?.topViewed?.map((p: any) => (
                        <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="truncate max-w-xs">
                            <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                            <p className="text-[11px] text-gray-500">{p.city}</p>
                          </div>
                          <span className="font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                            {p.viewCount || 0} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top 5 Most Enquired */}
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-600" /> Highest Inquiry Volume
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {propData?.topEnquired?.map((p: any) => (
                        <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="truncate max-w-xs">
                            <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                            <p className="text-[11px] text-gray-500">{p.city}</p>
                          </div>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                            {p.enquiryCount || 0} inquiries
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Lead Funnel & Conversion */}
        {activeTab === 'leads' && (
          <div className="p-6 space-y-6">
            {isLoadingLeads ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading funnel data...</div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Overall Pipeline Conversion</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Percentage of registered leads that conclude in accepted deal contracts.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-primary">
                      {leadData?.overallConversionRate}%
                    </span>
                    <p className="text-[11px] text-gray-500 uppercase font-semibold">Lead to Won</p>
                  </div>
                </div>

                {/* Funnel Stages Progression */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Conversion Funnel Stages
                  </h3>
                  {leadData?.funnel?.map((step: any) => (
                    <div key={step.stage} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800">{step.stage}</span>
                        <span className="font-bold text-primary">
                          {step.count} ({step.percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(5, step.percent)}%` }}
                          className="h-full bg-primary rounded-full transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Staff Leaderboard */}
        {activeTab === 'staff' && (
          <div className="p-6">
            {isLoadingStaff ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading staff metrics...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase">
                        Staff Member
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase">Role</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-600 uppercase">
                        Leads Handled
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-600 uppercase">
                        Tasks Completed
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-600 uppercase">
                        Viewings
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-600 uppercase">
                        Deals Closed
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 uppercase">
                        Agreed Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffData.map((staff: any, idx: number) => (
                      <tr key={staff._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-bold text-gray-400 w-4">#{idx + 1}</span>
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{staff.name}</p>
                              <p className="text-[10px] text-gray-500">{staff.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center font-semibold">
                          {staff.leadsCount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">
                          {staff.completedTasks}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">
                          {staff.viewingsConducted}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-emerald-600">
                          {staff.dealsClosed}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-gray-900">
                          €{staff.dealVolume.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-primary mb-1">
              <FileSpreadsheet className="w-5 h-5" />
              <h3 className="text-base font-bold text-gray-900">Bulk CSV / Excel Data Import</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Paste standard comma-separated records with a header row to batch import listings or leads.
            </p>

            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setImportType('properties');
                  setImportResult(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold ${
                  importType === 'properties'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Import Properties
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('leads');
                  setImportResult(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold ${
                  importType === 'leads' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Import Leads
              </button>
            </div>

            {importResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                  <div className="flex items-center text-emerald-800 font-bold text-sm mb-1">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Import Finished
                  </div>
                  <p className="text-xs text-emerald-700">
                    Total rows: <strong>{importResult.total}</strong> | Successfully Created:{' '}
                    <strong>{importResult.created}</strong> | Skipped / Duplicates:{' '}
                    <strong>{importResult.skipped}</strong>
                  </p>
                </div>

                {importResult.errors?.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 space-y-1">
                    <p className="font-bold flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Notes / Non-fatal issues:
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {importResult.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-primary text-white rounded text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">CSV Data Text</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (importType === 'properties') {
                          setRawCsvText(
                            'title,price,city,area,bedrooms,bathrooms\n"Fitzwilliam Luxury Penthouse",1250000,"Dublin","Dublin 2",3,3\n"Ballinteer Family Residence",680000,"Dublin","Ballinteer",4,2'
                          );
                        } else {
                          setRawCsvText(
                            'name,email,phone,notes\n"David Kelly","david.kelly@example.com","+353871234567","Interested in Dublin 4 apartments"\n"Emma Walsh","emma.w@example.com","+353861234568","Looking to purchase within 30 days"'
                          );
                        }
                      }}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Insert Sample Format
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={rawCsvText}
                    onChange={(e) => setRawCsvText(e.target.value)}
                    placeholder="title,price,city,area,bedrooms,bathrooms..."
                    className="w-full text-xs font-mono border border-gray-300 rounded p-2.5 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 border rounded text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      importPropertiesMutation.isPending || importLeadsMutation.isPending
                    }
                    className="px-4 py-2 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-dark disabled:opacity-50"
                  >
                    {importPropertiesMutation.isPending || importLeadsMutation.isPending
                      ? 'Importing...'
                      : 'Upload & Process Batch'}
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
