const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  server.close();
});

test('GET /api/health should return ok status', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
});

test('Homework Collections API: GET, POST items, smart stats and unique avatars', async () => {
  // 1. Get the pre-seeded "oquvchilar" collection
  const res = await fetch(`${baseUrl}/api/collections/oquvchilar`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  assert.strictEqual(data.success, true);
  assert.strictEqual(data.slug, 'oquvchilar');
  assert.strictEqual(typeof data.stats.total, 'number');
  assert.strictEqual(typeof data.stats.active, 'number');
  assert.strictEqual(typeof data.stats.inactive, 'number');
  assert.ok(data.items.length >= 6);

  // Verify unique avatars for each student
  const avatarSeeds = data.items.map(s => s.avatar);
  const uniqueAvatars = new Set(avatarSeeds);
  assert.ok(uniqueAvatars.size >= 5, 'Avatars must be unique for each student');

  // 2. Student adds new student (POST /api/collections/oquvchilar/items)
  const addRes = await fetch(`${baseUrl}/api/collections/oquvchilar/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Otabek Ganiyev',
      email: 'otabek@gmail.com',
      status: 'Faol'
    })
  });
  assert.strictEqual(addRes.status, 201);
  const addedJson = await addRes.json();
  assert.strictEqual(addedJson.data.name, 'Otabek Ganiyev');
  const newId = addedJson.data.id;

  // 3. Student views details (GET /api/collections/oquvchilar/items/:id)
  const getDetail = await fetch(`${baseUrl}/api/collections/oquvchilar/items/${newId}`);
  assert.strictEqual(getDetail.status, 200);
  const detailJson = await getDetail.json();
  assert.strictEqual(detailJson.name, 'Otabek Ganiyev');

  // 3b. Direct user endpoint (GET /api/collections/oquvchilar/1) just like jsonplaceholder
  const directStudentRes = await fetch(`${baseUrl}/api/collections/oquvchilar/1`);
  assert.strictEqual(directStudentRes.status, 200);
  const directText = await directStudentRes.text();
  // Verify multi-line indentation format:
  assert.ok(directText.includes('\n'), 'JSON response must be pretty-printed with line breaks');
  const directStudent = JSON.parse(directText);
  assert.strictEqual(directStudent.name, 'Ali Valiyev');
  assert.strictEqual(directStudent.email, 'ali@gmail.com');
  assert.ok(directStudent.phone, 'Student must have phone');
  assert.strictEqual(directStudent.address.city, 'Toshkent');
  assert.ok(directStudent.avatar, 'Student must have avatar');

  // 4. Update student (PUT)
  const putRes = await fetch(`${baseUrl}/api/collections/oquvchilar/items/${newId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Fa\'olsiz', isActive: false })
  });
  assert.strictEqual(putRes.status, 200);

  // 5. Delete student (DELETE)
  const delRes = await fetch(`${baseUrl}/api/collections/oquvchilar/items/${newId}`, {
    method: 'DELETE'
  });
  assert.strictEqual(delRes.status, 200);
});

test('POST /api/users should create a user and return 201', async () => {
  const payload = {
    firstName: 'Hasan',
    lastName: 'Maniyev',
    age: 23,
    carName: 'Tracker 2',
    fianceName: 'Zulayho',
    profession: 'Software Engineer',
    city: 'Tashkent'
  };

  const res = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.strictEqual(res.status, 201);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.firstName, 'Hasan');
});
