import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Dices, RefreshCw, Send, AlertCircle, Check, Info, 
  Upload, Image as ImageIcon, X, Link as LinkIcon, Palette, Calendar, Hash, Tag, Type 
} from 'lucide-react';
import { request, uploadImage, getFullApiUrl } from '../utils/api';

const STOCK_IMAGES = [
  { name: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
  { name: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { name: 'iPhone 17', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80' },
  { name: 'MacBook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { name: 'BMW Sports', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Movie Poster', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' }
];

const SAMPLE_DATASETS = [
  {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    firstName: 'Hasan',
    lastName: 'Maniyev',
    age: 23,
    profession: 'Senior Full-Stack Engineer',
    email: 'hasan.maniyev@dev.io',
    city: 'Tashkent',
    carName: 'BMW M5 Competition',
    fianceName: 'Zulayho',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80',
    productName: 'iPhone 17 Pro Max',
    price: 1299,
    brand: 'Apple',
    color: '#6366f1',
    inStock: true,
    description: 'Next-generation flagship smartphone with aerospace titanium alloy casing and A19 Pro chip.',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    title: 'Interstellar',
    director: 'Christopher Nolan',
    year: 2014,
    rating: 8.7,
    isAvailable: true
  },
  {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    firstName: 'Alisher',
    lastName: 'Navoiy',
    age: 28,
    profession: 'Frontend Architect & Mentor',
    email: 'alisher@moderncode.uz',
    city: 'Samarkand',
    carName: 'Chevrolet Malibu 2 Turbo',
    fianceName: 'Guli',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    productName: 'MacBook Pro 16" M3 Max',
    price: 3499,
    brand: 'Apple',
    color: '#0f172a',
    inStock: true,
    description: 'Ultra-fast laptop designed for computational intelligence, code compilation and 3D rendering.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    title: 'Inception',
    director: 'Christopher Nolan',
    year: 2010,
    rating: 8.8,
    isAvailable: true
  }
];

export default function DynamicForm({ templates, selectedTemplateId, setSelectedTemplateId, onApiGenerated }) {
  const [formData, setFormData] = useState({});
  const [uploadingField, setUploadingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRefs = useRef({});

  const currentTemplate = templates.find(t => t.id === Number(selectedTemplateId)) || templates[0];
  const fields = currentTemplate?.fields || [];

  // Reset or initialize values when template changes
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

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    setUploadingField(key);
    try {
      const uploadRes = await uploadImage(file);
      const url = uploadRes.fullUrl || uploadRes.url;
      handleInputChange(key, url, 'image');
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingField(null);
    }
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
      } else if (f.type === 'image') {
        filled[f.key] = STOCK_IMAGES[Math.floor(Math.random() * STOCK_IMAGES.length)].url;
      } else if (f.type === 'color') {
        filled[f.key] = '#6366f1';
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
      // Create both /api/users (if applicable) and /api/data for maximum flexibility
      if (currentTemplate?.id === 1 && formData.firstName && formData.lastName) {
        try {
          await request('/api/users', {
            method: 'POST',
            body: JSON.stringify(formData)
          });
        } catch (_) {}
      }

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
    } catch (err) {
      setError(err.message || 'Network error occurred while generating API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 p-6 sm:p-8 border-b border-white/[0.06] bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Universal API Generator
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select a template, customize fields with photos, and generate your live endpoint.
                </p>
              </div>
            </div>
          </div>

          {/* Quick random filler button */}
          <button
            type="button"
            onClick={handleFillRandom}
            className="group relative inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 hover:text-white backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Dices className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
            <span>Fill Sample Data & Images</span>
          </button>
        </div>

        {/* Template Selector with Pills */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {templates.map(tpl => {
            const isSelected = Number(selectedTemplateId) === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20 scale-[1.02]'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
              >
                <span>{tpl.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tpl.fields?.length || 0} fields
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Form Content */}
      <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Validation Issue</p>
              <p className="text-xs text-rose-200/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fields.map((field) => {
            const val = formData[field.key] !== undefined ? formData[field.key] : '';

            // 1. IMAGE FIELD (Upload or URL with visual preview)
            if (field.type === 'image') {
              const isUploading = uploadingField === field.key;
              return (
                <div key={field.key} className="md:col-span-2 lg:col-span-3 rounded-2xl bg-white/[0.02] border border-white/[0.07] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>{field.name}</span>
                      {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      image
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Visual Thumbnail */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.1] shrink-0 flex items-center justify-center group shadow-md">
                      {val ? (
                        <>
                          <img src={val} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleInputChange(field.key, '', 'image')}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                            title="Remove photo"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2 text-slate-600">
                          <ImageIcon className="w-7 h-7 mx-auto mb-1 text-slate-600" />
                          <span className="text-[10px]">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Input & Upload Controls */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={val}
                            placeholder="Paste image URL (https://...)"
                            onChange={(e) => handleInputChange(field.key, e.target.value, 'image')}
                            className="w-full bg-slate-950/70 border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-indigo-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                          />
                        </div>

                        {/* Direct File Upload button */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={el => fileInputRefs.current[field.key] = el}
                          className="hidden"
                          onChange={(e) => handleFileUpload(field.key, e.target.files[0])}
                        />
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRefs.current[field.key]?.click()}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 transition-all shrink-0 active:scale-95"
                        >
                          {isUploading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                        </button>
                      </div>

                      {/* Stock Preset Picker */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 mr-1">Presets:</span>
                        {STOCK_IMAGES.map((img) => (
                          <button
                            key={img.name}
                            type="button"
                            onClick={() => handleInputChange(field.key, img.url, 'image')}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/[0.05] transition-colors"
                          >
                            {img.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // 2. BOOLEAN TOGGLE
            if (field.type === 'boolean') {
              return (
                <div key={field.key} className="bg-slate-950/40 border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span>{field.name}</span>
                      {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">{field.key} (true / false)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange(field.key, !val, 'boolean')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      val ? 'bg-indigo-600 shadow-md shadow-indigo-600/30' : 'bg-slate-800'
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

            // 3. COLOR PICKER
            if (field.type === 'color') {
              return (
                <div key={field.key} className="bg-slate-950/40 border border-white/[0.06] rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Palette className="w-3.5 h-3.5 text-pink-400" />
                      <span>{field.name}</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">{val || '#000000'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={val || '#6366f1'}
                      onChange={(e) => handleInputChange(field.key, e.target.value, 'color')}
                      className="w-10 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleInputChange(field.key, e.target.value, 'color')}
                      placeholder="#6366f1"
                      className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              );
            }

            // 4. TEXTAREA
            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="md:col-span-2 lg:col-span-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      {field.name} {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">{field.key} : textarea</span>
                  </div>
                  <textarea
                    rows={3}
                    value={val}
                    required={field.required}
                    placeholder={`Enter ${field.name}...`}
                    onChange={(e) => handleInputChange(field.key, e.target.value, 'textarea')}
                    className="w-full bg-slate-950/60 border border-white/[0.08] rounded-2xl p-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              );
            }

            // 5. STANDARD INPUTS (text, number, email, date)
            return (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                    <span>{field.name}</span>
                    {field.required && <span className="text-rose-400">*</span>}
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {field.key} : {field.type}
                  </span>
                </div>
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                  value={val}
                  required={field.required}
                  placeholder={`Enter ${field.name}...`}
                  onChange={(e) => handleInputChange(field.key, e.target.value, field.type)}
                  className="w-full bg-slate-950/60 border border-white/[0.08] rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            );
          })}
        </div>

        {/* Elegant Action Button */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Generates dynamic JSON endpoint ready for Fetch API</span>
          </div>

          {/* Premium Glowing Gradient Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex items-center justify-center p-0.5 rounded-2xl overflow-hidden font-bold transition-all duration-300 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:opacity-100 opacity-90 transition-opacity" />
            <span className="relative px-8 py-3.5 rounded-[14px] bg-[#0c101d] transition-colors group-hover:bg-opacity-80 flex items-center space-x-3 text-sm text-white font-extrabold tracking-wide">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Generating Dynamic API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Generate API Endpoint</span>
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
