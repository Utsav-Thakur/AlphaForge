import React from 'react';

export default function KPICard({ 
  label, 
  value, 
  suffix = "", 
  decimals = 0, 
  icon: Icon, 
  trendText, 
  trendDirection = "up", 
  colorClass = "text-teal", 
  subLabel,
  watermark: WatermarkIcon
}) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden h-[160px] select-none slide-up">
      {/* Background Watermark Icon */}
      {WatermarkIcon && (
        <div className="absolute right-[-10px] bottom-[-10px] text-silver-3 opacity-5 pointer-events-none">
          <WatermarkIcon size={96} />
        </div>
      )}

      {/* Header Row */}
      <div className="flex justify-between items-center z-10">
        <span className="text-[10px] font-bold text-silver-3 uppercase tracking-widest">{label}</span>
        {Icon && (
          <div className="text-teal opacity-80">
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* Main Value Container */}
      <div className="my-2 z-10">
        <h3 className={`text-3xl font-bold heading-syne tracking-tight ${colorClass}`}>
          {value !== undefined ? (
            <span className="count-up">
              {Number(value).toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
              })}
              {suffix}
            </span>
          ) : (
            <span className="text-silver-3">N/A</span>
          )}
        </h3>
      </div>

      {/* Footer Metrics Row */}
      <div className="flex justify-between items-center mt-auto z-10">
        {trendText && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
            trendDirection === 'up' 
              ? 'badge-profit' 
              : trendDirection === 'down' 
                ? 'badge-loss' 
                : 'badge-silver'
          }`}>
            {trendText}
          </span>
        )}
        {subLabel && (
          <span className="text-[11px] text-silver-3 truncate max-w-[150px]">{subLabel}</span>
        )}
      </div>
    </div>
  );
}
