import React, { useState, useEffect } from 'react';
import { 
  Search, Terminal, Copy, Check, Play, Trash2, 
  ExternalLink, Layers, RefreshCw, Eye, Database, Image as ImageIcon 
} from 'lucide-react';
import { request, getFullApiUrl } from '../utils/api';

export default function GeneratedApisList({ onTestApi, onViewResult }) {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, userRes] = await Promise.all([
        request('/api/data'),
        request('/api/users')
      ]);

      if (recRes.ok) setRecords(recRes.data.data || []);
      if (userRes.ok) setUsers(userRes.data.data || []);
    } catch (err) {
      console.error('API ro\'yxatini yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteRecord = async (id, type) => {
    if (!window.confirm(`Haqiqatan ham #${id} raqamli API endpointni o'chirmoqchimisiz?`)) return;

    try {
      const endpoint = type === 'user' ? `/api/users/${id}` : `/api/data/${id}`;
      const res = await request(endpoint, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'user') {
          setUsers(prev => prev.filter(u => u.id !== id));
        } else {
          setRecords(prev => prev.filter(r => r.id !== id));
        }
      }
    } catch (err) {
      alert('O\'chirishda xatolik: ' + err.message);
    }
  };

  const combinedItems = [
    ...records.map(r => {
      const payload = r.payload || {};
      const imgKey = Object.keys(payload).find(k => 
        ['avatar', 'image', 'productimage', 'poster', 'photo', 'carphoto', 'carimage', 'thumbnail'].includes(k.toLowerCase())
      );
      return {
        id: r.id,
        type: 'dynamic',
        templateName: r.templateName || 'Dinamik API',
        endpoint: `/api/data/${r.id}`,
        fullUrl: getFullApiUrl(`/api/data/${r.id}`),
        data: payload,
        imageUrl: imgKey ? payload[imgKey] : null,
        createdAt: r.createdAt
      };
    }),
    ...users.map(u => ({
      id: u.id,
      type: 'user',
      templateName: 'O\'quvchi profili',
      endpoint: `/api/users/${u.id}`,
      fullUrl: getFullApiUrl(`/api/users/${u.id}`),
      data: u,
      imageUrl: u.avatar || null,
      createdAt: u.createdAt
    }))
  ].sort((a, b) => b.id - a.id);

  const filtered = combinedItems.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const idMatch = String(item.id).includes(term);
    const textMatch = JSON.stringify(item.data).toLowerCase().includes(term);
    const templateMatch = (item.templateName || '').toLowerCase().includes(term);

    return idMatch || textMatch || templateMatch;
  });

  return (
    <div className="space-y-6">
      {/* Qidiruv va Filter paneli */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                <Terminal className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Yaratilgan API Endpointlar Ro'yxati</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Barcha o'quvchilar tomonidan generatsiya qilingan REST endpointlar (PostgreSQL bazasida saqlangan).
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Ro'yxatni yangilash</span>
          </button>
        </div>

        {/* Qidiruv inputi va filterlar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ID, o'quvchi ismi, mashina, shahar bo'yicha qidirish..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
            {['all', 'dynamic', 'users'].map(mode => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterType === mode
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'all' ? 'Barchasi' : mode === 'dynamic' ? 'Dinamik API\'lar' : 'O\'quvchi profillari'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ro'yxat elementlari */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-medium">Baza ma'lumotlari o'qilmoqda...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Database className="w-9 h-9 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">Hech qanday API topilmadi</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm ? 'Qidiruv so\'rovingiz bo\'yicha hech qanday natija chiqmadi.' : 'Hali hech qanday API generatsiya qilinmagan. "API Yaratish" bo\'limiga o\'tib yarating!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filtered.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Chap qism: Miniatyura va Tafsilotlar */}
              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                {item.imageUrl ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                    <img src={item.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <Terminal className="w-5 h-5 text-indigo-600" />
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ID #{item.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.templateName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {item.type === 'user' ? '/api/users/:id' : '/api/data/:id'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <code className="text-xs font-mono text-indigo-600 truncate select-all">
                      {item.fullUrl}
                    </code>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono line-clamp-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80 max-w-xl">
                    {JSON.stringify(item.data)}
                  </div>
                </div>
              </div>

              {/* O'ng qism: Amallar tugmalari */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleCopy(item.fullUrl, `${item.type}-${item.id}`)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center space-x-1 transition-all"
                  title="URL nusxalash"
                >
                  {copiedId === `${item.type}-${item.id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Nusxalash</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTestApi({ url: item.fullUrl, method: 'GET', id: item.id })}
                  className="px-3 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-bold flex items-center space-x-1 shadow-2xs transition-all active:scale-95"
                  title="Testerda sinash"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Sinash</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewResult({
                    id: item.id,
                    endpoint: item.endpoint,
                    data: item.data,
                    templateName: item.templateName
                  })}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
                  title="Kartochka ko'rinishi"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteRecord(item.id, item.type)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 text-xs transition-colors"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
