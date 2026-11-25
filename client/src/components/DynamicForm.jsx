import React, { useState, useEffect } from 'react';
import { Sparkles, Dices, RefreshCw, Send, AlertCircle, Check, Info } from 'lucide-react';
import { request } from '../utils/api';

const SAMPLE_DATASETS = [
  {
    firstName: 'Hasan',
    lastName: 'Maniyev',
    age: 23,
    carName: 'BMW M5 Competition',
    fianceName: 'Zulayho',
    profession: 'Software Engineer',
    city: 'Tashkent',
    productName: 'MacBook Pro M3 Max',
    price: 3499,
    color: 'Space Black',
    brand: 'Apple',
    inStock: true
  },
  {
    firstName: 'Alisher',
    lastName: 'Navoiy',
    age: 28,
    carName: 'Chevrolet Malibu 2 Turbo',
    fianceName: 'Guli',
    profession: 'Frontend Architect',
    city: 'Samarkand',
    productName: 'Sony WH-1000XM5',
    price: 399,
    color: 'Silver',
    brand: 'Sony',
    inStock: true
  },
  {
    firstName: 'Madina',
    lastName: 'Karimova',
    age: 21,
    carName: 'Mercedes-Benz CLA',
    fianceName: 'Sardor',
    profession: 'UI/UX Designer',
    city: 'Bukhara',
    productName: 'iPad Air M2',
    price: 699,
    color: 'Starlight',
    brand: 'Apple',
    inStock: false
  }
];

export default function DynamicForm({ templates, selectedTemplateId, setSelectedTemplateId, onApiGenerated }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('dynamic'); // 'dynamic' or 'users'

  // Current active template
  const currentTemplate = templates.find(t => t.id === Number(selectedTemplateId)) || templates[0];
  const fields = currentTemplate?.fields || [];

  // Initialize or reset form values when template changes
  useEffect(() => {
    if (fields.length > 0) {
      const initial = {};
      fields.forEach(f => {
        initial[f.key] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'boolean' ? false : '');
      });
      setFormData(initial);
      setError(null);
    }
  }, [selectedTemplateId, templates]);

  const handleInputChange = (key, value, type) => {
    let parsedVal = value;
    if (type === 'number') {
      parsedVal = value === '' ? '' : Number(value);
    } else if (type === 'boolean') {
      parsedVal = Boolean(value);
    }
    setFormData(prev => ({
      ...prev,
      [key]: parsedVal
    }));
  };

  const handleFillRandom = () => {
    const randomSet = SAMPLE_DATASETS[Math.floor(Math.random() * SAMPLE_DATASETS.length)];
    const filled = {};
    fields.forEach(f => {
      if (randomSet[f.key] !== undefined) {
        filled[f.key] = randomSet[f.key];
      } else if (f.type === 'number') {
        filled[f.key] = Math.floor(Math.random() * 100) + 1;
      } else if (f.type === 'boolean') {
        filled[f.key] = Math.random() > 0.5;
      } else {
        filled[f.key] = `Sample ${f.name}`;
      }
    });
    setFormData(filled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // If template is the default Student/User Profile and user chose /api/users mode
      if (mode === 'users' || currentTemplate?.id === 1 && formData.firstName) {
        // We can create both /api/users and /api/data so student can test both!
        const userRes = await request('/api/users', {
          method: 'POST',
          body: JSON.stringify(formData)
        });

        // Also post to dynamic record store
        const dataRes = await request('/api/data', {
          method: 'POST',
          body: JSON.stringify({
            templateId: currentTemplate.id,
            ...formData
          })
        });

        if (userRes.ok || dataRes.ok) {
          const result = userRes.ok ? userRes.data : dataRes.data;
          onApiGenerated({
            id: result.data?.id || result.apiId,
            endpoint: userRes.ok ? `/api/users/${result.data?.id}` : `/api/data/${result.apiId}`,
            data: result.data || result,
            templateName: currentTemplate.name,
            alternateEndpoint: `/api/data/${dataRes.data?.apiId}`
          });
        } else {
          setError(userRes.data?.message || dataRes.data?.message || 'Failed to generate API');
        }
      } else {
        // Dynamic endpoint generation
        const res = await request('/api/data', {
          method: 'POST',
          body: JSON.stringify({
            templateId: currentTemplate.id,
            ...formData
          })
        });

        if (res.ok) {
          onApiGenerated({
            id: res.data.apiId,
            endpoint: res.data.endpoint,
            data: res.data.data,
            templateName: currentTemplate.name
          });
        } else {
          setError(res.data?.message || (res.data?.errors ? res.data.errors.join(', ') : 'Failed to generate API'));
        }
      }
    } catch (err) {
      setError(err.message || 'Network error occurred while generating API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-dark-border bg-gradient-to-r from-dark-card via-slate-900/60 to-dark-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">API Creation Form</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Select an API template and enter your data to generate a real, live REST endpoint.
            </p>
          </div>

          {/* Quick random filler button */}
          <button
            type="button"
            onClick={handleFillRandom}
            className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Dices className="w-4 h-4 text-indigo-400" />
            <span>Fill Sample Data</span>
          </button>
        </div>

        {/* Template Selector */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Select Active Lesson / Template:
            </label>
            <select
              value={selectedTemplateId || (templates[0]?.id || '')}
              onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            >
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} {tpl.is_published ? '' : '(Draft)'} ({tpl.fields?.length || 0} fields)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full p-2.5 rounded-xl bg-dark-bg/80 border border-dark-border text-xs text-slate-400 flex items-center space-x-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">
                {currentTemplate?.description || 'Dynamic JSON structure managed by administrator.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Error</p>
              <p className="text-xs text-rose-200/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fields.map((field) => {
            const val = formData[field.key] !== undefined ? formData[field.key] : '';

            if (field.type === 'boolean') {
              return (
                <div key={field.key} className="bg-dark-bg/70 border border-dark-border rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span>{field.name}</span>
                      {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">{field.key} (boolean)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange(field.key, !val, 'boolean')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      val ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        val ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            }

            return (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                    <span>{field.name}</span>
                    {field.required && <span className="text-rose-400 text-sm">*</span>}
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {field.key} : {field.type}
                  </span>
                </div>
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={val}
                  required={field.required}
                  placeholder={`Enter ${field.name}...`}
                  onChange={(e) => handleInputChange(field.key, e.target.value, field.type)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-5 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Target Endpoint: <code className="text-indigo-300 font-mono font-medium">/api/data/:id</code> or <code className="text-indigo-300 font-mono font-medium">/api/users/:id</code></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating API Endpoint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate API</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
