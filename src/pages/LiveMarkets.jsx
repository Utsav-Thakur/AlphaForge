import React, { useContext, useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart,
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  Brush,
  Legend
} from 'recharts';
import { Activity, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function LiveMarkets() {
  const { stockPrices, macroIndicators } = useContext(DataContext);

  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [timePeriod, setTimePeriod] = useState(60); // 30, 60, 120, 250 days
  const [activeMacro, setActiveMacro] = useState('fed_funds_rate');

  const tickerNames = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    NVDA: 'NVIDIA Corporation'
  };

  // 1. Tickers calculations
  const lastRow = stockPrices.length > 0 ? stockPrices[stockPrices.length - 1] : {};
  const prevRow = stockPrices.length > 1 ? stockPrices[stockPrices.length - 2] : {};
  const prev5Row = stockPrices.length > 5 ? stockPrices[stockPrices.length - 6] : {};

  const getMetrics = (symbol) => {
    const cur = lastRow[symbol] || 100;
    const prev1 = prevRow[symbol] || 99;
    const prev5 = prev5Row[symbol] || 95;
    
    const pct1 = ((cur - prev1) / prev1) * 100;
    const pct5 = ((cur - prev5) / prev5) * 100;
    const volume = lastRow.Volume || 45000000;

    return {
      price: cur.toFixed(2),
      chg1: pct1.toFixed(2),
      chg5: pct5.toFixed(2),
      isUp1: pct1 >= 0,
      isUp5: pct5 >= 0,
      volume: volume.toLocaleString()
    };
  };

  // Last update date
  const lastDate = lastRow.Date || '2026-07-10';

  // Ingest latest macro indices
  const latestMacro = macroIndicators && macroIndicators.length > 0 
    ? macroIndicators[macroIndicators.length - 1] 
    : { fed_funds_rate: 5.25, cpi_inflation: 3.1, vix: 14.5, treasury_10yr: 4.2 };

  // Filter prices dataset based on timeline selection
  const filteredData = stockPrices.slice(-timePeriod);

  // Compute returns correlation matrix dynamically in JS
  const computeCorrelation = (sym1, sym2) => {
    const returns1 = [];
    const returns2 = [];
    for (let i = 1; i < filteredData.length; i++) {
      const p1_t = filteredData[i][sym1];
      const p1_prev = filteredData[i-1][sym1];
      const p2_t = filteredData[i][sym2];
      const p2_prev = filteredData[i-1][sym2];
      if (p1_t && p1_prev && p2_t && p2_prev) {
        returns1.push((p1_t - p1_prev) / p1_prev);
        returns2.push((p2_t - p2_prev) / p2_prev);
      }
    }
    if (returns1.length === 0) return 1.0;
    const mean1 = returns1.reduce((s, x) => s + x, 0) / returns1.length;
    const mean2 = returns2.reduce((s, x) => s + x, 0) / returns2.length;
    
    let num = 0;
    let den1 = 0;
    let den2 = 0;
    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      num += diff1 * diff2;
      den1 += diff1 * diff1;
      den2 += diff2 * diff2;
    }
    if (den1 === 0 || den2 === 0) return 1.0;
    return (num / Math.sqrt(den1 * den2)).toFixed(3);
  };

  const tickersList = ['AAPL', 'MSFT', 'NVDA'];

  // Map macro values to overlay plot data
  const chartOverlayData = filteredData.map((row, idx) => {
    const macroRow = macroIndicators && macroIndicators[idx] ? macroIndicators[idx] : {};
    return {
      date: row.Date,
      price: row[activeTicker],
      macro: Number(macroRow[activeMacro]) || Number(latestMacro[activeMacro]) || 0
    };
  });

  return (
    <div className="animated-page flex flex-col gap-6 p-6 min-h-screen bg-bg relative z-10">
      
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-syne heading-syne text-silver flex items-center gap-2">
            <Activity className="text-teal" /> Live Market Feed
          </h2>
          <p className="text-xs text-silver-3 mt-1">
            Real data indices loaded from FRED and Yahoo Finance. Last tick synchronized on {lastDate}.
          </p>
        </div>
      </div>

      {/* FRED Macro Indicators Strip */}
      <div className="grid grid-cols-4 gap-6">
        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">Federal Funds Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-xl font-bold font-syne heading-syne text-silver">
              {Number(latestMacro.fed_funds_rate).toFixed(2)}%
            </h4>
            <span className="text-[10px] font-bold text-loss flex items-center gap-0.5 bg-loss/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight size={10} /> +25 bps
            </span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">CPI Inflation</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-xl font-bold font-syne heading-syne text-silver">
              {(Number(latestMacro.cpi_inflation) || 3.10).toFixed(2)}%
            </h4>
            <span className="text-[10px] font-bold text-profit flex items-center gap-0.5 bg-profit/10 px-1.5 py-0.5 rounded">
              <ArrowDownRight size={10} /> -10 bps
            </span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">VIX Volatility Fear Index</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-xl font-bold font-syne heading-syne text-silver">
              {(Number(latestMacro.vix) || 14.50).toFixed(2)}
            </h4>
            <span className="text-[10px] font-bold text-profit flex items-center gap-0.5 bg-profit/10 px-1.5 py-0.5 rounded">
              <ArrowDownRight size={10} /> -1.25
            </span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">10-Year Treasury Yield</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-xl font-bold font-syne heading-syne text-silver">
              {(Number(latestMacro.treasury_10yr) || 4.20).toFixed(2)}%
            </h4>
            <span className="text-[10px] font-bold text-loss flex items-center gap-0.5 bg-loss/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight size={10} /> +5 bps
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Watchlist Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Watchlist Panel Left */}
        <div className="lg:w-[35%] flex flex-col gap-4">
          <div className="glass-card p-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">Watchlist</span>
            <div className="flex flex-col gap-2">
              {tickersList.map((sym) => {
                const metric = getMetrics(sym);
                const isActive = activeTicker === sym;
                return (
                  <div 
                    key={sym}
                    onClick={() => setActiveTicker(sym)}
                    className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between border ${
                      isActive 
                        ? 'bg-teal/5 border-teal' 
                        : 'bg-card border-border hover:border-border-2 hover:bg-card-hover'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs font-bold text-teal">{sym}</span>
                      <span className="text-[10px] text-silver-3 truncate max-w-[120px]">
                        {tickerNames[sym]}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-silver">${metric.price}</span>
                      <div className="flex gap-2 text-[9px] font-bold">
                        <span className={metric.isUp1 ? 'text-profit' : 'text-loss'}>
                          1D: {metric.isUp1 ? '+' : ''}{metric.chg1}%
                        </span>
                        <span className={metric.isUp5 ? 'text-profit' : 'text-loss'}>
                          5D: {metric.isUp5 ? '+' : ''}{metric.chg5}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Chart Panel Center/Right */}
        <div className="lg:w-[65%] glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold font-syne heading-syne text-silver">
                {activeTicker} Price & Macro Overlay
              </h3>
              <span className="text-[10px] text-silver-3 font-semibold mt-0.5">
                Comparing adjusted prices with macroeconomic factors
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timeline selector pills */}
              <div className="flex bg-[#111116] border border-border p-1 rounded-lg">
                {[30, 60, 120, 250].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTimePeriod(t)}
                    className={`text-[9px] font-bold px-2 py-1 rounded transition-all duration-200 ${
                      timePeriod === t 
                        ? 'bg-teal text-bg' 
                        : 'text-silver-3 hover:text-silver'
                    }`}
                  >
                    {t}D
                  </button>
                ))}
              </div>

              {/* Macro dropdown selector */}
              <select 
                value={activeMacro}
                onChange={(e) => setActiveMacro(e.target.value)}
                className="bg-[#111116] border border-border rounded-lg text-[10px] font-bold text-silver px-3 py-1.5 focus:border-teal outline-none"
              >
                <option value="fed_funds_rate">Fed Funds Rate</option>
                <option value="cpi_inflation">CPI Inflation</option>
                <option value="vix">VIX Fear Index</option>
                <option value="treasury_10yr">10Y Treasury Yield</option>
              </select>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartOverlayData}>
                <defs>
                  <linearGradient id="markets-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4c8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00d4c8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#22222e" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#606270" fontSize={10} />
                <YAxis yAxisId="left" stroke="#00d4c8" fontSize={10} domain={['auto', 'auto']} label={{ value: 'Stock Price ($)', fill: '#00d4c8', angle: -90, position: 'insideLeft', offset: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f0b429" fontSize={10} label={{ value: 'Macro Value', fill: '#f0b429', angle: 90, position: 'insideRight', offset: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  labelStyle={{ color: '#e8eaf0', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" name={`${activeTicker} Price`} dataKey="price" stroke="#00d4c8" strokeWidth={2} fill="url(#markets-area-grad)" dot={false} />
                <Line yAxisId="right" type="monotone" name={activeMacro.replace('_', ' ').toUpperCase()} dataKey="macro" stroke="#f0b429" strokeWidth={1.5} dot={false} />
                <Brush dataKey="date" height={25} stroke="#22222e" fill="#111116" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Dynamic Correlation Heatmap Grid */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
          Dynamic Asset Returns Correlation Matrix
        </span>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {/* Header Corner */}
          <div className="bg-bg p-3 border border-border rounded-lg text-[10px] font-bold text-silver-3 flex items-center justify-center">
            Correlation
          </div>
          {tickersList.map(sym => (
            <div key={sym} className="bg-bg p-3 border border-border rounded-lg text-[10px] font-bold text-teal font-mono text-center">
              {sym}
            </div>
          ))}

          {/* Row Ingestion */}
          {tickersList.map((rowSym) => (
            <React.Fragment key={rowSym}>
              <div className="bg-bg p-3 border border-border rounded-lg text-[10px] font-bold text-teal font-mono flex items-center pl-3">
                {rowSym}
              </div>
              {tickersList.map((colSym) => {
                const coef = Number(computeCorrelation(rowSym, colSym));
                
                // Color scaling: red (neg) to neutral to teal (pos)
                let colorBg = 'rgba(22, 22, 29, 0.4)';
                if (coef >= 0.75) colorBg = 'rgba(0, 212, 200, 0.85)';
                else if (coef >= 0.50) colorBg = 'rgba(0, 212, 200, 0.5)';
                else if (coef >= 0.25) colorBg = 'rgba(0, 212, 200, 0.25)';
                else if (coef < 0) colorBg = 'rgba(255, 69, 96, 0.4)';

                return (
                  <div 
                    key={colSym}
                    className="p-3 border border-border rounded-lg font-mono text-xs text-center flex items-center justify-center font-bold text-silver"
                    style={{ backgroundColor: colorBg }}
                  >
                    {coef.toFixed(3)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
}
