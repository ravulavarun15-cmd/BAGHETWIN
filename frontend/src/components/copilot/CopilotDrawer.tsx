import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  ChevronDown,
  CornerDownLeft,
  Flame,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  User,
  X,
  Zap
} from 'lucide-react';
import * as api from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  disclaimer?: string;
  timestamp: string;
  suggestedFollowups?: string[];
}

interface CopilotDrawerProps {
  wellId?: string;
  onOpenFullPage?: () => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  wellId = 'BGW-001',
  onOpenFullPage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "### Welcome to BAGHETWIN Copilot\n\nI am your analytical assistant for the **Baghewala Heavy Oil Field**. I can explain fleet conditions across the 35 wells, interpret live telemetry, summarize ML forecasts, and explain SRP/VFD recommendations.\n\nWhat would you like to explore?",
      disclaimer: "Analytical engine grounded in local dataset and trained scikit-learn models",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowups: [
        "Give me an overview of all 35 wells.",
        "Which wells are currently operational?",
        "What does the existing VFD recommendation suggest?",
        "Explain the latest viscosity prediction."
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || busy) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    try {
      const res = await api.copilotQuery(userMsg.text, wellId);
      const data = res.data;

      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No information available for this request.',
        disclaimer: data.disclaimer,
        suggestedFollowups: data.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "Could not reach the BAGHETWIN Copilot backend service. Please verify that the FastAPI backend is operational.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-amber-300/30 group"
          aria-label="Open BAGHETWIN Copilot AI"
        >
          <div className="relative">
            <Bot size={22} className="text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 pulse-emerald" />
          </div>
          <span className="text-xs font-black tracking-wider uppercase pr-1">
            Copilot AI
          </span>
        </button>
      )}

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[620px] max-h-[85vh] glass-panel rounded-3xl border border-amber-400/30 shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-slide-in-right">
          {/* Drawer Header */}
          <div className="p-4 bg-gradient-to-r from-[#0b1118] to-[#121c29] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-white">BAGHETWIN Copilot</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 font-bold border border-amber-400/20">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Grounded in 35-well telemetry & ML
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenFullPage && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullPage();
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  title="Expand to Full Page"
                >
                  <Maximize2 size={15} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Conversation History Area */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300 mt-1">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-medium rounded-tr-sm shadow-md shadow-amber-500/10'
                      : 'bg-[#0e1622]/90 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-line text-[12px]">{m.text}</div>

                  {m.disclaimer && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-400 shrink-0" />
                      <span>{m.disclaimer}</span>
                    </div>
                  )}

                  {/* Followup Question Pills */}
                  {m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/50 space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        Suggested queries:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.suggestedFollowups.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(q)}
                            className="text-[10px] text-left px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-amber-500/20 text-amber-300 border border-slate-700 hover:border-amber-400/40 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[9px] text-right opacity-50 mt-1">{m.timestamp}</div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300 mt-1">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {/* Busy Typing Indicator */}
            {busy && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
                  <Bot size={15} />
                </div>
                <div className="bg-[#0e1622]/90 border border-slate-700/60 rounded-2xl px-4 py-2.5 flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1.5">Analyzing telemetry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-[#0b1118] border-t border-slate-800">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about 35 wells, telemetry, ML predictions..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || busy}
                className="absolute right-1.5 p-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition shadow-md shadow-amber-500/20"
              >
                <Send size={13} />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-center text-slate-500">
              Operational interpretation assistant · Does not issue field control signals
            </div>
          </div>
        </div>
      )}
    </>
  );
};
