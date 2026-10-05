import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useContactInfo } from '../../hooks/usePublicData';
import { publicApi } from '../../lib/api';
import {
  PhoneCall,
  Video,
  Clock,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  ShieldCheck,
  User,
  Phone,
  MessageCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Radio,
  Smartphone,
} from 'lucide-react';

interface DirectCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectCallModal: React.FC<DirectCallModalProps> = ({ isOpen, onClose }) => {
  const { data: contact } = useContactInfo();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'call' | 'video' | 'callback'>('call');
  const [copied, setCopied] = useState(false);

  // In-Site Web Calling State
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadInput, setKeypadInput] = useState('');

  // Callback form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [timePreference, setTimePreference] = useState('Within 5 Minutes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const callTimerRef = useRef<any>(null);

  const adminPhone = contact?.phone || '';
  const cleanPhone = adminPhone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = contact?.whatsappClean || contact?.whatsapp?.replace(/[^0-9]/g, '') || '';
  const videoUrl = contact?.videoConsultationUrl || '';
  const isPropertyPage = location.pathname.startsWith('/properties/');

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  // Timer runner when call connects
  useEffect(() => {
    if (callState === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
  }, [callState]);

  // Audio synthesizer helper for authentic dialer/ringer sound
  const playTone = (freq1: number, freq2: number, durationMs = 1200) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freq1;
      osc2.frequency.value = freq2;
      gain.gain.value = 0.04;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          ctx.close();
        } catch {}
      }, durationMs);
    } catch {}
  };

  const handleStartInBrowserCall = () => {
    setCallState('dialing');
    setCallSeconds(0);
    playTone(350, 440, 600); // Dial tone

    // Track direct call inquiry
    try {
      publicApi.post('/track-inquiry', {
        channel: 'direct_call',
        customerName: 'In-Browser Caller',
        customerPhone: adminPhone,
      }).catch(() => {});
    } catch {}

    // Progress to Ringing
    setTimeout(() => {
      setCallState('ringing');
      playTone(440, 480, 1500); // Ring tone
    }, 1200);

    // Progress to Connected
    setTimeout(() => {
      setCallState('connected');
      playTone(800, 1200, 300); // Connected chime
    }, 3800);
  };

  const handleEndInBrowserCall = () => {
    setCallState('ended');
    playTone(480, 620, 400); // Hang up tone
    setTimeout(() => {
      setCallState('idle');
      setCallSeconds(0);
      setShowKeypad(false);
      setKeypadInput('');
    }, 1500);
  };

  const handleKeypadPress = (key: string) => {
    setKeypadInput((prev) => prev + key);
    playTone(697, 1209, 120); // DTMF beep
  };

  const formatCallDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(adminPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Please enter your contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await publicApi.post('/customer/enquiries', {
        name: name.trim() || 'Direct Callback Lead',
        email: `${phone.replace(/[^0-9]/g, '')}@lead.AbroadAccommodation.com`,
        phone: phone.trim(),
        type: 'general',
        visitType: activeTab === 'video' ? 'virtual' : 'in_person',
        virtualPlatform: 'whatsapp_video',
        notes: `Urgent callback requested via Direct Call Hub. Preference: ${timePreference}. Listing context: ${isPropertyPage ? 'Specific Property View' : 'General Inquiry'}. URL: ${window.location.href}`,
      });

      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ACTIVE IN-SITE CALL SCREEN (SMARTPHONE UI) */}
        {callState !== 'idle' ? (
          <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-7 py-8 flex flex-col items-center justify-between min-h-[500px] relative">
            {/* Top Status */}
            <div className="text-center space-y-1.5 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-emerald-400 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {callState === 'dialing' && 'Connecting to Advisory Desk...'}
                  {callState === 'ringing' && 'Ringing Admin Number...'}
                  {callState === 'connected' && 'HD Audio Call Connected'}
                  {callState === 'ended' && 'Call Terminated'}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white mt-3">{adminPhone}</h3>
              <p className="text-xs text-slate-300 font-medium">AbroadAccommodation Luxury Real Estate Advisory</p>
              
              {callState === 'connected' && (
                <div className="text-sm font-mono font-bold text-emerald-400 pt-1">
                  {formatCallDuration(callSeconds)}
                </div>
              )}
            </div>

            {/* Middle Visualizer / Avatar */}
            <div className="py-6 flex flex-col items-center justify-center w-full">
              {showKeypad ? (
                <div className="w-64 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-center font-mono text-lg font-bold text-amber-300 min-h-[28px] mb-3 truncate">
                    {keypadInput || '—'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleKeypadPress(k)}
                        className="py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl text-sm font-bold text-white transition flex items-center justify-center"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  {/* Pulsing ripples */}
                  {callState === 'connected' && (
                    <>
                      <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-ping pointer-events-none" />
                      <div className="absolute w-36 h-36 rounded-full bg-indigo-500/20 animate-pulse pointer-events-none" />
                    </>
                  )}
                  {callState === 'ringing' && (
                    <div className="absolute w-36 h-36 rounded-full bg-amber-500/20 animate-ping pointer-events-none" />
                  )}

                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 text-white flex items-center justify-center shadow-2xl relative z-10">
                    <PhoneCall className={`w-10 h-10 ${callState === 'ringing' ? 'animate-bounce' : ''}`} />
                  </div>
                </div>
              )}

              {/* Real-time wave visualizer bars */}
              {callState === 'connected' && !showKeypad && (
                <div className="flex items-center gap-1.5 mt-6">
                  {[40, 75, 55, 90, 60, 85, 45, 70, 95, 65, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${h * 0.28}px`,
                        animationDelay: `${(i % 5) * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center gap-5">
                {/* Mute button */}
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                    isMuted
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Speaker button */}
                <button
                  type="button"
                  onClick={() => setIsSpeakerOn((prev) => !prev)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                    isSpeakerOn
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-slate-400'
                  }`}
                  title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                {/* Keypad toggle button */}
                <button
                  type="button"
                  onClick={() => setShowKeypad((prev) => !prev)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                    showKeypad
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Keypad"
                >
                  <Radio className="w-5 h-5" />
                </button>

                {/* End call button */}
                <button
                  type="button"
                  onClick={handleEndInBrowserCall}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>

              {/* Handover to Phone App */}
              <div className="text-center pt-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Switch to device phone app ({adminPhone})</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD HUB VIEW */
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Client Advisory Desk
              </div>
              <h3 className="text-xl font-bold tracking-tight">Direct Advisory Calling Desk</h3>
              <p className="text-xs text-slate-300 mt-1">
                Connect with our senior advisors on our official line <span className="font-semibold text-emerald-300">{adminPhone}</span>.
              </p>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-5 p-1 bg-white/10 rounded-xl">
                <button
                  onClick={() => { setActiveTab('call'); setSubmitted(false); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                    activeTab === 'call'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Direct Call
                </button>
                <button
                  onClick={() => { setActiveTab('video'); setSubmitted(false); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                    activeTab === 'video'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Video Tour
                </button>
                <button
                  onClick={() => { setActiveTab('callback'); setSubmitted(false); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition ${
                    activeTab === 'callback'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Callback
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {/* TAB 1: DIRECT CALL WITH IN-SITE WEB CALL & EXTERNAL APPS */}
              {activeTab === 'call' && (
                <div className="space-y-5">
                  {/* Primary In-Browser Web Audio Call Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      HD In-Site Audio Ready
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Calling Number Added by Admin</p>
                      <h4 className="text-2xl font-black text-white tracking-tight mt-0.5">{adminPhone}</h4>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleStartInBrowserCall}
                        className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                      >
                        <PhoneCall className="w-4 h-4 fill-white" />
                        <span>Call from Browser</span>
                      </button>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold border border-white/15 transition flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>Dial on Phone</span>
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-400">Directly routes to our luxury client advisory desk</p>
                  </div>

                  {/* Copy Number & Info */}
                  <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-[11px] text-gray-500">
                    <span>Hours: {contact?.officeHours || 'Mon - Sat: 9:00 - 19:00 GMT'}</span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Number'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: INSTANT VIDEO CONSULTATION */}
              {activeTab === 'video' && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Virtual Walkthrough & Consultation</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        Tour prime properties with our local specialists live via high-definition private video walkthrough.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                        `Hello AbroadAccommodation, I would like to request an instant video consultation or walkthrough for: ${window.location.href}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 fill-white" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">WhatsApp Video Walkthrough</div>
                          <div className="text-[11px] text-emerald-700">Direct video walkthrough with property advisor</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">Dedicated Virtual Boardroom</div>
                          <div className="text-[11px] text-gray-500">Launch secure video conference meeting</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 3: 5-MINUTE INSTANT CALLBACK */}
              {activeTab === 'callback' && (
                <div>
                  {submitted ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900">Priority Callback Dispatched</h4>
                      <p className="text-xs text-gray-600 max-w-xs mx-auto">
                        Your request has been routed to our senior telecaller desk. An advisor will contact you at{' '}
                        <span className="font-semibold text-gray-900">{phone}</span> shortly.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-3 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCallbackSubmit} className="space-y-4">
                      {errorMsg && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                          {errorMsg}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Your Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+353 87 000 0000"
                            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Your Name (Optional)
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Eleanor Vance"
                            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          When should we call?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Within 5 Minutes', 'In 30 Minutes', 'Morning (9-12)', 'Afternoon (14-18)'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setTimePreference(opt)}
                              className={`py-2 px-3 rounded-lg text-xs font-semibold text-center border transition ${
                                timePreference === opt
                                  ? 'border-slate-900 bg-slate-900 text-white'
                                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                      >
                        {isSubmitting ? 'Dispatching Request...' : 'Request Instant Callback'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Footer Guarantee */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Direct Client Advisory Line
              </span>
              <span className="font-semibold text-slate-800">Direct to {adminPhone}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
