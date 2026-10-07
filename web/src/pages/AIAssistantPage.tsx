import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt?: string;
}

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ASSISTANT',
      content:
        '👋 Hello ' +
        (user?.name || 'there') +
        "! I am your **RideSafe AI Assistant**.\n\n" +
        'I provide real-time assistance with:\n' +
        '• Visual Pickup Assistance & landmark navigation\n' +
        '• Passenger safety protocols, SOS & vehicle checks\n' +
        '• SmartMatch driver scoring & transparent fare breakdowns\n' +
        '• Organizing trip projects & tasks\n\n' +
        'How can I help you today?',
    },
  ]);

  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "My driver can't find me.",
    "I don't feel safe.",
    'How does the 4-digit Ride PIN work?',
    'Explain the estimated fare calculation.',
    'How do I plan a trip project with tasks?',
    'What is the SmartMatch driver score?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isSending) return;

    setInput('');
    // Add user message
    const userMsg: Message = { role: 'USER', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await api.post('/ai/chat', {
        message: text,
        sessionId,
      });

      if (res.data.success) {
        setSessionId(res.data.data.sessionId);
        const assistantMsg: Message = {
          role: 'ASSISTANT',
          content: res.data.data.reply,
          createdAt: res.data.data.createdAt,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'ASSISTANT',
        content: '⚠️ ' + (err.response?.data?.message || 'Sorry, I encountered an issue. Please try again.'),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-widest uppercase text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            AI MOBILITY INTELLIGENCE
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">
          RideSafe AI Assistant
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Backend-controlled assistant for trip planning, safety protocols, and transit guidance
        </p>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Suggestions:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="shrink-0 rounded-full border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:text-cyan-300 px-3 py-1 text-xs text-slate-300 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 space-y-4 shadow-inner">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'ASSISTANT';

          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 text-white">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                  isAssistant
                    ? 'border border-slate-800 bg-slate-950/90 text-slate-200'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium'
                }`}
              >
                {/* Formatting markdown paragraphs */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.content}
                </div>
              </div>

              {!isAssistant && (
                <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-cyan-400 font-bold text-xs border border-slate-700">
                  {user?.name ? user.name[0] : 'U'}
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-950 flex items-center justify-center shrink-0 border border-cyan-800 text-cyan-400">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              <span>RideSafe AI is analyzing your inquiry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask RideSafe AI about safety, fare breakdown, landmarks, or tasks..."
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="rounded-xl bg-cyan-400 hover:bg-cyan-300 p-3 text-slate-950 shadow-lg shadow-cyan-400/20 transition disabled:opacity-50"
          title="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
