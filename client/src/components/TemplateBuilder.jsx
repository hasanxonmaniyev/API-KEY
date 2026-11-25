import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Check, RefreshCw, 
  Layers, ToggleLeft, ToggleRight, Code, Eye, FileText, AlertCircle 
} from 'lucide-react';
import { request } from '../utils/api';

export default function TemplateBuilder({ templates, onTemplatesUpdated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [fields, setFields] = useState([
    { id: '1', key: 'productName', name: 'Product Name', type: 'text', required: true, defaultValue: 'iPhone 17' },
    { id: '2', key: 'price', name: 'Price', type: 'number', required: true, defaultValue: 1200 },
    { id: '3', key: 'color', name: 'Color', type: 'text', required: false, defaultValue: 'Black' },
    { id: '4', key: 'brand', name: 'Brand', type: 'text', required: true, defaultValue: 'Apple' },
    { id: '5', key: 'inStock', name: 'In Stock', type: 'boolean', required: true, defaultValue: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load a template into the editor
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setName(tpl.name);
    setDescription(tpl.description || '');
    setIsPublished(tpl.is_published);
    setFields(Array.isArray(tpl.fields) ? tpl.fields : JSON.parse(tpl.fields || '[]'));
    setStatusMessage(null);
  };

  // Start creating a new blank template
  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    setIsPublished(true);
    setFields([
      { id: Date.now().toString(), key: 'title', name: 'Title', type: 'text', required: true, defaultValue: '' }
    ]);
    setStatusMessage(null);
  };

  // Add field
  const handleAddField = () => {
    const newId = Date.now().toString();
    setFields(prev => [
      ...prev,
      {
        id: newId,
        key: `field_${prev.length + 1}`,
        name: `Field ${prev.length + 1}`,
        type: 'text',
        required: false,
        defaultValue: ''
      }
    ]);
  };

  // Update field
  const handleUpdateField = (index, key, value) => {
    setFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      // Auto-generate key from name if name changed and key was default
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

  // Delete field
  const handleDeleteField = (index) => {
    if (fields.length <= 1) {
      alert('Template must have at least one field');
      return;
    }
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  // Reorder field
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

  // Save template (Create or Update)
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
        setStatusMessage({ type: 'success', text: `Template "${name}" saved successfully!` });
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

  // Delete whole template
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template and all its records?')) return;
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

  // Generate live JSON preview object
  const previewJson = {
    id: 125,
    ...fields.reduce((acc, f) => {
      let val = f.defaultValue;
      if (val === undefined || val === '') {
        if (f.type === 'number') val = 100;
        else if (f.type === 'boolean') val = true;
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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Admin Dynamic Field Builder</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Build custom API structures for lessons. Add unlimited fields, define data types, and publish for students.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewTemplate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Lesson Template</span>
        </button>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Template Selector & Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Existing Templates</span>
              <span className="text-xs text-slate-500 font-mono">{templates.length} total</span>
            </h3>

            <div className="space-y-2">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTemplate?.id === t.id
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                      : 'bg-dark-bg/60 border-dark-border text-slate-300 hover:bg-dark-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{t.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      t.is_published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description || 'No description'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live JSON Preview */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Generated Output Schema</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400">GET /api/data/:id</span>
            </div>
            <pre className="bg-[#07090e] border border-dark-border/80 rounded-xl p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto max-h-64 scrollbar-none">
              {JSON.stringify(previewJson, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right: Field Editor Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-6">
            {statusMessage && (
              <div className={`p-4 rounded-xl text-sm flex items-center space-x-3 ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {statusMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Template Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Car Telemetry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status for Students
                </label>
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isPublished ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span>{isPublished ? 'Published to Students' : 'Hidden (Draft Only)'}</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lesson Objective / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Practicing nested objects and number calculations with Fetch API"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Custom Dynamic Fields List */}
            <div className="pt-4 border-t border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Dynamic Fields</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">
                    {fields.length}
                  </span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddField}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Field</span>
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id || idx}
                    className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                  >
                    {/* Reorder buttons */}
                    <div className="flex items-center space-x-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded hover:bg-dark-hover disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 1)}
                        disabled={idx === fields.length - 1}
                        title="Move Down"
                        className="p-1 rounded hover:bg-dark-hover disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Field Name */}
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">Field Label</label>
                      <input
                        type="text"
                        value={field.name}
                        placeholder="e.g. Brand"
                        onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                        className="w-full bg-dark-card border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    {/* JSON Key */}
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">JSON Key</label>
                      <input
                        type="text"
                        value={field.key}
                        placeholder="e.g. brand"
                        onChange={(e) => handleUpdateField(idx, 'key', e.target.value)}
                        className="w-full bg-dark-card border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-mono"
                      />
                    </div>

                    {/* Type Selector */}
                    <div className="w-full md:w-32">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                        className="w-full bg-dark-card border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                      </select>
                    </div>

                    {/* Required toggle */}
                    <div className="flex items-center space-x-2 pt-4 md:pt-0">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                          className="rounded bg-dark-card border-dark-border text-indigo-600 focus:ring-0"
                        />
                        <span>Req</span>
                      </label>

                      {/* Delete field */}
                      <button
                        type="button"
                        onClick={() => handleDeleteField(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-dark-border flex items-center justify-between">
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Template</span>
                </button>
              )}

              <div className="flex items-center space-x-3 ml-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{selectedTemplate ? 'Update Template' : 'Save Template'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
