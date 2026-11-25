const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let useFallback = false;

// In-memory/local JSON persistent store for offline development when DATABASE_URL is not set
const localStoreFile = path.join(__dirname, '..', 'local_dev_store.json');

const defaultTemplates = [
  {
    id: 1,
    name: 'Student & Developer Profile (with Photo)',
    description: 'Personal profile with avatar image, career details and skills for portfolio apps',
    fields: [
      { id: 'avatar', key: 'avatar', name: 'Profile Photo', type: 'image', required: false, defaultValue: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
      { id: 'firstName', key: 'firstName', name: 'First Name', type: 'text', required: true, defaultValue: 'Hasan' },
      { id: 'lastName', key: 'lastName', name: 'Last Name', type: 'text', required: true, defaultValue: 'Maniyev' },
      { id: 'age', key: 'age', name: 'Age', type: 'number', required: true, defaultValue: 23 },
      { id: 'profession', key: 'profession', name: 'Profession', type: 'text', required: true, defaultValue: 'Full-Stack Developer' },
      { id: 'email', key: 'email', name: 'Email Address', type: 'email', required: false, defaultValue: 'hasan@example.com' },
      { id: 'city', key: 'city', name: 'City', type: 'text', required: true, defaultValue: 'Tashkent' },
      { id: 'carName', key: 'carName', name: 'Car Name', type: 'text', required: false, defaultValue: 'BMW M5 Competition' },
      { id: 'fianceName', key: 'fianceName', name: 'Fiancé Name', type: 'text', required: false, defaultValue: 'Zulayho' }
    ],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'E-Commerce Product Catalog (with Image)',
    description: 'Dynamic products with image preview, price, brand, rating and stock status',
    fields: [
      { id: 'productImage', key: 'productImage', name: 'Product Image', type: 'image', required: true, defaultValue: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80' },
      { id: 'productName', key: 'productName', name: 'Product Name', type: 'text', required: true, defaultValue: 'iPhone 17 Pro' },
      { id: 'price', key: 'price', name: 'Price ($)', type: 'number', required: true, defaultValue: 1199 },
      { id: 'brand', key: 'brand', name: 'Brand', type: 'text', required: true, defaultValue: 'Apple' },
      { id: 'color', key: 'color', name: 'Color Accent', type: 'color', required: false, defaultValue: '#4f46e5' },
      { id: 'inStock', key: 'inStock', name: 'In Stock', type: 'boolean', required: true, defaultValue: true },
      { id: 'description', key: 'description', name: 'Product Description', type: 'textarea', required: false, defaultValue: 'Next-generation flagship smartphone with titanium body.' }
    ],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Cinema & Movie Hub (with Poster)',
    description: 'Movie card API with poster image, release year, rating and genre tags',
    fields: [
      { id: 'poster', key: 'poster', name: 'Movie Poster', type: 'image', required: true, defaultValue: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
      { id: 'title', key: 'title', name: 'Movie Title', type: 'text', required: true, defaultValue: 'Interstellar' },
      { id: 'director', key: 'director', name: 'Director', type: 'text', required: true, defaultValue: 'Christopher Nolan' },
      { id: 'year', key: 'year', name: 'Release Year', type: 'number', required: true, defaultValue: 2014 },
      { id: 'rating', key: 'rating', name: 'IMDb Rating', type: 'number', required: true, defaultValue: 8.7 },
      { id: 'isAvailable', key: 'isAvailable', name: 'Available to Stream', type: 'boolean', required: true, defaultValue: true }
    ],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let localData = {
  templateSeq: 3,
  recordSeq: 1,
  userSeq: 1,
  templates: [...defaultTemplates],
  records: [],
  users: []
};

// Load saved local data if exists
function loadLocalData() {
  try {
    if (fs.existsSync(localStoreFile)) {
      const content = fs.readFileSync(localStoreFile, 'utf8');
      localData = JSON.parse(content);
    }
  } catch (err) {
    console.warn('[DB Fallback] Could not read local store, using in-memory defaults:', err.message);
  }
}

function saveLocalData() {
  try {
    fs.writeFileSync(localStoreFile, JSON.stringify(localData, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB Fallback] Failed to persist local store:', err.message);
  }
}

loadLocalData();

// Initialize PostgreSQL connection
async function initDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('⚠️  DATABASE_URL environment variable is not defined.');
    console.log('🔄 Running in local fallback mode. Connect DATABASE_URL on Railway for production PostgreSQL.');
    useFallback = true;
    return;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false }
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully!');

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ PostgreSQL tables and default templates initialized.');
    }
    client.release();
    useFallback = false;
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.warn('🔄 Falling back to local store for uninterrupted execution...');
    useFallback = true;
  }
}

// Universal query runner that works with real PostgreSQL and fallback
async function query(text, params = []) {
  if (!useFallback && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('PostgreSQL Query Error:', err.message);
      throw err;
    }
  }

  // Fallback simulator for development without DB
  return handleFallbackQuery(text, params);
}

function handleFallbackQuery(text, params) {
  // Normalize whitespace so regexes match multiline SQL cleanly
  const cleanSql = text.trim().replace(/\s+/g, ' ');

  // 1. TEMPLATES: SELECT
  if (/^SELECT\s+.*\s+FROM\s+templates/i.test(cleanSql)) {
    if (cleanSql.includes('WHERE id = $1')) {
      const item = localData.templates.find(t => t.id === Number(params[0]));
      return { rows: item ? [item] : [] };
    }
    const publishedOnly = cleanSql.includes('WHERE is_published = true');
    const rows = publishedOnly 
      ? localData.templates.filter(t => t.is_published)
      : [...localData.templates];
    rows.sort((a, b) => b.id - a.id);
    return { rows };
  }

  // 2. TEMPLATES: INSERT
  if (/^INSERT\s+INTO\s+templates/i.test(cleanSql)) {
    const id = localData.templateSeq++;
    const [name, description, fields, is_published] = params;
    const newTemplate = {
      id,
      name,
      description,
      fields: typeof fields === 'string' ? JSON.parse(fields) : fields,
      is_published: is_published ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localData.templates.push(newTemplate);
    saveLocalData();
    return { rows: [newTemplate] };
  }

  // 3. TEMPLATES: UPDATE
  if (/^UPDATE\s+templates/i.test(cleanSql)) {
    const id = Number(params[params.length - 1]);
    const idx = localData.templates.findIndex(t => t.id === id);
    if (idx === -1) return { rows: [] };

    const [name, description, fields, is_published] = params;
    localData.templates[idx] = {
      ...localData.templates[idx],
      name,
      description,
      fields: typeof fields === 'string' ? JSON.parse(fields) : fields,
      is_published,
      updated_at: new Date().toISOString()
    };
    saveLocalData();
    return { rows: [localData.templates[idx]] };
  }

  // 4. TEMPLATES: DELETE
  if (/^DELETE\s+FROM\s+templates/i.test(cleanSql)) {
    const id = Number(params[0]);
    const idx = localData.templates.findIndex(t => t.id === id);
    if (idx !== -1) {
      const deleted = localData.templates.splice(idx, 1)[0];
      localData.records = localData.records.filter(r => r.template_id !== id);
      saveLocalData();
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // 5. RECORDS: SELECT
  if (/^SELECT\s+.*\s+FROM\s+records/i.test(cleanSql)) {
    if (cleanSql.includes('WHERE id = $1') || cleanSql.includes('WHERE r.id = $1')) {
      const rec = localData.records.find(r => r.id === Number(params[0]));
      if (!rec) return { rows: [] };
      const t = localData.templates.find(tpl => tpl.id === rec.template_id);
      return { 
        rows: [{
          ...rec,
          template_name: t ? t.name : null,
          template_fields: t ? t.fields : []
        }]
      };
    }

    if (cleanSql.includes('WHERE template_id = $1') || cleanSql.includes('WHERE r.template_id = $1')) {
      const filtered = localData.records.filter(r => r.template_id === Number(params[0]));
      return { rows: filtered };
    }

    // All records with template joined
    const rows = localData.records.map(r => {
      const t = localData.templates.find(tpl => tpl.id === r.template_id);
      return {
        ...r,
        template_name: t ? t.name : null,
        template_fields: t ? t.fields : []
      };
    });
    rows.sort((a, b) => b.id - a.id);
    return { rows };
  }

  // 6. RECORDS: INSERT
  if (/^INSERT\s+INTO\s+records/i.test(cleanSql)) {
    const id = localData.recordSeq++;
    const [template_id, data] = params;
    const newRecord = {
      id,
      template_id: Number(template_id),
      data: typeof data === 'string' ? JSON.parse(data) : data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localData.records.push(newRecord);
    saveLocalData();
    return { rows: [newRecord] };
  }

  // 7. RECORDS: UPDATE
  if (/^UPDATE\s+records/i.test(cleanSql)) {
    const id = Number(params[params.length - 1]);
    const idx = localData.records.findIndex(r => r.id === id);
    if (idx === -1) return { rows: [] };

    const [data] = params;
    localData.records[idx] = {
      ...localData.records[idx],
      data: typeof data === 'string' ? JSON.parse(data) : data,
      updated_at: new Date().toISOString()
    };
    saveLocalData();
    return { rows: [localData.records[idx]] };
  }

  // 8. RECORDS: DELETE
  if (/^DELETE\s+FROM\s+records/i.test(cleanSql)) {
    const id = Number(params[0]);
    const idx = localData.records.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = localData.records.splice(idx, 1)[0];
      saveLocalData();
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // 9. USERS: SELECT
  if (/^SELECT\s+.*\s+FROM\s+users/i.test(cleanSql)) {
    if (cleanSql.includes('WHERE id = $1')) {
      const user = localData.users.find(u => u.id === Number(params[0]));
      return { rows: user ? [user] : [] };
    }
    const rows = [...localData.users].sort((a, b) => b.id - a.id);
    return { rows };
  }

  // 10. USERS: INSERT
  if (/^INSERT\s+INTO\s+users/i.test(cleanSql)) {
    const id = localData.userSeq++;
    const [first_name, last_name, age, car_name, fiance_name, profession, city] = params;
    const newUser = {
      id,
      first_name,
      last_name,
      age: Number(age),
      car_name,
      fiance_name,
      profession,
      city,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localData.users.push(newUser);
    saveLocalData();
    return { rows: [newUser] };
  }

  // 11. USERS: UPDATE
  if (/^UPDATE\s+users/i.test(cleanSql)) {
    const id = Number(params[params.length - 1]);
    const idx = localData.users.findIndex(u => u.id === id);
    if (idx === -1) return { rows: [] };

    const [first_name, last_name, age, car_name, fiance_name, profession, city] = params;
    localData.users[idx] = {
      ...localData.users[idx],
      first_name,
      last_name,
      age: Number(age),
      car_name,
      fiance_name,
      profession,
      city,
      updated_at: new Date().toISOString()
    };
    saveLocalData();
    return { rows: [localData.users[idx]] };
  }

  // 12. USERS: DELETE
  if (/^DELETE\s+FROM\s+users/i.test(cleanSql)) {
    const id = Number(params[0]);
    const idx = localData.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const deleted = localData.users.splice(idx, 1)[0];
      saveLocalData();
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // COUNT queries
  if (/SELECT COUNT\(\*\) FROM (\w+)/i.test(cleanSql)) {
    const match = cleanSql.match(/SELECT COUNT\(\*\) FROM (\w+)/i);
    const table = match[1].toLowerCase();
    const count = (localData[table] || []).length;
    return { rows: [{ count }] };
  }

  return { rows: [] };
}

module.exports = {
  initDb,
  query,
  getPool: () => pool,
  isFallback: () => useFallback
};
