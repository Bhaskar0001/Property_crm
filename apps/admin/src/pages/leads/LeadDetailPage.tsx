import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Sparkles,
  Plus,
  Send,
  Building,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  useLead,
  useChangeLeadStage,
  useAssignLead,
  useAddLeadNote,
  useMatchProperties,
  useCreateLeadTask,
  useUpdateTaskStatus,
} from '../../hooks/useLeads';
import { useLeadStages, useStaffList } from '../../hooks/useAdminConfig';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useLead(id || '');
  const { data: stages = [] } = useLeadStages();
  const { data: staffList = [] } = useStaffList();

  const changeStage = useChangeLeadStage();
  const assignLead = useAssignLead();
  const addNote = useAddLeadNote();
  const matchProperties = useMatchProperties();
  const createTask = useCreateLeadTask();
  const updateTaskStatus = useUpdateTaskStatus();

  // State for new note
  const [noteText, setNoteText] = useState('');
  // State for new task
  const [taskForm, setTaskForm] = useState({
    title: '',
    dueDate: '',
    dueTime: '10:00',
    priority: 'normal',
  });
  const [showTaskForm, setShowTaskForm] = useState(false);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-gray-200">
        <p className="text-xs text-gray-400">Loading lead details...</p>
      </div>
    );
  }

  if (!data?.lead) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-gray-900">Lead Not Found</h2>
        <Link to="/leads" className="text-xs text-primary hover:underline mt-2 inline-block">
          Return to Leads
        </Link>
      </div>
    );
  }

  const { lead, activities = [], tasks = [] } = data;

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !id) return;
    await addNote.mutateAsync({ id, description: noteText.trim() });
    setNoteText('');
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !id) return;
    await createTask.mutateAsync({
      id,
      data: {
        title: taskForm.title.trim(),
        dueDate: taskForm.dueDate || undefined,
        dueTime: taskForm.dueTime,
        priority: taskForm.priority,
      },
    });
    setTaskForm({ title: '', dueDate: '', dueTime: '10:00', priority: 'normal' });
    setShowTaskForm(false);
  };

  // WhatsApp click-to-chat
  const whatsappNumber = lead.customer?.phone?.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hello ${lead.customer?.name || ''}, this is regarding your inquiry with AbroadAccommodation.`
      )}`
    : `https://wa.me/?text=${encodeURIComponent(`Hello ${lead.customer?.name || ''}, this is AbroadAccommodation.`)}`;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/leads"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Leads</span>
        </Link>
      </div>

      {/* Main Lead Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Lead ID: #{lead._id.slice(-6)}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-semibold text-primary">
              Source: {lead.source?.name || 'Website'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {lead.customer?.name || 'Client Lead'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
            {lead.customer?.email && (
              <a
                href={`mailto:${lead.customer.email}`}
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{lead.customer.email}</span>
              </a>
            )}
            {lead.customer?.phone && (
              <a
                href={`tel:${lead.customer.phone}`}
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{lead.customer.phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Action Controls: Stage, Agent, WhatsApp */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Stage Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Pipeline Stage
            </label>
            <select
              value={lead.stage?._id || ''}
              onChange={(e) =>
                changeStage.mutate({
                  id: lead._id,
                  stageId: e.target.value,
                })
              }
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {stages.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Staff Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Assigned Agent
            </label>
            <select
              value={lead.assignedTo?._id || ''}
              onChange={(e) =>
                assignLead.mutate({
                  id: lead._id,
                  staffId: e.target.value,
                })
              }
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Unassigned</option>
              {staffList.map((st: any) => (
                <option key={st._id} value={st._id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* WhatsApp Direct Action */}
          <div className="flex flex-col justify-end">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm mt-3"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Acquisition Requirements & Matched Properties */}
        <div className="lg:col-span-2 space-y-6">
          {/* Associated Property (if enquiry-based) */}
          {lead.property && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-primary" />
                <span>Primary Inquired Property</span>
              </h2>
              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  {lead.property.coverImage && (
                    <img
                      src={lead.property.coverImage}
                      alt=""
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{lead.property.title}</h3>
                    <p className="text-xs text-gray-500">
                      {[lead.property.area, lead.property.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-primary block">
                    €{lead.property.price?.toLocaleString() || 'Price on Request'}
                  </span>
                  <Link
                    to={`/properties/${lead.property._id}/edit`}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Edit Property
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Acquisition Criteria Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Acquisition Parameters & Requirements
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Min Budget</span>
                <span className="text-sm font-bold text-gray-800">
                  {lead.requirements?.minBudget
                    ? `€${lead.requirements.minBudget.toLocaleString()}`
                    : 'Flexible'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Max Budget</span>
                <span className="text-sm font-bold text-gray-800">
                  {lead.requirements?.maxBudget
                    ? `€${lead.requirements.maxBudget.toLocaleString()}`
                    : 'Flexible'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Bedrooms</span>
                <span className="text-sm font-bold text-gray-800">
                  {lead.requirements?.bedrooms ? `${lead.requirements.bedrooms}+ Beds` : 'Any'}
                </span>
              </div>
            </div>

            {lead.notes && (
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                  Client Briefing & Notes:
                </span>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          {/* Automated Property Matching Engine */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-gray-900">
                  Automated Property Matches
                </h2>
              </div>
              <button
                type="button"
                onClick={() => matchProperties.mutate(lead._id)}
                disabled={matchProperties.isPending}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-primary hover:bg-blue-100 rounded-md text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <span>{matchProperties.isPending ? 'Re-matching...' : 'Run Auto-Matcher'}</span>
              </button>
            </div>

            {lead.matchedProperties && lead.matchedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lead.matchedProperties.map((prop) => (
                  <div
                    key={prop._id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-200 mb-2">
                        <img
                          src={
                            prop.coverImage ||
                            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{prop.title}</h4>
                      <p className="text-[11px] text-gray-500">
                        {[prop.area, prop.city].filter(Boolean).join(', ')}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        €{prop.price?.toLocaleString() || 'Price on Request'}
                      </span>
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                          `Hello, we have matched a property to your requirements: ${prop.title} - http://localhost:3000/properties/${prop.slug}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                      >
                        <span>Share</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">
                Click "Run Auto-Matcher" to search active portfolio for properties matching this client's parameters.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Follow-up Tasks & Activity Timeline */}
        <div className="space-y-6">
          {/* Follow-up Tasks Checklist */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Follow-up Tasks
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="p-1 rounded hover:bg-gray-100 text-primary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Creation Form */}
            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="p-3 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                <input
                  type="text"
                  required
                  placeholder="Task title (e.g. Call client with brochure)..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded"
                  />
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="px-2.5 py-1 text-xs text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task._id}
                      className="flex items-start space-x-2 p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100 text-xs transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateTaskStatus.mutate({
                            taskId: task._id,
                            status: isCompleted ? 'pending' : 'completed',
                          })
                        }
                        className="mt-0.5 text-gray-400 hover:text-primary shrink-0"
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-1">
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          {task.assignedTo && <span>• {task.assignedTo.name}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No scheduled tasks yet.</p>
            )}
          </div>

          {/* Activity & Communications Timeline */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Activity & Audit Timeline
            </h3>

            {/* Add note input */}
            <form onSubmit={handleNoteSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Log a client note or call record..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Timeline items */}
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-1 space-y-3">
              {activities.map((act) => (
                <div key={act._id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                    <span className="font-semibold text-gray-700">
                      {act.performedBy?.name || 'System'}
                    </span>
                    <span>{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-snug">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
