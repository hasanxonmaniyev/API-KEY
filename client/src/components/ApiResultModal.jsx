import React, { useState } from 'react';
import { 
  Check, Copy, ExternalLink, Play, Sparkles, X, 
  Terminal, Code2, Link, ArrowRight, Eye, Layout, Image as ImageIcon, CheckCircle2 
} from 'lucide-react';
import { getFullApiUrl } from '../utils/api';
import CodeSnippets from './CodeSnippets';

export default function ApiResultModal({ result, onClose, onTestApi }) {
  if (!result) return null;

  const [activeView, setActiveView] = useState('visual'); // 'visual', 'json', 'code'
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const fullUrl = getFullApiUrl(result.endpoint);
  const data = result.data || {};
  const jsonString = JSON.stringify(data, null, 2);

  // Rasm kalitini topish
  const imageKey = Object.keys(data).find(k => 
    ['avatar', 'image', 'productimage', 'poster', 'photo', 'carphoto', 'carimage', 'thumbnail'].includes(k.toLowerCase())
  );
  const imageUrl = imageKey ? data[imageKey] : null;

  // Asosiy sarlavha
  const titleKey = Object.keys(data).find(k => 
    ['firstname', 'name', 'productname', 'title', 'model', 'carname'].includes(k.toLowerCase())
  );
  const title = titleKey 
    ? (data[titleKey] + (data.lastName ? ' ' + data.lastName : ''))
    : `Yozuv #${result.id}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-8">
        {/* Modal Tepasi */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">API Endpoint Muvaffaqiyatli Yaratildi!</h3>
              <p className="text-xs text-slate-500">
                Ma'lumotlar PostgreSQL bazasida saqlandi va Fetch API bilan ishlashga tayyor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tana qismi */}
        <div className="p-6 space-y-6">
          {/* API URL va ID Bloki */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Individual API ID:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
                  #{result.id}
                </span>
                {result.templateName && (
                  <span className="text-xs text-slate-500">
                    ({result.templateName})
                  </span>
                )}
              </div>

              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono">
                201 Created (Yaratildi)
              </span>
            </div>

            {/* URL nusxalash maydoni */}
            <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-xl p-2 shadow-2xs">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white font-mono shrink-0">
                GET
              </span>
              <input
                readOnly
                value={fullUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-800 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Nusxalandi' : 'URL nusxalash'}</span>
              </button>
            </div>
          </div>

          {/* Amallar tugmalari */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onTestApi({ url: fullUrl, method: 'GET', id: result.id })}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Testerda sinab ko'rish</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'JSON nusxalandi' : 'JSON nusxalash'}</span>
            </button>

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Brauzerda ochish</span>
            </a>
          </div>

          {/* Tablar: Vizual kartochka, JSON va Fetch kodi */}
          <div className="space-y-3">
            <div className="flex items-center space-x-1 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveView('visual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'visual'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Kartochka ko'rinishi (Visual)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('json')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'json'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON javobi (Raw)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'code'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>JavaScript Fetch Kodi</span>
              </button>
            </div>

            {/* 1. Vizual Kartochka */}
            {activeView === 'visual' && (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {imageUrl && (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 border border-slate-300 shadow-xs bg-white">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{title}</h4>
                      {data.profession && (
                        <p className="text-xs text-indigo-600 font-semibold">{data.profession}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {data.city && (
                        <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                          📍 {data.city}
                        </span>
                      )}
                      {data.age && (
                        <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                          🎂 {data.age} yosh
                        </span>
                      )}
                      {data.carName && (
                        <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                          🚗 {data.carName}
                        </span>
                      )}
                      {data.fianceName && (
                        <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                          💍 {data.fianceName}
                        </span>
                      )}
                      {data.price !== undefined && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                          ${data.price}
                        </span>
                      )}
                    </div>

                    {data.description && (
                      <p className="text-xs text-slate-500 leading-relaxed pt-1">
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Raw JSON */}
            {activeView === 'json' && (
              <pre className="bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                {jsonString}
              </pre>
            )}

            {/* 3. Fetch Kodi */}
            {activeView === 'code' && (
              <div>
                <CodeSnippets url={fullUrl} id={result.id} sampleData={result.data} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
