import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  CornerDownLeft,
  Cpu,
  Database,
  Flame,
  HelpCircle,
  Layers,
  Lightbulb,
  MessageSquare,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
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

interface CopilotPageProps {
  wellId?: string;
}

export const CopilotPage: React.FC<CopilotPageProps> = ({ wellId = 'BGW-001' }) => {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "### BAGHETWIN Industrial Intelligence Copilot\n\nWelcome to the operational intelligence center for **Baghewala Heavy Oil Field**. I am directly connected to the 35-well fleet registry, live virtual well telemetry, and trained scikit-learn models (`production_model.pkl`, `anomaly_model.pkl`, `rod_risk_model.pkl`).\n\nYou can query fleet health, examine specific wells, interpret ML predictions, diagnose pump rod-floating risks, and review VFD/SRP recommendations.",
      disclaimer: "Domain-grounded analytical AI engine · Rule-based and model-driven",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowups: [
        "Give me an overview of all 35 wells.",
        "Which wells are currently operational?",
        "Explain the current status of Well 12.",
        "What does this pump health prediction mean?",
        "Summarize the available operational warnings.",
        "Explain the latest viscosity prediction.",
        "What does the existing VFD recommendation suggest?"
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        text: "Could not communicate with the BAGHETWIN Copilot backend service. Please check that the backend is running.",
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

  const suggestedCards = [
    {
      title: "Fleet Overview",
      desc: "Analyze status breakdown across all 35 monitored wells",
      prompt: "Give me an overview of all 35 wells."
    },
    {
      title: "Active Producers",
      desc: "List the 28 operational wells and production ranges",
      prompt: "Which wells are currently operational?"
    },
    {
      title: "VFD & SRP Settings",
      desc: "Engineering rationale for current pump speed recommendation",
      prompt: "What does the existing VFD recommendation suggest?"
    },
    {
      title: "Viscosity Model",
      desc: "Thermal viscosity drop and mobility in heavy crude",
      prompt: "Explain the latest viscosity prediction."
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Page Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-400 pulse-amber" />
            OPERATIONAL ASSISTANT & EXPLAINABLE ML
          </div>
          <h2 className="text-3xl font-black text-white mt-1">
            BAGHETWIN <span className="gradient-text">Copilot Intelligence</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Domain-informed assistant for telemetry interpretation, anomaly diagnosis, and optimization guidance across the Baghewala field.
          </p>
        </div>

        {/* Clear / Reset Conversation */}
        <button
          onClick={() =>
            setMessages([
              {
                id: 'reset',
                sender: 'assistant',
                text: "Conversation reset. How can I assist you with Baghewala operations today?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestedFollowups: [
                  "Give me an overview of all 35 wells.",
                  "Which wells are currently operational?",
                  "Summarize the available operational warnings."
                ]
              }
            ])
          }
          className="self-start md:self-center px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
        >
          <RefreshCcw size={13} /> Reset Chat
        </button>
      </div>

      {/* Suggested Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {suggestedCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => handleSend(card.prompt)}
            className="glass glass-card-hover rounded-2xl p-4 cursor-pointer border border-slate-800 hover:border-amber-400/40 group transition-all"
          >
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold mb-1">
              <span>{card.title}</span>
              <Sparkles size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-slate-400 leading-snug">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Conversation Stream Window */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar space-y-4 text-sm">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300 mt-1">
                  <Bot size={20} />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-medium rounded-tr-sm shadow-lg shadow-amber-500/15'
                    : 'bg-[#0e1622]/90 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-line text-sm leading-6">{m.text}</div>

                {m.disclaimer && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 text-xs text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400 shrink-0" />
                    <span>{m.disclaimer}</span>
                  </div>
                )}

                {/* Followup Question Buttons */}
                {m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-700/50 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 block">
                      Explore further:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedFollowups.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="text-xs text-left px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-amber-500/20 text-amber-300 border border-slate-700 hover:border-amber-400/40 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-right opacity-50 mt-1.5">{m.timestamp}</div>
              </div>

              {m.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300 mt-1">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}

          {/* Busy Loading Indicator */}
          {busy && (
            <div className="flex gap-3.5 items-center">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
                <Bot size={20} />
              </div>
              <div className="bg-[#0e1622]/90 border border-slate-700/60 rounded-2xl px-5 py-3 flex items-center gap-2 text-slate-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2">Analyzing fleet records & running model inferences...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0a1118] border-t border-slate-800">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: 'Give me an overview of all 35 wells', 'Explain Well 12', 'What does this pump health prediction mean?'..."
              className="w-full pl-4 pr-12 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || busy}
              className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition shadow-md shadow-amber-500/20"
            >
              <Send size={16} />
            </button>
          </div>

          <div className="mt-2 text-xs text-center text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>
              BAGHETWIN Copilot is an analytical assistant grounded in telemetry and local ML models. It does not control physical field equipment.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
