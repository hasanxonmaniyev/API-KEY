import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DynamicForm from './components/DynamicForm';
import TemplateBuilder from './components/TemplateBuilder';
import GeneratedApisList from './components/GeneratedApisList';
import ApiTester from './components/ApiTester';
import Documentation from './components/Documentation';
import ApiResultModal from './components/ApiResultModal';
import { request } from './utils/api';
import { Sparkles, Terminal, Layers, Code, Heart, Github, Rocket, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [stats, setStats] = useState(null);
  const [modalResult, setModalResult] = useState(null);
  const [testerProps, setTesterProps] = useState({ url: '/api/data/1', method: 'GET' });

  const loadData = async () => {
    try {
      const [tplRes, statsRes] = await Promise.all([
        request('/api/templates'),
        request('/api/stats')
      ]);

      if (tplRes.ok && tplRes.data.data) {
        setTemplates(tplRes.data.data);
        if (!selectedTemplateId && tplRes.data.data.length > 0) {
          setSelectedTemplateId(tplRes.data.data[0].id);
        }
      }

      if (statsRes.ok) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApiGenerated = (result) => {
    setModalResult(result);
    loadData();
  };

  const handleTestApi = ({ url, method = 'GET', id }) => {
    setTesterProps({ url, method });
    setModalResult(null);
    setActiveTab('tester');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070a12] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 -left-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-2/3 -right-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onRefreshStats={loadData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'generator' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Elegant Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-purple-950/40 border border-white/[0.08] p-7 sm:p-10 shadow-2xl backdrop-blur-xl">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Educational REST API Platform with Photos & Universal Data</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  Design, build & test <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">real APIs</span> in seconds.
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Add photos, custom properties, numbers, and tags. Get an individual auto-incremented API ID with real PostgreSQL persistence to practice JavaScript <code className="text-indigo-300 font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.05]">fetch()</code> immediately.
                </p>
              </div>
            </div>

            {/* Dynamic Creation Form */}
            <DynamicForm
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
              onApiGenerated={handleApiGenerated}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <TemplateBuilder
              templates={templates}
              onTemplatesUpdated={loadData}
            />
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="animate-in fade-in duration-300">
            <GeneratedApisList
              onTestApi={handleTestApi}
              onViewResult={setModalResult}
            />
          </div>
        )}

        {activeTab === 'tester' && (
          <div className="animate-in fade-in duration-300">
            <ApiTester
              initialUrl={testerProps.url}
              initialMethod={testerProps.method}
            />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="animate-in fade-in duration-300">
            <Documentation />
          </div>
        )}
      </main>

      {/* Result Modal popup */}
      {modalResult && (
        <ApiResultModal
          result={modalResult}
          onClose={() => setModalResult(null)}
          onTestApi={handleTestApi}
        />
      )}

      {/* Elegant Footer */}
      <footer className="border-t border-white/[0.06] py-8 bg-slate-950/60 backdrop-blur-xl text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">API Builder Edu</span>
            <span>•</span>
            <span>Universal Dynamic REST API Generator for Students</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1.5">
              <span>Database:</span>
              <strong className="text-indigo-400">PostgreSQL (JSONB)</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center space-x-1.5">
              <span>Hostable on:</span>
              <strong className="text-slate-300">Railway & Vercel</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
