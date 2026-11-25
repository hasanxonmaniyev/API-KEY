import React, { useState } from 'react';
import { BookOpen, Code, Copy, Check, Terminal, ExternalLink, Lightbulb, AlertCircle } from 'lucide-react';

export default function Documentation() {
  const [copiedSection, setCopiedSection] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getCode = `// Fetching data from your generated endpoint
async function loadUserData() {
  try {
    const response = await fetch('https://your-domain.up.railway.app/api/users/1');

    if (!response.ok) {
      throw new Error('Network response failed with code ' + response.status);
    }

    const userData = await response.json();
    console.log('Student Info:', userData);

    // Display inside HTML DOM
    document.getElementById('name').textContent = userData.firstName + ' ' + userData.lastName;
    document.getElementById('job').textContent = userData.profession;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

loadUserData();`;

  const postCode = `// Creating a new item with POST request
async function createStudentApi() {
  const newStudent = {
    firstName: 'Hasan',
    lastName: 'Maniyev',
    age: 23,
    carName: 'BMW M5',
    fianceName: 'Zulayho',
    profession: 'Full-Stack Developer',
    city: 'Tashkent'
  };

  try {
    const response = await fetch('https://your-domain.up.railway.app/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Crucial header for Express body parser!
      },
      body: JSON.stringify(newStudent) // Convert JS Object to JSON String
    });

    const result = await response.json();
    console.log('Created User API ID:', result.data.id);
  } catch (error) {
    console.error('Failed to create:', error);
  }
}`;

  const putCode = `// Updating existing item with PUT
async function updateUser(id, updatedFields) {
  const response = await fetch(\`https://your-domain.up.railway.app/api/users/\${id}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedFields)
  });

  const updated = await response.json();
  console.log('Updated result:', updated);
}`;

  const deleteCode = `// Deleting record with DELETE
async function deleteUser(id) {
  const response = await fetch(\`https://your-domain.up.railway.app/api/users/\${id}\`, {
    method: 'DELETE'
  });

  if (response.ok) {
    console.log('Record successfully deleted from PostgreSQL database!');
  }
}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            JavaScript Fetch API — Educational Guide for Students
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Complete guide on interacting with your generated REST API using standard modern JavaScript.
        </p>
      </div>

      {/* REST HTTP Methods Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { method: 'GET', color: 'emerald', desc: 'Read data from the database. No request body needed.' },
          { method: 'POST', color: 'indigo', desc: 'Create a new record in PostgreSQL with JSON payload.' },
          { method: 'PUT', color: 'amber', desc: 'Update existing record fields by ID.' },
          { method: 'DELETE', color: 'rose', desc: 'Permanently remove a record from the database.' }
        ].map(m => (
          <div key={m.method} className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-2">
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
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
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">GET</span>
            <h3 className="text-base font-bold text-white">How to fetch data with GET</h3>
          </div>
          <button
            onClick={() => handleCopy(getCode, 'get')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
          >
            {copiedSection === 'get' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          By default, <code className="text-indigo-300 font-mono">fetch(url)</code> uses the HTTP GET method. Remember to check <code className="text-indigo-300 font-mono">response.ok</code> and parse with <code className="text-indigo-300 font-mono">await response.json()</code>.
        </p>
        <pre className="bg-[#07090e] border border-dark-border rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
          {getCode}
        </pre>
      </div>

      {/* Section 2: POST */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300">POST</span>
            <h3 className="text-base font-bold text-white">How to send data with POST</h3>
          </div>
          <button
            onClick={() => handleCopy(postCode, 'post')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 transition-colors"
          >
            {copiedSection === 'post' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          To send data, you must provide <code className="text-indigo-300 font-mono">method: 'POST'</code>, set the header <code className="text-indigo-300 font-mono">'Content-Type': 'application/json'</code>, and stringify your body object using <code className="text-indigo-300 font-mono">JSON.stringify(payload)</code>.
        </p>
        <pre className="bg-[#07090e] border border-dark-border rounded-xl p-4 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
          {postCode}
        </pre>
      </div>

      {/* Section 3: PUT & DELETE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300">PUT</span>
              <h3 className="text-sm font-bold text-white">Update record</h3>
            </div>
            <button
              onClick={() => handleCopy(putCode, 'put')}
              className="p-1.5 rounded text-slate-400 hover:text-white"
            >
              {copiedSection === 'put' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="bg-[#07090e] border border-dark-border rounded-xl p-3 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed">
            {putCode}
          </pre>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300">DELETE</span>
              <h3 className="text-sm font-bold text-white">Delete record</h3>
            </div>
            <button
              onClick={() => handleCopy(deleteCode, 'del')}
              className="p-1.5 rounded text-slate-400 hover:text-white"
            >
              {copiedSection === 'del' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="bg-[#07090e] border border-dark-border rounded-xl p-3 text-xs font-mono text-rose-300 overflow-x-auto leading-relaxed">
            {deleteCode}
          </pre>
        </div>
      </div>

      {/* Pro Tips for Students */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Top 3 Common Student Errors & Solutions</span>
        </h4>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 font-bold">1.</span>
            <span>
              <strong>Forgetting <code className="font-mono text-indigo-300">await response.json()</code>:</strong>{' '}
              <code className="font-mono text-indigo-300">fetch()</code> returns a Promise resolving to a Response object, not the raw JSON. You must await <code className="font-mono text-indigo-300">response.json()</code>!
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 font-bold">2.</span>
            <span>
              <strong>Missing <code className="font-mono text-indigo-300">'Content-Type': 'application/json'</code>:</strong>{' '}
              When making POST or PUT requests, without this header, the Express server will receive an empty <code className="font-mono text-indigo-300">req.body</code>.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 font-bold">3.</span>
            <span>
              <strong>CORS Errors:</strong>{' '}
              This API Builder has CORS enabled (<code className="font-mono text-indigo-300">cors()</code>) on all origins, meaning you can fetch from localhost, CodePen, StackBlitz, or your custom frontend without cross-origin blocks.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
