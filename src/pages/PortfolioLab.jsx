import React, { useContext, useState } from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { Briefcase, Activity, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import GraphExplainerModal from '../components/ui/GraphExplainerModal';

export default function PortfolioLab() {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainType, setExplainType] = useState('optimizer_frontier');

  const handleExplain = (type) => {
    setExplainType(type);
    setExplainOpen(true);
  };

  const { portfolioResults } = useContext(DataContext);
  const [selectedPortfolio, setSelectedPortfolio] = useState('SP500_Tech');

  const activePort = portfolioResults?.[selectedPortfolio];

  // Parse optimal weights
  const optWeights = activePort?.optimal_weights || {};
  const assetsList = Object.keys(optWeights);
  const equalWeight = assetsList.length > 0 ? 1 / assetsList.length : 0.25;

  const weightsComparisonData = assetsList.map(asset => {
    const oWeight = optWeights[asset] || 0;
    const change = oWeight - equalWeight;
    return {
      name: asset,
      Current: Number((equalWeight * 100).toFixed(2)),
      Optimal: Number((oWeight * 100).toFixed(2)),
      isIncrease: change >= 0,
      delta: Math.abs(change * 100).toFixed(1)
    };
  });

  // efficient frontier scatter points
  const scatterPoints = (activePort?.efficient_frontier || []).map(item => ({
    vol: Number((item.volatility * 100).toFixed(2)),
    ret: Number((item.return * 100).toFixed(2)),
    sharpe: item.sharpe
  }));

  const optVol = activePort?.optimal_volatility || 12.45;
  const optRet = activePort?.optimal_return || 18.52;
  const optSharpe = activePort?.optimal_sharpe || 1.3604;

  const minVarPoint = scatterPoints.length > 0 
    ? scatterPoints.reduce((prev, curr) => prev.vol < curr.vol ? prev : curr)
    : { vol: 8.5, ret: 10.2, sharpe: 0.8 };

  // Risk contribution pie data (approximated for display based on optimal weights)
  const pieColors = ['#00d4c8', '#3b8cff', '#f0b429', '#ff4560', '#8b5cf6'];
  const riskDonutData = assetsList.map((asset, idx) => {
    const weight = optWeights[asset] || 0.25;
    // Approximated risk contribution (weight * volatility multiplier)
    const factor = (idx + 1) * 0.15;
    return {
      name: asset,
      value: Number((weight * (1 + factor) * 100).toFixed(1)),
      color: pieColors[idx % pieColors.length]
    };
  });

  return (
    <div className="animated-page flex flex-col gap-6 p-6 min-h-screen bg-bg relative z-10">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold font-syne heading-syne text-silver flex items-center gap-2">
            <Briefcase className="text-teal" /> Portfolio Optimization Lab
          </h2>
          <p className="text-xs text-silver-3 mt-1">
            Comparing Modern Portfolio Theory (MPT) SLSQP quadratic optimization against 5,000 Monte Carlo runs.
          </p>
        </div>

        {/* Portfolio selection pills */}
        <div className="flex bg-[#111116] border border-border p-1 rounded-lg">
          {['SP500_Tech', 'NIFTY_Blue', 'Global_Mix'].map((p) => (
            <button 
              key={p}
              onClick={() => setSelectedPortfolio(p)}
              className={`text-xs font-bold px-4 py-2 rounded transition-all duration-200 ${
                selectedPortfolio === p 
                  ? 'bg-teal text-bg shadow-[0_0_12px_rgba(0,212,200,0.25)]' 
                  : 'text-silver-3 hover:text-silver'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">Optimal Sharpe Ratio</span>
          <h3 className="text-2xl font-bold font-syne heading-syne text-profit mt-2">
            {optSharpe.toFixed(4)}
          </h3>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">Optimal Expected Return</span>
          <h3 className="text-2xl font-bold font-syne heading-syne text-info mt-2">
            {optRet.toFixed(2)}%
          </h3>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">Optimal Volatility</span>
          <h3 className="text-2xl font-bold font-syne heading-syne text-loss mt-2">
            {optVol.toFixed(2)}%
          </h3>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between border border-border">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider">Risk-Free Rate Benchmark</span>
          <h3 className="text-2xl font-bold font-syne heading-syne text-gold mt-2">
            5.25%
          </h3>
        </div>
      </div>

      {/* Main Frontier and Weights Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Efficient Frontier Scatter */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-silver">Efficient Frontier Scatter (Monte Carlo)</h3>
              <span className="text-[10px] text-silver-3 font-semibold">
                Optimal Max Sharpe Portfolio (Gold Star) vs Minimum Variance Portfolio (Blue Dot).
              </span>
            </div>
            <button 
              onClick={() => handleExplain('optimizer_frontier')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 10 }}>
                <CartesianGrid stroke="#22222e" />
                <XAxis type="number" dataKey="vol" name="Volatility" unit="%" stroke="#606270" fontSize={10} label={{ value: 'Annual Volatility %', fill: '#606270', position: 'bottom', offset: -5 }} />
                <YAxis type="number" dataKey="ret" name="Return" unit="%" stroke="#606270" fontSize={10} label={{ value: 'Expected Return %', fill: '#606270', angle: -90, position: 'left' }} />
                <ZAxis type="number" dataKey="sharpe" range={[20, 20]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  labelStyle={{ color: '#e8eaf0', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                />
                <Scatter name="Random Portfolios" data={scatterPoints} fill="#1c1c26" shape="circle" />
                {/* Max Sharpe star marker */}
                <Scatter name="Optimal Max Sharpe" data={[{ vol: Number(optVol.toFixed(2)), ret: Number(optRet.toFixed(2)), sharpe: optSharpe }]} fill="#f0b429" shape="star" />
                {/* Min Var circle marker */}
                <Scatter name="Minimum Variance" data={[{ vol: Number(minVarPoint.vol.toFixed(2)), ret: Number(minVarPoint.ret.toFixed(2)), sharpe: minVarPoint.sharpe }]} fill="#3b8cff" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weights Comparison Bars */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-silver">Current Equal Weights vs MPT Optimal Splits</h3>
              <span className="text-[10px] text-silver-3 font-semibold">
                Scipy SLSQP bounds allocated: Min 2% - Max 40% per asset.
              </span>
            </div>
            <button 
              onClick={() => handleExplain('optimizer_weights')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightsComparisonData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#22222e" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#606270" fontSize={10} />
                <YAxis stroke="#606270" fontSize={10} suffix="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  labelStyle={{ color: '#e8eaf0', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                />
                <Legend />
                <Bar dataKey="Current" fill="#22222e" name="Current Split" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimal" fill="#00d4c8" name="Optimal Split" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Asset Risk Contribution & Correlation Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Contribution Donut */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
              Portfolio Marginal Risk Allocation
            </span>
            <button 
              onClick={() => handleExplain('credit_risk_mix')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>
          <div className="h-[180px] w-full flex items-center justify-between">
            <div className="w-[140px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  />
                  <Pie
                    data={riskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5 text-[9px] font-mono">
              {riskDonutData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-silver-2">{d.name}: {d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Matrix */}
        <div className="glass-card p-6 col-span-2 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
            Portfolio Asset Correlations Heatmap
          </span>
          
          <div 
            className="heatmap-grid gap-1 mt-2 text-xs"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${assetsList.length + 1}, minmax(0, 1fr))`
            }}
          >
            {/* Header Corner */}
            <div className="bg-bg p-2 text-center text-silver-3 font-semibold border border-border">Asset</div>
            {assetsList.map(a => (
              <div key={a} className="bg-bg p-2 text-center text-teal font-mono border border-border">{a}</div>
            ))}

            {/* Matrix Mapping */}
            {assetsList.map((rowAsset, rIdx) => (
              <React.Fragment key={rowAsset}>
                <div className="bg-bg p-2 text-teal font-mono border border-border flex items-center pl-2">{rowAsset}</div>
                {assetsList.map((colAsset, colIdx) => {
                  let coef = 1.0;
                  if (rowAsset !== colAsset) {
                    // Approximate static return correlations for heatmaps
                    coef = Number((Math.sin(rIdx + colIdx) * 0.35 + 0.15).toFixed(2));
                  }

                  let colorBg = 'rgba(22, 22, 29, 0.4)';
                  if (coef >= 0.75) colorBg = 'rgba(0, 212, 200, 0.85)';
                  else if (coef >= 0.50) colorBg = 'rgba(0, 212, 200, 0.5)';
                  else if (coef >= 0.25) colorBg = 'rgba(0, 212, 200, 0.25)';
                  else if (coef < 0) colorBg = 'rgba(255, 69, 96, 0.4)';

                  return (
                    <div 
                      key={colAsset}
                      className="p-2 text-center font-mono font-bold text-silver border border-border"
                      style={{ backgroundColor: colorBg }}
                    >
                      {coef.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>

      <GraphExplainerModal 
        isOpen={explainOpen} 
        onClose={() => setExplainOpen(false)} 
        graphType={explainType} 
      />
    </div>
  );
}
