# 🚀 API Builder — Educational REST API Generator

Talabalar va dasturlashni o'rganuvchilar uchun **JavaScript Fetch API** amaliyotini o'rganishga mo'ljallangan to'liq dinamik REST API platformasi.

---

## 🌟 Asosiy Imkoniyatlar (Key Features)

1. **Dinamik API Field Builder (Admin)**:
   - Cheksiz yangi maydonlar (fields) yaratish.
   - Maydon turlari: `text`, `number`, `boolean`.
   - Maydonlarni tartiblash (Reorder Up / Down) va o'chirish.
   - Turli darslar uchun API shablonlari (Templates) yaratish va talabalar uchun chop etish (Publish).

2. **Talabalar uchun API Generatori (Student Generator)**:
   - Tanlangan dars shabloniga mos dinamik forma.
   - Default Student Profile maydonlari: *First Name, Last Name, Age, Car Name, Fiancé Name, Profession, City*.
   - Har bir talaba uchun avto-inkrement individual ID va unikal endpoint yaratish.
   - JSON javobini syntax highlighting bilan ko'rish.
   - Bitta tugma bilan API URL va JSON nusxalash.
   - To'g'ridan-to'g'ri Postman uslubidagi interaktiv testerda sinab ko'rish.

3. **Interaktiv API Tester (Postman Inspired)**:
   - `GET`, `POST`, `PUT`, `DELETE` so'rovlarini brauzerdan yuborish.
   - HTTP status kodlari (200 OK, 201 Created, 400 Bad Request, 404 Not Found).
   - So'rov tezligi (latency ms) va response payload hajmini ko'rish.

4. **Ta'limiy Fetch API Qo'llanmasi (Interactive Docs)**:
   - JavaScript `fetch()` orqali GET, POST, PUT, DELETE kod namunalari.
   - Axios, cURL va Python tayyor kod shablonlari.
   - Talabalar tez-tez yo'l qo'yadigan xatolar va ularning yechimi.

5. **PostgreSQL Doimiy Xotira**:
   - Shablonlar va talabalar ma'lumotlari PostgreSQL ma'lumotlar bazasida `JSONB` formatida xavfsiz saqlanadi.
   - Railway va boshqa bulutli xizmatlarga 100% moslashgan.

---

## 🛠 Texnologiyalar (Tech Stack)

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, CORS
- **Database**: PostgreSQL (`pg` pool, `JSONB` dynamic storage)
- **Deployment**: Railway (Backend + PostgreSQL), Vercel (Frontend)

---

## 📡 REST API Endpointlar

### 1. Talabalar Foydalanuvchi API (Users Endpoints)
| Method | Endpoint | Tavsif |
|---|---|---|
| `POST` | `/api/users` | Yangi foydalanuvchi yaratish |
| `GET` | `/api/users` | Barcha foydalanuvchilarni olish |
| `GET` | `/api/users/:id` | Bitta foydalanuvchini ID bo'yicha olish |
| `PUT` | `/api/users/:id` | Foydalanuvchi ma'lumotlarini tahrirlash |
| `DELETE` | `/api/users/:id` | Foydalanuvchini bazadan o'chirish |

### 2. Dinamik API (Dynamic Records Endpoints)
| Method | Endpoint | Tavsif |
|---|---|---|
| `POST` | `/api/data` | Shablon asosida dinamik API yaratish |
| `GET` | `/api/data` | Barcha dinamik API'lar ro'yxati |
| `GET` | `/api/data/:id` | Talaba o'z JSON javobini to'g'ridan-to'g'ri olishi |
| `PUT` | `/api/data/:id` | Dinamik ma'lumotni yangilash |
| `DELETE` | `/api/data/:id` | Dinamik ma'lumotni o'chirish |

### 3. Shablonlar (Admin Template Endpoints)
| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/api/templates` | Barcha dars shablonlarini olish |
| `POST` | `/api/templates` | Yangi dars shabloni yaratish |
| `PUT` | `/api/templates/:id` | Shablon maydonlarini o'zgartirish |
| `DELETE` | `/api/templates/:id` | Shablonni o'chirish |

---

## 💻 Loyihani Lokal Muhitda Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish
```bash
npm run install:all
```

### 2. Frontendni build qilish
```bash
npm run build:client
```

### 3. Serverni ishga tushirish
```bash
npm start
# http://localhost:5001 manzilida to'liq ishga tushadi
```

### 4. Alohida ishlab chiqish (Development Mode)
- Server: `npm run server` (Port: 5001)
- Client: `npm run client` (Port: 3000)

### 5. Testlarni tekshirish
```bash
npm test
```

---

## 🚂 Railway'ga Joylashtirish (Railway Deployment)

1. **Railway hisobingizga kiring** ([railway.app](https://railway.app)).
2. **New Project** -> **Deploy from GitHub repo** -> `API-KEY` repozitoriysini tanlang.
3. Loyihaga **PostgreSQL** ma'lumotlar bazasi qo'shing (*Add Service -> Database -> Add PostgreSQL*).
4. Railway avtomatik tarzda `DATABASE_URL` o'zgaruvchisini ulaydi.
5. Server ishga tushganda avtomatik ravishda PostgreSQL jadvallarini (`templates`, `records`, `users`) yaratadi va ishga tayyor bo'ladi!

---

## 🌐 JavaScript Fetch API Namunalari

### 1. Ma'lumotlarni o'qish (GET):
```javascript
fetch('https://sizning-domen.up.railway.app/api/users/1')
  .then(res => res.json())
  .then(data => console.log('Olingan maʼlumot:', data))
  .catch(err => console.error('Xatolik:', err));
```

### 2. Yangi ma'lumot yuborish (POST):
```javascript
fetch('https://sizning-domen.up.railway.app/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templateId: 2,
    productName: 'iPhone 17 Pro',
    price: 1199,
    color: 'Titanium',
    brand: 'Apple',
    inStock: true
  })
})
.then(res => res.json())
.then(result => console.log('Yangi API yaratildi:', result));
```
