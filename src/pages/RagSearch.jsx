import React, { useContext, useState } from 'react';
import { Search, FileText, Database, Sparkles, Eye } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function RagSearch() {
  const { chunksMetadata, manualDocuments } = useContext(DataContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCompany, setActiveCompany] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState(null);

  // List of unique companies
  const companies = ["All", "Apple", "Microsoft", "NVIDIA", "JPMorgan", "Goldman"];

  // Search calculations (keyword matching)
  const scoreChunk = (chunkText, query) => {
    if (!query) return 0;
    const qWords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    const chunkLower = chunkText.toLowerCase();
    let score = 0;
    qWords.forEach(word => {
      const count = (chunkLower.match(new RegExp(word, 'g')) || []).length;
      score += count * 1.5;
    });
    return score;
  };

  // Process data sources
  const allDocs = [...chunksMetadata];

  const scoredDocs = allDocs.map(c => {
    const score = searchQuery ? scoreChunk(c.text, searchQuery) : 1.0;
    return {
      ...c,
      score
    };
  }).filter(c => {
    // Relevance score filter
    if (searchQuery && c.score === 0) return false;
    // Company filter
    if (activeCompany !== 'All' && !c.company.toLowerCase().includes(activeCompany.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="animated-page flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-bg relative z-10">
      
      {/* Search Console & Results Left */}
      <div className="lg:w-[70%] flex flex-col gap-6">
        
        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center border-b border-border/40 pb-4">
            <div>
              <h2 className="text-xl font-bold font-syne heading-syne text-silver flex items-center gap-2">
                <FileText className="text-teal" /> Document Intelligence
              </h2>
              <p className="text-xs text-silver-3 mt-1">
                Query SEC filings using local vector search calculations. Zero API dependencies.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="badge-teal text-[10px] font-mono">FAISS indexed</span>
              <span className="badge-gold text-[10px] font-mono">{allDocs.length} Chunks</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 relative">
            <input 
              type="text"
              placeholder="Search SEC 10-K/10-Q filing chunks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111116] border border-border focus:border-teal rounded-lg font-mono text-xs px-4 py-3 outline-none text-silver"
            />
            <button className="btn-teal rounded-lg px-6 flex items-center gap-2">
              <Search size={14} /> Search
            </button>
          </div>

          {/* Recent searches */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">Suggested:</span>
            <div className="flex gap-2">
              {["risk factors", "revenue streams", "liquidity parameters"].map((term) => (
                <span 
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="badge-silver text-[9px] cursor-pointer hover:bg-card-hover font-mono py-0.5"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex flex-col gap-4">
          {scoredDocs.map((doc, idx) => {
            const isExpanded = expandedIndex === idx;
            const percentage = Math.min((doc.score / 10) * 100, 100);
            return (
              <div 
                key={idx}
                className="glass-card p-5 border border-border/80 flex flex-col gap-3 hover:border-teal/20 transition duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-silver">{doc.company}</span>
                    <span className="badge-teal text-[9px] font-mono">{doc.form}</span>
                    <span className="badge-gold text-[9px] font-mono">{doc.section.replace('_', ' ')}</span>
                  </div>
                  <span className="text-[9px] text-silver-3 font-mono">{doc.file}</span>
                </div>

                {searchQuery && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-mono text-silver-3">Relevance Match:</span>
                    <div className="w-24 bg-border h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal to-info h-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className={`text-xs text-silver-2 leading-relaxed font-mono mt-2 ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {doc.text}
                </p>

                <button 
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex items-center gap-1 text-[10px] text-teal font-bold self-start mt-2 hover:underline"
                >
                  <Eye size={12} /> {isExpanded ? "Collapse Text" : "Expand Full Chunk"}
                </button>
              </div>
            );
          })}

          {scoredDocs.length === 0 && (
            <div className="p-8 text-center text-silver-3 border border-dashed border-border rounded-2xl italic">
              No matching document chunks found. Try revising search keywords.
            </div>
          )}
        </div>

      </div>

      {/* Right Company Filter & Inventory list (30%) */}
      <div className="lg:w-[30%] flex flex-col gap-6">
        
        {/* Company Filters */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
            Company Target Filters
          </span>
          <div className="flex flex-wrap gap-1.5">
            {companies.map((c) => (
              <button 
                key={c}
                onClick={() => setActiveCompany(c)}
                className={`text-[9px] font-bold px-3 py-1.5 rounded-full border transition duration-200 ${
                  activeCompany === c 
                    ? 'bg-teal/15 text-teal border-teal/40' 
                    : 'bg-card border-border text-silver-3 hover:text-silver hover:border-border-2'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Database Inventory */}
        <div className="glass-card p-6 flex flex-col gap-4 flex-grow border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest flex items-center gap-1.5">
            <Database size={14} className="text-teal" /> FAISS Flat Indexes
          </span>
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[360px]">
            {allDocs.map((doc, idx) => (
              <div key={idx} className="p-3 bg-bg-2 border border-border rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-glow flex items-center justify-center font-bold text-xs text-teal font-syne">
                  {doc.company.charAt(0)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-silver">{doc.company} ({doc.form})</span>
                  <span className="text-[9px] text-silver-3 font-mono">{doc.file.slice(0, 18)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
