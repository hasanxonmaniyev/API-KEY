import React from 'react';
import { Sparkles, Terminal, Layers, BookOpen, Activity, Database, CheckCircle2, GraduationCap, Braces } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, onRefreshStats }) {
  const tabs = [
    { id: 'myapis', label: "Mening API'larim", icon: Braces },
    { id: 'homework', label: 'Dars Vazifalari', icon: GraduationCap },
    { id: 'generator', label: 'API Yaratish', icon: Sparkles },
    { id: 'explorer', label: 'Barcha API\'lar', icon: Terminal, badge: stats?.totalApisGenerated },
    { id: 'admin', label: 'Admin Konstruktor', icon: Layers },
    { id: 'tester', label: 'API Tester', icon: Activity },
    { id: 'docs', label: 'Fetch Qo\'llanma', icon: BookOpen }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Tizim nomi */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setActiveTab('myapis')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Terminal className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  API Builder
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Edu Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal hidden sm:block">
                Dasturlash o'quvchilari uchun jonli REST API platformasi
              </p>
            </div>
          </div>

          {/* Navigatsiya Menyusi */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Ma'lumotlar bazasi holati */}
          <div className="flex items-center space-x-3">
            <div 
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>{stats?.databaseMode === 'postgresql' ? 'PostgreSQL' : 'Lokal Baza'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobil menyu */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-200 space-x-1 scrollbar-none bg-slate-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
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
