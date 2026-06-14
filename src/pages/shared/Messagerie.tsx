import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import type { ChatMessage } from '../../store/chatStore';
import { Send, Search, MessageSquare, ArrowLeft, Clock, User, Check, CheckCheck, Mic, Volume2, X, MoreVertical, Reply, Smile } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { useSpeechToText } from '../../hooks/useSpeechToText';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// Sub-component for Real Audio Message Playback
function AudioBubblePlayer({ text, duration, isOwn }: { text: string; duration: string; isOwn: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!text || !text.startsWith('data:audio')) return;

    const audio = new Audio(text);
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [text]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Playback failed:", err);
        });
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center gap-3 py-1 text-inherit">
      <button 
        type="button" 
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isOwn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
        }`}
      >
        {isPlaying ? (
          <span className={`w-2.5 h-2.5 rounded-sm ${isOwn ? 'bg-white' : 'bg-indigo-600'}`} />
        ) : (
          <svg className={`w-3 h-3 fill-current translate-x-0.5`} viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex flex-col gap-1 w-36">
        {/* Animated Sound Wave Bars */}
        <div className="flex items-end gap-0.5 h-6">
          {Array.from({ length: 18 }).map((_, idx) => {
            const active = progress > (idx / 18) * 100;
            const h = 4 + ((idx * 7) % 12);
            return (
              <div 
                key={idx} 
                className={`w-0.5 rounded-full transition-all duration-300 ${
                  active 
                    ? (isOwn ? 'bg-emerald-350' : 'bg-emerald-500') 
                    : (isOwn ? 'bg-white/40' : 'bg-slate-350 dark:bg-slate-700')
                }`} 
                style={{ height: `${h}px` }} 
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] opacity-70">
          <span>{formatTime(currentTime)}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}

export default function Messagerie() {
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeChatId, 
    activeMessages, 
    sendMessage, 
    sendAudioMessage, 
    editMessage, 
    deleteMessage, 
    addReaction, 
    deleteConversations,
    subscribeToChat, 
    markChatAsRead, 
    setActiveChat 
  } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  // Selection states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);

  // Advanced States
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Speech-to-text hook
  const { 
    isListening: isSpeechListening, 
    isSupported: isSpeechSupported, 
    startListening: startSpeechListening, 
    stopListening: stopSpeechListening 
  } = useSpeechToText({
    onResult: (text) => {
      setInputText(prev => prev + (prev ? ' ' : '') + text);
    }
  });

  const handleDeleteConversations = async () => {
    if (selectedChatIds.length === 0 || !user) return;
    const confirmDelete = window.confirm(`Voulez-vous supprimer ces ${selectedChatIds.length} conversation(s) ?`);
    if (!confirmDelete) return;

    try {
      await deleteConversations(selectedChatIds, user.id);
      ToastSuccess("Conversations supprimées.");
      setSelectedChatIds([]);
      setIsSelectionMode(false);
      setActiveChat(null);
    } catch (err) {
      ToastError("Erreur lors de la suppression.");
    }
  };

  const toggleSelectChat = (chatId: string) => {
    setSelectedChatIds(prev => 
      prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]
    );
  };

  const handleSelectAll = () => {
    if (selectedChatIds.length === filteredConversations.length) {
      setSelectedChatIds([]);
    } else {
      setSelectedChatIds(filteredConversations.map(c => c.chatId));
    }
  };

  const getLastMessagePreview = (lastMsg: ChatMessage | undefined) => {
    if (!lastMsg) return 'Démarrer la discussion';
    if (lastMsg.deletedForEveryone) return 'Ce message a été supprimé';
    if (lastMsg.isAudio || lastMsg.text?.startsWith('data:audio/')) return '🎙️ vocal';
    return lastMsg.text;
  };

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

  // Mark active chat as read
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
      if (editingMessage) {
        await editMessage(activeChatId, editingMessage.id, inputText);
        setEditingMessage(null);
      } else {
        const replyPayload = replyingTo 
          ? { messageId: replyingTo.id, senderName: replyingTo.senderName, text: replyingTo.text, isAudio: !!replyingTo.isAudio } 
          : undefined;
        await sendMessage(activeChatId, user.id, user.name, inputText, replyPayload);
        setReplyingTo(null);
      }
      setInputText('');
    } catch (err: any) {
      ToastError("Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  };

  // Recording audio message handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          if (!activeChatId || !user) return;
          const base64Data = reader.result as string;
          const min = Math.floor(recordingTime / 60);
          const sec = recordingTime % 60;
          const durationStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

          try {
            await sendAudioMessage(activeChatId, user.id, user.name, base64Data, durationStr);
            ToastSuccess("Note vocale envoyée !");
          } catch (err) {
            ToastError("Erreur d'envoi de la note vocale.");
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      ToastError("Impossible d'accéder au microphone.");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
      ToastSuccess("Enregistrement annulé.");
    }
  };

  const sendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatRecordingTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    return `${min}:${s < 10 ? '0' : ''}${s}`;
  };

  // Message modifications
  const handleEdit = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setInputText(msg.text);
    setReplyingTo(null);
  };

  const handleDelete = async (msg: ChatMessage, forEveryone: boolean) => {
    if (!activeChatId || !user) return;
    try {
      await deleteMessage(activeChatId, msg.id, forEveryone, user.id);
      ToastSuccess("Message supprimé.");
    } catch (err) {
      ToastError("Impossible de supprimer le message.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    ToastSuccess("Message copié !");
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!activeChatId || !user) return;
    try {
      await addReaction(activeChatId, msgId, user.id, emoji);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
    setEditingMessage(null);
  };

  // Filter conversations
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
        <div className="p-4 border-b border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-heading font-bold text-content flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={20} />
              Messagerie Directe
            </h1>
            {filteredConversations.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedChatIds([]);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  isSelectionMode
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                    : 'bg-surface hover:bg-surface-raised border-border text-content-secondary'
                }`}
              >
                {isSelectionMode ? 'Annuler' : 'Gérer'}
              </button>
            )}
          </div>
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

          {/* Selection Actions Bar */}
          {isSelectionMode && (
            <div className="flex items-center justify-between bg-surface-raised border border-border rounded-xl p-2 text-xs animate-fade-in gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="btn btn-xs btn-ghost text-[10px]"
              >
                {selectedChatIds.length === filteredConversations.length ? 'Décocher tout' : 'Tout cocher'}
              </button>
              <span className="font-semibold text-content-muted text-[10px] truncate">
                {selectedChatIds.length} sélectionné(s)
              </span>
              <button
                type="button"
                disabled={selectedChatIds.length === 0}
                onClick={handleDeleteConversations}
                className="btn btn-xs btn-error text-[10px] text-white"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

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
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleSelectChat(chat.chatId);
                    } else {
                      setActiveChat(chat.chatId);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 text-left ${
                    isActive && !isSelectionMode
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-content'
                      : 'hover:bg-surface-raised/80 text-content-secondary hover:text-content border-l-4 border-transparent'
                  }`}
                >
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedChatIds.includes(chat.chatId)}
                      onChange={() => toggleSelectChat(chat.chatId)}
                      className="checkbox checkbox-primary checkbox-xs flex-shrink-0"
                      onClick={(e) => e.stopPropagation()} // Prevent double trigger
                    />
                  )}

                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/10 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400">
                      {chat.recipientName.charAt(0).toUpperCase()}
                    </div>
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
                      {getLastMessagePreview(chat.lastMessage)}
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
                    Envoyez un message pour démarrer la discussion.
                  </p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isOwn = msg.senderId === user.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}
                    >
                      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {/* Sender Name */}
                        {!isOwn && (
                          <span className="text-[10px] text-content-muted mb-1 ml-2">
                            {msg.senderName}
                          </span>
                        )}
                        
                        <div className="flex items-center gap-1">
                          {/* Options dropdown menu (visible on hover) */}
                          {isOwn && (
                            <div className="dropdown dropdown-left dropdown-hover opacity-0 group-hover:opacity-100 transition-opacity">
                              <button tabIndex={0} type="button" className="p-1 rounded-lg hover:bg-surface-raised text-content-muted">
                                <MoreVertical size={14} />
                              </button>
                              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-surface border border-border rounded-xl w-52 z-30 text-xs gap-1">
                                {/* Emoji reaction shortcuts */}
                                <div className="flex gap-1 justify-center border-b border-border-subtle pb-1.5 mb-1">
                                  {EMOJIS.map(emo => (
                                    <button 
                                      key={emo} 
                                      type="button" 
                                      onClick={() => handleReaction(msg.id, emo)} 
                                      className="hover:scale-125 transition-transform text-base"
                                    >
                                      {emo}
                                    </button>
                                  ))}
                                </div>
                                <li><button type="button" onClick={() => handleReply(msg)} className="flex items-center gap-1.5"><Reply size={12} />Répondre</button></li>
                                <li><button type="button" onClick={() => handleCopy(msg.text)}>Copier</button></li>
                                {!msg.deletedForEveryone && (
                                  <li><button type="button" onClick={() => handleEdit(msg)}>Modifier</button></li>
                                )}
                                <li><button type="button" onClick={() => handleDelete(msg, false)} className="text-red-500">Supprimer pour moi</button></li>
                                {!msg.deletedForEveryone && (
                                  <li><button type="button" onClick={() => handleDelete(msg, true)} className="text-red-500">Supprimer pour tous</button></li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words relative ${
                            isOwn
                              ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                              : 'bg-surface-raised border border-border-subtle text-content rounded-tl-none'
                          }`}>
                            {/* Reply Quote Display */}
                            {msg.replyTo && (
                              <div className={`mb-2 p-2 rounded-xl text-xs border-l-4 border-indigo-500 flex flex-col ${
                                isOwn ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-content-secondary'
                              }`}>
                                <span className="font-bold text-indigo-500">{msg.replyTo.senderName}</span>
                                <span className="truncate">{msg.replyTo.isAudio ? '🎵 Note vocale' : msg.replyTo.text}</span>
                              </div>
                            )}

                            {msg.deletedForEveryone ? (
                              <span className="italic text-xs opacity-60">Ce message a été supprimé</span>
                            ) : msg.isAudio && msg.audioDuration ? (
                              <AudioBubblePlayer text={msg.text} duration={msg.audioDuration} isOwn={isOwn} />
                            ) : (
                              msg.text
                            )}

                            {/* Edited status */}
                            {msg.edited && !msg.deletedForEveryone && (
                              <span className="block text-[8px] opacity-60 text-right mt-1">modifié</span>
                            )}
                          </div>

                          {!isOwn && (
                            <div className="dropdown dropdown-right dropdown-hover opacity-0 group-hover:opacity-100 transition-opacity">
                              <button tabIndex={0} type="button" className="p-1 rounded-lg hover:bg-surface-raised text-content-muted">
                                <MoreVertical size={14} />
                              </button>
                              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-surface border border-border rounded-xl w-52 z-30 text-xs gap-1">
                                <div className="flex gap-1 justify-center border-b border-border-subtle pb-1.5 mb-1">
                                  {EMOJIS.map(emo => (
                                    <button 
                                      key={emo} 
                                      type="button" 
                                      onClick={() => handleReaction(msg.id, emo)} 
                                      className="hover:scale-125 transition-transform text-base"
                                    >
                                      {emo}
                                    </button>
                                  ))}
                                </div>
                                <li><button type="button" onClick={() => handleReply(msg)} className="flex items-center gap-1.5"><Reply size={12} />Répondre</button></li>
                                <li><button type="button" onClick={() => handleCopy(msg.text)}>Copier</button></li>
                                <li><button type="button" onClick={() => handleDelete(msg, false)} className="text-red-500">Supprimer pour moi</button></li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Reactions and Metadata */}
                        <div className={`flex items-center gap-2 mt-1 px-1 text-[9px] text-content-muted ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span>{formatMessageTime(msg.timestamp)}</span>
                          </div>
                          {isOwn && (
                            msg.read ? (
                              <CheckCheck size={12} className="text-indigo-500" />
                            ) : (
                              <Check size={12} />
                            )
                          )}
                          
                          {/* Reactions badges */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex items-center gap-0.5 bg-surface-raised border border-border px-1.5 py-0.5 rounded-full shadow-sm text-xs">
                              {Object.entries(msg.reactions).map(([uid, emo]) => (
                                <span key={uid} title={uid === user.id ? 'Vous' : 'Autre'}>{emo}</span>
                              ))}
                            </div>
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
              {/* Quoted Message Preview */}
              {replyingTo && (
                <div className="mb-2 p-2 rounded-xl bg-surface-raised border border-border-subtle flex items-center justify-between text-xs animate-fade-in">
                  <div className="border-l-4 border-indigo-500 pl-2">
                    <p className="font-bold text-indigo-600">Réponse à {replyingTo.senderName}</p>
                    <p className="text-content-muted truncate">{replyingTo.isAudio ? '🎵 Note vocale' : replyingTo.text}</p>
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-content-muted hover:text-content">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Editing Indicator */}
              {editingMessage && (
                <div className="mb-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-xs flex justify-between items-center text-amber-800 dark:text-amber-450 animate-fade-in">
                  <span>Mode édition : modification de votre message...</span>
                  <button type="button" onClick={() => { setEditingMessage(null); setInputText(''); }} className="hover:text-amber-900">
                    <X size={14} />
                  </button>
                </div>
              )}

              {isRecording ? (
                /* Active Recording Controls */
                <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-3 text-xs text-red-700 dark:text-red-400 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-semibold">Enregistrement note vocale...</span>
                    <span className="font-mono font-bold ml-1">{formatRecordingTime(recordingTime)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="btn btn-xs btn-error btn-outline rounded-lg text-[10px]"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={sendRecording}
                      className="btn btn-xs btn-error rounded-lg text-[10px] text-white"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Inputs */
                <div className="flex gap-2 items-end">
                  {/* Dictation Button */}
                  {isSpeechSupported && (
                    <button
                      type="button"
                      onClick={isSpeechListening ? stopSpeechListening : startSpeechListening}
                      className={`p-2.5 rounded-xl border flex-shrink-0 transition-all ${
                        isSpeechListening
                          ? 'bg-red-50 text-red-500 border-red-200 animate-pulse'
                          : 'bg-surface hover:bg-surface-raised border-border text-content-muted hover:text-content'
                      }`}
                      title={isSpeechListening ? "Arrêter la dictée" : "Dicter le message"}
                    >
                      <Mic size={16} />
                    </button>
                  )}

                  {/* Audio Recording Toggle */}
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-2.5 rounded-xl border bg-surface hover:bg-surface-raised border-border text-content-muted hover:text-content flex-shrink-0"
                    title="Enregistrer note vocale"
                  >
                    <Volume2 size={16} className="text-indigo-500 animate-pulse" />
                  </button>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder={editingMessage ? "Modifier le message..." : "Écrivez votre message ici... (Entrée pour envoyer)"}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-border bg-surface/50 text-content placeholder-content-muted p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all max-h-32"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none flex-shrink-0"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">{editingMessage ? 'Modifier' : 'Envoyer'}</span>
                  </button>
                </div>
              )}
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
