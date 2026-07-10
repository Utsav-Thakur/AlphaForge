import React, { useState, useEffect, useContext } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  ArrowRight,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DataContext } from '../context/DataContext';
import PdGauge from '../components/ui/PdGauge';
import GraphExplainerModal from '../components/ui/GraphExplainerModal';

export default function CreditRisk() {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainType, setExplainType] = useState('credit_risk_pd');

  const handleExplain = (type) => {
    setExplainType(type);
    setExplainOpen(true);
  };

  const { top10Loans, shapWaterfall, addLoan } = useContext(DataContext);

  // States
  const [loanAmnt, setLoanAmnt] = useState(25000);
  const [intRate, setIntRate] = useState(15.0);
  const [ficoScore, setFicoScore] = useState(700);
  const [dti, setDti] = useState(18.5);
  const [annualInc, setAnnualInc] = useState(75000);
  const [grade, setGrade] = useState('B');
  const [empLength, setEmpLength] = useState(5);
  const [openAcc, setOpenAcc] = useState(12);
  const [delinq2yrs, setDelinq2yrs] = useState(0);

  const [pdScore, setPdScore] = useState(0.12);
  const [recommendedRate, setRecommendedRate] = useState(8.5);

  const calculateRisk = () => {
    // Math formulas matching backend logit
    const ficoNorm = (ficoScore - 300) / (850 - 300);
    const dtiNorm = dti / 50;
    const intNorm = (intRate - 5) / (36 - 5);
    const incNorm = Math.min(annualInc / 250000, 1.0);
    const gradeMap = { A: 0.05, B: 0.18, C: 0.38, D: 0.58, E: 0.78, F: 0.92, G: 1.0 };
    const gradeVal = gradeMap[grade] || 0.2;
    const delinqNorm = Math.min(delinq2yrs / 5, 1.0);
    const empNorm = empLength / 10;
    const openNorm = Math.min(openAcc / 20, 1.0);

    let z = -1.2;
    z += dtiNorm * 2.2;
    z += intNorm * 1.8;
    z += gradeVal * 2.8;
    z += delinqNorm * 1.9;
    z += openNorm * 0.4;
    z -= ficoNorm * 3.8;
    z -= incNorm * 2.0;
    z -= empNorm * 0.5;

    const pd = 1 / (1 + Math.exp(-z));
    setPdScore(pd);

    // Rate = risk-free 5.25% + default risk premium + margins
    const rate = 5.25 + pd * 24.5 + 2.0;
    setRecommendedRate(rate);

    // Sync to global context array
    addLoan({
      loan_amnt: loanAmnt,
      int_rate: intRate,
      fico_score: ficoScore,
      dti,
      annual_inc: annualInc,
      grade,
      emp_length_num: empLength,
      open_acc: openAcc,
      delinq_2yrs: delinq2yrs,
      pd_score: pd
    });
  };

  const loadProfile = (profile) => {
    setLoanAmnt(profile.loan_amnt || 15000);
    setIntRate(profile.int_rate || 12.0);
    setFicoScore(profile.fico_score || 720);
    setDti(profile.dti || 15.0);
    setAnnualInc(profile.annual_inc || 90000);
    setGrade(profile.grade || 'A');
    setEmpLength(profile.emp_length_num || 5);
    setOpenAcc(profile.open_acc || 10);
    setDelinq2yrs(profile.delinq_2yrs || 0);
  };

  // Re-run risk calculations on slider changes
  useEffect(() => {
    calculateRisk();
  }, [ficoScore, dti, intRate, annualInc, grade, loanAmnt]);

  // Overall Portfolio Risk Pie Chart data
  const pieData = [
    { name: 'Low Risk', value: 65, color: '#00d084' },
    { name: 'Medium Risk', value: 20, color: '#f0b429' },
    { name: 'High Risk', value: 15, color: '#ff4560' }
  ];

  return (
    <div className="animated-page flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-bg relative z-10">
      
      {/* Left Input Panel (65%) */}
      <div className="lg:w-[65%] flex flex-col gap-6">
        
        <div className="glass-card p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border/40 pb-4">
            <div>
              <h2 className="text-xl font-bold font-syne heading-syne text-silver flex items-center gap-2">
                <ShieldAlert className="text-teal" /> Credit Risk Scorer
              </h2>
              <p className="text-xs text-silver-3 mt-1">
                Configure loan attributes interactively to evaluate model probability of default.
              </p>
            </div>
            <span className="badge-teal text-[10px] font-mono">ROC-AUC: 0.8614</span>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Slider 1: Loan Amount */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver-2 font-medium">Loan Amount</span>
                <span className="font-mono text-teal font-bold">${loanAmnt.toLocaleString()}</span>
              </div>
              <input 
                type="range" min="1000" max="100000" step="1000"
                value={loanAmnt} onChange={(e) => setLoanAmnt(Number(e.target.value))}
                className="w-full accent-teal"
              />
            </div>

            {/* Slider 2: Interest Rate */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver-2 font-medium">Interest Rate</span>
                <span className="font-mono text-teal font-bold">{intRate.toFixed(1)}%</span>
              </div>
              <input 
                type="range" min="5.0" max="36.0" step="0.1"
                value={intRate} onChange={(e) => setIntRate(Number(e.target.value))}
                className="w-full accent-teal"
              />
            </div>

            {/* Slider 3: FICO Score */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver-2 font-medium">FICO Credit Score</span>
                <span className="font-mono text-profit font-bold">{ficoScore}</span>
              </div>
              <input 
                type="range" min="300" max="850" step="1"
                value={ficoScore} onChange={(e) => setFicoScore(Number(e.target.value))}
                className="w-full accent-teal"
              />
            </div>

            {/* Slider 4: Debt-To-Income */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver-2 font-medium">Debt-to-Income (DTI)</span>
                <span className="font-mono text-loss font-bold">{dti.toFixed(1)}%</span>
              </div>
              <input 
                type="range" min="0.0" max="50.0" step="0.5"
                value={dti} onChange={(e) => setDti(Number(e.target.value))}
                className="w-full accent-teal"
              />
            </div>

            {/* Slider 5: Annual Income */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver-2 font-medium">Annual Income</span>
                <span className="font-mono text-teal font-bold">${annualInc.toLocaleString()}</span>
              </div>
              <input 
                type="range" min="20000" max="500000" step="5000"
                value={annualInc} onChange={(e) => setAnnualInc(Number(e.target.value))}
                className="w-full accent-teal"
              />
            </div>

            {/* Pill Selector: Grade */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-silver-2 font-medium">Credit Risk Grade</span>
              <div className="flex flex-wrap gap-1 bg-[#111116] border border-border p-1 rounded-lg">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((g) => (
                  <button 
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded transition ${
                      grade === g 
                        ? 'bg-teal text-bg shadow-[0_0_10px_rgba(0,212,200,0.25)]' 
                        : 'text-silver-3 hover:text-silver'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 6: Employment Years */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver-2 font-medium">Employment Duration</span>
                <span className="font-mono text-teal font-bold">{empLength} Years</span>
              </div>
              <input 
                type="range" min="0" max="10" step="1"
                value={empLength} onChange={(e) => setEmpLength(Number(e.target.value))}
                className="w-full accent-teal"
              />
            </div>

            {/* Slider 7: Open Accounts */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver-2 font-medium">Open Credit Lines</span>
                <span className="font-mono text-teal font-bold">{openAcc} accounts</span>
              </div>
              <input 
                type="range" min="0" max="30" step="1"
                value={openAcc} onChange={(e) => setOpenAcc(Number(e.target.value))}
                className="w-full accent-teal"
              />
            </div>

            {/* Input 8: Delinquency count */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-silver-2 font-medium">Delinquencies (Past 2 Years)</span>
              <input 
                type="number" min="0" max="10"
                value={delinq2yrs} onChange={(e) => setDelinq2yrs(Number(e.target.value))}
                className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs font-mono px-4 py-2 outline-none text-silver"
              />
            </div>

          </div>

          <button 
            onClick={calculateRisk} 
            className="btn-teal text-xs justify-center mt-2"
          >
            <UserCheck size={14} /> Calculate Risk Score
          </button>
        </div>

        {/* SHAP Local Explanation waterfall simulation */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
              Individual Feature Driving Weights (SHAP Analysis)
            </span>
            <button 
              onClick={() => handleExplain('shap_local')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {shapWaterfall.map((sw, idx) => {
              const valueWidth = Math.min(Math.abs(sw.shap_value) * 150, 100);
              const isPositive = sw.shap_value >= 0;
              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-silver-2 w-28 truncate">{sw.feature}</span>
                  <div className="flex-1 mx-4 bg-[#111116] h-2 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full absolute rounded-full ${isPositive ? 'bg-loss right-[50%]' : 'bg-profit left-[50%]'}`}
                      style={{ width: `${valueWidth}%` }}
                    />
                  </div>
                  <span className={`font-mono font-bold w-12 text-right ${isPositive ? 'text-loss' : 'text-profit'}`}>
                    {isPositive ? '+' : ''}{sw.shap_value.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Sidebar (35%) */}
      <div className="lg:w-[35%] flex flex-col gap-6">
        
        {/* Needle Gauge Dial */}
        <div className="glass-card p-6 flex flex-col items-center justify-center border border-border/80">
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
              Probability of Default
            </span>
            <button 
              onClick={() => handleExplain('credit_risk_pd')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>
          <PdGauge score={pdScore} />
          
          <div className="mt-4 flex flex-col items-center gap-2 border-t border-border/40 pt-4 w-full text-center">
            <span className="text-[11px] text-silver-3">Recommended Pricing Rate:</span>
            <span className="text-xl font-bold font-syne heading-syne text-gold">
              {recommendedRate.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* High Risk Records Sidebar lookup */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-loss uppercase tracking-widest">
            🔴 Highest Risk Database Profiles
          </span>
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[190px]">
            {top10Loans.map((l, idx) => (
              <div 
                key={idx}
                onClick={() => loadProfile(l)}
                className="p-3 bg-bg-2 border border-border hover:border-teal/30 hover:bg-card-hover cursor-pointer transition rounded-xl flex justify-between items-center group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-silver">
                    ${l.loan_amnt.toLocaleString()} • Grade {l.grade}
                  </span>
                  <span className="text-[10px] text-silver-3">
                    FICO: {l.fico_score} | DTI: {l.dti}%
                  </span>
                </div>
                <span className="text-loss font-mono text-xs font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  Load <ArrowRight size={12} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Portfolio risk donut */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">
              Overall Portfolio Risk Mix
            </span>
            <button 
              onClick={() => handleExplain('credit_risk_mix')}
              className="flex items-center gap-1 text-[10px] text-teal border border-teal/20 px-2 py-0.5 rounded hover:bg-teal/5 transition"
            >
              <Sparkles size={10} /> AI Explain
            </button>
          </div>
          <div className="h-[120px] w-full flex justify-between items-center">
            <div className="w-[120px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16161d', borderColor: '#22222e' }}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 text-[10px]">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-silver-2 font-medium">{d.name}: {d.value}%</span>
                </div>
              ))}
            </div>
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
