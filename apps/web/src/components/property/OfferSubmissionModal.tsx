import React, { useState } from 'react';
import {
  X,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { publicApi } from '../../lib/api';

interface OfferSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    _id: string;
    title: string;
    price?: number;
    internalReference?: string;
    currency?: {
      code: string;
      symbol: string;
    };
  };
}

export const OfferSubmissionModal: React.FC<OfferSubmissionModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const { customer } = useCustomerAuth();
  const { formatPrice, currentCurrency } = useCurrency();

  const [formData, setFormData] = useState({
    amount: property.price ? String(property.price) : '',
    buyerName: customer?.name || '',
    buyerEmail: customer?.email || '',
    buyerPhone: customer?.phone || '',
    purchasingPosition: 'Mortgage Approved (AIP)',
    completionTimeline: 'Standard (4 to 8 weeks)',
    conditions: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setErrorMessage('Please enter a valid purchase offer amount.');
      return;
    }
    if (!formData.buyerName.trim() || !formData.buyerEmail.trim()) {
      setErrorMessage('Please provide your name and contact email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await publicApi.post('/offers', {
        propertyId: property._id,
        amount: Number(formData.amount),
        buyerName: formData.buyerName.trim(),
        buyerEmail: formData.buyerEmail.trim(),
        buyerPhone: formData.buyerPhone.trim(),
        purchasingPosition: formData.purchasingPosition,
        completionTimeline: formData.completionTimeline,
        conditions: formData.conditions.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to submit offer. Please contact the advisory desk.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 my-8">
        <button
          onClick={onClose}
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
              Offer Registered in System
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Purchase Offer Transmitted
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your binding purchase offer of{' '}
              <span className="font-bold text-slate-900">
                {property.currency?.symbol || '€'}{Number(formData.amount).toLocaleString()}
              </span>{' '}
              for <span className="font-semibold text-slate-900">{property.title}</span> has been securely lodged with our
              representation desk. The vendor’s designated advisor will review your terms and reply within 24 business hours.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-w-md mx-auto">
              You can monitor negotiation status, counter-offers, and legal contracts directly from your{' '}
              <span className="font-semibold text-[#004274]">Client Portal</span>.
            </div>
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#004274] hover:bg-[#002544] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition"
              >
                Close & Continue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Legally Registered Offer Protocol</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Submit Formal Purchase Offer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                For {property.title} {property.internalReference ? `(Ref: ${property.internalReference})` : ''}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Price Guidance Display */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Guide Price
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {property.price ? formatPrice(property.price) : 'Price on Request'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Active Display FX
                </span>
                <span className="text-xs font-bold text-[#004274]">{currentCurrency}</span>
              </div>
            </div>

            {/* Offer Amount Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Offer Amount ({property.currency?.symbol || '€'}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">
                  {property.currency?.symbol || '€'}
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1000"
                  placeholder="e.g. 850000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>
            </div>

            {/* Buyer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Eleanor Vance"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="eleanor@example.com"
                    value={formData.buyerEmail}
                    onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+353 87 123 4567"
                    value={formData.buyerPhone}
                    onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Purchasing Position & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Purchaser Financial Position *
                </label>
                <select
                  value={formData.purchasingPosition}
                  onChange={(e) => setFormData({ ...formData, purchasingPosition: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none cursor-pointer"
                >
                  <option value="Cash Purchaser (Proof of Funds ready)">Cash Purchaser (Funds in place)</option>
                  <option value="Mortgage Approved (AIP)">Mortgage Approved (AIP in hand)</option>
                  <option value="Subject to Property Sale">Subject to Property Sale (Chain)</option>
                  <option value="Institutional / Corporate">Institutional / Corporate Fund</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Closing Timeline
                </label>
                <select
                  value={formData.completionTimeline}
                  onChange={(e) => setFormData({ ...formData, completionTimeline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none cursor-pointer"
                >
                  <option value="Expedited (Within 28 days)">Expedited (Within 28 days)</option>
                  <option value="Standard (4 to 8 weeks)">Standard (4 to 8 weeks)</option>
                  <option value="Flexible (8 to 12 weeks)">Flexible (8 to 12 weeks)</option>
                </select>
              </div>
            </div>

            {/* Special Conditions */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Special Conditions / Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Subject to structural survey, all appliances and light fixtures included..."
                value={formData.conditions}
                onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004274] focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Lobbying Offer...</span>
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4" />
                    <span>Transmitting Binding Offer</span>
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
