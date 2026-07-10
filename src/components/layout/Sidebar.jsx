import React, { useContext } from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Briefcase, 
  Search, 
  PlusCircle, 
  Database, 
  Info,
  Sparkles
} from 'lucide-react';
import { DataContext } from '../../context/DataContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { creditDashboard, manualLoans } = useContext(DataContext);

  const totalLoans = (creditDashboard?.total_loans || 0) + manualLoans.length;

  const sections = [
    {
      title: "Intelligence",
      items: [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
        { id: "forge_ai", label: "ForgeAI", icon: MessageSquareCode, accent: "text-teal" },
        { id: "live_markets", label: "Live Markets", icon: Activity },
      ]
    },
    {
      title: "Analytics",
      items: [
        { id: "credit_scorer", label: "Credit Risk", icon: ShieldAlert },
        { id: "forecaster", label: "Forecaster", icon: TrendingUp },
        { id: "optimizer", label: "Portfolio Lab", icon: Briefcase },
        { id: "doc_search", label: "RAG Search", icon: Search },
      ]
    },
    {
      title: "Data",
      items: [
        { id: "add_data", label: "Add Data", icon: PlusCircle },
        { id: "data_overview", label: "Data Overview", icon: Database },
      ]
    },
    {
      title: "System",
      items: [
        { id: "about", label: "About", icon: Info },
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-bg-2 border-r border-border flex flex-col z-40 select-none">
      {/* Top Branding Header */}
      <div className="p-6 pb-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-tr from-teal to-info flex items-center justify-center font-bold text-lg text-bg heading-syne shadow-[0_0_15px_rgba(0,212,200,0.25)]">
            AF
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-syne heading-syne tracking-tight gradient-teal">
              AlphaForge
            </span>
            <span className="text-[9px] text-silver-3 uppercase tracking-widest font-semibold mt-0.5">
              Financial Intelligence
            </span>
          </div>
        </div>
        {/* Animated Teal Line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-teal/40 via-info/20 to-transparent mt-2"></div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-5">
        {sections.map((sect, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-silver-3 uppercase tracking-widest px-3 mb-1">
              {sect.title}
            </span>
            {sect.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border-l-[3px] ${
                    isActive 
                      ? 'bg-teal/5 border-teal text-teal font-semibold' 
                      : 'border-transparent text-silver-2 hover:bg-card hover:text-teal hover:border-teal/30'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-teal' : 'text-silver-3'} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status and Shortcut */}
      <div className="p-4 border-t border-border flex flex-col gap-4">
        {/* Status Card */}
        <div className="glass-card p-3 flex flex-col gap-2 bg-card/40 border border-border/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-profit animate-pulse"></span>
            <span className="text-[10px] font-bold text-silver-2 uppercase tracking-wider">System Online</span>
          </div>
          <span className="text-[10px] text-silver-3">
            5 Modules • {totalLoans} Records
          </span>
          {/* Progress bar */}
          <div className="w-full bg-[#22222e] h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal to-info h-full w-[80%] rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
