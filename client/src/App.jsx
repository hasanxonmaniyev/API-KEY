import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DynamicForm from './components/DynamicForm';
import TemplateBuilder from './components/TemplateBuilder';
import GeneratedApisList from './components/GeneratedApisList';
import ApiTester from './components/ApiTester';
import Documentation from './components/Documentation';
import ApiResultModal from './components/ApiResultModal';
import { request } from './utils/api';
import { Sparkles, Terminal, Layers, Code, Heart, Github } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator'); // generator | admin | explorer | tester | docs
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [stats, setStats] = useState(null);
  const [modalResult, setModalResult] = useState(null);
  const [testerProps, setTesterProps] = useState({ url: '/api/users/1', method: 'GET' });

  // Load templates and stats from backend
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

  // Handler when student generates API from form
  const handleApiGenerated = (result) => {
    setModalResult(result);
    loadData(); // refresh stats & counts
  };

  // Handler to jump to Tester from Result Modal or List
  const handleTestApi = ({ url, method = 'GET', id }) => {
    setTesterProps({ url, method });
    setModalResult(null);
    setActiveTab('tester');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onRefreshStats={loadData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Quick Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/30 via-dark-card to-violet-950/20 border border-indigo-500/20 p-6 sm:p-8">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Educational API Platform for Students</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Create your own live REST API in seconds.
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Fill out the dynamic form below, receive your unique auto-incremented API ID, and copy ready-to-use JavaScript <code className="text-indigo-300 font-mono font-medium">fetch()</code> code to test in your web applications.
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

      {/* Footer */}
      <footer className="border-t border-dark-border py-6 bg-dark-card/50 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">API Builder — Educational Platform</span>
            <span>•</span>
            <span>Built for programming students</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1">
              <span>Database:</span>
              <strong className="text-indigo-400">PostgreSQL</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center space-x-1">
              <span>Deployable to:</span>
              <strong className="text-slate-300">Railway & Vercel</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
