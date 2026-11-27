const db = require('../config/db');

// Mavjud yo'nalishlar bilan to'qnashmasligi uchun band qilingan nomlar
const RESERVED_SLUGS = new Set([
  'users', 'templates', 'data', 'stats', 'collections', 'upload', 'uploads', 'health', 'resources'
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/['`ʻʼ‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function parseItems(row) {
  return typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// Ro'yxatni tekshiradi: faqat obyektlar, id bo'lmasa avtomatik beriladi, id takrorlanmaydi
function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return { error: "Ma'lumot JSON massiv bo'lishi kerak: [ { ... }, { ... } ]" };
  }
  const bad = items.findIndex(it => !isPlainObject(it));
  if (bad !== -1) {
    return { error: `#${bad + 1}-element obyekt emas. Har bir element { ... } ko'rinishida bo'lishi kerak` };
  }

  let maxId = items.reduce((m, it) => (Number.isInteger(it.id) && it.id > m ? it.id : m), 0);
  const seen = new Set();
  const result = [];
  for (const it of items) {
    const missingId = it.id === undefined || it.id === null || it.id === '';
    const item = missingId ? Object.assign({ id: ++maxId }, it, { id: maxId }) : it;
    const key = String(item.id);
    if (seen.has(key)) {
      return { error: `id = ${key} bir necha marta takrorlangan. Har bir elementning id'si boshqacha bo'lishi kerak` };
    }
    seen.add(key);
    result.push(item);
  }
  return { items: result };
}

function nextId(items) {
  return items.reduce((m, it) => (Number(it.id) > m ? Number(it.id) : m), 0) + 1;
}

function sameId(a, b) {
  return String(a) === String(b);
}

async function findBySlug(slug) {
  const result = await db.query('SELECT * FROM resources WHERE slug = $1', [slug]);
  return result.rows[0] || null;
}

async function saveItems(row, items, title = row.title) {
  await db.query(
    'UPDATE resources SET title = $1, items = $2, updated_at = NOW() WHERE slug = $3',
    [title, JSON.stringify(items), row.slug]
  );
}

function summary(row) {
  const items = parseItems(row);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    count: items.length,
    endpoint: `/api/${row.slug}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function serverError(res, err, message) {
  console.error(message, err);
  return res.status(500).json({ success: false, message, error: err.message });
}

/* ---------------- Boshqaruv API (sayt ishlatadi): /api/resources ---------------- */

exports.list = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM resources ORDER BY id DESC');
    return res.json({ success: true, data: result.rows.map(summary) });
  } catch (err) {
    return serverError(res, err, "API'lar ro'yxatini olishda xatolik");
  }
};

exports.get = async (req, res) => {
  try {
    const row = await findBySlug(req.params.slug);
    if (!row) return res.status(404).json({ success: false, message: `"${req.params.slug}" topilmadi` });
    return res.json({ success: true, data: { ...summary(row), items: parseItems(row) } });
  } catch (err) {
    return serverError(res, err, 'API ni olishda xatolik');
  }
};

exports.create = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ success: false, message: 'API nomi (title) kiritilishi shart' });

    const slug = slugify(req.body.slug || title);
    if (!slug || !SLUG_RE.test(slug)) {
      return res.status(400).json({ success: false, message: "Link nomi faqat lotin harflari, raqam va '-' dan iborat bo'lishi kerak" });
    }
    if (RESERVED_SLUGS.has(slug)) {
      return res.status(400).json({ success: false, message: `"${slug}" nomi tizimda band. Boshqa nom tanlang (masalan: "${slug}-list" yoki "my-${slug}")` });
    }

    const { items, error } = normalizeItems(req.body.items ?? []);
    if (error) return res.status(400).json({ success: false, message: error });

    if (await findBySlug(slug)) {
      return res.status(409).json({ success: false, message: `"/api/${slug}" allaqachon mavjud. Boshqa link nomini tanlang` });
    }

    const result = await db.query(
      'INSERT INTO resources (slug, title, items) VALUES ($1, $2, $3) RETURNING *',
      [slug, title, JSON.stringify(items)]
    );
    return res.status(201).json({ success: true, data: { ...summary(result.rows[0]), items } });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Bu link nomi allaqachon mavjud' });
    }
    return serverError(res, err, 'API yaratishda xatolik');
  }
};

// Butun ro'yxatni (va nomini) almashtirish — JSON muharriridan "Saqlash"
exports.replace = async (req, res) => {
  try {
    const row = await findBySlug(req.params.slug);
    if (!row) return res.status(404).json({ success: false, message: `"${req.params.slug}" topilmadi` });

    const title = req.body.title !== undefined ? String(req.body.title).trim() : row.title;
    if (!title) return res.status(400).json({ success: false, message: "API nomi bo'sh bo'lmasligi kerak" });

    const { items, error } = normalizeItems(req.body.items ?? parseItems(row));
    if (error) return res.status(400).json({ success: false, message: error });

    await saveItems(row, items, title);
    const updated = await findBySlug(row.slug);
    return res.json({ success: true, data: { ...summary(updated), items } });
  } catch (err) {
    return serverError(res, err, 'Saqlashda xatolik');
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM resources WHERE slug = $1 RETURNING *', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: `"${req.params.slug}" topilmadi` });
    return res.json({ success: true, message: `/api/${req.params.slug} o'chirildi` });
  } catch (err) {
    return serverError(res, err, "O'chirishda xatolik");
  }
};

/* ---------------- Ommaviy API (JSONPlaceholder uslubi): /api/:slug ---------------- */

// Band nomlar va mavjud bo'lmagan linklar keyingi handlerga (JSON 404) o'tadi.
// true qaytsa req.resource va req.resourceItems tayyor.
async function loadPublic(req, res, next) {
  const { slug } = req.params;
  if (RESERVED_SLUGS.has(slug)) { next(); return false; }
  try {
    const row = await findBySlug(slug);
    if (!row) { next(); return false; }
    req.resource = row;
    req.resourceItems = parseItems(row);
    return true;
  } catch (err) {
    serverError(res, err, 'Server xatosi');
    return false;
  }
}

// GET /api/:slug  -> [ {...}, {...} ]   (?username=Bret kabi filtr ham ishlaydi)
exports.publicList = async (req, res, next) => {
  if (!(await loadPublic(req, res, next))) return;
  let items = req.resourceItems;
  const filters = Object.entries(req.query);
  if (filters.length > 0) {
    items = items.filter(it => filters.every(([k, v]) => it[k] !== undefined && String(it[k]) === String(v)));
  }
  return res.json(items);
};

// GET /api/:slug/:id -> { ... }
exports.publicGet = async (req, res, next) => {
  if (!(await loadPublic(req, res, next))) return;
  const item = req.resourceItems.find(it => sameId(it.id, req.params.id));
  if (!item) return res.status(404).json({});
  return res.json(item);
};

// POST /api/:slug -> yangi element, 201
exports.publicCreate = async (req, res, next) => {
  if (!(await loadPublic(req, res, next))) return;
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ success: false, message: "Body JSON obyekt bo'lishi kerak: { ... }" });
  }
  try {
    const items = req.resourceItems;
    let id = req.body.id;
    if (id === undefined || id === null || id === '') id = nextId(items);
    if (items.some(it => sameId(it.id, id))) {
      return res.status(409).json({ success: false, message: `id = ${id} allaqachon mavjud` });
    }
    const item = Object.assign({ id }, req.body, { id });
    items.push(item);
    await saveItems(req.resource, items);
    return res.status(201).json(item);
  } catch (err) {
    return serverError(res, err, "Qo'shishda xatolik");
  }
};

// PUT /api/:slug/:id -> to'liq almashtirish | PATCH -> qisman yangilash
function makeUpdate(merge) {
  return async (req, res, next) => {
    if (!(await loadPublic(req, res, next))) return;
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ success: false, message: "Body JSON obyekt bo'lishi kerak: { ... }" });
    }
    try {
      const items = req.resourceItems;
      const idx = items.findIndex(it => sameId(it.id, req.params.id));
      if (idx === -1) return res.status(404).json({});
      const id = items[idx].id;
      items[idx] = merge
        ? { ...items[idx], ...req.body, id }
        : Object.assign({ id }, req.body, { id });
      await saveItems(req.resource, items);
      return res.json(items[idx]);
    } catch (err) {
      return serverError(res, err, 'Yangilashda xatolik');
    }
  };
}
exports.publicReplace = makeUpdate(false);
exports.publicPatch = makeUpdate(true);

// DELETE /api/:slug/:id -> {}
exports.publicDelete = async (req, res, next) => {
  if (!(await loadPublic(req, res, next))) return;
  try {
    const items = req.resourceItems;
    const filtered = items.filter(it => !sameId(it.id, req.params.id));
    if (filtered.length === items.length) return res.status(404).json({});
    await saveItems(req.resource, filtered);
    return res.json({});
  } catch (err) {
    return serverError(res, err, "O'chirishda xatolik");
  }
};

exports.RESERVED_SLUGS = RESERVED_SLUGS;
