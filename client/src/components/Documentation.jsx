import React, { useState } from 'react';
import { BookOpen, Code, Copy, Check, Terminal, ExternalLink, Lightbulb, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function Documentation() {
  const [copiedSection, setCopiedSection] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getCode = `// Fetching data and rendering photos into the DOM
async function loadUserData() {
  try {
    const response = await fetch('https://your-domain.up.railway.app/api/data/1');

    if (!response.ok) {
      throw new Error(\`Network error: \${response.status}\`);
    }

    const item = await response.json();
    console.log('Received API Data:', item);

    // Render image directly in HTML <img>
    if (item.avatar || item.productImage || item.poster) {
      document.getElementById('photo').src = item.avatar || item.productImage || item.poster;
    }
    document.getElementById('title').textContent = item.firstName || item.productName || item.title;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

loadUserData();`;

  const postCode = `// Creating dynamic record with photo & universal types
async function createRecordWithPhoto() {
  const newProduct = {
    templateId: 2,
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80',
    productName: 'iPhone 17 Pro Max',
    price: 1299,
    brand: 'Apple',
    color: '#6366f1',
    inStock: true
  };

  try {
    const response = await fetch('https://your-domain.up.railway.app/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    });

    const result = await response.json();
    console.log('Created Dynamic API ID:', result.apiId);
  } catch (error) {
    console.error('Failed to create:', error);
  }
}`;

  const uploadCode = `// Uploading an image file directly to the server
async function uploadImageFile(fileInput) {
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    const base64Data = reader.result;

    const response = await fetch('https://your-domain.up.railway.app/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data })
    });

    const uploaded = await response.json();
    console.log('Hosted Image URL:', uploaded.fullUrl);
    // You can now pass uploaded.fullUrl into your POST /api/data request!
  };

  reader.readAsDataURL(file);
}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in">
      {/* Title */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              JavaScript Fetch API — Universal Educational Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Learn how to consume, display images, send POST requests, and upload files using standard modern JavaScript.
            </p>
          </div>
        </div>
      </div>

      {/* Methods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { method: 'GET', color: 'emerald', desc: 'Read data & images from database. Perfect for rendering in <img> and <div>.' },
          { method: 'POST', color: 'indigo', desc: 'Create new records with photos, numbers, booleans, and custom fields.' },
          { method: 'PUT', color: 'amber', desc: 'Update existing record data, replace photos or change prices.' },
          { method: 'DELETE', color: 'rose', desc: 'Permanently remove a record from PostgreSQL database.' }
        ].map(m => (
          <div key={m.method} className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-4.5 space-y-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${
              m.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300' :
              m.method === 'POST' ? 'bg-indigo-500/20 text-indigo-300' :
              m.method === 'PUT' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {m.method}
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Section 1: GET */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">GET</span>
            <h3 className="text-base font-extrabold text-white">Fetching Data & Rendering Photos</h3>
          </div>
          <button
            onClick={() => handleCopy(getCode, 'get')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            {copiedSection === 'get' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <pre className="bg-[#06080e] border border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
          {getCode}
        </pre>
      </div>

      {/* Section 2: POST */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300">POST</span>
            <h3 className="text-base font-extrabold text-white">Sending Dynamic Data with Photos</h3>
          </div>
          <button
            onClick={() => handleCopy(postCode, 'post')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            {copiedSection === 'post' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <pre className="bg-[#06080e] border border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
          {postCode}
        </pre>
      </div>

      {/* Section 3: Upload */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300">UPLOAD</span>
            <h3 className="text-base font-extrabold text-white">How Image Upload Works (/api/upload)</h3>
          </div>
          <button
            onClick={() => handleCopy(uploadCode, 'upload')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            {copiedSection === 'upload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          The API Builder includes a dedicated image hosting service at <code className="text-purple-300 font-mono">/api/upload</code>. You can send Base64 images directly, and receive an instant hosted URL to store in your PostgreSQL records.
        </p>
        <pre className="bg-[#06080e] border border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed">
          {uploadCode}
        </pre>
      </div>
    </div>
  );
}
