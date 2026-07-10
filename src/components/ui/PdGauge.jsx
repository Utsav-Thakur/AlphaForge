import React, { useEffect, useState } from 'react';

export default function PdGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate needle on score change
    const start = animatedScore;
    const end = score;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = start + (end - start) * ease;
      setAnimatedScore(val);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(end);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Semicircle parameters
  const radius = 80;
  const strokeWidth = 10;
  const cx = 100;
  const cy = 90;
  
  // Calculate angle for needle: from 0 (left / 180 deg) to 1 (right / 0 deg)
  const angle = 180 - animatedScore * 180; // in degrees
  const angleRad = (angle * Math.PI) / 180;
  
  // Needle coordinates
  const needleLen = 70;
  const needleX = cx + needleLen * Math.cos(angleRad);
  const needleY = cy - needleLen * Math.sin(angleRad);

  // Class for risk tier
  let riskColor = "text-profit";
  let riskText = "Low Risk";
  if (score >= 0.30) {
    riskColor = "text-loss glow-loss";
    riskText = "High Risk";
  } else if (score >= 0.15) {
    riskColor = "text-warning glow-gold";
    riskText = "Medium Risk";
  }

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-[180px]">
      <svg className="w-[200px] h-[110px]" viewBox="0 0 200 110">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d084" /> {/* Green */}
            <stop offset="35%" stopColor="#f0b429" /> {/* Amber */}
            <stop offset="100%" stopColor="#ff4560" /> {/* Red */}
          </linearGradient>
        </defs>

        {/* Outer Background Track */}
        <path 
          d="M 20 90 A 80 80 0 0 1 180 90" 
          fill="none" 
          stroke="#22222e" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round"
        />

        {/* Gradient Arcs */}
        <path 
          d="M 20 90 A 80 80 0 0 1 180 90" 
          fill="none" 
          stroke="url(#gauge-gradient)" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round"
        />

        {/* Gauge Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#e8eaf0"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Pivot pin */}
        <circle cx={cx} cy={cy} r="6" fill="#e8eaf0" stroke="#16161d" strokeWidth="2" />
      </svg>

      {/* Label overlays */}
      <div className="absolute bottom-2 flex flex-col items-center">
        <h4 className={`text-3xl font-bold heading-syne tracking-tight ${riskColor}`}>
          {(score * 100).toFixed(1)}%
        </h4>
        <span className="text-[10px] font-bold text-silver-3 uppercase tracking-wider mt-1">{riskText}</span>
      </div>
    </div>
  );
}
