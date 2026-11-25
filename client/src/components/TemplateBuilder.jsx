import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Check, RefreshCw, 
  Layers, Code, Image as ImageIcon, Sparkles, AlertCircle, Palette 
} from 'lucide-react';
import { request } from '../utils/api';

const FIELD_TYPES = [
  { value: 'text', label: 'Text (Single line)', color: 'text-indigo-400 bg-indigo-500/10' },
  { value: 'number', label: 'Number', color: 'text-emerald-400 bg-emerald-500/10' },
  { value: 'boolean', label: 'Boolean (True/False)', color: 'text-amber-400 bg-amber-500/10' },
  { value: 'image', label: 'Image (Photo/URL)', color: 'text-purple-400 bg-purple-500/10' },
  { value: 'email', label: 'Email', color: 'text-cyan-400 bg-cyan-500/10' },
  { value: 'date', label: 'Date', color: 'text-blue-400 bg-blue-500/10' },
  { value: 'color', label: 'Color (Hex)', color: 'text-pink-400 bg-pink-500/10' },
  { value: 'textarea', label: 'Textarea (Paragraph)', color: 'text-slate-300 bg-slate-500/10' },
  { value: 'tags', label: 'Tags (Array)', color: 'text-rose-400 bg-rose-500/10' }
];

export default function TemplateBuilder({ templates, onTemplatesUpdated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [fields, setFields] = useState([
    { id: '1', key: 'productImage', name: 'Product Image', type: 'image', required: true, defaultValue: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80' },
    { id: '2', key: 'productName', name: 'Product Name', type: 'text', required: true, defaultValue: 'iPhone 17 Pro' },
    { id: '3', key: 'price', name: 'Price', type: 'number', required: true, defaultValue: 1200 },
    { id: '4', key: 'color', name: 'Color Accent', type: 'color', required: false, defaultValue: '#4f46e5' },
    { id: '5', key: 'inStock', name: 'In Stock', type: 'boolean', required: true, defaultValue: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setName(tpl.name);
    setDescription(tpl.description || '');
    setIsPublished(tpl.is_published);
    setFields(Array.isArray(tpl.fields) ? tpl.fields : JSON.parse(tpl.fields || '[]'));
    setStatusMessage(null);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    setIsPublished(true);
    setFields([
      { id: Date.now().toString(), key: 'image', name: 'Photo', type: 'image', required: false, defaultValue: '' },
      { id: (Date.now() + 1).toString(), key: 'title', name: 'Title', type: 'text', required: true, defaultValue: '' }
    ]);
    setStatusMessage(null);
  };

  const handleAddField = (type = 'text') => {
    const newId = Date.now().toString();
    const defaultName = type === 'image' ? 'Photo' : `Field ${fields.length + 1}`;
    const defaultKey = type === 'image' ? 'photo' : `field_${fields.length + 1}`;
    setFields(prev => [
      ...prev,
      {
        id: newId,
        key: defaultKey,
        name: defaultName,
        type: type,
        required: false,
        defaultValue: ''
      }
    ]);
  };

  const handleUpdateField = (index, key, value) => {
    setFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      if (key === 'name' && (!updated[index].key || updated[index].key.startsWith('field_'))) {
        updated[index].key = value
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .split(' ')
          .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join('');
      }
      return updated;
    });
  };

  const handleDeleteField = (index) => {
    if (fields.length <= 1) {
      alert('Template must have at least one field');
      return;
    }
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveField = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    setFields(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a template name' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const payload = {
        name,
        description,
        is_published: isPublished,
        fields
      };

      let res;
      if (selectedTemplate?.id) {
        res = await request(`/api/templates/${selectedTemplate.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await request('/api/templates', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Template "${name}" saved in PostgreSQL!` });
        onTemplatesUpdated();
        if (!selectedTemplate) {
          setSelectedTemplate(res.data.data);
        }
      } else {
        setStatusMessage({ type: 'error', text: res.data?.message || 'Failed to save template' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Delete this template and all associated student records?')) return;
    try {
      const res = await request(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        handleNewTemplate();
        onTemplatesUpdated();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Preview object
  const previewJson = {
    id: 125,
    ...fields.reduce((acc, f) => {
      let val = f.defaultValue;
      if (val === undefined || val === '') {
        if (f.type === 'number') val = 100;
        else if (f.type === 'boolean') val = true;
        else if (f.type === 'image') val = 'https://images.unsplash.com/...';
        else if (f.type === 'color') val = '#6366f1';
        else val = `Sample ${f.name}`;
      } else {
        if (f.type === 'number') val = Number(val);
        if (f.type === 'boolean') val = Boolean(val);
      }
      acc[f.key || 'unnamed'] = val;
      return acc;
    }, {})
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Banner */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Admin Dynamic Field Builder</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Design custom universal API schemas: photos, numbers, booleans, colors, and text.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewTemplate}
          className="group relative inline-flex items-center justify-center p-0.5 rounded-2xl overflow-hidden font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <span className="relative px-5 py-2.5 rounded-[14px] bg-[#0d1222] group-hover:bg-opacity-80 flex items-center space-x-2 text-xs text-white">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Create New Template</span>
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Templates Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Saved Templates</span>
              <span className="font-mono text-indigo-400">{templates.length} total</span>
            </h3>

            <div className="space-y-2">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTemplate?.id === t.id
                      ? 'bg-indigo-600/15 border-indigo-500/80 text-white shadow-md'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{t.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      t.is_published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{t.description || 'Custom lesson API'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Real-Time Schema Preview</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400">JSON</span>
            </div>
            <pre className="bg-[#06080e] border border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-64 leading-relaxed">
              {JSON.stringify(previewJson, null, 2)}
            </pre>
          </div>
        </div>

        {/* Form Canvas */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-6">
            {statusMessage && (
              <div className={`p-4 rounded-2xl text-xs font-medium flex items-center space-x-2 ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cinema Movies & Posters"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/[0.08] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Visibility</label>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                    isPublished ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-white/[0.08] text-slate-400'
                  }`}
                >
                  <span>{isPublished ? 'Published to Students' : 'Draft / Hidden'}</span>
                  <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Description / Lesson Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Practicing image rendering and Fetch API in JavaScript"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/[0.08] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Fields List */}
            <div className="pt-4 border-t border-white/[0.06] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Universal Fields ({fields.length})
                </h4>

                {/* Quick Add Pills */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddField('image')}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-all"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>+ Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('text')}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all"
                  >
                    <span>+ Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('number')}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all"
                  >
                    <span>+ Number</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id || idx}
                    className="p-4 rounded-2xl bg-slate-950/40 border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-1 text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-white/[0.06] disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 1)}
                        disabled={idx === fields.length - 1}
                        className="p-1 rounded-lg hover:bg-white/[0.06] disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Label</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Key</label>
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => handleUpdateField(idx, 'key', e.target.value)}
                        className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-mono"
                      />
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                        className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        {FIELD_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-3 pt-2 sm:pt-4">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                          className="rounded bg-slate-800 border-white/[0.1] text-indigo-600 focus:ring-0"
                        />
                        <span>Req</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleDeleteField(idx)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Delete Template
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative ml-auto inline-flex items-center justify-center p-0.5 rounded-2xl overflow-hidden font-bold transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <span className="relative px-6 py-2.5 rounded-[14px] bg-[#0c101d] group-hover:bg-opacity-80 flex items-center space-x-2 text-xs text-white">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{selectedTemplate ? 'Update in Database' : 'Save Template'}</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
