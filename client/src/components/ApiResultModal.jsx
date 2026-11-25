import React, { useState } from 'react';
import { 
  Check, Copy, ExternalLink, Play, Sparkles, X, 
  Terminal, Code2, Link, ArrowRight 
} from 'lucide-react';
import { getFullApiUrl } from '../utils/api';
import CodeSnippets from './CodeSnippets';

export default function ApiResultModal({ result, onClose, onTestApi }) {
  if (!result) return null;

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const fullUrl = getFullApiUrl(result.endpoint);
  const jsonString = JSON.stringify(result.data, null, 2);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">API Endpoint Generated Successfully!</h3>
              <p className="text-xs text-slate-400">
                Your REST API endpoint is active in PostgreSQL and ready for JavaScript Fetch API.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Unique API ID & URL Banner */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-dark-bg to-dark-bg border border-indigo-500/30 rounded-2xl p-4.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Unique API ID:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-sm border border-indigo-500/30">
                  #{result.id}
                </span>
                {result.templateName && (
                  <span className="text-xs text-slate-400">
                    Template: <strong className="text-slate-300">{result.templateName}</strong>
                  </span>
                )}
              </div>

              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                HTTP 201 Created
              </span>
            </div>

            {/* Full URL Box */}
            <div className="flex items-center space-x-2 bg-[#06080d] border border-dark-border rounded-xl p-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white font-mono">
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
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-200 transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy API URL'}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onTestApi({ url: fullUrl, method: 'GET', id: result.id })}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Test API Endpoint</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </a>
          </div>

          {/* JSON Response Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>JSON Response Preview</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">application/json</span>
            </div>
            <pre className="bg-[#07090e] border border-dark-border rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-56 scrollbar-none leading-relaxed">
              {jsonString}
            </pre>
          </div>

          {/* Interactive Code Snippets for Students */}
          <div>
            <span className="block text-xs font-semibold text-slate-300 mb-2">
              How to use this in your JavaScript code:
            </span>
            <CodeSnippets url={fullUrl} id={result.id} sampleData={result.data} />
          </div>
        </div>
      </div>
    </div>
  );
}
