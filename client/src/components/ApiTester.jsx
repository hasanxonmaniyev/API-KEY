import React, { useState } from 'react';
import { Play, Send, RefreshCw, Copy, Check, Clock, Database, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export default function ApiTester({ initialUrl = '', initialMethod = 'GET', initialBody = '' }) {
  const [method, setMethod] = useState(initialMethod || 'GET');
  const [url, setUrl] = useState(initialUrl || '/api/data/1');
  const [body, setBody] = useState(initialBody || '{\n  "firstName": "Hasan",\n  "lastName": "Maniyev",\n  "age": 23,\n  "profession": "Dasturchi",\n  "city": "Tashkent"\n}');
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
            statusText: 'Noto\'g\'ri format (Client Error)',
            time: 0,
            size: 0,
            data: { error: 'Request Body maydonida yaroqsiz JSON formati', details: jsonErr.message }
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
        statusText: res.statusText || (res.status === 200 ? 'OK (Muvaffaqiyatli)' : res.status === 201 ? 'Created (Yaratildi)' : 'Javob'),
        time: duration,
        size: new Blob([rawText]).size,
        data
      });
    } catch (err) {
      const endTime = performance.now();
      setResponse({
        status: 0,
        statusText: 'Tarmoq / Ulanish xatosi',
        time: Math.round(endTime - startTime),
        size: 0,
        data: { error: err.message, tip: 'Server ishga tushirilganligini va manzil to\'g\'riligini tekshiring.' }
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
    if (status >= 200 && status < 300) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status >= 300 && status < 400) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (status >= 400 && status < 500) return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-red-50 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Play className="w-5 h-5 fill-indigo-700" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interaktiv REST API Tester</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            GET, POST, PUT, DELETE so'rovlarini real vaqtda yuborish, status kodlari va JSON javoblarni tahlil qilish.
          </p>
        </div>

        {/* Tezkor namunalar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setMethod('GET'); setUrl('/api/data/1'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            GET /api/data/1
          </button>
          <button
            type="button"
            onClick={() => { setMethod('GET'); setUrl('/api/users'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            GET /api/users
          </button>
          <button
            type="button"
            onClick={() => { setMethod('GET'); setUrl('/api/templates'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            GET /api/templates
          </button>
        </div>
      </div>

      {/* Postman uslubidagi So'rov konsoli */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-bold font-mono text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 cursor-pointer shadow-2xs"
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
              placeholder="Masalan: /api/data/1 yoki https://..."
              className="w-full bg-transparent px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>So'rov yuborish</span>
                </>
              )}
            </button>
          </div>

          {/* POST / PUT uchun Body */}
          {['POST', 'PUT'].includes(method) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>So'rov JSON Tanasi (Request Body)</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">application/json</span>
              </div>
              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="JSON formatidagi ma'lumot..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </form>

        {/* Natija Javob Paneli */}
        {response && (
          <div className="border-t border-slate-200 bg-slate-50/60 p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </span>

                <span className="text-xs font-semibold text-slate-500 ml-2">Vaqt:</span>
                <span className="inline-flex items-center space-x-1 text-xs font-mono text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{response.time} ms</span>
                </span>

                <span className="text-xs font-semibold text-slate-500 ml-2">Hajm:</span>
                <span className="text-xs font-mono text-slate-700">
                  {response.size} B
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyResponse}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Nusxalandi' : 'Javobni nusxalash'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed shadow-inner">
              {typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
