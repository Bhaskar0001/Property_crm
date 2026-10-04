import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../lib/api';
import {
  X,
  Send,
  RotateCcw,
  Building,
  ArrowUpRight,
  PhoneCall,
  Phone,
  MessageCircle,
  Calendar,
  Compass,
  MapPin,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { LuxuryEmblem } from '../common/LuxuryEmblem';
import { EnterpriseChatIcon } from '../common/EnterpriseChatIcon';
import { DirectCallModal } from '../communication/DirectCallModal';
import { ChatBookingModal } from './ChatBookingModal';
import { useContactInfo } from '../../hooks/usePublicData';

interface MatchedProperty {
  id: string;
  title: string;
  slug: string;
  price?: number;
  currencySymbol: string;
  city?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  coverImage?: string;
  propertyType?: string;
}

interface Message {
  id: string;
  role: 'user' | 'advisor';
  text: string;
  matchedProperties?: MatchedProperty[];
  timestamp: string;
  showActions?: boolean;
}

interface InquiryQuestionCard {
  id: string;
  badge: string;
  title: string;
  query: string;
  description: string;
  icon: string;
}

const INQUIRY_QUESTION_CARDS: InquiryQuestionCard[] = [
  {
    id: 'penthouses-villas',
    badge: 'Signature Portfolios',
    title: 'Penthouses & Luxury Villas',
    query: 'Show me available luxury penthouses and private villas across your portfolio.',
    description: 'Explore signature residential listings and prime waterfront estates',
    icon: '🏰',
  },
  {
    id: 'available-properties',
    badge: 'Active Listings',
    title: 'Browse Available Listings',
    query: 'What properties are currently available in your portfolio?',
    description: 'View active homes, apartments, and investment residences',
    icon: '📍',
  },
  {
    id: 'budget-search',
    badge: 'Investment Criteria',
    title: 'Filter by Price & Budget',
    query: 'Can you help me find listings matching my budget and criteria?',
    description: 'Verified pricing, floor plans, and investment yields',
    icon: '💎',
  },
  {
    id: 'viewing-tour',
    badge: 'Private Concierge',
    title: 'Book Viewing or Video Tour',
    query: 'I would like to schedule a private viewing or live video walkthrough.',
    description: 'Coordinate confidential on-site access or scheduled video walkthrough',
    icon: '🗓️',
  },
  {
    id: 'valuation',
    badge: 'Advisory Desk',
    title: 'Confidential Valuation',
    query: 'How do I arrange a confidential property valuation for my home?',
    description: 'Market appraisal, recent comparables and confidential advisory',
    icon: '📊',
  },
];

const CONCIERGE_SERVICES = [
  { label: '🏛️ Private Viewing', query: 'I would like to schedule a private viewing.' },
  { label: '💎 Prime Residences', query: 'Show me exclusive luxury villas and penthouses available for acquisition.' },
  { label: '📊 Property Valuation', query: 'I would like to arrange a confidential property valuation.' },
];

export const PropertyAIChatbot: React.FC = () => {
  const { data: contact } = useContactInfo();
  const [isOpen, setIsOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProperty, setBookingProperty] = useState<{ id: string; title: string; city?: string; area?: string } | null>(null);
  const [showQuestionCards, setShowQuestionCards] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'advisor',
      text: "Welcome to EstateElite Private Advisory. How may we assist your international acquisitions, private viewings, or portfolio search today?",
      timestamp: 'Today',
      showActions: true,
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      if (messages.length > 1) {
        scrollToBottom();
      } else if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
    }
  }, [messages, isOpen, showQuestionCards]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await publicApi.post('/chat', {
        message: textToSend,
        conversationHistory,
      });

      const responseData = res.data?.data;
      const advisorMsg: Message = {
        id: String(Date.now() + 1),
        role: 'advisor',
        text: responseData?.reply || "Thank you for your inquiry. Our advisory desk is reviewing your requirements.",
        matchedProperties: responseData?.matchedProperties || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'advisor',
          text: "Our senior property director is standing by. You can also connect directly via our Direct Call or WhatsApp buttons below.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showActions: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBooking = (property?: { id: string; title: string; city?: string; area?: string }) => {
    setBookingProperty(property || null);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (details: {
    leadId: string;
    propertyTitle: string;
    date: string;
    time: string;
    visitType: string;
    name: string;
  }) => {
    const confirmMsg: Message = {
      id: `booking-${Date.now()}`,
      role: 'advisor',
      text: `🏛️ Viewing Request Confirmed in Live CRM!\n\nReference: #${details.leadId.slice(-6).toUpperCase()}\nClient: ${details.name}\nProperty: ${details.propertyTitle}\nFormat: ${details.visitType}\nScheduled Window: ${details.date} (${details.time})\n\nOur Senior Advisor has received this lead in the Admin Desk and will contact you directly to confirm security and access logistics.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  const handleResetChat = () => {
    setShowQuestionCards(true);
    setMessages([
      {
        id: 'welcome-1',
        role: 'advisor',
        text: "Conversation refreshed. How may we assist your prime property search or private viewing arrangements today?",
        timestamp: 'Just now',
        showActions: true,
      },
    ]);
  };

  const handleOpenWhatsApp = (customText?: string) => {
    const phone = contact?.whatsappClean || '353891234567';
    const text = customText || 'Hello EstateElite, I would like to speak with a senior property advisor.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Unified Luxury Floating Enterprise Advisory Dock */}
      <aside
        aria-label="Direct Communication & Chat Assistant"
        className="fixed bottom-6 right-4 sm:right-6 z-40 font-sans"
      >
        <div className="flex items-center bg-slate-950/95 backdrop-blur-xl border border-amber-500/30 hover:border-amber-400/60 shadow-2xl shadow-slate-950/60 rounded-full p-1.5 transition-all duration-300 transform hover:-translate-y-0.5">
          {/* Direct Call / Video Tour Button */}
          <button
            onClick={() => setCallModalOpen(true)}
            className="group flex items-center gap-2 px-3.5 py-2 text-white hover:bg-white/10 rounded-full transition-all duration-200 active:scale-95 focus:outline-none"
            aria-label="Direct Call or Video Tour Consultation"
            title="Direct Call & Video Tour Consultation"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-slate-200 hidden sm:inline">
              Call / Tour
            </span>
          </button>

          {/* Elegant Vertical Divider */}
          <span className="h-5 w-px bg-slate-800 shrink-0 mx-0.5" />

          {/* Instant Chat Assistant Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="group flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 via-[#002b55]/60 to-amber-500/20 hover:from-amber-500/30 hover:to-[#00386e] text-white rounded-full transition-all duration-200 active:scale-95 border border-amber-400/30 hover:border-amber-400 focus:outline-none"
            aria-label="Chat with Property Advisor"
            title="Chat with Property Advisor"
          >
            <EnterpriseChatIcon size="sm" variant="gold" className="transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold tracking-wide text-amber-100">
              Chat with Advisor
            </span>
            <span className="flex h-2 w-2 relative" title="Advisors Online">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>
        </div>
      </aside>

      {/* Direct Call / Video Tour Modal */}
      <DirectCallModal isOpen={callModalOpen} onClose={() => setCallModalOpen(false)} />

      {/* Expanded Luxury Private Advisory Suite */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[94vw] sm:w-[440px] max-h-[86vh] h-[680px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          {/* Executive Header */}
          <div className="bg-gradient-to-r from-slate-950 via-[#001e3d] to-slate-950 text-white p-4.5 px-5 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-950/30">
                  <LuxuryEmblem size="sm" variant="gold" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">EstateElite Private Advisory</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Advisors Online • Typical response in 2 mins</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCallModalOpen(true)}
                title="Instant Call / Video Tour"
                className="p-1.5 text-slate-300 hover:text-emerald-400 rounded-lg hover:bg-white/10 transition"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetChat}
                title="Refresh conversation"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close advisory desk"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Curated Client Concierge Menu */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setShowQuestionCards((prev) => !prev)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition border shrink-0 ${
                showQuestionCards
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border-slate-200'
              }`}
            >
              ✦ Question Cards
            </button>
            <span className="h-4 w-px bg-slate-200 shrink-0" />
            {CONCIERGE_SERVICES.map((srv) => (
              <button
                key={srv.label}
                onClick={() => handleSend(srv.query)}
                className="text-[11px] font-semibold px-3 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 rounded-full whitespace-nowrap transition shadow-2xs text-slate-700"
              >
                {srv.label}
              </button>
            ))}
            <button
              onClick={() => setCallModalOpen(true)}
              className="text-[11px] font-semibold px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full whitespace-nowrap transition shadow-2xs"
            >
              📞 Direct Call
            </button>
          </div>

          {/* Conversation Stream */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
            {/* Interactive Question Cards Grid */}
            {showQuestionCards && (
              <div className="bg-gradient-to-b from-slate-50 via-white to-amber-50/20 rounded-2xl p-3.5 border border-slate-200/90 shadow-sm space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Select an Inquiry Question:</span>
                  </div>
                  <button
                    onClick={() => setShowQuestionCards(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-700 font-semibold px-1.5 py-0.5 rounded hover:bg-slate-100 transition"
                  >
                    Hide
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INQUIRY_QUESTION_CARDS.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => {
                        setShowQuestionCards(false);
                        if (card.id === 'viewing-tour') {
                          handleOpenBooking();
                        } else {
                          handleSend(card.query);
                        }
                      }}
                      className="text-left p-3 rounded-xl bg-white hover:bg-amber-50/40 border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-lg leading-none">{card.icon}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-900 transition">
                            {card.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#00386e] transition leading-snug mb-1">
                          {card.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-amber-700 group-hover:text-amber-800">
                        <span>Ask Advisor</span>
                        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Advisor Header Tag */}
                {msg.role === 'advisor' && (
                  <div className="flex items-center gap-1.5 mb-1.5 pl-1 text-[11px] font-bold text-slate-700">
                    <LuxuryEmblem size="xs" variant="gold" />
                    <span>EstateElite Senior Advisory Desk</span>
                  </div>
                )}

                {/* Message Body */}
                <div
                  className={`max-w-[88%] p-4 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-slate-900 to-[#002244] text-white rounded-2xl rounded-br-xs shadow-md font-medium'
                      : 'bg-white text-slate-800 border-l-2 border-l-amber-500 border-y border-r border-slate-200/90 rounded-2xl rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-[12.5px] leading-relaxed">{msg.text}</div>

                  {/* Built-in Client Actions on Welcome / Advisor Prompts */}
                  {msg.showActions && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      <button
                        onClick={() => setCallModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002544] hover:bg-[#003866] text-white text-[11px] font-bold rounded-lg transition shadow-xs"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Request Direct Call</span>
                      </button>
                      <button
                        onClick={() => handleOpenWhatsApp()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20be5b] text-white text-[11px] font-bold rounded-lg transition shadow-xs"
                      >
                        <MessageCircle className="w-3 h-3 fill-white" />
                        <span>WhatsApp Desk</span>
                      </button>
                      <button
                        onClick={() => handleOpenBooking()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition cursor-pointer"
                      >
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span>Book Private Tour</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Matched Luxury Residences Cards */}
                {msg.matchedProperties && msg.matchedProperties.length > 0 && (
                  <div className="mt-3 w-full space-y-2 max-w-[96%]">
                    <div className="flex items-center justify-between pl-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                        <Compass className="w-3.5 h-3.5 text-amber-600" />
                        <span>Curated Verified Residences:</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {msg.matchedProperties.length} verified listings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.matchedProperties.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            {prop.coverImage ? (
                              <img
                                src={prop.coverImage}
                                alt={prop.title}
                                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                                <Building className="w-6 h-6" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-amber-700">
                                  {prop.propertyType || 'Prime Residence'}
                                </span>
                                <span className="text-xs font-black text-[#002f5a]">
                                  {prop.price ? `${prop.currencySymbol}${Number(prop.price).toLocaleString('en-US')}` : 'Price on Application'}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#004274] transition">
                                {prop.title}
                              </h4>
                              <div className="flex items-center gap-1 text-[10.5px] text-slate-500 truncate mt-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{[prop.area, prop.city].filter(Boolean).join(', ') || 'Prime Location'}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600 font-semibold">
                                {prop.bedrooms ? <span>🛏️ {prop.bedrooms} Beds</span> : null}
                                {prop.bathrooms ? <span>🛁 {prop.bathrooms} Baths</span> : null}
                              </div>
                            </div>
                          </div>

                          {/* Quick interactive actions on each card */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <Link
                              to={`/properties/${prop.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00386e] hover:text-[#0055a5] transition"
                            >
                              <span>View Full Details</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenBooking({ id: prop.id, title: prop.title, city: prop.city, area: prop.area })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-lg text-[10.5px] font-bold transition cursor-pointer"
                            >
                              <Calendar className="w-3 h-3 text-amber-700" />
                              <span>Book Viewing</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Quick Reopen Question Cards Prompt */}
            {!showQuestionCards && (
              <div className="flex justify-center pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setShowQuestionCards(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-full text-[11px] font-semibold transition shadow-2xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Show Question Cards</span>
                </button>
              </div>
            )}

            {/* In-Transit Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 max-w-[130px] shadow-xs">
                <LuxuryEmblem size="xs" variant="gold" />
                <span className="text-[11px] text-slate-500 font-medium">Consulting...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Executive Input & Quick Contact Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setCallModalOpen(true)}
                title="Instant Call / Video Tour"
                className="p-2.5 text-slate-500 hover:text-[#004274] hover:bg-slate-100 rounded-xl transition border border-slate-200"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp()}
                title="Direct WhatsApp"
                className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition border border-emerald-200"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inquire about residences, pricing, acquisitions..."
                className="flex-1 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#002544] focus:outline-none transition font-medium"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-slate-950 via-[#002244] to-slate-900 hover:from-slate-900 hover:to-[#003159] text-amber-300 rounded-xl transition disabled:opacity-30 shadow-md"
                aria-label="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 text-center text-[10px] text-slate-400 font-medium">
              Licensed Global Advisory Practice • London • Dublin • Dubai
            </div>
          </div>
        </div>
      )}

      {/* Real CRM Viewing Booking Modal */}
      <ChatBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedProperty={bookingProperty}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
};
