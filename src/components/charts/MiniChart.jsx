import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar 
} from 'recharts';

export default function MiniChart({ type, data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] text-silver-3 italic">
        No preview data
      </div>
    );
  }

  switch (type) {
    case 'credit': {
      // Data format: { name: 'A', rate: 1.5 }
      return (
        <div className="w-full h-full p-2 opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="rate" fill="#00d4c8" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    case 'forecaster': {
      // Data format: { date: '...', historical: 180 }
      return (
        <div className="w-full h-full opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.slice(-30)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mini-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4c8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00d4c8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="price" stroke="#00d4c8" strokeWidth={1.5} fill="url(#mini-area-grad)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
    case 'portfolio': {
      // Data format: { name: 'AAPL', value: 0.25 }
      return (
        <div className="w-full h-full p-1 opacity-60 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#22222e" />
              <PolarAngleAxis dataKey="name" tick={false} />
              <Radar name="Weights" dataKey="value" stroke="#3b8cff" fill="#3b8cff" fillOpacity={0.3} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    case 'markets': {
      // Multi-ticker prices index chart
      return (
        <div className="w-full h-full opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.slice(-30)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line type="monotone" dataKey="AAPL" stroke="#00d4c8" strokeWidth={1.2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="MSFT" stroke="#f0b429" strokeWidth={1.2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="NVDA" stroke="#3b8cff" strokeWidth={1.2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    case 'rag': {
      // Document stack thumbnail
      return (
        <div className="w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
          <div className="w-24 h-16 bg-[#16161d] border border-border rounded-md rotate-[-6deg] absolute left-6 shadow-md z-10 flex flex-col gap-1 p-1">
            <div className="w-8 h-1.5 bg-silver-3 rounded-full opacity-40"></div>
            <div className="w-12 h-1 bg-silver-3 rounded-full opacity-20"></div>
            <div className="w-10 h-1 bg-silver-3 rounded-full opacity-20"></div>
          </div>
          <div className="w-24 h-16 bg-[#1c1c26] border border-teal-glow rounded-md rotate-[4deg] absolute right-6 shadow-md z-20 flex flex-col gap-1 p-1">
            <div className="w-8 h-1.5 bg-teal rounded-full opacity-60"></div>
            <div className="w-14 h-1 bg-silver-3 rounded-full opacity-35"></div>
            <div className="w-10 h-1 bg-silver-3 rounded-full opacity-35"></div>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}
