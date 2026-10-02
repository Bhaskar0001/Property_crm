import { useState } from 'react';
import {
  PhoneCall,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useCallingQueue, useLogCall, useTelecallerStats } from '../../hooks/useTelecaller';

export function TelecallerWorkspacePage() {
  const { data: queue = [], isLoading: loadingQueue } = useCallingQueue();
  const { data: stats } = useTelecallerStats();
  const logCall = useLogCall();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Disposition form state
  const [disposition, setDisposition] = useState<string>('CONNECTED');
  const [notes, setNotes] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('11:00');
  const [callDuration, setCallDuration] = useState<number>(60);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Active lead
  const activeLead = queue.find((l) => l._id === (selectedLeadId || queue[0]?._id)) || queue[0];

  const handleLogCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;

    await logCall.mutateAsync({
      leadId: activeLead._id,
      disposition,
      duration: callDuration,
      notes,
      callbackDate: disposition === 'CALLBACK_SCHEDULED' ? callbackDate : undefined,
      callbackTime: disposition === 'CALLBACK_SCHEDULED' ? callbackTime : undefined,
    });

    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 2500);

    // Reset form
    setNotes('');
    setCallbackDate('');
    setDisposition('CONNECTED');

    // Advance to next lead in queue
    const currentIndex = queue.findIndex((l) => l._id === activeLead._id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      setSelectedLeadId(queue[currentIndex + 1]._id);
    }
  };

  const dispositions = [
    { code: 'CONNECTED', label: 'Connected / Answered', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    { code: 'QUALIFIED', label: 'Qualified Buyer / Tenant', color: 'bg-blue-50 text-primary border-blue-300' },
    { code: 'CALLBACK_SCHEDULED', label: 'Schedule Callback', color: 'bg-amber-50 text-amber-700 border-amber-300' },
    { code: 'BUSY', label: 'Busy / Engaged', color: 'bg-orange-50 text-orange-700 border-orange-300' },
    { code: 'NO_ANSWER', label: 'No Answer / Voicemail', color: 'bg-slate-50 text-slate-700 border-slate-300' },
    { code: 'NOT_INTERESTED', label: 'Not Interested', color: 'bg-rose-50 text-rose-700 border-rose-300' },
    { code: 'WRONG_NUMBER', label: 'Invalid / Wrong Number', color: 'bg-gray-100 text-gray-500 border-gray-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
          <PhoneCall className="w-6 h-6 text-primary" />
          <span>Telecaller & Sales Calling Desk</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Priority calling queue with automated stage advancement, callback scheduling, and outcome analytics.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Calls Today
            </span>
            <span className="text-xl font-bold text-gray-900">{stats?.callsToday || 0}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Connected
            </span>
            <span className="text-xl font-bold text-gray-900">{stats?.connectedToday || 0}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Qualified Leads
            </span>
            <span className="text-xl font-bold text-gray-900">{stats?.qualifiedToday || 0}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Pending Callbacks
            </span>
            <span className="text-xl font-bold text-gray-900">{stats?.pendingCallbacks || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Split Calling Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Prioritized Queue (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[700px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Priority Calling Queue
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {queue.length} Leads
            </span>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {loadingQueue ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading call queue...</div>
            ) : queue.length > 0 ? (
              queue.map((lead) => {
                const isSelected = activeLead?._id === lead._id;
                return (
                  <div
                    key={lead._id}
                    onClick={() => setSelectedLeadId(lead._id)}
                    className={`p-4 transition-all cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-primary'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">
                        {lead.customer?.name || 'Inquiry Contact'}
                      </span>
                      {lead.scheduledCallback ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Callback
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                          {lead.priority}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{lead.customer?.phone || 'No phone'}</span>
                    </div>

                    {lead.property && (
                      <p className="text-[11px] text-primary truncate font-medium">
                        Ref: {lead.property.title}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                All scheduled calls and leads are up to date!
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Call Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeLead ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              {/* Client Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                    Active Calling Record
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeLead.customer?.name || 'Unnamed Client'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeLead.customer?.email}
                  </p>
                </div>

                {/* Direct Dial & WhatsApp Action Buttons */}
                <div className="flex items-center space-x-2">
                  {activeLead.customer?.phone && (
                    <a
                      href={`tel:${activeLead.customer.phone}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Dial Call</span>
                    </a>
                  )}

                  <a
                    href={`https://wa.me/${activeLead.customer?.phone?.replace(/\D/g, '') || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                    title="Open WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Success Notification Alert */}
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Call outcome saved successfully! Loaded next lead in queue.</span>
                </div>
              )}

              {/* Disposition Form */}
              <form onSubmit={handleLogCallSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Select Call Outcome / Disposition *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dispositions.map((d) => {
                      const isSelected = disposition === d.code;
                      return (
                        <button
                          key={d.code}
                          type="button"
                          onClick={() => setDisposition(d.code)}
                          className={`p-2.5 rounded-lg text-xs font-bold text-left border transition-all ${
                            isSelected
                              ? 'border-primary ring-2 ring-primary/20 bg-blue-50 text-primary shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Callback Scheduler */}
                {disposition === 'CALLBACK_SCHEDULED' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <span>Set Scheduled Callback Date & Time</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                          Callback Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={callbackDate}
                          onChange={(e) => setCallbackDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                          Preferred Time Window
                        </label>
                        <input
                          type="time"
                          value={callbackTime}
                          onChange={(e) => setCallbackTime(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Duration & Notes */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Call Notes & Client Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Discussed budget, requested floorplans, planning site visit next Tuesday..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <label className="font-semibold text-gray-600">Call Duration (sec):</label>
                      <input
                        type="number"
                        value={callDuration}
                        onChange={(e) => setCallDuration(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={logCall.isPending}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{logCall.isPending ? 'Logging Outcome...' : 'Save Disposition & Advance Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400 text-xs">
              Select a lead from the queue on the left to begin calling.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
