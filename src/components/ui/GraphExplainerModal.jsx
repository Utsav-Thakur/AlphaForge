import React from 'react';
import { X, Sparkles, AlertCircle, Cpu, BookOpen, LineChart } from 'lucide-react';

export default function GraphExplainerModal({ isOpen, onClose, graphType, contextData }) {
  if (!isOpen) return null;

  const explainerContent = {
    overview_benchmark: {
      title: "Asset Price Benchmark",
      badge: "Historical Context",
      icon: LineChart,
      description: "Visualizes the last 20 business days of adjusted close stock prices, serving as the historical baseline for deep learning projections.",
      model: "yfinance API Data Sync",
      aiGuidance: "This area chart outlines recent equity price trends. ForgeAI leverages this data to compute rolling averages and volatility ranges before feedforward sequence execution.",
      insights: [
        "Tracks Adjusted Close price values to avoid stock split distortions.",
        "Generates base technical indicator arrays (MA5, MA20) dynamically.",
        "Helps screen for sudden price volatility spikes before forecasting."
      ]
    },
    credit_risk_mix: {
      title: "Portfolio Risk Mix",
      badge: "Concentration Risk",
      icon: AlertCircle,
      description: "Classifies the default probability profile of active loan assets into low, medium, and high-risk segments.",
      model: "Stratified Portfolio Classifier",
      aiGuidance: "Ensures risk managers can monitor default concentration. High concentrations in G-grade loans trigger automated capital reserve warnings.",
      insights: [
        "Low Risk: Probability of Default (PD) under 15% (typically Grades A-B).",
        "Medium Risk: PD between 15% and 30% (typically Grades C-D).",
        "High Risk: PD exceeding 30% (typically Grades E-G)."
      ]
    },
    credit_risk_pd: {
      title: "Probability of Default (PD) Gauge",
      badge: "Risk Scoring",
      icon: Cpu,
      description: "Translates high-dimensional credit records into a singular, interpretable default probability score.",
      model: "XGBoost Logit Link Model",
      aiGuidance: "By passing applicant parameters (FICO, DTI, Income) through an XGBoost model, we compute a logit distance and resolve it to a default risk percentage.",
      insights: [
        "FICO score improvements cause an exponential decay in default likelihood.",
        "High Debt-To-Income (DTI) ratios compound baseline risk parameters.",
        "Recommended pricing rate dynamically adjusts based on risk-free rate + risk premiums."
      ]
    },
    shap_global: {
      title: "Global Feature Importance",
      badge: "SHAP Explainability",
      icon: BookOpen,
      description: "Aggregates absolute SHAP values across thousands of records to identify which metrics drive model decisions globally.",
      model: "XGBoost TreeExplainer",
      aiGuidance: "TreeExplainer mathematically calculates feature contributions. It verifies that FICO score and annual income are the primary drivers of default scores.",
      insights: [
        "Ensures compliance with regulatory audit frameworks (e.g. Fair Lending Act).",
        "Validates that the classifier does not leverage biased proxy parameters.",
        "Identifies features that risk analysts can inspect for custom underwriting."
      ]
    },
    shap_local: {
      title: "Waterfall Analysis (Single Prediction)",
      badge: "Local Explanation",
      icon: Sparkles,
      description: "Exposes individual feature driving weights for a single credit application decision.",
      model: "SHAP Local Attribution Values",
      aiGuidance: "Explains precisely why an applicant was flagged. Red bars show features increasing default risk, while green bars show features mitigating default risk.",
      insights: [
        "Deconstructs the exact delta between baseline risk and current score.",
        "FICO scores below average shift local bars heavily into the red.",
        "Helps underwriters provide clear feedback to applicants on credit rejections."
      ]
    },
    forecaster: {
      title: "TFT Price Projection",
      badge: "Time-Series Deep Learning",
      icon: LineChart,
      description: "Projects the stock price trajectory for the next 5 business days alongside historical trends.",
      model: "Temporal Fusion Transformer (TFT)",
      aiGuidance: "The TFT model processes rolling prices and macroeconomic indices. Shaded boundaries represent standard volatility bounds derived from model residuals.",
      insights: [
        "Forecast trajectory is anchored directly to the last actual price to show relative return path.",
        "Dashed lines indicate the mean projection path calculated by the temporal net.",
        "Shaded regions outline a ±1.5% daily compounded standard deviation confidence boundary."
      ]
    },
    optimizer_frontier: {
      title: "Efficient Frontier Allocation",
      badge: "Portfolio Management",
      icon: Cpu,
      description: "Maps the trade-off between expected return and volatility using Monte Carlo simulations.",
      model: "Markowitz Modern Portfolio Theory",
      aiGuidance: "Calculates 5,000 randomized asset weight vectors. The gold star marks the Max Sharpe Ratio (best returns per unit of risk); the blue dot marks the Minimum Volatility portfolio.",
      insights: [
        "Points along the upper curve represent the mathematically optimal portfolios.",
        "Helps identify allocations that maximize returns while minimizing standard deviations.",
        "Leverages covariance matrices calculated over the last 252 trading days."
      ]
    },
    optimizer_weights: {
      title: "Asset Allocation Splits",
      badge: "Optimization Solver",
      icon: Sparkles,
      description: "Compares current portfolio weights against the optimal allocations computed by our mathematical solver.",
      model: "Scipy SLSQP Constraints Solver",
      aiGuidance: "Solves a non-linear optimization task. Constraints are configured to prevent extreme concentration, bounding individual assets between 2% and 40% allocations.",
      insights: [
        "Current splits assume equal weight distributions across select tickers.",
        "Optimal splits maximize expected Sharpe ratios within boundaries.",
        "Updates automatically as covariance estimates shift with live watchlists."
      ]
    }
  };

  const content = explainerContent[graphType] || {
    title: "Graph Explanation",
    badge: "AI Context",
    icon: Sparkles,
    description: "Interactive chart explanation provided by AlphaForge AI.",
    model: "Standard Analytics",
    aiGuidance: "Inspect chart variables, scales, and data points to evaluate system metrics.",
    insights: ["Real-time visual data feed.", "Trained on processed finance models."]
  };

  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border border-teal/20 bg-card p-6 shadow-2xl slide-up text-left">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal">
              <Icon size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-silver font-syne heading-syne flex items-center gap-2">
                {content.title} <Sparkles size={12} className="text-teal animate-pulse" />
              </h3>
              <span className="badge-teal text-[9px] font-mono mt-0.5">{content.badge}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-silver-3 hover:text-loss transition p-1 hover:bg-[#1c1c26] rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 mt-4 overflow-y-auto max-h-[380px] pr-2">
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-silver-3 uppercase tracking-widest font-bold font-mono">Description</span>
            <p className="text-xs text-silver-2 leading-relaxed">{content.description}</p>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 bg-bg-2 border border-border rounded-xl">
            <div className="flex items-center gap-2 text-[10px] text-teal font-mono uppercase tracking-widest font-bold">
              <Cpu size={12} /> Model: {content.model}
            </div>
            <p className="text-xs text-silver-3 leading-relaxed mt-1">{content.aiGuidance}</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-silver-3 uppercase tracking-widest font-bold font-mono">ForgeAI Core Insights</span>
            <ul className="text-xs text-silver-2 list-disc pl-4 flex flex-col gap-2 font-sans">
              {content.insights.map((ins, idx) => (
                <li key={idx} className="leading-relaxed">{ins}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 pt-4 mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="btn-teal text-xs py-2 px-4 shadow-[0_0_12px_rgba(0,212,200,0.1)]"
          >
            Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
}
