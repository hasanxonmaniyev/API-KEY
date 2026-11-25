import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function CodeSnippets({ url, id, sampleData }) {
  const [activeLang, setActiveLang] = useState('fetch');
  const [copied, setCopied] = useState(false);

  const snippets = {
    fetch: `// 1. Practice JavaScript Fetch API (GET)
async function getMyData() {
  try {
    const response = await fetch('${url}');
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

getMyData();`,

    fetchPost: `// 2. Practice JavaScript Fetch API (POST)
async function createNewData() {
  const payload = ${JSON.stringify(sampleData || { title: 'New Item' }, null, 2)};

  const response = await fetch('${url.replace(/\/\d+$/, '')}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log('Created record:', result);
}

createNewData();`,

    axios: `// Using Axios library in React/Node
import axios from 'axios';

axios.get('${url}')
  .then(response => {
    console.log('Axios Data:', response.data);
  })
  .catch(error => {
    console.error('Axios Error:', error);
  });`,

    curl: `# cURL command (run in your terminal)
curl -X GET "${url}" \\
  -H "Accept: application/json"`,

    python: `# Python 3 with 'requests' package
import requests

response = requests.get("${url}")
if response.status_code == 200:
    data = response.json()
    print("Python received:", data)
else:
    print("Error:", response.status_code)`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#07090e] border border-dark-border rounded-xl overflow-hidden">
      {/* Tab headers */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-border bg-dark-card/60">
        <div className="flex items-center space-x-1">
          {[
            { id: 'fetch', label: 'JS Fetch (GET)' },
            { id: 'fetchPost', label: 'JS Fetch (POST)' },
            { id: 'axios', label: 'Axios' },
            { id: 'curl', label: 'cURL' },
            { id: 'python', label: 'Python' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveLang(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
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
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Snippet' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Code Display */}
      <div className="p-4 overflow-x-auto max-h-72">
        <pre className="text-xs font-mono text-indigo-200/90 leading-relaxed whitespace-pre">
          {snippets[activeLang]}
        </pre>
      </div>
    </div>
  );
}
