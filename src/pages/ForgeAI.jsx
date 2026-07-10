import React, { useState, useEffect, useContext, useRef } from 'react';
import { Sparkles, FileText, Send, HelpCircle, ArrowRight, BrainCircuit } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function ForgeAI() {
  const { chunksMetadata } = useContext(DataContext);

  const [messages, setMessages] = useState([
    { 
      sender: 'forge_ai', 
      text: `Hello. I'm ForgeAI — Financial Optimization & Risk Generative Engine. I have indexed ${chunksMetadata.length} SEC EDGAR filings from Apple, Microsoft, NVIDIA, JPMorgan, and Goldman Sachs. Ask me questions about their risk factors, financial disclosures, or strategic initiatives. I run entirely locally in your browser with zero external API calls.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeSources, setActiveSources] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyword scoring algorithm matching user request
  const scoreChunk = (chunkText, query) => {
    const qWords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    const chunkLower = chunkText.toLowerCase();
    let score = 0;
    qWords.forEach(word => {
      const count = (chunkLower.match(new RegExp(word, 'g')) || []).length;
      // Weight longer words higher
      score += count * (word.length > 6 ? 2 : 1);
    });
    return score;
  };

  const handleSend = (textToSend) => {
    if (!textToSend.trim() || streaming) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setStreaming(true);

    // Filter index if necessary
    const targetChunks = activeFilter === 'All' 
      ? chunksMetadata 
      : chunksMetadata.filter(c => c.company.toLowerCase().includes(activeFilter.toLowerCase()));

    // Score all chunks
    const scoredChunks = targetChunks.map(c => ({
      ...c,
      score: scoreChunk(c.text, textToSend)
    })).filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score);

    let responseText = "I have queried the indexed regulatory filings but could not identify any direct relevance matches. Try adjusting the query keywords or company filter pills.";
    let sources = [];

    if (scoredChunks.length > 0) {
      const topMatch = scoredChunks[0];
      // Get top 4 sources
      sources = scoredChunks.slice(0, 4);
      responseText = `Based on ${topMatch.company}'s ${topMatch.form} filing under ${topMatch.section.replace('_', ' ')}:\n\n"${topMatch.text.trim()}"`;
    }

    let charIndex = 0;
    const finalResponse = responseText;
    const msgId = Date.now();

    // Create empty placeholder message for streaming effect
    setMessages(prev => [...prev, { id: msgId, sender: 'forge_ai', text: '' }]);
    setActiveSources(sources);

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
    }, 12); // Stream speed: 12ms per character
  };

  const suggestedPrompts = [
    "What are Apple's main risk factors?",
    "How does JPMorgan describe market risk?",
    "What is NVIDIA's revenue strategy?",
    "Compare Goldman Sachs and JPMorgan on credit risk"
  ];

  const companies = ["All", "Apple", "Microsoft", "NVIDIA", "JPMorgan", "Goldman"];

  return (
    <div className="animated-page flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-bg relative z-10">
      
      {/* LEFT 60% — Chat Interface */}
      <div className="lg:w-[60%] flex flex-col h-[85vh] glass-card border border-border overflow-hidden relative">
        <div className="scanlines absolute inset-0 pointer-events-none opacity-30 z-0"></div>

        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-bg-2/60 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              {/* Rotating outer hexagon-ish border ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-teal animate-[spin_8s_linear_infinite] opacity-60"></div>
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-teal to-info flex items-center justify-center font-bold text-bg font-syne shadow-[0_0_15px_rgba(0,212,200,0.2)]">
                F
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold font-syne heading-syne text-silver">ForgeAI</span>
              <span className="text-[9px] text-silver-3 uppercase tracking-widest">
                Financial Optimization & Risk Generative Engine
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-profit flex items-center gap-1.5 bg-profit/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse"></span> Online
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 z-10">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {m.sender === 'forge_ai' && (
                <div className="w-8 h-8 rounded-full bg-card-2 border border-border flex items-center justify-center font-bold text-xs text-teal font-syne">
                  F
                </div>
              )}
              <div className={`p-4 rounded-xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-teal to-info text-bg font-semibold shadow-md rounded-tr-none'
                  : 'glass-card border-l-[3px] border-l-teal rounded-tl-none text-silver-2'
              }`}>
                {/* Formatting paragraphs */}
                {m.text.split('\n').map((p, pIdx) => (
                  <p key={pIdx} className={pIdx > 0 ? 'mt-2 border-t border-border/40 pt-2 font-mono text-[11px]' : ''}>
                    {p}
                  </p>
                ))}
                {streaming && m.sender === 'forge_ai' && idx === messages.length - 1 && (
                  <span className="stream-cursor"></span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        <div className="px-6 py-2 flex flex-wrap gap-2 z-10 border-t border-border/20 bg-bg-2/30">
          {suggestedPrompts.map((q, idx) => (
            <div 
              key={idx}
              onClick={() => !streaming && handleSend(q)}
              className="badge-teal cursor-pointer hover:bg-teal/20 text-[10px] font-sans transition py-1 px-3"
            >
              {q}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-bg-2/60 z-10 flex gap-2">
          <input 
            type="text"
            placeholder="Ask ForgeAI about any SEC filing..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            disabled={streaming}
            className="input-field flex-1 font-mono text-xs bg-[#0c0c0f] border border-border focus:border-teal rounded-lg px-4 py-2.5 outline-none text-silver focus:shadow-[0_0_10px_rgba(0,212,200,0.15)]"
          />
          <button 
            onClick={() => handleSend(inputText)}
            disabled={streaming}
            className="btn-teal rounded-lg w-10 h-10 p-0 flex items-center justify-center hover:scale-105 transition"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* RIGHT 40% — Context Panel */}
      <div className="lg:w-[40%] flex flex-col gap-6 h-[85vh] overflow-y-auto">
        
        {/* Filter Selection Pills */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
            Filing Company Filter
          </span>
          <div className="flex flex-wrap gap-2">
            {companies.map(c => (
              <span 
                key={c}
                onClick={() => setActiveFilter(c)}
                className={`cursor-pointer text-[10px] px-3 py-1.5 rounded-full transition-all duration-200 border ${
                  activeFilter === c 
                    ? 'bg-teal/15 text-teal border-teal/40 font-bold' 
                    : 'bg-card border-border text-silver-3 hover:text-silver hover:border-border-2'
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Citations Pane */}
        <div className="glass-card p-6 flex flex-col gap-4 flex-1">
          <span className="text-[10px] font-bold text-teal uppercase tracking-widest">
            Source Documents Reference ({activeSources.length})
          </span>

          {activeSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 text-silver-3 gap-2 flex-1 border border-dashed border-border rounded-xl">
              <BrainCircuit size={32} className="opacity-40 animate-pulse text-teal" />
              <p className="text-xs italic">Submit a prompt or click a suggestion to trigger RAG search.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[480px]">
              {activeSources.map((src, sIdx) => {
                const percentage = Math.min((src.score / 15) * 100, 100);
                return (
                  <div key={sIdx} className="p-4 bg-bg-2 border border-border/80 rounded-xl flex flex-col gap-2 relative group hover:border-teal/30 transition">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-silver">{src.company}</span>
                      <span className="badge-teal text-[9px] font-mono">{src.form}</span>
                    </div>
                    <span className="badge-gold text-[9px] w-fit font-mono mt-0.5">
                      {src.section.replace('_', ' ')}
                    </span>
                    
                    {/* Relevance Score Bar */}
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between text-[9px] text-silver-3">
                        <span>Semantic Relevance</span>
                        <span>{src.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-border h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-teal to-info h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-[10px] text-silver-3 font-mono leading-relaxed mt-2 border-t border-border/40 pt-2 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                      {src.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
