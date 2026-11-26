import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Copy, Check, ExternalLink, Play, Trash2, 
  Users, CheckCircle2, PauseCircle, RefreshCw, Eye, Sparkles, Code2, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { request, getFullApiUrl } from '../utils/api';
import CodeSnippets from './CodeSnippets';

export default function HomeworkCollections({ onTestApi }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('students');
  const [itemCount, setItemCount] = useState(6);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await request('/api/collections');
      if (res.ok && res.data.data) {
        setCollections(res.data.data);
        if (!selectedCollection && res.data.data.length > 0) {
          loadSingleCollection(res.data.data[0].slug || res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Kolleksiyalarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSingleCollection = async (slugOrId) => {
    try {
      const res = await request(`/api/collections/${slugOrId}`);
      if (res.ok && res.data) {
        setSelectedCollection(res.data);
      }
    } catch (err) {
      console.error('Kolleksiyani yuklashda xatolik:', err);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Yangi aqlli vazifa yaratish
  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      // Aqlli ravishda N ta takrorlanmaydigan element yaratish
      const sampleNames = [
        'Ali Valiyev', 'Madina Karimova', 'Behzod Raximov', 'Sardor To\'xtayev',
        'Dilnoza Azimova', 'Jasur Mirzayev', 'Kamola Usmonova', 'Bobur Raxmatov',
        'Zafar Qodirov', 'Nilufar Salimova', 'Shoxrux Xamidov', 'Sevara Aliyeva'
      ];

      const sampleProducts = [
        { name: 'iPhone 17 Pro', price: 1199, avatar: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560' },
        { name: 'MacBook Pro M3', price: 2499, avatar: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' },
        { name: 'Sony WH-1000XM5', price: 399, avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
        { name: 'Apple Watch Ultra', price: 799, avatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }
      ];

      const count = Number(itemCount) || 6;
      const items = [];

      for (let i = 0; i < count; i++) {
        if (newCategory === 'students') {
          const name = sampleNames[i % sampleNames.length] + (i >= sampleNames.length ? ` (${i + 1})` : '');
          const firstName = name.split(' ')[0];
          const lastName = name.split(' ')[1] || '';
          const isAct = i % 3 !== 2; // Ko'pchiligi faol
          items.push({
            id: i + 1,
            firstName,
            lastName,
            name,
            email: `${firstName.toLowerCase()}${i + 1}@gmail.com`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}&backgroundColor=b6e3f4,c0aede,ffd5dc,d1d4f9`,
            status: isAct ? 'Faol' : 'Fa\'olsiz',
            isActive: isAct
          });
        } else {
          const prod = sampleProducts[i % sampleProducts.length];
          const isAct = i % 4 !== 3;
          items.push({
            id: i + 1,
            name: `${prod.name} ${i >= sampleProducts.length ? i + 1 : ''}`.trim(),
            price: prod.price,
            avatar: prod.avatar,
            status: isAct ? 'Faol' : 'Fa\'olsiz',
            isActive: isAct
          });
        }
      }

      const res = await request('/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          description: `O'quvchilar uchun uyga vazifa to'plami (${count} ta element)`,
          items
        })
      });

      if (res.ok) {
        setCreating(false);
        setNewTitle('');
        await loadCollections();
        if (res.data.data) {
          loadSingleCollection(res.data.data.slug || res.data.data.id);
        }
      }
    } catch (err) {
      alert('Vazifa yaratishda xatolik: ' + err.message);
    }
  };

  const fullEndpoint = selectedCollection 
    ? getFullApiUrl(`/api/collections/${selectedCollection.slug || selectedCollection.id}`) 
    : '';

  const singleUserEndpoint = selectedCollection
    ? `${fullEndpoint}/1`
    : '';

  return (
    <div className="space-y-6">
      {/* 1. Sarlavha Paneli */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              O'quvchilar Uyga Vazifasi uchun Maxsus API Tizimi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            O'quvchilarga beriladigan amaliy vazifalar uchun tayyor API yaratish. Har bir o'quvchi boshqa-boshqa avatarga, ism, email va faollik statistikasiga ega bo'ladi.
          </p>
        </div>

        <button
          onClick={() => setCreating(!creating)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{creating ? 'Bekor qilish' : 'Yangi Vazifa API Yaratish'}</span>
        </button>
      </div>

      {/* 2. Yangi Vazifa Yaratish Modali / Formasi */}
      {creating && (
        <form onSubmit={handleCreateHomework} className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Yangi Dars Vazifasi Parametrlari</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Vazifa nomi</label>
              <input
                type="text"
                required
                placeholder="Masalan: Skyline Education - O'quvchilar ro'yxati"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Elementlar soni</label>
              <select
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value={6}>6 ta o'quvchi</option>
                <option value={12}>12 ta o'quvchi</option>
                <option value={20}>20 ta o'quvchi</option>
                <option value={50}>50 ta o'quvchi</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
            >
              Avtomatik Generatsiya Qilish
            </button>
          </div>
        </form>
      )}

      {/* 3. Asosiy Tanlangan Vazifa Ko'rinishi (Skyline Education skrinshoti kabi) */}
      {selectedCollection && (
        <div className="space-y-6">
          {/* Vazifaning O'quvchilarga beriladigan Fetch havolalari banneri */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  O'quvchilarga beriladigan Fetch API havolalari:
                </span>
                <h3 className="text-sm font-bold text-slate-900">{selectedCollection.title}</h3>
              </div>

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold self-start sm:self-auto">
                Tayyor REST API
              </span>
            </div>

            {/* 1. Bitta o'quvchi havolasi (Darsdagi misol: jsonplaceholder kabi) */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600">
                1. Bitta o'quvchi ma'lumoti (darsdagi HTML card uchun):
              </span>
              <div className="flex items-center space-x-2 bg-white border border-indigo-200 rounded-xl p-2 shadow-2xs">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white font-mono shrink-0">
                  GET
                </span>
                <input
                  readOnly
                  value={singleUserEndpoint}
                  className="w-full bg-transparent text-xs font-mono text-indigo-900 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(singleUserEndpoint, 'single-url')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs shrink-0"
                >
                  {copiedUrl === 'single-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl === 'single-url' ? 'Nusxalandi!' : 'Havolani nusxalash'}</span>
                </button>
              </div>
            </div>

            {/* 2. Barcha o'quvchilar va statistika */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600">
                2. Barcha o'quvchilar ro'yxati va umumiy statistika (Jami, Faol, Fa'olsizlar):
              </span>
              <div className="flex items-center space-x-2 bg-white border border-indigo-200 rounded-xl p-2 shadow-2xs">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-white font-mono shrink-0">
                  GET
                </span>
                <input
                  readOnly
                  value={fullEndpoint}
                  className="w-full bg-transparent text-xs font-mono text-indigo-900 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(fullEndpoint, 'main-url')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white transition-all shadow-xs shrink-0"
                >
                  {copiedUrl === 'main-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl === 'main-url' ? 'Nusxalandi!' : 'Havolani nusxalash'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Skrinshotdagi Dashboard ko'rinishi (Skyline Education UI) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <span>🎓 {selectedCollection.title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  O'quvchilar o'z saytiga quyidagi ma'lumotlarni chiqarib berishlari kerak:
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onTestApi({ url: singleUserEndpoint, method: 'GET' })}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>#1 O'quvchini sinash</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTestApi({ url: fullEndpoint, method: 'GET' })}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 shadow-xs"
                >
                  <Play className="w-3 h-3 fill-slate-700" />
                  <span>Hammasini sinash</span>
                </button>
              </div>
            </div>

            {/* Statistik kartochkalar (Skrinshotdagidek: Jami, Faol, Faolsiz) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Jami o'quvchilar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Jami o'quvchilar</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {selectedCollection.stats?.total || selectedCollection.items?.length || 0}
                  </p>
                </div>
              </div>

              {/* Faol o'quvchilar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Faol o'quvchilar</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {selectedCollection.stats?.active || 0}
                  </p>
                </div>
              </div>

              {/* Fa'olsizlar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <PauseCircle className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Fa'olsizlar</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {selectedCollection.stats?.inactive || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* O'quvchilar Ro'yxati Gridi (Skrinshotdagi kartochkalar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {selectedCollection.items?.map((student) => {
                const isFaol = student.status === 'Faol' || student.isActive === true;
                const cityDisplay = student.address?.city || student.city || 'Toshkent';
                const phoneDisplay = student.phone || '+998 90 123 45 67';
                return (
                  <div
                    key={student.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-start space-x-3.5">
                      {/* Har bir o'quvchi uchun boshqa-boshqa chiroyli rasm/avatar */}
                      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 bg-slate-50 shadow-2xs">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {student.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate font-mono">
                          {student.email}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          📞 {phoneDisplay}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          📍 {cityDisplay}
                        </p>
                        <div className="pt-1">
                          <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isFaol 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {student.status || (isFaol ? 'Faol' : 'Fa\'olsiz')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>ID: #{student.id}</span>
                      <button
                        type="button"
                        onClick={() => onTestApi({ url: `${fullEndpoint}/${student.id}`, method: 'GET' })}
                        className="text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center space-x-1"
                      >
                        <span>Batafsil</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* O'quvchilar uchun kod namunasi */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>O'quvchilar darsdagi kabi ushbu API'ni qanday ulaydi (JavaScript Fetch):</span>
              </div>

              {/* 1-Kod namunasi: Bitta o'quvchi kartochkasi */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">
                  A) Bitta foydalanuvchi ma'lumotlarini DOM'ga chiqarish (Darsdagi vazifa):
                </span>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`const name = document.getElementById("name");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const city = document.getElementById("city");
const avatar = document.getElementById("avatar");

// jsonplaceholder o'rniga o'z API'miz:
fetch("${singleUserEndpoint}")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    console.log(data);
    name.innerText = data.name;
    email.innerText = data.email;
    phone.innerText = data.phone;
    city.innerText = data.address.city; // yoki data.city
    if (avatar) avatar.src = data.avatar;
  })
  .catch(function(error) {
    console.log("Xatolik:", error);
  });`}
                </pre>
              </div>

              {/* 2-Kod namunasi: 6 ta o'quvchining hammasini chiqarish */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">
                  B) Barcha 6 ta o'quvchi va umumiy statistikani chiqarish:
                </span>
                <pre className="bg-slate-900 text-cyan-300 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
{`fetch("${fullEndpoint}")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    // 1. Statistika
    console.log("Jami o'quvchilar:", data.stats.total);
    console.log("Faol o'quvchilar:", data.stats.active);
    console.log("Fa'olsizlar:", data.stats.inactive);

    // 2. Har bir o'quvchi ma'lumotlari
    data.items.forEach(function(student) {
      console.log(student.id, student.name, student.email, student.phone, student.city, student.avatar, student.status);
    });
  })
  .catch(function(error) {
    console.log("Xatolik:", error);
  });`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
