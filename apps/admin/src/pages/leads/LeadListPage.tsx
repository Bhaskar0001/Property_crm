import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Kanban,
  List,
  Search,
  Plus,
  Phone,
  Mail,
  ArrowRight,
  X,
  Building,
} from 'lucide-react';
import { useLeads, useCreateLead, useChangeLeadStage } from '../../hooks/useLeads';
import { useLeadStages, useLeadSources } from '../../hooks/useAdminConfig';
import { Lead } from '../../types/lead';
import { useCountryFilter } from '../../context/CountryFilterContext';

export function LeadListPage() {
  const { selectedCountryId } = useCountryFilter();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load stages & sources
  const { data: stages = [] } = useLeadStages();
  const { data: sources = [] } = useLeadSources();

  // Load leads
  const { data, isLoading } = useLeads({
    search: search || undefined,
    stage: selectedStage || undefined,
    source: selectedSource || undefined,
    priority: selectedPriority || undefined,
    country: selectedCountryId !== 'all' ? selectedCountryId : undefined,
    limit: 100,
  });

  const leads: Lead[] = data?.data || [];
  const createLead = useCreateLead();
  const changeStage = useChangeLeadStage();

  // Create form state
  const [newLead, setNewLead] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    source: '',
    stage: '',
    priority: 'medium',
    minBudget: '',
    maxBudget: '',
    bedrooms: '',
    notes: '',
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead.mutateAsync({
      customerName: newLead.customerName,
      customerEmail: newLead.customerEmail,
      customerPhone: newLead.customerPhone,
      source: newLead.source || (sources[0]?._id ?? undefined),
      stage: newLead.stage || (stages[0]?._id ?? undefined),
      priority: newLead.priority,
      requirements: {
        minBudget: newLead.minBudget ? Number(newLead.minBudget) : undefined,
        maxBudget: newLead.maxBudget ? Number(newLead.maxBudget) : undefined,
        bedrooms: newLead.bedrooms ? Number(newLead.bedrooms) : undefined,
      },
      notes: newLead.notes,
    });
    setShowCreateModal(false);
    setNewLead({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      source: '',
      stage: '',
      priority: 'medium',
      minBudget: '',
      maxBudget: '',
      bedrooms: '',
      notes: '',
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-700">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700">Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leads & CRM Pipeline</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage inquiries, lead stages, customer requirements, and property matching.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads, customer name, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Stages</option>
          {stages.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Sources</option>
          {sources.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {(search || selectedStage || selectedSource || selectedPriority) && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedStage('');
              setSelectedSource('');
              setSelectedPriority('');
            }}
            className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <p className="text-xs text-gray-400">Loading pipeline leads...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage: any) => {
            const stageLeads = leads.filter((l) => l.stage?._id === stage._id);
            return (
              <div
                key={stage._id}
                className="w-80 shrink-0 bg-gray-50/70 rounded-xl border border-gray-200/80 p-3.5 flex flex-col max-h-[calc(100vh-250px)]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color || '#004274' }}
                    />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      {stage.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
                    >
                      <div>
                        {/* Top: Customer & Priority */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link
                            to={`/leads/${lead._id}`}
                            className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors"
                          >
                            {lead.customer?.name || 'Unnamed Client'}
                          </Link>
                          {getPriorityBadge(lead.priority)}
                        </div>

                        {/* Contact details */}
                        <div className="space-y-1 text-xs text-gray-500 mb-3">
                          {lead.customer?.email && (
                            <div className="flex items-center space-x-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{lead.customer.email}</span>
                            </div>
                          )}
                          {lead.customer?.phone && (
                            <div className="flex items-center space-x-1.5 truncate">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{lead.customer.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Associated Property or Notes */}
                        {lead.property ? (
                          <div className="flex items-center space-x-1.5 text-xs text-primary font-medium bg-blue-50/60 p-2 rounded mb-3">
                            <Building className="w-3.5 h-3.5 shrink-0 text-[#6fabca]" />
                            <span className="truncate">{lead.property.title}</span>
                          </div>
                        ) : lead.notes ? (
                          <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded mb-3">
                            {lead.notes}
                          </p>
                        ) : null}
                      </div>

                      {/* Bottom Footer: Stage Selector & Assigned Agent */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        {/* Move stage dropdown */}
                        <select
                          value={lead.stage?._id || stage._id}
                          onChange={(e) =>
                            changeStage.mutate({
                              id: lead._id,
                              stageId: e.target.value,
                            })
                          }
                          className="text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded px-1.5 py-1"
                        >
                          {stages.map((s: any) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        {/* Assigned staff initials badge */}
                        <div
                          className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                          title={lead.assignedTo?.name || 'Unassigned'}
                        >
                          {lead.assignedTo?.name?.[0] || '?'}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Property / Notes</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <p className="font-semibold text-gray-700">No leads found in pipeline</p>
                    <p className="text-xs text-gray-400 mt-1">New client booking inquiries from the website or chatbot will stream here automatically.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to={`/leads/${lead._id}`}
                      className="font-bold text-gray-900 hover:text-primary transition-colors block text-sm"
                    >
                      {lead.customer?.name || 'Unnamed Client'}
                    </Link>
                    <span className="text-gray-400 text-[11px] block">{lead.customer?.email}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-700">
                      {lead.source?.name || 'Website'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-0.5 rounded font-bold text-white uppercase text-[10px]"
                      style={{ backgroundColor: lead.stage?.color || '#004274' }}
                    >
                      {lead.stage?.name || 'New'}
                    </span>
                  </td>

                  <td className="px-6 py-4">{getPriorityBadge(lead.priority)}</td>

                  <td className="px-6 py-4 font-medium text-gray-800">
                    {lead.assignedTo?.name || 'Unassigned'}
                  </td>

                  <td className="px-6 py-4 max-w-xs truncate">
                    {lead.property?.title || lead.notes || '—'}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/leads/${lead._id}`}
                      className="inline-flex items-center space-x-1 text-primary hover:underline font-semibold"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-4">Register New Lead</h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLead.customerName}
                  onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
                  placeholder="e.g. Marcus Aurelius"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newLead.customerEmail}
                    onChange={(e) => setNewLead({ ...newLead, customerEmail: e.target.value })}
                    placeholder="marcus@example.com"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newLead.customerPhone}
                    onChange={(e) => setNewLead({ ...newLead, customerPhone: e.target.value })}
                    placeholder="+353 87 000 0000"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="">Default (Website)</option>
                    {sources.map((s: any) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Notes / Acquisition Requirements
                </label>
                <textarea
                  rows={3}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Target area, budget parameters, timeline..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={createLead.isPending}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {createLead.isPending ? 'Registering...' : 'Create Lead'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
