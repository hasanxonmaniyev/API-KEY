const db = require('../config/db');

// O'quvchilar uchun sifatli avatarlar to'plami (Har bir o'quvchi uchun boshqa-boshqa)
const DEFAULT_STUDENT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=AliValiyev&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=MadinaKarimova&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=BehzodRaximov&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=SardorToxtayev&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=DilnozaAzimova&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=JasurMirzayev&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=KamolaUsmonova&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=BoburRaxmatov&backgroundColor=ffd5dc'
];

// Dastlabki namunaviy o'quvchilar ro'yxati (Skrinshotdagi kabi)
const SEED_STUDENTS = [
  {
    id: 1,
    name: 'Ali Valiyev',
    firstName: 'Ali',
    lastName: 'Valiyev',
    email: 'ali@gmail.com',
    phone: '+998 90 123 45 67',
    city: 'Toshkent',
    address: {
      city: 'Toshkent',
      street: 'Amir Temur shoh ko\'chasi, 45-uy'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AliValiyev&backgroundColor=c0aede',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AliValiyev&backgroundColor=c0aede',
    status: 'Faol',
    isActive: true,
    age: 21,
    profession: 'Frontend Dasturchi'
  },
  {
    id: 2,
    name: 'Madina Karimova',
    firstName: 'Madina',
    lastName: 'Karimova',
    email: 'madina@gmail.com',
    phone: '+998 93 456 78 90',
    city: 'Samarqand',
    address: {
      city: 'Samarqand',
      street: 'Registon ko\'chasi, 12-uy'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MadinaKarimova&backgroundColor=b6e3f4',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MadinaKarimova&backgroundColor=b6e3f4',
    status: 'Faol',
    isActive: true,
    age: 20,
    profession: 'UI/UX Dizayner'
  },
  {
    id: 3,
    name: 'Behzod Raximov',
    firstName: 'Behzod',
    lastName: 'Raximov',
    email: 'behzod@gmail.com',
    phone: '+998 97 789 01 23',
    city: 'Buxoro',
    address: {
      city: 'Buxoro',
      street: 'Mustaqillik ko\'chasi, 8-uy'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BehzodRaximov&backgroundColor=ffd5dc',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BehzodRaximov&backgroundColor=ffd5dc',
    status: 'Fa\'olsiz',
    isActive: false,
    age: 23,
    profession: 'Backend Dasturchi'
  },
  {
    id: 4,
    name: 'Sardor To\'xtayev',
    firstName: 'Sardor',
    lastName: 'To\'xtayev',
    email: 'sardor@gmail.com',
    phone: '+998 99 234 56 78',
    city: 'Farg\'ona',
    address: {
      city: 'Farg\'ona',
      street: 'Al-Farg\'oniy ko\'chasi, 19-uy'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SardorToxtayev&backgroundColor=d1d4f9',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SardorToxtayev&backgroundColor=d1d4f9',
    status: 'Faol',
    isActive: true,
    age: 22,
    profession: 'Full-Stack Muhandis'
  },
  {
    id: 5,
    name: 'Dilnoza Azimova',
    firstName: 'Dilnoza',
    lastName: 'Azimova',
    email: 'dilnoza@gmail.com',
    phone: '+998 91 345 67 89',
    city: 'Toshkent',
    address: {
      city: 'Toshkent',
      street: 'Chilonzor 9-mavze, 2-uy'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DilnozaAzimova&backgroundColor=ffdfbf',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DilnozaAzimova&backgroundColor=ffdfbf',
    status: 'Faol',
    isActive: true,
    age: 19,
    profession: 'Mobil Dasturchi'
  },
  {
    id: 6,
    name: 'Jasur Mirzayev',
    firstName: 'Jasur',
    lastName: 'Mirzayev',
    email: 'jasur@gmail.com',
    phone: '+998 94 567 89 01',
    city: 'Andijon',
    address: {
      city: 'Andijon',
      street: 'Bobur shoh ko\'chasi, 55-uy'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JasurMirzayev&backgroundColor=c0aede',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JasurMirzayev&backgroundColor=c0aede',
    status: 'Fa\'olsiz',
    isActive: false,
    age: 24,
    profession: 'QA Muhandis'
  }
];

// Aqlli statistikani hisoblash
function calculateStats(items = []) {
  const total = items.length;
  let active = 0;
  let inactive = 0;

  items.forEach(item => {
    if (item.status === 'Faol' || item.isActive === true || item.inStock === true) {
      active++;
    } else {
      inactive++;
    }
  });

  return {
    total,
    active,
    inactive
  };
}

// GET /api/collections - Barcha dars vazifalari ro'yxati
exports.getAllCollections = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM collections ORDER BY id DESC');
    const collections = result.rows.map(row => {
      const items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        description: row.description,
        stats: calculateStats(items),
        itemCount: items.length,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    return res.status(200).json({
      success: true,
      count: collections.length,
      data: collections
    });
  } catch (err) {
    console.error('getAllCollections xatosi:', err);
    return res.status(500).json({ success: false, message: 'Kolleksiyalarni olishda xatolik', error: err.message });
  }
};

// GET /api/collections/:idOrSlug - O'quvchilar uyga vazifasi uchun to'liq API (statistika va ro'yxat)
exports.getCollection = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = !isNaN(Number(idOrSlug));

    const queryText = isId 
      ? 'SELECT * FROM collections WHERE id = $1'
      : 'SELECT * FROM collections WHERE slug = $1';
    const params = [isId ? Number(idOrSlug) : idOrSlug];

    const result = await db.query(queryText, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `"${idOrSlug}" nomli vazifa API topilmadi` });
    }

    const row = result.rows[0];
    const items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
    const stats = calculateStats(items);

    // O'quvchilar fetch() orqali to'g'ridan-to'g'ri o'qib, o'z saytiga ulashlari uchun toza format:
    return res.status(200).json({
      success: true,
      title: row.title,
      slug: row.slug,
      category: row.category,
      description: row.description,
      stats: {
        total: stats.total,
        active: stats.active,
        inactive: stats.inactive,
        totalStudents: stats.total,
        activeStudents: stats.active,
        inactiveStudents: stats.inactive
      },
      items,
      data: items // Ikkala variantda ham beramiz (data yoki items)
    });
  } catch (err) {
    console.error('getCollection xatosi:', err);
    return res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
};

// POST /api/collections - O'qituvchi yangi dars vazifasi API'sini yaratishi
exports.createCollection = async (req, res) => {
  try {
    const { title, slug, category = 'students', description = '', items = [] } = req.body;

    if (!title || String(title).trim() === '') {
      return res.status(400).json({ success: false, message: 'Vazifa sarlavhasi (title) talab qilinadi' });
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `task-${Date.now()}`;

    // Har bir elementga unikal ID va avatar berish
    const formattedItems = items.map((item, index) => {
      const avatarIndex = index % DEFAULT_STUDENT_AVATARS.length;
      const firstName = item.firstName || item.name?.split(' ')[0] || `O'quvchi ${index + 1}`;
      const lastName = item.lastName || item.name?.split(' ')[1] || '';
      const fullName = item.name || `${firstName} ${lastName}`.trim();
      
      return {
        id: item.id || (index + 1),
        firstName,
        lastName,
        name: fullName,
        email: item.email || `${firstName.toLowerCase()}@gmail.com`,
        avatar: item.avatar || DEFAULT_STUDENT_AVATARS[avatarIndex],
        status: item.status || (index % 3 === 0 ? 'Fa\'olsiz' : 'Faol'),
        isActive: item.status ? item.status === 'Faol' : (index % 3 !== 0),
        ...item
      };
    });

    const result = await db.query(
      `INSERT INTO collections (slug, title, category, description, items)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [finalSlug, title, category, description, JSON.stringify(formattedItems)]
    );

    const created = result.rows[0];
    return res.status(201).json({
      success: true,
      message: 'Vazifa kolleksiyasi yaratildi!',
      endpoint: `/api/collections/${created.slug}`,
      data: created
    });
  } catch (err) {
    console.error('createCollection xatosi:', err);
    return res.status(500).json({ success: false, message: 'Vazifa yaratishda xatolik', error: err.message });
  }
};

// POST /api/collections/:idOrSlug/items - O'quvchi "+ Yangi o'quvchi" tugmasi orqali yangi yozuv qo'shishi (CRUD)
exports.addItem = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = !isNaN(Number(idOrSlug));

    const result = await db.query(
      isId ? 'SELECT * FROM collections WHERE id = $1' : 'SELECT * FROM collections WHERE slug = $1',
      [isId ? Number(idOrSlug) : idOrSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kolleksiya topilmadi' });
    }

    const collection = result.rows[0];
    const items = typeof collection.items === 'string' ? JSON.parse(collection.items) : (collection.items || []);

    const maxId = items.reduce((max, it) => Math.max(max, Number(it.id) || 0), 0);
    const newId = maxId + 1;

    const newItem = {
      id: newId,
      name: req.body.name || `${req.body.firstName || 'Yangi'} ${req.body.lastName || 'O\'quvchi'}`.trim(),
      email: req.body.email || `user${newId}@gmail.com`,
      avatar: req.body.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user${newId}`,
      status: req.body.status || (req.body.isActive === false ? 'Fa\'olsiz' : 'Faol'),
      isActive: req.body.status === 'Fa\'olsiz' ? false : (req.body.isActive !== false),
      ...req.body
    };

    items.push(newItem);

    await db.query(
      'UPDATE collections SET items = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(items), collection.id]
    );

    return res.status(201).json({
      success: true,
      message: 'Yangi yozuv qo\'shildi!',
      data: newItem
    });
  } catch (err) {
    console.error('addItem xatosi:', err);
    return res.status(500).json({ success: false, message: 'Yozuv qo\'shishda xatolik', error: err.message });
  }
};

// GET /api/collections/:idOrSlug/items/:itemId - "Batafsil ->" uchun bitta o'quvchi ma'lumoti
exports.getItem = async (req, res) => {
  try {
    const { idOrSlug, itemId } = req.params;
    const isId = !isNaN(Number(idOrSlug));

    const result = await db.query(
      isId ? 'SELECT * FROM collections WHERE id = $1' : 'SELECT * FROM collections WHERE slug = $1',
      [isId ? Number(idOrSlug) : idOrSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kolleksiya topilmadi' });
    }

    const items = typeof result.rows[0].items === 'string' ? JSON.parse(result.rows[0].items) : (result.rows[0].items || []);
    const item = items.find(it => Number(it.id) === Number(itemId));

    if (!item) {
      return res.status(404).json({ success: false, message: `#${itemId} raqamli element topilmadi` });
    }

    return res.status(200).json(item);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server xatosi', error: err.message });
  }
};

// PUT /api/collections/:idOrSlug/items/:itemId - O'quvchini tahrirlash (masalan, statusini "Faol" qilish)
exports.updateItem = async (req, res) => {
  try {
    const { idOrSlug, itemId } = req.params;
    const isId = !isNaN(Number(idOrSlug));

    const result = await db.query(
      isId ? 'SELECT * FROM collections WHERE id = $1' : 'SELECT * FROM collections WHERE slug = $1',
      [isId ? Number(idOrSlug) : idOrSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kolleksiya topilmadi' });
    }

    const collection = result.rows[0];
    const items = typeof collection.items === 'string' ? JSON.parse(collection.items) : (collection.items || []);
    const index = items.findIndex(it => Number(it.id) === Number(itemId));

    if (index === -1) {
      return res.status(404).json({ success: false, message: `#${itemId} raqamli element topilmadi` });
    }

    const updatedItem = {
      ...items[index],
      ...req.body,
      id: Number(itemId)
    };

    items[index] = updatedItem;

    await db.query(
      'UPDATE collections SET items = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(items), collection.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Ma\'lumot yangilandi!',
      data: updatedItem
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Yangilashda xatolik', error: err.message });
  }
};

// DELETE /api/collections/:idOrSlug/items/:itemId - O'quvchini o'chirish
exports.deleteItem = async (req, res) => {
  try {
    const { idOrSlug, itemId } = req.params;
    const isId = !isNaN(Number(idOrSlug));

    const result = await db.query(
      isId ? 'SELECT * FROM collections WHERE id = $1' : 'SELECT * FROM collections WHERE slug = $1',
      [isId ? Number(idOrSlug) : idOrSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kolleksiya topilmadi' });
    }

    const collection = result.rows[0];
    const items = typeof collection.items === 'string' ? JSON.parse(collection.items) : (collection.items || []);
    const filtered = items.filter(it => Number(it.id) !== Number(itemId));

    if (items.length === filtered.length) {
      return res.status(404).json({ success: false, message: `#${itemId} raqamli element topilmadi` });
    }

    await db.query(
      'UPDATE collections SET items = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(filtered), collection.id]
    );

    return res.status(200).json({
      success: true,
      message: `#${itemId} raqamli element o'chirildi.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'O\'chirishda xatolik', error: err.message });
  }
};

// DELETE /api/collections/:idOrSlug - Butun kolleksiyani o'chirish
exports.deleteCollection = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = !isNaN(Number(idOrSlug));

    const result = await db.query(
      isId ? 'DELETE FROM collections WHERE id = $1 RETURNING *' : 'DELETE FROM collections WHERE slug = $1 RETURNING *',
      [isId ? Number(idOrSlug) : idOrSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kolleksiya topilmadi' });
    }

    return res.status(200).json({
      success: true,
      message: `"${result.rows[0].title}" vazifasi o'chirildi.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'O\'chirishda xatolik', error: err.message });
  }
};
