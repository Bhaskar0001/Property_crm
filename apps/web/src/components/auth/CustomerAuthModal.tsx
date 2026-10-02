import { useState } from 'react';
import { X, Mail, ShieldCheck, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export function CustomerAuthModal() {
  const { isLoginModalOpen, closeLoginModal, sendOtp, verifyOtp } = useCustomerAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    closeLoginModal();
    setStep('email');
    setOtp('');
    setError(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await sendOtp(email.trim(), name.trim() || undefined);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await verifyOtp(email.trim(), otp.trim(), name.trim() || undefined, phone.trim() || undefined);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#004274]/10 text-[#004274] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-[#004274]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Client Portal Access
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'email'
              ? 'Passwordless access to your saved properties & viewing schedules'
              : `Enter the 6-digit verification code sent to ${email}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Request Email */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Fitzgerald"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004274] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004274] focus:bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Transmitting Code...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 text-center">
                6-Digit Verification Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full py-3 text-center tracking-[0.5em] text-2xl font-bold bg-slate-50 border border-slate-200 rounded-lg text-[#004274] focus:outline-none focus:ring-2 focus:ring-[#004274] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Mobile Phone (Optional for viewing alerts)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+353 87 123 4567"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004274] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-[#004274] hover:bg-[#00335a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verifying Code...' : 'Access Client Portal'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-slate-500 hover:text-[#004274] flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Change Email</span>
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="font-semibold text-[#004274] hover:underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
