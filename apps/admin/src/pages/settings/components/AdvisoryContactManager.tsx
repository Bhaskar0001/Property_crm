import React, { useState, useEffect } from 'react';
import { useAdvisoryContact, useUpdateAdvisoryContact } from '@/hooks/useAdminConfig';
import {
  PhoneCall,
  MessageSquare,
  Mail,
  Clock,
  Video,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Headphones,
} from 'lucide-react';

export const AdvisoryContactManager: React.FC = () => {
  const { data: contactInfo, isLoading } = useAdvisoryContact();
  const updateContact = useUpdateAdvisoryContact();

  const [formData, setFormData] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    officeHours: '',
    videoConsultationUrl: '',
    companyName: '',
    address: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (contactInfo) {
      setFormData({
        phone: contactInfo.phone || '',
        whatsapp: contactInfo.whatsapp || '',
        email: contactInfo.email || '',
        officeHours: contactInfo.officeHours || '',
        videoConsultationUrl: contactInfo.videoConsultationUrl || '',
        companyName: contactInfo.companyName || '',
        address: contactInfo.address || '',
      });
    }
  }, [contactInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      await updateContact.mutateAsync(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update advisory contact channels.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const cleanWhatsApp = (formData.whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Public Routing Active
          </div>
          <h2 className="text-xl font-bold tracking-tight">Advisory, Direct Calling & WhatsApp Channels</h2>
          <p className="text-sm text-slate-300 mt-1">
            Configure the phone number, WhatsApp line, and video consultation bridge used across the public website's floating action widgets.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-10 text-white pointer-events-none">
          <Headphones className="w-48 h-48" />
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Advisory communication channels updated successfully! Changes reflect immediately on the live public site.</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Primary Advisory Phone Number
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Triggered when visitors click "Call Advisory Desk".</p>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Official WhatsApp Number (Intl Format)
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-600" />
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+15550000000"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Include country code without leading zero or spaces.</p>
            </div>

            {/* Desk Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Advisory Desk Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="advisory@yourdomain.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Office Hours */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Operating Hours Display
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.officeHours}
                  onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                  placeholder="Mon - Sat: 9:00 AM - 7:00 PM GMT"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Video Consultation URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Default Video Consultation Bridge / Meeting Link
            </label>
            <div className="relative">
              <Video className="w-4 h-4 absolute left-3.5 top-3.5 text-indigo-500" />
              <input
                type="url"
                value={formData.videoConsultationUrl}
                onChange={(e) => setFormData({ ...formData, videoConsultationUrl: e.target.value })}
                placeholder="https://meet.google.com/new or zoom link"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used when clients launch an immediate virtual property walkthrough session.
            </p>
          </div>

          {/* Company Name & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Brokerage / Desk Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="EstateElite Private Advisory"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Headquarters Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 100 Main Street, Suite 400, City, Country"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={updateContact.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateContact.isPending ? 'Saving Settings...' : 'Save Advisory Channels'}
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-5">
          <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-b from-gray-50 to-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Client Preview</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Connected
              </span>
            </div>

            {/* Direct Call Button Preview */}
            <div className="space-y-1.5">
              <span className="text-xs text-gray-500 font-medium">Public Floating Call Button:</span>
              <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-xl shadow">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold">Direct Advisory Desk</div>
                  <div className="text-[11px] text-slate-300">{formData.phone || 'No phone configured'}</div>
                </div>
              </div>
            </div>

            {/* WhatsApp Preview */}
            <div className="space-y-1.5">
              <span className="text-xs text-gray-500 font-medium">Public WhatsApp Widget:</span>
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    WA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">WhatsApp Concierge</div>
                    <div className="text-[11px] text-emerald-700 font-medium">Online • Instant reply</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 p-1"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Security Note */}
            <div className="pt-2 border-t border-gray-100 flex items-start gap-2 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                All inquiries initiated via these buttons auto-register as priority CRM leads with source attribution.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
