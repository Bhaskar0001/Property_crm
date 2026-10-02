import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2, Building2 } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Buying',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const offices = [
    {
      city: 'Dublin (Global HQ)',
      address: '24-26 Fitzwilliam Place, Dublin 2, D02 T928',
      country: 'Republic of Ireland',
      phone: '+353 1 234 5678',
      email: 'dublin@propertyos.com',
      hours: 'Mon - Fri: 08:30 - 18:30 GMT',
    },
    {
      city: 'London Mayfair',
      address: '14 Berkeley Street, Mayfair, London W1J 8DX',
      country: 'United Kingdom',
      phone: '+44 20 7946 0912',
      email: 'london@propertyos.com',
      hours: 'Mon - Fri: 09:00 - 18:00 BST',
    },
    {
      city: 'Dubai DIFC',
      address: 'Gate Precinct 4, DIFC, PO Box 507111',
      country: 'United Arab Emirates',
      phone: '+971 4 362 7000',
      email: 'dubai@propertyos.com',
      hours: 'Mon - Fri: 09:00 - 18:00 GST',
    },
  ];

  return (
    <div className="bg-[#fcfdfd] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#004274] block mb-2">
            Direct Representation & Advisory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Speak With Our Advisory Desk
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Whether acquiring prime residential assets, seeking confidential valuations, or exploring commercial portfolios, our international partners are ready to assist.
          </p>
        </div>

        {/* Office Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {offices.map((office) => (
            <div
              key={office.city}
              className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#004274]/10 text-[#004274] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{office.city}</h3>
                  <span className="text-xs text-[#004274] font-medium">{office.country}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#6fabca] shrink-0 mt-0.5" />
                  <span>{office.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#6fabca] shrink-0" />
                  <span>{office.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#6fabca] shrink-0" />
                  <span>{office.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{office.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form Container */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-lg p-8">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Enquiry Transmitted</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you, {formData.name}. A senior client director from our advisory desk has received your briefing and will reply within 4 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-[#004274] text-white text-xs font-bold uppercase tracking-wider rounded-md"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Send Direct Briefing</h3>
                <p className="text-xs text-slate-500">
                  All consultations and property enquiries are conducted with strict confidentiality.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Liam O'Connor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="liam@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+353 87 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nature of Enquiry
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Buying">Acquiring / Buying Property</option>
                  <option value="Selling">Instructing PropertyOS to Sell</option>
                  <option value="Renting">Luxury Letting / Tenancy</option>
                  <option value="Institutional">Commercial & Institutional Investment</option>
                  <option value="Valuation">Valuation & Probate Services</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Message / Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Outline your acquisition criteria, budget parameters, target jurisdictions, or asset details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
              >
                Transmit Confidential Enquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
