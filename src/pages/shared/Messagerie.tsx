import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import type { ChatConversation } from '../../store/chatStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { Send, Search, MessageSquare, ArrowLeft, Clock, User, Check, CheckCheck } from 'lucide-react';
import { ToastError } from '../../controllers/Toast-emitter';

export default function Messagerie() {
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeChatId, 
    activeMessages, 
    sendMessage, 
    subscribeToChat, 
    markChatAsRead, 
    setActiveChat 
  } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  // Find active conversation object
  const activeConversation = conversations.find(c => c.chatId === activeChatId);

  // Subscribe to active chat messages
  useEffect(() => {
    if (activeChatId) {
      const unsub = subscribeToChat(activeChatId);
      return () => {
        unsub();
      };
    }
  }, [activeChatId, subscribeToChat]);

  // Mark active chat as read when messages load or activeChatId changes
  useEffect(() => {
    if (activeChatId && user) {
      markChatAsRead(activeChatId, user.id).catch(err => {
        console.error("Erreur marquage lu:", err);
      });
    }
  }, [activeChatId, activeMessages.length, user, markChatAsRead]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !user) return;

    setSending(true);
    try {
      await sendMessage(activeChatId, user.id, user.name, inputText);
      setInputText('');
    } catch (err: any) {
      ToastError("Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  };

  // Filter conversations/directory by search term
  const filteredConversations = conversations.filter(c =>
    c.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      
      const isToday = date.toDateString() === now.toDateString();
      const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      if (isToday) {
        return `Aujourd'hui à ${timeStr}`;
      } else {
        const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        return `${dateStr} à ${timeStr}`;
      }
    } catch {
      return '';
    }
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-surface/40 backdrop-blur-md rounded-2xl border border-border-subtle overflow-hidden shadow-glow">
      {/* List / Sidebar directory of chats */}
      <div className={`w-full md:w-80 flex flex-col border-r border-border-subtle bg-surface-raised/30 ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search header */}
        <div className="p-4 border-b border-border-subtle space-y-3">
          <h1 className="text-xl font-heading font-bold text-content flex items-center gap-2">
            <MessageSquare className="text-indigo-500" size={20} />
            Messagerie Directe
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-content-muted" size={16} />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-surface/50 text-content placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center">
              <User className="mx-auto text-content-muted mb-2 opacity-50" size={32} />
              <p className="text-sm text-content-muted">Aucun contact trouvé</p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isActive = chat.chatId === activeChatId;
              const hasUnread = chat.unreadCount > 0;
              
              return (
                <button
                  key={chat.chatId}
                  onClick={() => setActiveChat(chat.chatId)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-content'
                      : 'hover:bg-surface-raised/80 text-content-secondary hover:text-content border-l-4 border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/10 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400">
                      {chat.recipientName.charAt(0).toUpperCase()}
                    </div>
                    {/* Role badge */}
                    <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 text-[8px] font-bold uppercase rounded-md text-white ${
                      chat.recipientRole === 'TEACHER' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}>
                      {chat.recipientRole === 'TEACHER' ? 'Prof' : 'Étu'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold truncate ${hasUnread ? 'text-content font-bold' : ''}`}>
                        {chat.recipientName}
                      </span>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-content-muted flex-shrink-0 ml-1">
                          {new Date(chat.lastMessage.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-content font-medium' : 'text-content-muted'}`}>
                      {chat.lastMessage ? chat.lastMessage.text : 'Démarrer la discussion'}
                    </p>
                  </div>

                  {hasUnread && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Chat Pane */}
      <div className={`flex-1 flex flex-col bg-surface/20 ${
        !activeChatId ? 'hidden md:flex' : 'flex'
      }`}>
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border-subtle bg-surface-raised/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 -ml-2 rounded-xl text-content-secondary hover:bg-surface-raised transition-colors"
                  aria-label="Retour à la liste"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-base font-bold text-content flex items-center gap-2">
                    {activeConversation.recipientName}
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      activeConversation.recipientRole === 'TEACHER'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}>
                      {activeConversation.recipientRole === 'TEACHER' ? 'Enseignant' : 'Étudiant'}
                    </span>
                  </h2>
                  <p className="text-xs text-content-muted">Discussion en temps réel sécurisée</p>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70 p-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-4 text-indigo-500">
                    <MessageSquare size={28} />
                  </div>
                  <h3 className="font-semibold text-content mb-1">Aucun message</h3>
                  <p className="text-sm text-content-muted max-w-xs">
                    Envoyez un message pour démarrer votre conversation avec {activeConversation.recipientName}.
                  </p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isOwn = msg.senderId === user.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {/* Sender Name (only for other users) */}
                        {!isOwn && (
                          <span className="text-[10px] text-content-muted mb-1 ml-2">
                            {msg.senderName}
                          </span>
                        )}
                        
                        {/* Bubble */}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                            : 'bg-surface-raised border border-border-subtle text-content rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>

                        {/* Timestamp & Status */}
                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] text-content-muted">
                          <Clock size={10} />
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {isOwn && (
                            msg.read ? (
                              <CheckCheck size={12} className="text-indigo-500" />
                            ) : (
                              <Check size={12} />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-border-subtle bg-surface-raised/10">
              <div className="flex gap-2 items-end">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Écrivez votre message ici... (Entrée pour envoyer)"
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-border bg-surface/50 text-content placeholder-content-muted p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all max-h-32"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none flex-shrink-0"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70 p-6">
            <div className="w-16 h-16 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4 text-content-muted">
              <MessageSquare size={28} />
            </div>
            <h3 className="font-semibold text-content text-lg mb-1">Sélectionnez une discussion</h3>
            <p className="text-sm text-content-muted max-w-sm">
              Choisissez un contact dans la liste de gauche pour afficher la messagerie et échanger en temps réel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
