import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Building,
  User,
  Phone,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Share2,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  useWhatsAppConversations,
  useWhatsAppMessages,
  useSendWhatsAppMessage,
  useSendPropertyCard,
  useWhatsAppTemplates,
  Conversation,
} from '../../hooks/useWhatsApp';
import { useProperties } from '../../hooks/useProperties';

export function WhatsAppWorkspacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [propertySearchTerm, setPropertySearchTerm] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useWhatsAppConversations();

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  const { data: conversationData, isLoading: isLoadingMessages } =
    useWhatsAppMessages(selectedConversationId || undefined);

  const currentConversation: Conversation | null =
    conversationData?.conversation ||
    conversations.find((c) => c._id === selectedConversationId) ||
    null;

  const messages = conversationData?.messages || [];

  const { data: templates = [] } = useWhatsAppTemplates();
  const { data: propertiesData } = useProperties({ limit: 50 });
  const properties = propertiesData?.data || [];

  const sendMessageMutation = useSendWhatsAppMessage();
  const sendPropertyMutation = useSendPropertyCard();

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.customer?.name?.toLowerCase().includes(term) ||
      c.phoneNumber?.includes(term) ||
      c.lastMessagePreview?.toLowerCase().includes(term)
    );
  });

  const filteredProperties = properties.filter((p: any) => {
    if (!propertySearchTerm) return true;
    const term = propertySearchTerm.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.city?.toLowerCase().includes(term) ||
      p.slug?.toLowerCase().includes(term)
    );
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate(
      {
        conversationId: selectedConversationId,
        text: messageText,
      },
      {
        onSuccess: () => {
          setMessageText('');
        },
      }
    );
  };

  const handleSendProperty = (propertyId: string) => {
    if (!selectedConversationId) return;

    sendPropertyMutation.mutate(
      {
        conversationId: selectedConversationId,
        propertyId,
      },
      {
        onSuccess: () => {
          setIsShareModalOpen(false);
          setPropertySearchTerm('');
        },
      }
    );
  };

  const handleSelectTemplate = (templateBody: string) => {
    const custName = currentConversation?.customer?.name || 'there';
    const filled = templateBody.replace('{{1}}', custName);
    setMessageText(filled);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block mr-2" />
            WhatsApp Business Inbox
          </h1>
          <p className="text-xs text-gray-500">
            Real-time multi-agent messaging via Meta WhatsApp Business Cloud API.
          </p>
        </div>
      </div>

      {/* Main Workspace Split Pane */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex overflow-hidden">
        {/* Left Side: Conversation Threads */}
        <div className="w-80 sm:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50">
          {/* Search Box */}
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoadingConversations ? (
              <div className="p-6 text-center text-xs text-gray-500">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c._id === selectedConversationId;
                const displayName = c.customer?.name || c.phoneNumber || 'Unknown Lead';

                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedConversationId(c._id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-l-4 border-emerald-600'
                        : 'hover:bg-gray-100/60'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                        {c.lastMessageAt && (
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(c.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 truncate mb-1">
                        {c.lastMessagePreview || 'No messages yet'}
                      </p>

                      <div className="flex items-center space-x-1.5">
                        {c.isOptedOut && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-red-100 text-red-700">
                            Opted Out
                          </span>
                        )}
                        {c.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                            {c.unreadCount}
                          </span>
                        )}
                        {c.lead?.property && (
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                            {c.lead.property.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        {currentConversation ? (
          <div className="flex-1 flex flex-col bg-[#efeae2]/20">
            {/* Chat Top Header */}
            <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {(currentConversation.customer?.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 flex items-center">
                    {currentConversation.customer?.name || currentConversation.phoneNumber}
                    {currentConversation.isOptedOut && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-700 font-semibold">
                        STOPPED
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-500 flex items-center space-x-2">
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-gray-400" />
                      {currentConversation.phoneNumber}
                    </span>
                    {currentConversation.assignedTo && (
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1 text-gray-400" />
                        Advisor: {currentConversation.assignedTo.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Actions & Property Info */}
              <div className="flex items-center space-x-2">
                {currentConversation.lead?.property && (
                  <div className="hidden md:flex items-center bg-gray-50 border rounded px-2.5 py-1 text-xs">
                    <Building className="w-3.5 h-3.5 text-primary mr-1.5" />
                    <span className="font-semibold text-gray-800 truncate max-w-[160px]">
                      {currentConversation.lead.property.title}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-primary text-primary hover:bg-primary/5 rounded-md text-xs font-medium transition"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  Share Property
                </button>
              </div>
            </div>

            {/* Opt-out Warning Alert */}
            {currentConversation.isOptedOut && (
              <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center text-xs text-red-800">
                <ShieldAlert className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                This customer replied STOP and opted out of WhatsApp messages. Outbound messages are
                blocked to maintain compliance.
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {isLoadingMessages ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading chat history...</div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400">
                  <p>No messages in this conversation yet.</p>
                  <p className="mt-1">Send a greeting or share a property to initiate contact.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isOutbound = m.direction === 'outbound';

                  return (
                    <div
                      key={m._id}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3.5 py-2 shadow-xs text-xs relative ${
                          isOutbound
                            ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                            : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                        }`}
                      >
                        {/* Outbound Agent Name */}
                        {isOutbound && m.sentBy && (
                          <p className="text-[10px] font-bold text-emerald-800 mb-0.5">
                            {m.sentBy.name}
                          </p>
                        )}

                        {/* Media Thumbnail */}
                        {m.mediaUrl && (
                          <div className="mb-2 rounded overflow-hidden">
                            <img
                              src={m.mediaUrl}
                              alt=""
                              className="w-full h-36 object-cover rounded"
                            />
                          </div>
                        )}

                        {/* Message Text Content */}
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>

                        {/* Timestamp & Status Icon */}
                        <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-400">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isOutbound && (
                            <span>
                              {m.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                              ) : m.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                              ) : m.status === 'sent' ? (
                                <Check className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <Clock className="w-3 h-3 text-gray-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Templates Bar */}
            <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center space-x-2 overflow-x-auto">
              <span className="text-[10px] font-semibold text-gray-400 flex items-center flex-shrink-0">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Templates:
              </span>
              {templates.map((tpl) => (
                <button
                  key={tpl._id}
                  onClick={() => handleSelectTemplate(tpl.body)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-medium text-gray-700 whitespace-nowrap transition"
                >
                  {tpl.name.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Composer Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
              <input
                type="text"
                disabled={currentConversation.isOptedOut || sendMessageMutation.isPending}
                placeholder={
                  currentConversation.isOptedOut
                    ? 'Messaging disabled: Customer has opted out.'
                    : 'Type a message... (Press Enter to send)'
                }
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 py-2 px-3 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={
                  !messageText.trim() ||
                  currentConversation.isOptedOut ||
                  sendMessageMutation.isPending
                }
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8 bg-gray-50/50">
            <div>
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Select a conversation</p>
              <p className="text-xs text-gray-500 mt-1">
                Choose a customer from the left list to begin messaging.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Share Property Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-1">Share Property via WhatsApp</h3>
            <p className="text-xs text-gray-500 mb-4">
              Select a property listing to dispatch a formatted card with photo, price, and private
              inspection link to {currentConversation?.customer?.name || 'the client'}.
            </p>

            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings by title or city..."
                value={propertySearchTerm}
                onChange={(e) => setPropertySearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-md"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-gray-100">
              {filteredProperties.map((p: any) => (
                <div
                  key={p._id}
                  className="pt-2 flex items-center justify-between hover:bg-gray-50 p-2 rounded transition"
                >
                  <div className="flex items-center space-x-3">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt="" className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <Building className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-900">{p.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {p.city} • {p.price ? `€${p.price.toLocaleString()}` : 'Price on request'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendProperty(p._id)}
                    disabled={sendPropertyMutation.isPending}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                  >
                    Send Card
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
