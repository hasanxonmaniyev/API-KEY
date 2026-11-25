import React, { useState, useEffect } from 'react';
import { 
  Search, Terminal, Copy, Check, Play, Trash2, 
  ExternalLink, Layers, RefreshCw, Eye, Database 
} from 'lucide-react';
import { request, getFullApiUrl } from '../utils/api';

export default function GeneratedApisList({ onTestApi, onViewResult }) {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'dynamic', 'users'
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

  // Combine items into unified list
  const combinedItems = [
    ...records.map(r => ({
      id: r.id,
      type: 'dynamic',
      templateName: r.templateName || 'Dynamic JSON',
      endpoint: `/api/data/${r.id}`,
      fullUrl: getFullApiUrl(`/api/data/${r.id}`),
      data: r.payload,
      createdAt: r.createdAt
    })),
    ...users.map(u => ({
      id: u.id,
      type: 'user',
      templateName: 'User Profile API',
      endpoint: `/api/users/${u.id}`,
      fullUrl: getFullApiUrl(`/api/users/${u.id}`),
      data: u,
      createdAt: u.createdAt
    }))
  ].sort((a, b) => b.id - a.id);

  // Filter items
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
      {/* Header & Controls */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Terminal className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Generated APIs Directory</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Browse, test, copy, or manage all generated live REST endpoints stored in PostgreSQL.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by API ID, student name, car, city, brand..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-1 bg-dark-bg p-1 rounded-xl border border-dark-border shrink-0 w-full sm:w-auto">
            {['all', 'dynamic', 'users'].map(mode => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filterType === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'all' ? 'All Endpoints' : mode === 'dynamic' ? 'Dynamic APIs' : 'User APIs'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="text-sm font-medium">Fetching generated endpoints from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Database className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-200">No APIs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm ? 'No results matched your search term.' : 'No APIs have been generated yet. Use the API Generator form to create your first endpoint!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg hover:border-indigo-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ID #{item.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
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

                {/* Data Snippet Preview */}
                <div className="text-xs text-slate-400 font-mono line-clamp-1 bg-[#06080d] p-1.5 rounded-lg border border-dark-border/60 max-w-2xl">
                  {JSON.stringify(item.data)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(item.fullUrl, `${item.type}-${item.id}`)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white bg-dark-bg hover:bg-dark-hover border border-dark-border text-xs flex items-center space-x-1.5 transition-colors"
                  title="Copy Full URL"
                >
                  {copiedId === `${item.type}-${item.id}` ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTestApi({ url: item.fullUrl, method: 'GET', id: item.id })}
                  className="p-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all"
                  title="Test in Interactive Tester"
                >
                  <Play className="w-4 h-4 fill-white" />
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
                  className="p-2 rounded-xl text-slate-300 hover:text-white bg-dark-bg hover:bg-dark-hover border border-dark-border text-xs transition-colors"
                  title="View JSON Modal"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteRecord(item.id, item.type)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-dark-border text-xs transition-colors"
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
