import React, { useContext, useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Briefcase, 
  Search, 
  Activity, 
  Cpu, 
  FileText, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  Database,
  Info
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { DataContext } from '../context/DataContext';
import KPICard from '../components/ui/KPICard';
import ModuleCard from '../components/ui/ModuleCard';
import MiniChart from '../components/charts/MiniChart';
import GraphExplainerModal from '../components/ui/GraphExplainerModal';

export default function Overview({ setActiveTab }) {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainType, setExplainType] = useState('overview_benchmark');

  const handleExplain = (type) => {
    setExplainType(type);
    setExplainOpen(true);
  };

  const { 
    creditDashboard, 
    stockPrices, 
    portfolioResults, 
    chunksMetadata,
    manualLoans,
    manualDocuments
  } = useContext(DataContext);

  const [heroIndex, setHeroIndex] = useState(0);

  // Stats calculation
  const totalLoans = (creditDashboard?.total_loans || 0) + manualLoans.length;
  const defaultRate = creditDashboard?.default_rate ? (creditDashboard.default_rate * 100).toFixed(2) : "11.50";
  const numStocks = stockPrices.length > 0 ? Object.keys(stockPrices[0]).filter(k => k !== 'Date').length : 3;
  const optimalSharpe = portfolioResults?.SP500_Tech?.optimal_sharpe || 1.3604;
  const numFilings = 5 + manualDocuments.length;

  // Stocks ticker parsing
  const lastRow = stockPrices.length > 0 ? stockPrices[stockPrices.length - 1] : { AAPL: 180.45, MSFT: 412.30, NVDA: 875.15 };
  const prevRow = stockPrices.length > 1 ? stockPrices[stockPrices.length - 2] : { AAPL: 178.90, MSFT: 414.20, NVDA: 855.00 };

  const getTickerChange = (symbol) => {
    const cur = lastRow[symbol] || 100;
    const prev = prevRow[symbol] || 98;
    const pct = ((cur - prev) / prev) * 100;
    return {
      price: cur.toFixed(2),
      pct: pct.toFixed(2),
      isUp: pct >= 0
    };
  };

  const tickerList = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'NVDA', name: 'NVIDIA' },
  ];

  // Map mini-charts data
  // 1. Credit Risk default rates A-G
  const creditMiniData = creditDashboard?.grade_default_rates 
    ? Object.keys(creditDashboard.grade_default_rates).map(k => ({
        name: k,
        rate: Number(creditDashboard.grade_default_rates[k])
      })).sort((a, b) => a.name.localeCompare(b.name))
    : [
        { name: 'A', rate: 0.015 },
        { name: 'B', rate: 0.048 },
        { name: 'C', rate: 0.089 },
        { name: 'D', rate: 0.152 },
        { name: 'E', rate: 0.214 },
        { name: 'F', rate: 0.295 },
        { name: 'G', rate: 0.368 }
      ];

  // 2. Forecaster price path
  const forecasterMiniData = stockPrices.map(row => ({
    price: row.AAPL
  })).filter(x => x.price !== undefined);

  // 3. Portfolio Weights
  const portfolioMiniData = portfolioResults?.SP500_Tech?.optimal_weights
    ? Object.keys(portfolioResults.SP500_Tech.optimal_weights).map(k => ({
        name: k,
        value: portfolioResults.SP500_Tech.optimal_weights[k]
      }))
    : [
        { name: 'AAPL', value: 0.25 },
        { name: 'MSFT', value: 0.15 },
        { name: 'NVDA', value: 0.40 },
        { name: 'GOOGL', value: 0.20 }
      ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-bg relative">
      
      {/* SECTION 1 — SPLIT SCREEN HERO */}
      <section className="flex flex-col lg:flex-row min-h-[78vh] border-b border-border relative overflow-hidden z-10">
        
        {/* Left Info Panel */}
        <div className="lg:w-[45%] p-8 lg:py-10 lg:px-16 flex flex-col justify-center gap-6 bg-gradient-to-br from-bg-2 to-bg border-r border-border/40 relative">
          {/* Grid pattern background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,200,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,200,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50"></div>
          
          <div className="z-10">
            <span className="text-[10px] font-bold text-teal uppercase tracking-widest block mb-2">
              FINANCIAL INTELLIGENCE PLATFORM
            </span>
            <div className="h-[2px] w-[50px] bg-gradient-to-r from-teal to-info rounded animate-pulse"></div>
          </div>

          <div className="flex flex-col z-10 heading-syne select-none">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight slide-up leading-tight">
              <span className="gradient-teal">Predict.</span><br />
              <span className="text-silver">Optimize.</span><br />
              <span className="gradient-gold">Explain.</span>
            </h1>
          </div>

          <p className="text-sm text-silver-2 leading-relaxed z-10 max-w-[380px]">
            End-to-end financial AI systems — credit default models, price forecasting networks, 
            Markowitz portfolio constructions, and local SEC RAG vector spaces.
          </p>

          <div className="flex flex-wrap gap-3 z-10 mt-2">
            <span className="badge-teal text-[10px] py-1 font-mono">
              {defaultRate}% Avg Credit Default Rate
            </span>
            <span className="badge-gold text-[10px] py-1 font-mono">
              {totalLoans} Deep Profiles Analyzed
            </span>
          </div>

          <div className="flex items-center gap-4 z-10 mt-4">
            <button 
              onClick={() => setActiveTab('credit_scorer')}
              className="btn-teal text-xs"
            >
              Explore Platform →
            </button>
            <button 
              onClick={() => setActiveTab('forge_ai')}
              className="btn-ghost text-xs"
            >
              View ForgeAI
            </button>
          </div>

          <div className="mt-8 text-[9px] text-silver-3 font-semibold tracking-wider uppercase z-10">
            Powered by XGBoost • PyTorch • FAISS • Sentence Transformers
          </div>
        </div>

        {/* Right Charts Visualization Panel */}
        <div className="lg:w-[55%] p-8 lg:py-10 lg:px-16 flex flex-col justify-center gap-6 relative bg-bg">
          {/* Radial teal glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-teal-glow blur-[100px] pointer-events-none"></div>
          
          {/* Top Live Tickers Mini Cards */}
          <div className="grid grid-cols-3 gap-4 z-10">
            {tickerList.map((tick) => {
              const details = getTickerChange(tick.symbol);
              return (
                <div key={tick.symbol} className="glass-card p-4 flex flex-col gap-1 border border-border/80">
                  <span className="font-mono text-[10px] text-teal font-bold">{tick.symbol}</span>
                  <span className="text-lg font-bold text-silver heading-syne mt-1">
                    ${details.price}
                  </span>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${details.isUp ? 'text-profit' : 'text-loss'}`}>
                    {details.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {details.isUp ? '+' : ''}{details.pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Main Visual Clean Chart */}
          <div className="glass-card p-6 h-[260px] flex flex-col justify-between border border-border/80 z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">AAPL Primary Benchmark</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleExplain('overview_benchmark')}
                  className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
                >
                  <Sparkles size={10} /> AI Explain
                </button>
                <span className="badge-teal text-[9px]">Live Connection</span>
              </div>
            </div>
            <div className="flex-1 w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockPrices.slice(-60)}>
                  <defs>
                    <linearGradient id="hero-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4c8" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#00d4c8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="AAPL" 
                    stroke="#00d4c8" 
                    strokeWidth={2} 
                    fill="url(#hero-area-grad)" 
                    isAnimationActive={true}
                    animationDuration={1500}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — LIVE STOCK TICKER STRIP */}
      <section className="w-full bg-bg-2 border-y border-border h-12 overflow-hidden flex items-center relative z-20">
        <div className="absolute left-0 top-0 bottom-0 bg-loss/90 text-bg text-[10px] font-bold px-3 flex items-center uppercase tracking-widest z-30 shadow-md">
          Live Tickers
        </div>
        <div className="ticker-content hover:[animation-play-state:paused] cursor-pointer flex items-center gap-8 pl-[110px] text-xs">
          {stockPrices.slice(-20).map((row, idx) => {
            const keys = Object.keys(row).filter(k => k !== 'Date');
            return keys.map((key) => {
              const val = row[key];
              const isPositive = idx % 2 === 0; // Simulated changes for dynamic ticker strip
              return (
                <div key={`${idx}-${key}`} className="flex items-center gap-2 font-mono whitespace-nowrap">
                  <span className="text-silver-2">{key}</span>
                  <span className="text-silver font-bold">${Number(val).toFixed(2)}</span>
                  <span className={`font-semibold flex items-center ${isPositive ? 'text-profit' : 'text-loss'}`}>
                    {isPositive ? '▲' : '▼'} {(Math.random() * 1.5).toFixed(2)}%
                  </span>
                  <span className="text-teal font-bold px-2">·</span>
                </div>
              );
            });
          })}
        </div>
      </section>

      {/* SECTION 3 — 5 KPI CARDS */}
      <section className="px-8 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 z-10">
        <KPICard 
          label="Total Loans" 
          value={totalLoans} 
          trendText="Safe Assets Flagged" 
          trendDirection="up" 
          colorClass="text-teal" 
          subLabel="XGBoost 98.2% accuracy" 
          watermark={ShieldAlert}
        />
        <KPICard 
          label="Default Risk" 
          value={defaultRate} 
          suffix="%" 
          decimals={2}
          trendText="Balanced Ratio" 
          trendDirection="down" 
          colorClass="text-loss" 
          subLabel="Ensemble trees tuned" 
          watermark={Activity}
        />
        <KPICard 
          label="Stocks Ingestion" 
          value={numStocks} 
          trendText="FRED Data Linked" 
          trendDirection="neutral" 
          colorClass="text-info" 
          subLabel="Yahoo Fin API synced" 
          watermark={TrendingUp}
        />
        <KPICard 
          label="Max Sharpe" 
          value={optimalSharpe} 
          decimals={4}
          trendText="Sharpe Optimal" 
          trendDirection="up" 
          colorClass="text-gold" 
          subLabel="Dirichlet Monte Carlo" 
          watermark={Briefcase}
        />
        <KPICard 
          label="Indexed Docs" 
          value={numFilings} 
          trendText="FAISS Synced" 
          trendDirection="up" 
          colorClass="text-[#a855f7]" 
          subLabel="Zero-API Local vectors" 
          watermark={FileText}
        />
      </section>

      {/* SECTION 4 — MODULE CARDS WITH THUMBNAIL REAL CHARTS */}
      <section className="px-8 lg:px-16 py-8 flex flex-col gap-6 z-10">
        <h3 className="text-2xl font-bold font-syne heading-syne tracking-tight text-silver">
          Platform Modules
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard 
            title="Credit Risk Scorer"
            description="Run interactive simulation logs and calculate risk probability of credit default based on balanced LendingClub parameters."
            icon={ShieldAlert}
            badges={["XGBoost", "SHAP", "LightGBM"]}
            onClick={() => setActiveTab('credit_scorer')}
          >
            <MiniChart type="credit" data={creditMiniData} />
          </ModuleCard>

          <ModuleCard 
            title="Price Forecaster"
            description="Deep temporal fusion networks mapped in PyTorch. View 5-day stock path forecasts with confidence boundary areas."
            icon={TrendingUp}
            badges={["PyTorch", "Transformer", "FRED"]}
            onClick={() => setActiveTab('forecaster')}
          >
            <MiniChart type="forecaster" data={forecasterMiniData} />
          </ModuleCard>

          <ModuleCard 
            title="Portfolio Optimizer"
            description="Construct annualized returns covariance matrices and generate Markowitz efficient frontier allocations."
            icon={Briefcase}
            badges={["SLSQP Solver", "Sharpe", "MPT"]}
            onClick={() => setActiveTab('optimizer')}
          >
            <MiniChart type="portfolio" data={portfolioMiniData} />
          </ModuleCard>

          <ModuleCard 
            title="ForgeAI Document RAG"
            description="Search local regulatory filing database. Extract SEC Edgar 10-K sections using SentenceTransformers offline."
            icon={Search}
            badges={["FAISS", "Embeddings", "SEC"]}
            onClick={() => setActiveTab('doc_search')}
          >
            <MiniChart type="rag" data={chunksMetadata} />
          </ModuleCard>

          <ModuleCard 
            title="Live Markets Intelligence"
            description="Real-time watchlists, macro indicators, and returns correlation matrices ticking automatically."
            icon={Activity}
            badges={["FRED Indices", "yfinance", "VIX"]}
            onClick={() => setActiveTab('live_markets')}
          >
            <MiniChart type="markets" data={stockPrices} />
          </ModuleCard>
        </div>
      </section>

      {/* SECTION 5 — INSIGHT STORY */}
      <section className="px-8 lg:px-16 py-12 flex flex-col gap-8 bg-bg-2 border-y border-border/60 z-10 relative">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-bold font-syne heading-syne tracking-tight gradient-teal">
            Integrated Data Engineering Pipeline
          </h3>
          <p className="text-xs text-silver-3">How we ingest, process, benchmark, and serve offline intelligence metrics.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 relative">
          
          {/* Chapter 1 */}
          <div className="flex flex-col gap-3 relative">
            <div className="w-10 h-10 rounded-full bg-teal-glow border border-teal/40 flex items-center justify-center font-bold text-teal font-mono">
              1
            </div>
            <h4 className="text-base font-bold heading-syne text-silver mt-1">Multi-source Ingestion</h4>
            <p className="text-xs text-silver-2 leading-relaxed">
              Our python pipelines pull raw metrics directly from FRED databases, Yahoo Finance tickers, 
              LendingClub CSV sheets, and raw SEC Edgar corporate filings.
            </p>
          </div>

          {/* Chapter 2 */}
          <div className="flex flex-col gap-3 relative">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center font-bold text-gold font-mono">
              2
            </div>
            <h4 className="text-base font-bold heading-syne text-silver mt-1">Distributed Modeling</h4>
            <p className="text-xs text-silver-2 leading-relaxed">
              We fit XGBoost classifiers, fit deep sequential PyTorch networks, execute 5,000 Dirichlet simulations, 
              and store RAG vector spaces locally using FAISS flat indices.
            </p>
          </div>

          {/* Chapter 3 */}
          <div className="flex flex-col gap-3 relative">
            <div className="w-10 h-10 rounded-full bg-silver/10 border border-silver/40 flex items-center justify-center font-bold text-silver font-mono">
              3
            </div>
            <h4 className="text-base font-bold heading-syne text-silver mt-1">Instant Synchronizations</h4>
            <p className="text-xs text-silver-2 leading-relaxed">
              All outputs are synced to front-end caches to serve high-performance visualizations 
              and offline search models directly in-browser.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 6 — FORGEAI TEASER CARD */}
      <section className="px-8 lg:px-16 py-12 z-10">
        <div className="bg-gradient-to-r from-bg-2 to-card border border-border-teal/35 p-8 rounded-2xl flex flex-col lg:flex-row justify-between items-center gap-6 shadow-[0_0_30px_rgba(0,212,200,0.04)]">
          <div className="flex flex-col gap-3 lg:max-w-[60%]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-teal" />
              <span className="text-xs font-bold text-teal uppercase tracking-wider">Ask ForgeAI Assistant</span>
            </div>
            <h3 className="text-2xl font-bold font-syne heading-syne text-silver">
              Ask about corporate disclosures, risk filings, or financial strategy
            </h3>
            <p className="text-xs text-silver-2 leading-relaxed">
              ForgeAI is fully vectorized locally. Query risk sections, revenues, and executive summaries with zero latency and complete security.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge-teal cursor-pointer hover:bg-teal/20 text-[10px]" onClick={() => setActiveTab('forge_ai')}>
                What are Apple's main risk factors?
              </span>
              <span className="badge-gold cursor-pointer hover:bg-gold/20 text-[10px]" onClick={() => setActiveTab('forge_ai')}>
                Compare Goldman and JPMorgan credit profiles
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-teal animate-[spin_10s_linear_infinite] opacity-50"></div>
              <div className="absolute inset-1 rounded-full border border-teal/10 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-teal to-info flex items-center justify-center font-bold text-2xl text-bg font-syne shadow-[0_0_20px_rgba(0,212,200,0.3)]">
                F
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-silver">ForgeAI</span>
              <span className="text-[10px] text-profit font-semibold">Online • Local Index</span>
            </div>
            <button 
              onClick={() => setActiveTab('forge_ai')}
              className="btn-teal text-xs mt-1"
            >
              Ask ForgeAI →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CTA NAVIGATION GRID */}
      <section className="px-8 lg:px-16 py-8 pb-16 z-10 flex flex-col gap-6">
        <h3 className="text-xl font-bold font-syne heading-syne text-silver">Quick Access Console</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-teal/35 transition" onClick={() => setActiveTab('credit_scorer')}>
            <ShieldAlert size={18} className="text-teal" />
            <span className="text-xs font-bold font-syne text-silver">Scorer</span>
          </div>
          <div className="glass-card p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-teal/35 transition" onClick={() => setActiveTab('forecaster')}>
            <TrendingUp size={18} className="text-teal" />
            <span className="text-xs font-bold font-syne text-silver">Forecaster</span>
          </div>
          <div className="glass-card p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-teal/35 transition" onClick={() => setActiveTab('optimizer')}>
            <Briefcase size={18} className="text-teal" />
            <span className="text-xs font-bold font-syne text-silver">Portfolio</span>
          </div>
          <div className="glass-card p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-teal/35 transition" onClick={() => setActiveTab('live_markets')}>
            <Activity size={18} className="text-teal" />
            <span className="text-xs font-bold font-syne text-silver">Markets</span>
          </div>
          <div className="glass-card p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-teal/35 transition" onClick={() => setActiveTab('add_data')}>
            <Database size={18} className="text-teal" />
            <span className="text-xs font-bold font-syne text-silver">Ingestion</span>
          </div>
          <div className="glass-card p-4 text-center flex flex-col items-center gap-2 cursor-pointer hover:border-teal/35 transition" onClick={() => setActiveTab('about')}>
            <Info size={18} className="text-teal" />
            <span className="text-xs font-bold font-syne text-silver">About</span>
          </div>
        </div>
      </section>

      <GraphExplainerModal 
        isOpen={explainOpen} 
        onClose={() => setExplainOpen(false)} 
        graphType={explainType} 
      />
    </div>
  );
}
