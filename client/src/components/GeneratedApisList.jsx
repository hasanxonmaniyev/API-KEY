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
      console.error('Failed to load generated APIs:', err);
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
    if (!window.confirm(`Delete API endpoint #${id} permanently?`)) return;

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
      alert('Delete failed: ' + err.message);
    }
  };

  const combinedItems = [
    ...records.map(r => {
      const payload = r.payload || {};
      const imgKey = Object.keys(payload).find(k => 
        ['avatar', 'image', 'productimage', 'poster', 'photo', 'carphoto', 'thumbnail'].includes(k.toLowerCase())
      );
      return {
        id: r.id,
        type: 'dynamic',
        templateName: r.templateName || 'Dynamic API',
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
      templateName: 'User Profile API',
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
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Controls */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Generated APIs Directory</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Explore, test, and copy all active REST endpoints stored permanently in PostgreSQL.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 transition-all shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by API ID, student name, product, city..."
              className="w-full bg-slate-950/70 border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-2xl border border-white/[0.08] shrink-0 w-full sm:w-auto">
            {['all', 'dynamic', 'users'].map(mode => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filterType === mode
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'all' ? 'All Endpoints' : mode === 'dynamic' ? 'Dynamic APIs' : 'User APIs'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-medium">Fetching endpoints from PostgreSQL database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-12 text-center text-slate-400 space-y-3">
          <Database className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-200">No Endpoints Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm ? 'No results matched your search query.' : 'Use the Generator form to create your first dynamic API endpoint!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-5 shadow-lg hover:border-indigo-500/40 hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
            >
              {/* Left with optional Image Thumbnail */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {item.imageUrl ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/[0.1] bg-slate-950 shadow-md">
                    <img src={item.imageUrl} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Terminal className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ID #{item.id}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {item.templateName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {item.type === 'user' ? '/api/users/:id' : '/api/data/:id'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <code className="text-xs font-mono text-indigo-300 truncate select-all">
                      {item.fullUrl}
                    </code>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono line-clamp-1 bg-slate-950/60 px-2 py-1 rounded-lg border border-white/[0.05] max-w-xl">
                    {JSON.stringify(item.data)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleCopy(item.fullUrl, `${item.type}-${item.id}`)}
                  className="px-3 py-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  title="Copy URL"
                >
                  {copiedId === `${item.type}-${item.id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTestApi({ url: item.fullUrl, method: 'GET', id: item.id })}
                  className="px-3.5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewResult({
                    id: item.id,
                    endpoint: item.endpoint,
                    data: item.data,
                    templateName: item.templateName
                  })}
                  className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs transition-colors"
                  title="Visual Card Modal"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteRecord(item.id, item.type)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.08] text-xs transition-colors"
                  title="Delete from PostgreSQL"
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
