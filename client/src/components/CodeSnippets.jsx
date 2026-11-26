import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function CodeSnippets({ url, id, sampleData }) {
  const [activeLang, setActiveLang] = useState('fetch');
  const [copied, setCopied] = useState(false);

  const snippets = {
    fetch: `// 1. JavaScript Fetch API orqali ma'lumotlarni o'qish (GET)
async function getMyData() {
  try {
    const response = await fetch('${url}');
    if (!response.ok) {
      throw new Error(\`Xatolik yuz berdi: \${response.status}\`);
    }
    const data = await response.json();
    console.log('Qabul qilingan ma\\'lumot:', data);
    return data;
  } catch (error) {
    console.error('Fetch xatosi:', error);
  }
}

getMyData();`,

    fetchPost: `// 2. JavaScript Fetch API orqali yangi yozuv yaratish (POST)
async function createNewData() {
  const payload = ${JSON.stringify(sampleData || { title: 'Yangi yozuv' }, null, 2)};

  const response = await fetch('${url.replace(/\/\d+$/, '')}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log('Yaratilgan yangi yozuv:', result);
}

createNewData();`,

    axios: `// React yoki Node.js loyihalarida Axios kutubxonasi orqali
import axios from 'axios';

axios.get('${url}')
  .then(response => {
    console.log('Axios javobi:', response.data);
  })
  .catch(error => {
    console.error('Axios xatosi:', error);
  });`,

    curl: `# Terminal (buyruqlar satri) orqali tekshirish
curl -X GET "${url}" \\
  -H "Accept: application/json"`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* Tab sarlavhalari */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-1">
          {[
            { id: 'fetch', label: 'JS Fetch (GET)' },
            { id: 'fetchPost', label: 'JS Fetch (POST)' },
            { id: 'axios', label: 'Axios' },
            { id: 'curl', label: 'cURL' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveLang(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                activeLang === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Nusxalandi' : 'Kodni nusxalash'}</span>
        </button>
      </div>

      {/* Kod maydoni */}
      <div className="p-4 overflow-x-auto max-h-64">
        <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre">
          {snippets[activeLang]}
        </pre>
      </div>
    </div>
  );
}
