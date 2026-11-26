import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DynamicForm from './components/DynamicForm';
import TemplateBuilder from './components/TemplateBuilder';
import GeneratedApisList from './components/GeneratedApisList';
import ApiTester from './components/ApiTester';
import Documentation from './components/Documentation';
import ApiResultModal from './components/ApiResultModal';
import HomeworkCollections from './components/HomeworkCollections';
import { request } from './utils/api';
import { Sparkles, Terminal, Layers, Code, Heart, Github, Rocket, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('homework'); // 'homework' | 'generator' | 'explorer' | 'admin' | 'tester' | 'docs'
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [stats, setStats] = useState(null);
  const [modalResult, setModalResult] = useState(null);
  const [testerProps, setTesterProps] = useState({ url: '/api/collections/oquvchilar', method: 'GET' });

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
      console.error('Boshlang\'ich ma\'lumotlarni olishda xatolik:', err);
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Tizim Navigatsiyasi */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onRefreshStats={loadData}
      />

      {/* Asosiy Ish Maydoni */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Dars Vazifalari (Homework APIs) - Asosiy ustuvor bo'lim */}
        {activeTab === 'homework' && (
          <div className="animate-in fade-in duration-200">
            <HomeworkCollections onTestApi={handleTestApi} />
          </div>
        )}

        {/* 2. Individual API Generatori */}
        {activeTab === 'generator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Individual API Endpoint Generatori</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Har bir talaba uchun o'zining shaxsiy REST API'si
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  O'zingizga mos ma'lumotlarni to'ldiring, tayyor mashina va o'quvchi rasmlarini bitta bosishda tanlang. Baza sizga unikal <code className="text-indigo-700 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">ID</code> va jonli endpoint generatsiya qilib beradi.
                </p>
              </div>
            </div>

            <DynamicForm
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
              onApiGenerated={handleApiGenerated}
            />
          </div>
        )}

        {/* 3. Barcha Yaratilgan API'lar */}
        {activeTab === 'explorer' && (
          <div className="animate-in fade-in duration-200">
            <GeneratedApisList
              onTestApi={handleTestApi}
              onViewResult={setModalResult}
            />
          </div>
        )}

        {/* 4. Admin Konstruktor */}
        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-200">
            <TemplateBuilder
              templates={templates}
              onTemplatesUpdated={loadData}
            />
          </div>
        )}

        {/* 5. API Tester */}
        {activeTab === 'tester' && (
          <div className="animate-in fade-in duration-200">
            <ApiTester
              initialUrl={testerProps.url}
              initialMethod={testerProps.method}
            />
          </div>
        )}

        {/* 6. Fetch API Qo'llanma */}
        {activeTab === 'docs' && (
          <div className="animate-in fade-in duration-200">
            <Documentation />
          </div>
        )}
      </main>

      {/* Natija Modali */}
      {modalResult && (
        <ApiResultModal
          result={modalResult}
          onClose={() => setModalResult(null)}
          onTestApi={handleTestApi}
        />
      )}

      {/* Tizim Futer (Pastki qismi) */}
      <footer className="border-t border-slate-200 py-6 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">API Builder Edu</span>
            <span>•</span>
            <span>Dasturlash o'quvchilari uchun uyga vazifalar va individual REST API platformasi</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1.5">
              <span>Ma'lumotlar bazasi:</span>
              <strong className="text-indigo-600">PostgreSQL (JSONB)</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center space-x-1.5">
              <span>Host:</span>
              <strong className="text-slate-700">Railway & Vercel</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
