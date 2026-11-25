import React from 'react';
import { Sparkles, Terminal, Layers, BookOpen, Activity, Database, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, onRefreshStats }) {
  const tabs = [
    { id: 'generator', label: 'API Generator', icon: Sparkles },
    { id: 'admin', label: 'Admin Builder', icon: Layers },
    { id: 'explorer', label: 'Generated APIs', icon: Terminal, badge: stats?.totalApisGenerated },
    { id: 'tester', label: 'API Tester', icon: Activity },
    { id: 'docs', label: 'Fetch API Guide', icon: BookOpen }
  ];

  return (
    <header className="border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-2xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => setActiveTab('generator')}>
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/30 group-hover:scale-105 transition-transform duration-300">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-300 bg-clip-text text-transparent">
                  API Builder
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                  Universal Edu
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Dynamic REST API Platform for Programming Students</p>
            </div>
          </div>

          {/* Navigation Links with Glassmorphism */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-900/60 border border-white/[0.07] p-1.5 rounded-2xl shadow-inner backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Database Status indicator */}
          <div className="flex items-center space-x-3">
            <div 
              title={stats?.databaseMode === 'postgresql' ? 'Connected to live PostgreSQL database' : 'Running in local fallback database mode'} 
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-slate-300 shadow-sm"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>{stats?.databaseMode === 'postgresql' ? 'PostgreSQL' : 'Local Store'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2.5 border-t border-white/[0.06] space-x-1.5 scrollbar-none bg-slate-950/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
