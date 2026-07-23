import React, { useState, useRef, useEffect } from 'react';
import { useKayimStore } from '../../store/kayimStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const KayimChatDrawer: React.FC = () => {
  const { 
    isOpen, 
    toggleChat, 
    messages, 
    isTyping, 
    sendMessage, 
    clearHistory,
    suggestedQuestions,
    initSuggestions 
  } = useKayimStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'STUDENT';
  const userName = user?.prenom || user?.name?.split(' ')[0] || 'Utilisateur';

  useEffect(() => {
    initSuggestions(role);
  }, [role, initSuggestions]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text, role, userName);
  };

  const handleSuggestionClick = async (question: string) => {
    await sendMessage(question, role, userName);
  };

  const handleActionClick = (url: string) => {
    if (url.startsWith('mailto:')) {
      window.location.href = url;
      return;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(url);
    if (window.innerWidth < 768) {
      toggleChat();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={toggleChat}
        aria-label="Ouvrir KAYIM Assistant"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-full shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
      >
        <div className="relative flex items-center justify-center">
          <Bot size={22} className="text-white group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="hidden sm:inline text-sm font-semibold tracking-wide">KAYIM IA</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={toggleChat}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white flex items-center justify-between border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 ring-1 ring-indigo-400/40 rounded-xl flex items-center justify-center">
              <Bot size={24} className="text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">KAYIM</h3>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full">
                  Assistant IA
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Guide officiel de la plateforme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              title="Réinitialiser la discussion"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={toggleChat}
              title="Fermer"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>



        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 rounded-bl-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-none'
                }`}
              >
                {/* Header info for KAYIM */}
                {msg.sender === 'kayim' && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/50 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Bot size={15} />
                    <span>KAYIM</span>
                  </div>
                )}

                {/* Main Text Content */}
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Steps Rendering if present */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    {msg.steps.map((step) => (
                      <div key={step.stepNumber} className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-0.5">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-[10px] font-bold">
                            {step.stepNumber}
                          </span>
                          {step.title}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                        {step.uiLocation && (
                          <div className="mt-1 text-[11px] text-slate-400 italic">
                            📍 {step.uiLocation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {msg.actionButtons && msg.actionButtons.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2">
                    {msg.actionButtons.map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(btn.url)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium text-xs rounded-lg transition-colors border border-indigo-200/60 dark:border-indigo-700/40"
                      >
                        <span>{btn.label}</span>
                        <ExternalLink size={12} />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2 bg-white dark:bg-slate-800 rounded-2xl max-w-[120px] border border-slate-200 dark:border-slate-700">
              <Sparkles size={14} className="animate-spin text-indigo-500" />
              <span>KAYIM écrit...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <HelpCircle size={12} />
              <span>Suggestions rapides :</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(q)}
                  className="text-left text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-colors border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-1"
                >
                  <span>{q}</span>
                  <ChevronRight size={12} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Posez votre question à KAYIM..."
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};
