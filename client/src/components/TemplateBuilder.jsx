import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Check, RefreshCw, 
  Layers, Code, Image as ImageIcon, Sparkles, AlertCircle, Palette 
} from 'lucide-react';
import { request } from '../utils/api';

const FIELD_TYPES = [
  { value: 'text', label: 'Matn (Text)', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'number', label: 'Raqam (Number)', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'boolean', label: 'Mantiqiy (True/False)', color: 'bg-amber-50 text-amber-700' },
  { value: 'image', label: 'Rasm (Photo/URL)', color: 'bg-purple-50 text-purple-700' },
  { value: 'email', label: 'Elektron pochta (Email)', color: 'bg-cyan-50 text-cyan-700' },
  { value: 'date', label: 'Sana (Date)', color: 'bg-blue-50 text-blue-700' },
  { value: 'color', label: 'Rang (Color)', color: 'bg-pink-50 text-pink-700' },
  { value: 'textarea', label: 'Katta matn (Textarea)', color: 'bg-slate-100 text-slate-700' }
];

export default function TemplateBuilder({ templates, onTemplatesUpdated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [fields, setFields] = useState([
    { id: '1', key: 'productImage', name: 'Mahsulot rasmi', type: 'image', required: true, defaultValue: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560' },
    { id: '2', key: 'productName', name: 'Mahsulot nomi', type: 'text', required: true, defaultValue: 'iPhone 17 Pro' },
    { id: '3', key: 'price', name: 'Narxi ($)', type: 'number', required: true, defaultValue: 1200 },
    { id: '4', key: 'brand', name: 'Brendi', type: 'text', required: true, defaultValue: 'Apple' },
    { id: '5', key: 'inStock', name: 'Omborda mavjud', type: 'boolean', required: true, defaultValue: true }
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
      { id: Date.now().toString(), key: 'image', name: 'Rasm', type: 'image', required: false, defaultValue: '' },
      { id: (Date.now() + 1).toString(), key: 'title', name: 'Nomi', type: 'text', required: true, defaultValue: '' }
    ]);
    setStatusMessage(null);
  };

  const handleAddField = (type = 'text') => {
    const newId = Date.now().toString();
    const defaultName = type === 'image' ? 'Rasm' : `Maydon ${fields.length + 1}`;
    const defaultKey = type === 'image' ? 'image' : `field_${fields.length + 1}`;
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
      alert('Shablonda kamida bitta maydon bo\'lishi shart');
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
      setStatusMessage({ type: 'error', text: 'Iltimos, shablon nomini kiriting' });
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
        setStatusMessage({ type: 'success', text: `"${name}" shabloni PostgreSQL bazasiga muvaffaqiyatli saqlandi!` });
        onTemplatesUpdated();
        if (!selectedTemplate) {
          setSelectedTemplate(res.data.data);
        }
      } else {
        setStatusMessage({ type: 'error', text: res.data?.message || 'Shablonni saqlashda xatolik yuz berdi' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Haqiqatan ham bu shablonni va unga bog\'langan o\'quvchilar ma\'lumotlarini o\'chirmoqchimisiz?')) return;
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

  const previewJson = {
    id: 125,
    ...fields.reduce((acc, f) => {
      let val = f.defaultValue;
      if (val === undefined || val === '') {
        if (f.type === 'number') val = 100;
        else if (f.type === 'boolean') val = true;
        else if (f.type === 'image') val = 'https://images.unsplash.com/...';
        else val = `Namunaviy ${f.name}`;
      } else {
        if (f.type === 'number') val = Number(val);
        if (f.type === 'boolean') val = Boolean(val);
      }
      acc[f.key || 'unnamed'] = val;
      return acc;
    }, {})
  };

  return (
    <div className="space-y-6">
      {/* Yuqori Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Dars Shablonlari Konstruktori</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dasturlash darslari uchun istalgan JSON tuzilmasini yarating: Rasmlar, raqamlar, matnlar va mantiqiy maydonlar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewTemplate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Dars Shabloni</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chap qism: Mavjud shablonlar */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Mavjud Shablonlar</span>
              <span className="text-xs text-indigo-700 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                {templates.length} ta
              </span>
            </div>

            <div className="space-y-2">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTemplate?.id === t.id
                      ? 'bg-indigo-50/80 border-indigo-300 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{t.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      t.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.is_published ? 'Chop etilgan' : 'Qoralama'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{t.description || 'Dars amaliyoti'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Jonli JSON Sxemasi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-600" />
                <span>Jonli JSON Sxemasi (Natija)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">GET /api/data/:id</span>
            </div>
            <pre className="bg-slate-900 text-emerald-400 rounded-xl p-3.5 text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
              {JSON.stringify(previewJson, null, 2)}
            </pre>
          </div>
        </div>

        {/* O'ng qism: Maydonlarni tahrirlash */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            {statusMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Shablon nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Avtosalon katalogi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Talabalar uchun ko'rinishi</label>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                    isPublished ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  <span>{isPublished ? 'Chop etilgan (Talabalar ko\'ra oladi)' : 'Yashirin (Qoralama)'}</span>
                  <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">Dars maqsadi / Tavsifi</label>
                <input
                  type="text"
                  placeholder="Masalan: Fetch API orqali rasmlar va narxlarni chiqarish amaliyoti"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Maydonlar ro'yxati */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Maydonlar ro'yxati ({fields.length} ta)
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddField('image')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>+ Rasm maydoni</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('text')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    <span>+ Matn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField('number')}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <span>+ Raqam</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {fields.map((field, idx) => (
                  <div
                    key={field.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                        title="Yuqoriga surish"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 1)}
                        disabled={idx === fields.length - 1}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                        title="Pastga surish"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Nomi (Label)</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                      />
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">JSON Kaliti (Key)</label>
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => handleUpdateField(idx, 'key', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-indigo-700 font-mono"
                      />
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Maydon turi</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                      >
                        {FIELD_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-3 pt-2 sm:pt-4">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Majburiy</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleDeleteField(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Shablonni o'chirish
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="ml-auto inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-95 transition-all"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{selectedTemplate ? 'O\'zgarishlarni saqlash' : 'Shablonni yaratish'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
