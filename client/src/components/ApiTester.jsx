import React, { useState } from 'react';
import { Play, Send, RefreshCw, Copy, Check, Clock, Database, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { getApiUrl, getFullApiUrl } from '../utils/api';

export default function ApiTester({ initialUrl = '', initialMethod = 'GET', initialBody = '' }) {
  const [method, setMethod] = useState(initialMethod || 'GET');
  const [url, setUrl] = useState(initialUrl || '/api/data/1');
  const [body, setBody] = useState(initialBody || '{\n  "firstName": "Hasan",\n  "lastName": "Maniyev",\n  "age": 23,\n  "profession": "Developer",\n  "city": "Tashkent"\n}');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResponse(null);

    const startTime = performance.now();
    try {
      const fullEndpoint = getApiUrl(url);

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        try {
          JSON.parse(body);
          options.body = body;
        } catch (jsonErr) {
          setLoading(false);
          setResponse({
            status: 400,
            statusText: 'Bad Request (Client Error)',
            time: 0,
            size: 0,
            data: { error: 'Invalid JSON format in Request Body', details: jsonErr.message }
          });
          return;
        }
      }

      const res = await fetch(fullEndpoint, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const contentType = res.headers.get('content-type');
      let data = null;
      let rawText = '';

      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
        rawText = JSON.stringify(data);
      } else {
        rawText = await res.text();
        data = rawText;
      }

      setResponse({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : res.status === 201 ? 'Created' : 'Response'),
        time: duration,
        size: new Blob([rawText]).size,
        data
      });
    } catch (err) {
      const endTime = performance.now();
      setResponse({
        status: 0,
        statusText: 'Network / Connection Error',
        time: Math.round(endTime - startTime),
        size: 0,
        data: { error: err.message, tip: 'Ensure backend server is running and CORS is enabled.' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (status >= 300 && status < 400) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (status >= 400 && status < 500) return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Interactive REST API Tester</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Execute GET, POST, PUT, DELETE requests in real-time. Inspect headers, payload sizes, and response latencies.
              </p>
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setMethod('GET'); setUrl('/api/data/1'); }}
            className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            GET /api/data/1
          </button>
          <button
            type="button"
            onClick={() => { setMethod('GET'); setUrl('/api/users'); }}
            className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            GET /api/users
          </button>
          <button
            type="button"
            onClick={() => { setMethod('GET'); setUrl('/api/templates'); }}
            className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            GET /api/templates
          </button>
        </div>
      </div>

      {/* Postman-like Request Console */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
        <form onSubmit={handleSend} className="p-6 sm:p-8 space-y-5">
          {/* URL Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-slate-950/80 p-2.5 rounded-2xl border border-white/[0.08] shadow-inner">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-slate-900 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-bold font-mono text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shrink-0 cursor-pointer"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. /api/data/1 or https://..."
              className="w-full bg-transparent px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex items-center justify-center p-0.5 rounded-xl overflow-hidden font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-95 shrink-0 disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <span className="relative px-6 py-2.5 rounded-[10px] bg-[#0c101d] group-hover:bg-opacity-80 flex items-center space-x-2 text-xs text-white">
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Request Body (for POST / PUT) */}
          {['POST', 'PUT'].includes(method) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Request JSON Body</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">application/json</span>
              </div>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter valid JSON payload..."
                className="w-full bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-indigo-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </form>

        {/* Response Panel */}
        {response && (
          <div className="border-t border-white/[0.06] bg-slate-950/60 p-6 sm:p-8 space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-400">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </span>

                <span className="text-xs font-semibold text-slate-400 ml-2">Time:</span>
                <span className="inline-flex items-center space-x-1 text-xs font-mono text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{response.time} ms</span>
                </span>

                <span className="text-xs font-semibold text-slate-400 ml-2">Size:</span>
                <span className="text-xs font-mono text-slate-300">
                  {response.size} B
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyResponse}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Response'}</span>
              </button>
            </div>

            <pre className="bg-[#06080e] border border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
              {typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
