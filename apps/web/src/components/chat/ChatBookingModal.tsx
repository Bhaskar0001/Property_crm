import React, { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin, CheckCircle2, AlertCircle, Building, Loader2 } from 'lucide-react';
import { publicApi } from '../../lib/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { usePublicProperties } from '../../hooks/usePublicData';

interface ChatBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProperty?: {
    id: string;
    title: string;
    city?: string;
    area?: string;
  } | null;
  onSuccess: (bookingDetails: {
    leadId: string;
    propertyTitle: string;
    date: string;
    time: string;
    visitType: string;
    name: string;
  }) => void;
}

export const ChatBookingModal: React.FC<ChatBookingModalProps> = ({
  isOpen,
  onClose,
  preselectedProperty,
  onSuccess,
}) => {
  const { customer } = useCustomerAuth();
  const { data: propertiesData } = usePublicProperties({ limit: 50 });
  const allProperties = propertiesData?.data || [];

  const [propertyId, setPropertyId] = useState<string>(preselectedProperty?.id || '');
  const [name, setName] = useState<string>(customer?.name || '');
  const [email, setEmail] = useState<string>(customer?.email || '');
  const [phone, setPhone] = useState<string>(customer?.phone || '');
  const [date, setDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>('14:00 - 15:00');
  const [visitType, setVisitType] = useState<'in_person' | 'virtual'>('in_person');
  const [virtualPlatform, setVirtualPlatform] = useState<string>('whatsapp_video');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync preselected property if provided
  React.useEffect(() => {
    if (preselectedProperty?.id) {
      setPropertyId(preselectedProperty.id);
    } else if (allProperties.length > 0 && !propertyId) {
      setPropertyId(allProperties[0]._id);
    }
  }, [preselectedProperty, allProperties]);

  if (!isOpen) return null;

  const selectedPropObj = allProperties.find((p) => p._id === propertyId);
  const activePropertyTitle = preselectedProperty?.title || selectedPropObj?.title || 'Selected Prime Residence';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide your contact phone number.');
      return;
    }
    if (!propertyId) {
      setError('Please select a property from the portfolio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await publicApi.post('/customer/enquiries', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        propertyId,
        type: 'viewing',
        visitType,
        virtualPlatform: visitType === 'virtual' ? virtualPlatform : undefined,
        scheduledDate: date,
        scheduledTime: time,
        notes: notes.trim()
          ? `[SUBMITTED VIA PRIVATE CHAT CONCIERGE] ${notes.trim()}`
          : '[SUBMITTED VIA PRIVATE CHAT CONCIERGE] Client requested confidential viewing coordination.',
      });

      const leadId = response.data?.leadId || 'CONFIRMED';
      onSuccess({
        leadId,
        propertyTitle: activePropertyTitle,
        date,
        time,
        visitType: visitType === 'virtual' ? 'Live Video Walkthrough' : 'Physical On-Site Viewing',
        name: name.trim(),
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to submit viewing inquiry:', err);
      setError(err?.response?.data?.message || 'Unable to register viewing request. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-[#002244] to-slate-900 text-white flex items-center justify-between border-b border-amber-500/20">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-0.5">
              Confidential Private Concierge
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Book Property Viewing</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Property Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#004274]" />
              Selected Property
            </label>
            {preselectedProperty ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900">{preselectedProperty.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {[preselectedProperty.area, preselectedProperty.city].filter(Boolean).join(', ') || 'Verified Prime Address'}
                </div>
              </div>
            ) : (
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004274]"
                required
              >
                <option value="">Choose a property to visit...</option>
                {allProperties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.city || 'Prime Location'} • €{p.price?.toLocaleString() || 'POA'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Format: In-Person or Virtual */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Viewing Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisitType('in_person')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  visitType === 'in_person'
                    ? 'bg-[#002544] text-white border-[#002544] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${visitType === 'in_person' ? 'text-amber-400' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">On-Site Visit</div>
                  <div className={`text-[10px] mt-0.5 ${visitType === 'in_person' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Physical guided tour with Senior Advisor
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisitType('virtual')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  visitType === 'virtual'
                    ? 'bg-[#002544] text-white border-[#002544] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Video className={`w-4 h-4 shrink-0 mt-0.5 ${visitType === 'virtual' ? 'text-amber-400' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">Live Video Tour</div>
                  <div className={`text-[10px] mt-0.5 ${visitType === 'virtual' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Scheduled walkthrough via WhatsApp or Zoom
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Video platform selector if virtual */}
          {visitType === 'virtual' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Live Video Platform
              </label>
              <select
                value={virtualPlatform}
                onChange={(e) => setVirtualPlatform(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#004274]"
              >
                <option value="whatsapp_video">WhatsApp Video Walkthrough</option>
                <option value="zoom">Zoom HD Video Meeting</option>
                <option value="google_meet">Google Meet</option>
                <option value="facetime">Apple FaceTime</option>
              </select>
            </div>
          )}

          {/* Client Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lord Alexander Wright"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004274]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+353 87 123 4567"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004274]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address (For Confidential Confirmation) *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@investment.com"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004274]"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Preferred Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004274]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Time Window
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#004274]"
              >
                <option value="10:00 - 11:30">Morning: 10:00 - 11:30</option>
                <option value="11:30 - 13:00">Mid-day: 11:30 - 13:00</option>
                <option value="14:00 - 15:30">Afternoon: 14:00 - 15:30</option>
                <option value="16:00 - 17:30">Late Afternoon: 16:00 - 17:30</option>
                <option value="18:00 - 19:30">Evening: 18:00 - 19:30</option>
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Special Instructions or Confidential Inquiries (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Interested in floorplan measurements, title deed inspection, or private parking..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004274] resize-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-slate-900 via-[#002244] to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Registering Live CRM Lead...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Confirm & Book Viewing Request</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              All inquiries are strictly confidential and immediately assigned to a licensed EstateElite senior partner.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
