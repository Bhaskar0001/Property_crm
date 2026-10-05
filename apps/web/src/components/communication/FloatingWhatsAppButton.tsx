import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useContactInfo } from '../../hooks/usePublicData';
import { publicApi } from '../../lib/api';
import { MessageCircle, X, ExternalLink } from 'lucide-react';

export const FloatingWhatsAppButton: React.FC = () => {
  const { data: contact } = useContactInfo();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);

  const phone = contact?.whatsappClean || '353891234567';
  const isPropertyPage = location.pathname.startsWith('/properties/');

  const handleOpenWhatsApp = () => {
    // Generate context-aware text
    let message = 'Hello AbroadAccommodation, I am browsing your portfolio and would like to speak with a luxury property advisor.';
    if (isPropertyPage) {
      const pageUrl = window.location.href;
      message = `Hello AbroadAccommodation, I am currently reviewing this listing and would like more details or to schedule a viewing: ${pageUrl}`;
    }

    // Background track inquiry
    try {
      publicApi.post('/track-inquiry', {
        channel: 'whatsapp',
        customerName: 'WhatsApp Visitor',
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start font-sans">
      {/* Floating expanded preview bubble */}
      {showTooltip && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  EE
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-400/20" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">AbroadAccommodation Concierge</h4>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Typically replies in 2 min
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              aria-label="Close message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 text-xs text-gray-600 leading-relaxed">
            {isPropertyPage ? (
              <span>
                Interested in this property? Tap below to chat directly with our listing specialist on WhatsApp.
              </span>
            ) : (
              <span>
                Need help discovering luxury penthouses, villas, or estates? Connect directly with our private advisory team.
              </span>
            )}
          </div>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Open WhatsApp Chat</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <div className="relative group">
        <button
          onClick={handleOpenWhatsApp}
          onMouseEnter={() => setShowTooltip(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
          aria-label="Chat on WhatsApp"
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline">WhatsApp</span>
        </button>

        {/* Status Chip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-md hidden sm:block">
          Direct Advisory Desk
        </div>
      </div>
    </div>
  );
};
