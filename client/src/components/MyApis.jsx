import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus, Copy, Check, ExternalLink, Play, Trash2, Save, FileJson, ListPlus,
  Pencil, X, Wand2, AlertCircle, Braces, Link2, RefreshCw
} from 'lucide-react';
import { request, getFullApiUrl } from '../utils/api';

const RESERVED = ['users', 'templates', 'data', 'stats', 'collections', 'upload', 'uploads', 'health', 'resources'];

const SAMPLE = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: { lat: '-37.3159', lng: '81.1496' }
    },
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets'
    }
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    address: {
      street: 'Victor Plains',
      suite: 'Suite 879',
      city: 'Wisokyburgh',
      zipcode: '90566-7771',
      geo: { lat: '-43.9509', lng: '-34.4618' }
    },
    phone: '010-692-6593 x09125',
    website: 'anastasia.net',
    company: {
      name: 'Deckow-Crist',
      catchPhrase: 'Proactive didactic contingency',
      bs: 'synergize scalable supply-chains'
    }
  }
];

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/['`ʻʼ‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Barcha elementlardan umumiy tuzilma (forma maydonlari) yig'iladi
function mergeShape(shape, value) {
  if (isObj(value)) {
    const base = isObj(shape) ? { ...shape } : {};
    for (const [k, v] of Object.entries(value)) base[k] = mergeShape(base[k], v);
    return base;
  }
  if (isObj(shape)) return shape;
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return shape && shape !== 'number' ? shape : 'number';
  if (typeof value === 'boolean') return shape && shape !== 'boolean' ? shape : 'boolean';
  return 'string';
}

function buildShape(items) {
  return items.reduce((s, it) => mergeShape(s, it), {});
}

function emptyFromShape(shape) {
  if (isObj(shape)) {
    return Object.fromEntries(Object.entries(shape).map(([k, s]) => [k, emptyFromShape(s)]));
  }
  if (shape === 'boolean') return false;
  if (shape === 'array') return [];
  return '';
}

function fillFromShape(shape, value) {
  if (isObj(shape)) {
    const src = isObj(value) ? value : {};
    const out = { ...src };
    for (const [k, s] of Object.entries(shape)) out[k] = fillFromShape(s, src[k]);
    return out;
  }
  return value === undefined ? emptyFromShape(shape) : value;
}

// Asl elementda bo'lmagan va bo'sh qoldirilgan maydonlarni olib tashlaydi
function prune(value, original) {
  if (!isObj(value)) return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    const orig = isObj(original) ? original[k] : undefined;
    if (isObj(v)) {
      const inner = prune(v, orig);
      if (Object.keys(inner).length > 0 || orig !== undefined) out[k] = inner;
    } else if (!(v === '' && orig === undefined)) {
      out[k] = v;
    }
  }
  return out;
}

function parseJsonList(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { error: `JSON xato: ${err.message}` };
  }
  if (isObj(parsed)) parsed = [parsed];
  if (!Array.isArray(parsed)) return { error: "Ma'lumot massiv bo'lishi kerak: [ { ... }, { ... } ]" };
  if (parsed.some(it => !isObj(it))) return { error: "Massivdagi har bir element obyekt bo'lishi kerak: { ... }" };
  return { items: parsed };
}

function CopyButton({ text, label = 'Nusxalash' }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Nusxalandi' : label}</span>
    </button>
  );
}

function ArrayField({ value, onChange }) {
  const [text, setText] = useState(JSON.stringify(value ?? []));
  const [bad, setBad] = useState(false);
  const serialized = JSON.stringify(value ?? []);
  useEffect(() => {
    // Foydalanuvchi yozayotgan matn shu qiymatga teng bo'lsa, uni qayta formatlamaymiz
    try { if (JSON.stringify(JSON.parse(text)) === serialized) return; } catch { /* yangilaymiz */ }
    setText(serialized);
    setBad(false);
  }, [serialized]);
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        try {
          const v = JSON.parse(e.target.value);
          if (!Array.isArray(v)) throw new Error();
          setBad(false);
          onChange(v);
        } catch {
          setBad(true);
        }
      }}
      className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${bad ? 'border-rose-400' : 'border-slate-300'}`}
      placeholder='["a", "b"]'
    />
  );
}

function FieldEditor({ shape, value, onChange, depth = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(shape).map(([key, s]) => {
        if (key === 'id' && depth === 0) return null;
        const v = value?.[key];
        const set = (nv) => onChange({ ...value, [key]: nv });

        if (isObj(s)) {
          return (
            <fieldset key={key} className="sm:col-span-2 border border-slate-200 rounded-xl p-3 bg-slate-50/60">
              <legend className="px-1.5 text-[11px] font-bold text-indigo-700 font-mono">{key}</legend>
              <FieldEditor shape={s} value={isObj(v) ? v : {}} onChange={set} depth={depth + 1} />
            </fieldset>
          );
        }

        return (
          <label key={key} className="block">
            <span className="block text-[11px] font-bold text-slate-600 font-mono mb-1">{key}</span>
            {s === 'boolean' ? (
              <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            ) : s === 'array' ? (
              <ArrayField value={v} onChange={set} />
            ) : (
              <input
                type={s === 'number' ? 'number' : 'text'}
                step="any"
                value={v ?? ''}
                onChange={(e) => set(s === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

function previewText(item) {
  const parts = Object.entries(item)
    .filter(([k, v]) => k !== 'id' && (typeof v === 'string' || typeof v === 'number'))
    .slice(0, 3)
    .map(([, v]) => String(v));
  return parts.join(' · ') || '{ ... }';
}

export default function MyApis({ onTestApi }) {
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState(null); // { slug, title, items, endpoint, count }
  const [creating, setCreating] = useState(false);

  // Yaratish formasi
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [newJson, setNewJson] = useState('[]');

  // Tanlangan API muharriri
  const [view, setView] = useState('form'); // 'form' | 'json'
  const [jsonText, setJsonText] = useState('');
  const [editingId, setEditingId] = useState(null); // null = yangi element
  const [formValue, setFormValue] = useState({});

  const [message, setMessage] = useState(null); // { type: 'error' | 'ok', text }
  const [busy, setBusy] = useState(false);

  const flash = (type, text) => {
    setMessage({ type, text });
    if (type === 'ok') setTimeout(() => setMessage(null), 2500);
  };

  const loadList = async () => {
    setLoadingList(true);
    try {
      const res = await request('/api/resources');
      if (res.ok) setList(res.data.data || []);
      return res.ok ? res.data.data || [] : [];
    } finally {
      setLoadingList(false);
    }
  };

  const openResource = async (slug) => {
    const res = await request(`/api/resources/${slug}`);
    if (!res.ok) return flash('error', res.data?.message || 'API topilmadi');
    setCreating(false);
    setSelected(res.data.data);
    setJsonText(JSON.stringify(res.data.data.items, null, 2));
    setEditingId(null);
    setMessage(null);
  };

  useEffect(() => {
    loadList().then((rows) => {
      if (rows.length > 0) openResource(rows[0].slug);
      else setCreating(true);
    });
  }, []);

  const shape = useMemo(() => buildShape(selected?.items || []), [selected]);
  const hasShape = Object.keys(shape).some(k => k !== 'id');

  useEffect(() => {
    if (!selected) return;
    if (editingId === null) {
      setFormValue(emptyFromShape(shape));
    } else {
      const item = selected.items.find(it => String(it.id) === String(editingId));
      setFormValue(fillFromShape(shape, item || {}));
    }
  }, [selected, editingId, shape]);

  const slugValue = slugTouched ? newSlug : slugify(newTitle);
  const finalSlug = slugify(slugValue);
  const slugReserved = RESERVED.includes(finalSlug);
  const newParsed = useMemo(() => parseJsonList(newJson), [newJson]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newParsed.error) return flash('error', newParsed.error);
    setBusy(true);
    try {
      const res = await request('/api/resources', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, slug: finalSlug, items: newParsed.items })
      });
      if (!res.ok) return flash('error', res.data?.message || 'Yaratib bo\'lmadi');
      setNewTitle(''); setNewSlug(''); setSlugTouched(false); setNewJson('[]');
      await loadList();
      await openResource(res.data.data.slug);
      flash('ok', 'API yaratildi!');
    } finally {
      setBusy(false);
    }
  };

  const reloadSelected = async () => {
    await openResource(selected.slug);
    loadList();
  };

  const handleSaveJson = async () => {
    const parsed = parseJsonList(jsonText);
    if (parsed.error) return flash('error', parsed.error);
    setBusy(true);
    try {
      const res = await request(`/api/resources/${selected.slug}`, {
        method: 'PUT',
        body: JSON.stringify({ items: parsed.items })
      });
      if (!res.ok) return flash('error', res.data?.message || 'Saqlab bo\'lmadi');
      await reloadSelected();
      flash('ok', 'Saqlandi');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const original = editingId === null ? {} : selected.items.find(it => String(it.id) === String(editingId));
    const { id: _ignored, ...body } = prune(formValue, original);
    setBusy(true);
    try {
      const res = editingId === null
        ? await request(`/api/${selected.slug}`, { method: 'POST', body: JSON.stringify(body) })
        : await request(`/api/${selected.slug}/${encodeURIComponent(editingId)}`, { method: 'PUT', body: JSON.stringify(body) });
      if (!res.ok) return flash('error', res.data?.message || 'Saqlab bo\'lmadi');
      setEditingId(null);
      await reloadSelected();
      flash('ok', editingId === null ? `Qo'shildi (id: ${res.data.id})` : 'Yangilandi');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm(`id = ${id} elementni o'chirasizmi?`)) return;
    const res = await request(`/api/${selected.slug}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) return flash('error', 'O\'chirib bo\'lmadi');
    if (String(editingId) === String(id)) setEditingId(null);
    await reloadSelected();
  };

  const handleDeleteApi = async () => {
    if (!window.confirm(`/api/${selected.slug} API'sini butunlay o'chirasizmi?`)) return;
    const res = await request(`/api/resources/${selected.slug}`, { method: 'DELETE' });
    if (!res.ok) return flash('error', 'O\'chirib bo\'lmadi');
    setSelected(null);
    const rows = await loadList();
    if (rows.length > 0) openResource(rows[0].slug);
    else setCreating(true);
  };

  const fullUrl = selected ? getFullApiUrl(`/api/${selected.slug}`) : '';
  const firstId = selected?.items?.[0]?.id ?? 1;

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700"><Braces className="w-5 h-5" /></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">O'z ma'lumotlaringizdan API yarating</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            JSON'ni joylab qo'ying yoki forma orqali kiriting. Sayt sizga link beradi va bu link ma'lumotlaringizni
            aynan siz kiritgandek, toza massiv ko'rinishida qaytaradi: <code className="font-mono text-indigo-700">[ {'{'} id: 1, ... {'}'} ]</code>
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setSelected(null); setMessage(null); }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi API</span>
        </button>
      </div>

      {message && (
        <div className={`flex items-start space-x-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
          message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chap: API'lar ro'yxati */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs h-fit space-y-2">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-bold text-slate-700">Mening API'larim</span>
            <button onClick={loadList} title="Yangilash" className="text-slate-400 hover:text-slate-700">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {!loadingList && list.length === 0 && (
            <p className="text-xs text-slate-400 px-1 py-2">Hali API yo'q. "Yangi API" ni bosing.</p>
          )}
          {list.map(r => (
            <button
              key={r.slug}
              onClick={() => openResource(r.slug)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                selected?.slug === r.slug ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold text-slate-800 truncate">{r.title}</div>
              <div className="text-[11px] font-mono text-slate-500 truncate">/api/{r.slug} · {r.count} ta</div>
            </button>
          ))}
        </aside>

        {/* O'ng: yaratish yoki tahrirlash */}
        <section className="lg:col-span-3 space-y-6">
          {creating && (
            <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-indigo-900">
                <FileJson className="w-4 h-4 text-indigo-600" />
                <span>Yangi API</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-bold text-slate-700 mb-1">Nomi</span>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Masalan: Foydalanuvchilar"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-slate-700 mb-1">Link</span>
                  <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3.5 focus-within:ring-2 focus-within:ring-indigo-500">
                    <span className="text-xs font-mono text-slate-400">/api/</span>
                    <input
                      required
                      value={slugValue}
                      onChange={(e) => { setSlugTouched(true); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
                      placeholder="foydalanuvchilar"
                      className="flex-1 bg-transparent py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  {slugReserved && (
                    <span className="block text-[11px] text-rose-600 mt-1">
                      "/api/{finalSlug}" tizimda band. Masalan "{finalSlug}-list" yoki "my-{finalSlug}" deb nomlang.
                    </span>
                  )}
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">Ma'lumotlar (JSON massiv)</span>
                  <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => setNewJson(JSON.stringify(SAMPLE, null, 2))}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900">
                      <Wand2 className="w-3 h-3" /><span>Namuna qo'yish</span>
                    </button>
                    {!newParsed.error && (
                      <button type="button" onClick={() => setNewJson(JSON.stringify(newParsed.items, null, 2))}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800">Formatlash</button>
                    )}
                  </div>
                </div>
                <textarea
                  value={newJson}
                  onChange={(e) => setNewJson(e.target.value)}
                  spellCheck={false}
                  rows={14}
                  className={`w-full bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 ${
                    newParsed.error ? 'ring-2 ring-rose-400' : 'focus:ring-indigo-500'
                  }`}
                />
                <p className={`text-[11px] mt-1 ${newParsed.error ? 'text-rose-600' : 'text-slate-500'}`}>
                  {newParsed.error || `${newParsed.items.length} ta element. id bo'lmagan elementlarga id avtomatik beriladi. Bo'sh qoldirsangiz, keyin forma orqali qo'shasiz.`}
                </p>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={busy || slugReserved || Boolean(newParsed.error)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  <Link2 className="w-4 h-4" /><span>API yaratish</span>
                </button>
              </div>
            </form>
          )}

          {selected && !creating && (
            <>
              {/* Link paneli */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selected.title}</h3>
                    <p className="text-[11px] text-slate-500">{selected.items.length} ta element</p>
                  </div>
                  <button onClick={handleDeleteApi} className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-600 hover:text-rose-800">
                    <Trash2 className="w-3.5 h-3.5" /><span>API'ni o'chirish</span>
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <code className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-indigo-700 truncate">
                    GET {fullUrl}
                  </code>
                  <div className="flex gap-2">
                    <CopyButton text={fullUrl} />
                    <a href={fullUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">
                      <ExternalLink className="w-3.5 h-3.5" /><span>Ochish</span>
                    </a>
                    {onTestApi && (
                      <button onClick={() => onTestApi({ url: `/api/${selected.slug}`, method: 'GET' })}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">
                        <Play className="w-3.5 h-3.5" /><span>Sinash</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-slate-600">
                  <span><b className="text-emerald-700">GET</b> /api/{selected.slug}</span>
                  <span><b className="text-emerald-700">GET</b> /api/{selected.slug}/{firstId}</span>
                  <span><b className="text-blue-700">POST</b> /api/{selected.slug}</span>
                  <span><b className="text-amber-700">PUT / PATCH</b> /api/{selected.slug}/{firstId}</span>
                  <span><b className="text-rose-700">DELETE</b> /api/{selected.slug}/{firstId}</span>
                  <span><b className="text-emerald-700">GET</b> /api/{selected.slug}?name=...</span>
                </div>
              </div>

              {/* Ko'rinish tanlash */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {[
                  { id: 'form', label: 'Forma', icon: ListPlus },
                  { id: 'json', label: 'JSON', icon: FileJson }
                ].map(t => (
                  <button key={t.id} onClick={() => setView(t.id)}
                    className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold ${
                      view === t.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}>
                    <t.icon className="w-3.5 h-3.5" /><span>{t.label}</span>
                  </button>
                ))}
              </div>

              {view === 'json' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <p className="text-xs text-slate-500">
                    Butun ro'yxatni shu yerda tahrirlang yoki yangi JSON joylab qo'ying, keyin <b>Saqlash</b>ni bosing.
                  </p>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    spellCheck={false}
                    rows={20}
                    className="w-full bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-rose-600">{parseJsonList(jsonText).error || ''}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setJsonText(JSON.stringify(selected.items, null, 2))}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Bekor qilish</button>
                      <button onClick={handleSaveJson} disabled={busy}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                        <Save className="w-3.5 h-3.5" /><span>Saqlash</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {view === 'form' && (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                  {/* Elementlar ro'yxati */}
                  <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1.5 h-fit max-h-[640px] overflow-y-auto">
                    <button onClick={() => setEditingId(null)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold border ${
                        editingId === null ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-dashed border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}>
                      <Plus className="w-3.5 h-3.5" /><span>Yangi element qo'shish</span>
                    </button>
                    {selected.items.map(it => (
                      <div key={String(it.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                          String(editingId) === String(it.id) ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-slate-50'
                        }`}>
                        <span className="text-[11px] font-mono font-bold text-slate-400 w-8 shrink-0">#{String(it.id)}</span>
                        <span className="flex-1 min-w-0 text-xs text-slate-700 truncate">{previewText(it)}</span>
                        <button onClick={() => setEditingId(it.id)} title="Tahrirlash" className="text-slate-400 hover:text-indigo-700">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteItem(it.id)} title="O'chirish" className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Forma */}
                  <form onSubmit={handleSaveItem} className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        {editingId === null ? "Yangi element" : `Tahrirlash: id = ${editingId}`}
                      </span>
                      {editingId !== null && (
                        <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-700">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {hasShape ? (
                      <>
                        <FieldEditor shape={shape} value={formValue} onChange={setFormValue} />
                        <p className="text-[11px] text-slate-400">
                          Maydonlar mavjud elementlardan olingan. Yangi maydon qo'shish uchun JSON bo'limidan foydalaning.
                          {editingId === null && ' id avtomatik beriladi.'}
                        </p>
                        <div className="flex justify-end">
                          <button type="submit" disabled={busy}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                            <Save className="w-3.5 h-3.5" /><span>{editingId === null ? "Qo'shish" : 'Saqlash'}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Forma maydonlari hali yo'q. Avval <b>JSON</b> bo'limida kamida bitta namuna element kiriting
                        (masalan, <code className="font-mono">[{'{'} "name": "", "email": "" {'}'}]</code>). Keyin forma shu tuzilma bo'yicha ochiladi.
                      </p>
                    )}
                  </form>
                </div>
              )}

              {/* API javobi */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">API javobi: GET /api/{selected.slug}</span>
                  <CopyButton text={JSON.stringify(selected.items, null, 2)} label="JSON nusxalash" />
                </div>
                <pre className="bg-slate-900 text-emerald-300 rounded-xl p-4 text-xs font-mono leading-relaxed max-h-96 overflow-auto">
                  {JSON.stringify(selected.items, null, 2)}
                </pre>
                <pre className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-4 text-xs font-mono overflow-auto">{`fetch("${fullUrl}")
  .then(res => res.json())
  .then(data => console.log(data));`}</pre>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
