import React from 'react';

export default function ModuleCard({ 
  title, 
  description, 
  icon: Icon, 
  badges = [], 
  onClick, 
  children 
}) {
  return (
    <div 
      onClick={onClick}
      className="glass-card card-3d cursor-pointer overflow-hidden flex flex-col justify-between h-[360px] p-0 group select-none border border-border hover:border-teal/30"
    >
      {/* Upper Mini-Chart Preview */}
      <div className="module-thumbnail w-full border-b border-border/40 relative">
        {children}
      </div>

      {/* Middle Text Details */}
      <div className="p-5 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="text-teal group-hover:scale-110 transition duration-300">
              <Icon size={20} />
            </div>
          )}
          <h4 className="text-base font-bold heading-syne text-silver group-hover:text-teal transition duration-300">
            {title}
          </h4>
        </div>
        <p className="text-xs text-silver-2 leading-relaxed mt-1 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Bottom Row Badges & CTA */}
      <div className="p-5 pt-0 border-t border-transparent flex justify-between items-center mt-auto">
        <div className="flex flex-wrap gap-1">
          {badges.map((b, idx) => (
            <span key={idx} className="badge-silver text-[9px] px-1.5 py-0.5 font-mono">
              {b}
            </span>
          ))}
        </div>
        <span className="text-teal text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
          Open <span className="font-mono">→</span>
        </span>
      </div>
    </div>
  );
}
