import React, { useState, useEffect, useRef, useContext } from 'react';
import { Sparkles, MessageSquare, X, Send, Maximize2 } from 'lucide-react';
import { DataContext } from '../../context/DataContext';

export default function ForgeAIFloat({ activeTab, setActiveTab }) {
  // If active page is ForgeAI page, hide floating widget
  if (activeTab === 'forge_ai') return null;

  const { chunksMetadata } = useContext(DataContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'forge_ai', text: "Hello! I'm ForgeAI. How can I help you analyze credit defaults, forecasts, or SEC filing texts today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [streaming, setStreaming] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const scoreChunk = (chunkText, query) => {
    const qWords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    const chunkLower = chunkText.toLowerCase();
    let score = 0;
    qWords.forEach(word => {
      const count = (chunkLower.match(new RegExp(word, 'g')) || []).length;
      score += count * 1.5;
    });
    return score;
  };

  const handleSend = (textToSend) => {
    if (!textToSend.trim() || streaming) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setStreaming(true);

    const scored = chunksMetadata.map(c => ({
      ...c,
      score: scoreChunk(c.text, textToSend)
    })).filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score);

    let responseText = "I queried my index, but couldn't locate matching SEC details. Try querying Apple, Microsoft, or NVIDIA risks.";
    if (scored.length > 0) {
      const topMatch = scored[0];
      responseText = `From ${topMatch.company}'s ${topMatch.form} (${topMatch.section.replace('_', ' ')}): "${topMatch.text.trim().slice(0, 200)}..."`;
    }

    let charIndex = 0;
    const finalResponse = responseText;
    const msgId = Date.now();

    setMessages(prev => [...prev, { id: msgId, sender: 'forge_ai', text: '' }]);

    const interval = setInterval(() => {
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return { ...m, text: finalResponse.substring(0, charIndex + 1) };
        }
        return m;
      }));
      charIndex++;
      if (charIndex >= finalResponse.length) {
        clearInterval(interval);
        setStreaming(false);
      }
    }, 15);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      
      {/* Expanded Chatbox Window */}
      {isOpen && (
        <div className="naxus-panel w-[380px] h-[520px] flex flex-col overflow-hidden mb-4 border border-border border-teal/20 slide-up">
          
          {/* Header */}
          <div className="p-4 border-b border-border bg-[#111116] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-teal" />
              <span className="text-xs font-bold heading-syne text-silver">ForgeAI Assistant</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Maximize to full page */}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab('forge_ai');
                }}
                className="text-silver-3 hover:text-teal transition"
                title="Open full dedicated page"
              >
                <Maximize2 size={12} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-silver-3 hover:text-loss transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex gap-2 max-w-[85%] text-[11px] leading-relaxed ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`p-3 rounded-lg ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-teal to-info text-bg font-semibold rounded-tr-none'
                    : 'glass-card border-l-2 border-l-teal rounded-tl-none text-silver-2'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Prompt Pills */}
          <div className="p-3 border-t border-border/20 bg-bg-2/30 flex flex-wrap gap-1.5">
            <span 
              onClick={() => !streaming && handleSend("What are Apple's risk factors?")}
              className="badge-teal cursor-pointer hover:bg-teal/20 text-[9px] py-0.5"
            >
              Apple Risks
            </span>
            <span 
              onClick={() => !streaming && handleSend("What is NVIDIA's revenue growth?")}
              className="badge-gold cursor-pointer hover:bg-gold/20 text-[9px] py-0.5"
            >
              NVIDIA Strategy
            </span>
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-border bg-[#111116] flex gap-2">
            <input 
              type="text"
              placeholder="Ask ForgeAI locally..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              disabled={streaming}
              className="flex-1 bg-[#0c0c0f] border border-border focus:border-teal rounded-md text-[11px] px-3 py-2 outline-none text-silver font-mono"
            />
            <button 
              onClick={() => handleSend(inputText)}
              disabled={streaming}
              className="btn-teal rounded-md w-8 h-8 p-0 flex items-center justify-center"
            >
              <Send size={12} />
            </button>
          </div>

          {/* Dedicated page link */}
          <div className="p-2 border-t border-border text-center bg-bg-2/60">
            <button 
              onClick={() => {
                setIsOpen(false);
                setActiveTab('forge_ai');
              }}
              className="text-[10px] text-teal font-bold hover:underline"
            >
              Open Full ForgeAI Console →
            </button>
          </div>

        </div>
      )}

      {/* Floating Button collapsed */}
      {!isOpen && (
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal to-info hover:glow-teal text-bg flex items-center justify-center shadow-lg hover:scale-105 transform transition duration-300 relative group"
          >
            {/* Pulsing outer accent ring */}
            <span className="absolute inset-0 rounded-full border border-dashed border-teal animate-[spin_8s_linear_infinite] opacity-50"></span>
            <span className="absolute inset-0 rounded-full bg-teal-glow animate-ping opacity-70"></span>
            <MessageSquare size={18} className="z-10 group-hover:scale-110 transition duration-300" />
          </button>
          <span className="text-[9px] font-bold text-teal tracking-widest uppercase mt-1 animate-pulse">
            ForgeAI
          </span>
        </div>
      )}

    </div>
  );
}
