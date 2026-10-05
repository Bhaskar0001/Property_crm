import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { useValuation } from '../../context/ValuationContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { usePublicPropertyTypes } from '../../hooks/usePublicData';
import { publicApi } from '../../lib/api';

export const ValuationModal: React.FC = () => {
  const { isValuationOpen, closeValuationModal, valuationPrefill } = useValuation();
  const { customer } = useCustomerAuth();
  const { data: propertyTypes = [] } = usePublicPropertyTypes();

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    country: '',
    propertyType: 'Detached',
    bedrooms: 3,
    bathrooms: 2,
    condition: 'Good',
    intent: 'selling',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    preferredDate: '',
    preferredTime: 'morning',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isValuationOpen) {
      setSubmitted(false);
      setErrorMessage(null);
      setFormData((prev) => ({
        ...prev,
        address: valuationPrefill.address || prev.address || '',
        city: valuationPrefill.city || prev.city || '',
        propertyType: valuationPrefill.propertyType || prev.propertyType || 'Detached',
        intent: valuationPrefill.intent || prev.intent || 'selling',
        ownerName: customer?.name || prev.ownerName || '',
        ownerEmail: customer?.email || prev.ownerEmail || '',
        ownerPhone: customer?.phone || prev.ownerPhone || '',
      }));
    }
  }, [isValuationOpen, valuationPrefill, customer]);

  if (!isValuationOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address.trim() || !formData.ownerName.trim() || !formData.ownerEmail.trim()) {
      setErrorMessage('Please fill in required fields: Address, Name, and Email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await publicApi.post('/valuation-request', {
        address: formData.address,
        city: formData.city || 'Undisclosed',
        country: formData.country || undefined,
        propertyType: formData.propertyType,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        condition: formData.condition,
        intent: formData.intent,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        preferredDate: formData.preferredDate || undefined,
        preferredTime: formData.preferredTime || undefined,
        notes: formData.notes || undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to submit valuation request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 my-8">
        <button
          onClick={closeValuationModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 block">
              Confidential Appraisal Instructed
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Valuation Request Submitted
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-slate-900">{formData.ownerName}</span>.
              Our senior valuation specialist has received your request for{' '}
              <span className="font-semibold text-slate-900">{formData.address}</span>. We will analyze recent market
              comparables and reach out with a comprehensive assessment.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={closeValuationModal}
                className="px-6 py-2.5 bg-[#004274] hover:bg-[#002544] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition"
              >
                Return to Site
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#004274] text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Certified Market Appraisal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Request Confidential Property Valuation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Receive institutional-grade market pricing, recent comparable sales, and yield optimization advice.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Purpose Tabs */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Valuation Purpose *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'selling', label: 'Considering Sale' },
                  { id: 'letting', label: 'Rental Yield' },
                  { id: 'remortgage', label: 'Refinancing' },
                  { id: 'probate', label: 'Probate / Tax' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, intent: item.id })}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center border transition-all ${
                      formData.intent === item.id
                        ? 'border-[#004274] bg-[#004274] text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Property Address or Eircode / Postcode *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Ailesbury Road, D04 X7P2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  City / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dublin 4, London, Dubai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>
            </div>

            {/* Specs Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none cursor-pointer"
                >
                  {propertyTypes && propertyTypes.length > 0 ? (
                    propertyTypes.map((t) => (
                      <option key={t._id} value={t.name}>
                        {t.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Detached House">Detached House</option>
                      <option value="Semi-Detached">Semi-Detached</option>
                      <option value="Apartment / Flat">Apartment / Flat</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Commercial / Mixed">Commercial / Mixed</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Bedrooms
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none cursor-pointer"
                >
                  <option value="Turnkey / Luxury">Turnkey / Luxury</option>
                  <option value="Good">Good condition</option>
                  <option value="Modernized">Recently Modernized</option>
                  <option value="Requires Renovation">Requires Renovation</option>
                </select>
              </div>
            </div>

            {/* Owner Contact Information */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#004274] block mb-2">
                Your Contact Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Julian Hayes"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="julian@example.com"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+353 87 123 4567"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Special Characteristics or Expected Target
              </label>
              <textarea
                rows={2}
                placeholder="South-facing garden, penthouse terrace, recent extension, planning permission..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={closeValuationModal}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#004274] hover:bg-[#002544] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Request...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Submit Valuation Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
