import React, { useState } from 'react';
import { 
  Check, Copy, ExternalLink, Play, Sparkles, X, 
  Terminal, Code2, Link, ArrowRight, Eye, Layout, Image as ImageIcon 
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

  // Detect image in payload
  const imageKey = Object.keys(data).find(k => 
    ['avatar', 'image', 'productimage', 'poster', 'photo', 'carphoto', 'thumbnail', 'pic'].includes(k.toLowerCase())
  );
  const imageUrl = imageKey ? data[imageKey] : null;

  // Detect primary title
  const titleKey = Object.keys(data).find(k => 
    ['firstname', 'name', 'productname', 'title', 'model'].includes(k.toLowerCase())
  );
  const title = titleKey ? (data[titleKey] + (data.lastName ? ' ' + data.lastName : '')) : `API Record #${result.id}`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative rounded-3xl bg-slate-900/90 border border-white/[0.1] w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col my-8">
        {/* Top Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-xl z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">API Endpoint Generated</h3>
              <p className="text-xs text-slate-400">
                Live in PostgreSQL & ready for Fetch API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Endpoint Banner */}
          <div className="rounded-2xl bg-slate-950/70 border border-indigo-500/30 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">API ID:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                  #{result.id}
                </span>
                {result.templateName && (
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Template: <strong className="text-slate-200">{result.templateName}</strong>
                  </span>
                )}
              </div>

              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                201 Created
              </span>
            </div>

            {/* URL Box */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-white/[0.08] rounded-xl p-2.5 shadow-inner">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white font-mono shrink-0">
                GET
              </span>
              <input
                readOnly
                value={fullUrl}
                className="w-full bg-transparent text-xs font-mono text-indigo-300 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onTestApi({ url: fullUrl, method: 'GET', id: result.id })}
              className="group relative inline-flex items-center justify-center p-0.5 rounded-xl overflow-hidden font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
              <span className="relative px-4 py-2 rounded-[10px] bg-indigo-600 group-hover:bg-opacity-90 flex items-center space-x-2 text-xs text-white">
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Test in API Tester</span>
              </span>
            </button>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 transition-colors"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Endpoint</span>
            </a>
          </div>

          {/* Tabs for Visual Card vs Raw JSON vs Code */}
          <div className="space-y-3">
            <div className="flex items-center space-x-1 border-b border-white/[0.08] pb-2">
              <button
                type="button"
                onClick={() => setActiveView('visual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'visual'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Visual Card Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('json')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'json'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw JSON Response</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === 'code'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Fetch API Code</span>
              </button>
            </div>

            {/* View 1: Visual Card Rendering */}
            {activeView === 'visual' && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 border border-white/[0.08] shadow-lg animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {imageUrl && (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-indigo-500/30 shadow-xl bg-slate-950">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-extrabold text-white">{title}</h4>
                      {data.inStock !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          data.inStock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {data.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      {data.profession && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                          {data.profession}
                        </span>
                      )}
                      {data.city && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                          📍 {data.city}
                        </span>
                      )}
                      {data.price !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                          ${data.price}
                        </span>
                      )}
                      {data.brand && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                          {data.brand}
                        </span>
                      )}
                    </div>

                    {data.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Raw JSON */}
            {activeView === 'json' && (
              <pre className="bg-[#06080e] border border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72 scrollbar-none leading-relaxed animate-in fade-in">
                {jsonString}
              </pre>
            )}

            {/* View 3: Code Snippets */}
            {activeView === 'code' && (
              <div className="animate-in fade-in">
                <CodeSnippets url={fullUrl} id={result.id} sampleData={result.data} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
