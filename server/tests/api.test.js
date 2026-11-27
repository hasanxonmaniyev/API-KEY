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

test('Resources: user-entered JSON is served as a clean array at /api/:slug', async () => {
  const json = (r) => r.json();
  const send = (method, path, body) => fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const slug = `test-users-${Date.now()}`;
  const items = [
    {
      id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz',
      address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998-3874', geo: { lat: '-37.3159', lng: '81.1496' } },
      phone: '1-770-736-8031 x56442', website: 'hildegard.org',
      company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net', bs: 'harness real-time e-markets' }
    },
    { id: 2, name: 'Ervin Howell', username: 'Antonette', address: { geo: { lat: '-43.9509', lng: '-34.4618' } } }
  ];

  // Reserved and invalid input
  assert.strictEqual((await send('POST', '/api/resources', { title: 'Users', slug: 'users', items })).status, 400);
  assert.strictEqual((await send('POST', '/api/resources', { title: 'Bad', slug, items: { a: 1 } })).status, 400);

  const created = await send('POST', '/api/resources', { title: 'Test users', slug, items });
  assert.strictEqual(created.status, 201);
  assert.strictEqual((await json(created)).data.endpoint, `/api/${slug}`);
  assert.strictEqual((await send('POST', '/api/resources', { title: 'Dup', slug, items })).status, 409);

  // Clean array, exactly as entered (no extra fields)
  const list = await send('GET', `/api/${slug}`);
  assert.strictEqual(list.status, 200);
  assert.deepStrictEqual(await json(list), items);

  assert.deepStrictEqual(await json(await send('GET', `/api/${slug}/1`)), items[0]);
  assert.deepStrictEqual(await json(await send('GET', `/api/${slug}?username=Antonette`)), [items[1]]);
  assert.strictEqual((await send('GET', `/api/${slug}/99`)).status, 404);

  // CRUD like JSONPlaceholder
  const added = await send('POST', `/api/${slug}`, { name: 'Clementine Bauch' });
  assert.strictEqual(added.status, 201);
  assert.deepStrictEqual(await json(added), { id: 3, name: 'Clementine Bauch' });

  const patched = await json(await send('PATCH', `/api/${slug}/3`, { username: 'Samantha' }));
  assert.deepStrictEqual(patched, { id: 3, name: 'Clementine Bauch', username: 'Samantha' });

  const replaced = await json(await send('PUT', `/api/${slug}/3`, { name: 'Only name' }));
  assert.deepStrictEqual(replaced, { id: 3, name: 'Only name' });

  assert.strictEqual((await send('DELETE', `/api/${slug}/3`)).status, 200);
  assert.strictEqual((await json(await send('GET', `/api/${slug}`))).length, 2);

  // Replace whole list from the editor; items without id get one
  const saved = await json(await send('PUT', `/api/resources/${slug}`, { items: [{ name: 'A' }, { id: 7, name: 'B' }, { name: 'C' }] }));
  assert.deepStrictEqual(saved.data.items.map(i => i.id), [8, 7, 9]);

  // Existing fixed APIs are not shadowed, unknown slugs are JSON 404
  assert.strictEqual((await send('GET', '/api/health')).status, 200);
  const missing = await send('GET', '/api/no-such-api-here');
  assert.strictEqual(missing.status, 404);
  assert.strictEqual((await json(missing)).success, false);

  assert.strictEqual((await send('DELETE', `/api/resources/${slug}`)).status, 200);
  assert.strictEqual((await send('GET', `/api/${slug}`)).status, 404);
});
