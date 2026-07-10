import React, { useContext, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { HelpCircle, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import GraphExplainerModal from '../components/ui/GraphExplainerModal';

export default function ShapExplainer() {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainType, setExplainType] = useState('shap_global');

  const handleExplain = (type) => {
    setExplainType(type);
    setExplainOpen(true);
  };

  const { shapImportance, shapWaterfall, creditDashboard } = useContext(DataContext);
  const [activeFeature, setActiveFeature] = useState(null);

  const featureExplanations = {
    fico_score: "FICO credit scoring aggregates consumer payment histories. FICO scores above 720 indicate high reliability, reducing default probabilities exponentially in our XGBoost weights.",
    dti: "Debt-to-Income (DTI) represents a borrower's total monthly debt obligations divided by monthly gross income. Spikes in DTI over 35% strongly signal credit stress.",
    int_rate: "The loan's interest rate. Higher interest rates increase the borrower's installment sizes and overall debt load, directly correlating with default frequency.",
    annual_inc: "Total borrower annual earnings. Serves as a vital proxy for credit capacity; higher income buffers borrowers against temporal default events.",
    loan_amnt: "The principal amount requested. Large loans carry larger default risk parameters, especially when coupled with low borrower annual incomes.",
    installment: "The monthly credit payment size. Correlates heavily with loan size and interest rates; larger installments increase pressure on household monthly buffers.",
    open_acc: "Number of active credit lines. Excess open accounts may indicate high leverage, whereas too few may reflect lack of credit experience."
  };

  // Format global feature values
  const sortedImportance = [...shapImportance].sort((a, b) => b.mean_abs_shap - a.mean_abs_shap);

  // Process waterfall chart calculations
  const waterfallData = shapWaterfall.map(w => ({
    name: w.feature,
    value: w.shap_value,
    color: w.shap_value >= 0 ? '#ff4560' : '#00d084' // loss-text red, profit-text green
  }));

  // Grade default rates
  const gradeData = creditDashboard?.grade_default_rates 
    ? Object.keys(creditDashboard.grade_default_rates).map(key => ({
        name: key,
        rate: Number((creditDashboard.grade_default_rates[key] * 100).toFixed(2))
      })).sort((a,b) => a.name.localeCompare(b.name))
    : [
        { name: 'A', rate: 1.5 },
        { name: 'B', rate: 4.8 },
        { name: 'C', rate: 8.9 },
        { name: 'D', rate: 15.2 },
        { name: 'E', rate: 21.4 },
        { name: 'F', rate: 29.5 },
        { name: 'G', rate: 36.8 }
      ];

  return (
    <div className="animated-page flex flex-col gap-6 p-6 min-h-screen bg-bg relative z-10">
      
      {/* Header Row */}
      <div className="flex justify-between items-center border-b border-border/40 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-syne heading-syne gradient-teal">
            Why Did the Model Flag This?
          </h2>
          <p className="text-xs text-silver-3 mt-1">
            Global SHAP feature importances and individual model prediction explanations.
          </p>
        </div>
      </div>

      {/* Main Bar Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Global SHAP Importance */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-silver">Global Feature Importance (XGBoost)</h3>
              <span className="text-[10px] text-silver-3 font-semibold">
                Mean absolute SHAP value impact across portfolio database.
              </span>
            </div>
            <button 
              onClick={() => handleExplain('shap_global')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedImportance}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="#22222e" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#606270" fontSize={10} />
                <YAxis dataKey="feature" type="category" stroke="#606270" width={90} fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  labelStyle={{ color: '#e8eaf0', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                />
                <Bar dataKey="mean_abs_shap" fill="#00d4c8" radius={[0, 4, 4, 0]}>
                  {sortedImportance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b8cff' : '#00d4c8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Local Waterfall breakdown */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-silver">Waterfall Analysis (Single Prediction)</h3>
              <span className="text-[10px] text-silver-3 font-semibold">
                Negative values (green) reduce risk; positive values (red) increase risk.
              </span>
            </div>
            <button 
              onClick={() => handleExplain('shap_local')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={waterfallData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="#22222e" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#606270" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#606270" width={90} fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  labelStyle={{ color: '#e8eaf0', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Feature Guide & Default Rate Grade Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expandable Feature Dictionary */}
        <div className="glass-card p-6 col-span-2 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
            XGBoost Feature Risk Guide
          </span>
          <div className="flex flex-col gap-2 mt-2">
            {Object.keys(featureExplanations).map((feat) => (
              <div key={feat} className="border border-border rounded-xl overflow-hidden bg-card/30">
                <div 
                  onClick={() => setActiveFeature(activeFeature === feat ? null : feat)}
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-card-hover/40 transition select-none"
                >
                  <span className="text-xs font-bold text-silver capitalize">
                    {feat.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-teal">
                    {activeFeature === feat ? 'Collapse' : 'Explain'}
                  </span>
                </div>
                {activeFeature === feat && (
                  <div className="p-4 bg-bg-2/60 text-xs text-silver-2 border-t border-border leading-relaxed font-sans">
                    {featureExplanations[feat]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Grade Default Rate Card */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-border justify-between">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-silver">Default Rate by Grade</h3>
              <span className="text-[10px] text-silver-3">Monotonic progression across LendingClub grades.</span>
            </div>
            <button 
              onClick={() => handleExplain('credit_risk_mix')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>

          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData}>
                <CartesianGrid stroke="#22222e" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#606270" fontSize={9} />
                <YAxis stroke="#606270" fontSize={9} suffix="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  formatter={(v) => [`${v}%`, 'Default Rate']}
                />
                <Bar dataKey="rate" fill="#ff4560" radius={[3, 3, 0, 0]}>
                  {gradeData.map((entry, index) => {
                    // Gradient color from green to red
                    const colors = ['#00d084', '#60d960', '#a0db40', '#f0b429', '#f3752b', '#f75141', '#ff4560'];
                    return <Cell key={`cell-${index}`} fill={colors[index] || '#ff4560'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-bg-2 border border-border/80 rounded-xl text-[10px] text-silver-2 leading-relaxed font-sans mt-3">
            <strong>Risk Grade Progression:</strong> Rates increase monotonically from Grade A (lowest default risk) to Grade G (highest defaults).
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
