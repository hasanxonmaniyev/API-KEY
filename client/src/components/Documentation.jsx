import React, { useState } from 'react';
import { BookOpen, Code, Copy, Check, Terminal, ExternalLink, Lightbulb, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function Documentation() {
  const [copiedSection, setCopiedSection] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getCode = `// 1. O'quvchi yoki Mashina ma'lumotlarini olish va DOM'ga chiqarish
async function loadUserData() {
  try {
    const response = await fetch('https://sizning-domen.up.railway.app/api/data/1');

    if (!response.ok) {
      throw new Error('Serverdan ma\\'lumot kelmadi: ' + response.status);
    }

    const item = await response.json();
    console.log('Olingan ma\\'lumot:', item);

    // Rasmni to'g'ridan-to'g'ri HTML <img> tegiga joylash
    if (item.avatar || item.carPhoto || item.productImage) {
      document.getElementById('myImage').src = item.avatar || item.carPhoto || item.productImage;
    }
    document.getElementById('myName').textContent = item.firstName + ' ' + (item.lastName || '');
    document.getElementById('myCar').textContent = item.carName || 'Mashina ko\\'rsatilmagan';
  } catch (error) {
    console.error('Xatolik yuz berdi:', error);
  }
}

loadUserData();`;

  const postCode = `// 2. Yangi ma'lumot va mashina rasmini yuborish (POST)
async function createNewRecord() {
  const yangiTalaba = {
    templateId: 1,
    firstName: 'Hasan',
    lastName: 'Maniyev',
    age: 23,
    profession: 'Full-Stack Dasturchi',
    city: 'Toshkent',
    carName: 'Chevrolet Tracker 2',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
  };

  try {
    const response = await fetch('https://sizning-domen.up.railway.app/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Express JSON o'qishi uchun majburiy sarlavha
      },
      body: JSON.stringify(yangiTalaba) // JS obyektini JSON qatoriga aylantirish
    });

    const result = await response.json();
    console.log('Yaratilgan yangi API ID:', result.apiId);
  } catch (error) {
    console.error('Saqlashda xatolik:', error);
  }
}

createNewRecord();`;

  const putCode = `// 3. Mavjud ma'lumotni tahrirlash (PUT)
async function updateRecord(id) {
  const oOzgarishlar = {
    carName: 'BMW M5 Competition',
    city: 'Samarqand'
  };

  const response = await fetch(\`https://sizning-domen.up.railway.app/api/data/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(oOzgarishlar)
  });

  const updated = await response.json();
  console.log('Yangilangan natija:', updated);
}`;

  const deleteCode = `// 4. Ma'lumotni PostgreSQL bazasidan o'chirish (DELETE)
async function deleteRecord(id) {
  const response = await fetch(\`https://sizning-domen.up.railway.app/api/data/\${id}\`, {
    method: 'DELETE'
  });

  if (response.ok) {
    console.log('Ma\\'lumot muvaffaqiyatli o\\'chirildi!');
  }
}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Sarlavha */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
            <BookOpen className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            JavaScript Fetch API — O'quvchilar uchun Amaliy Qo'llanma
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Ushbu platforma orqali yaratilgan REST API bilan JavaScript orqali qanday ishlash bo'yicha to'liq amaliy namunalar.
        </p>
      </div>

      {/* HTTP Metodlar Kartochkalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { method: 'GET', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', title: 'Ma\'lumot o\'qish', desc: 'Bazadagi rasmlar va yozuvlarni olib kelib DOM\'ga chiqarish.' },
          { method: 'POST', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200', title: 'Yangi API yaratish', desc: 'JSON formatida yangi o\'quvchi yoki mashina qo\'shish.' },
          { method: 'PUT', badge: 'bg-amber-50 text-amber-800 border-amber-200', title: 'Tahrirlash', desc: 'Mavjud yozuvning mashinasi, narxi yoki rasmini yangilash.' },
          { method: 'DELETE', badge: 'bg-rose-50 text-rose-800 border-rose-200', title: 'O\'chirish', desc: 'Yozuvni PostgreSQL bazasidan butunlay o\'chirish.' }
        ].map(m => (
          <div key={m.method} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-2xs">
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${m.badge}`}>
              {m.method}
            </span>
            <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* GET Bo'limi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">GET</span>
            <h3 className="text-sm font-bold text-slate-900">Ma'lumotlar va Rasmlarni o'qib olish (GET)</h3>
          </div>
          <button
            onClick={() => handleCopy(getCode, 'get')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            {copiedSection === 'get' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>Kodni nusxalash</span>
          </button>
        </div>
        <pre className="bg-slate-900 text-emerald-400 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
          {getCode}
        </pre>
      </div>

      {/* POST Bo'limi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">POST</span>
            <h3 className="text-sm font-bold text-slate-900">Yangi ma'lumot va rasm yuborish (POST)</h3>
          </div>
          <button
            onClick={() => handleCopy(postCode, 'post')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            {copiedSection === 'post' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>Kodni nusxalash</span>
          </button>
        </div>
        <pre className="bg-slate-900 text-indigo-300 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
          {postCode}
        </pre>
      </div>

      {/* PUT & DELETE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">PUT (Yangilash)</span>
            <button
              onClick={() => handleCopy(putCode, 'put')}
              className="p-1 rounded text-slate-400 hover:text-slate-700"
            >
              {copiedSection === 'put' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="bg-slate-900 text-amber-300 rounded-xl p-3 text-xs font-mono overflow-x-auto leading-relaxed">
            {putCode}
          </pre>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">DELETE (O'chirish)</span>
            <button
              onClick={() => handleCopy(deleteCode, 'del')}
              className="p-1 rounded text-slate-400 hover:text-slate-700"
            >
              {copiedSection === 'del' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="bg-slate-900 text-rose-300 rounded-xl p-3 text-xs font-mono overflow-x-auto leading-relaxed">
            {deleteCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
