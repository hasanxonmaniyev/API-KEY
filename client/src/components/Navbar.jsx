import React from 'react';
import { Sparkles, Terminal, Layers, BookOpen, Activity, Database, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, onRefreshStats }) {
  const tabs = [
    { id: 'generator', label: 'API Generator', icon: Sparkles },
    { id: 'admin', label: 'Admin Template Builder', icon: Layers },
    { id: 'explorer', label: 'Generated APIs', icon: Terminal, badge: stats?.totalApisGenerated },
    { id: 'tester', label: 'API Tester', icon: Activity },
    { id: 'docs', label: 'Fetch API Guide', icon: BookOpen }
  ];

  return (
    <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  API Builder
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Edu Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Dynamic REST API Generator for Students</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-dark-border text-slate-300'
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
              className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium bg-dark-bg border border-dark-border text-slate-300"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>{stats?.databaseMode === 'postgresql' ? 'PostgreSQL' : 'Local Fallback'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-dark-border space-x-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-dark-hover'
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
