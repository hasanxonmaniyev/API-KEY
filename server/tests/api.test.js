const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
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
  assert.strictEqual(json.data.city, 'Tashkent');

  // Verify GET by ID
  const getRes = await fetch(`${baseUrl}/api/users/${json.data.id}`);
  assert.strictEqual(getRes.status, 200);
  const user = await getRes.json();
  assert.strictEqual(user.firstName, 'Hasan');
});

test('Dynamic API: Admin creates template and student generates dynamic endpoint', async () => {
  // 1. Admin creates custom template
  const newTemplate = {
    name: 'Smart Gadget Inventory',
    description: 'Hardware gadgets for lesson 5',
    fields: [
      { key: 'productName', name: 'Product Name', type: 'text', required: true },
      { key: 'price', name: 'Price', type: 'number', required: true },
      { key: 'color', name: 'Color', type: 'text', required: false },
      { key: 'brand', name: 'Brand', type: 'text', required: true },
      { key: 'inStock', name: 'In Stock', type: 'boolean', required: true }
    ],
    is_published: true
  };

  const tplRes = await fetch(`${baseUrl}/api/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTemplate)
  });

  assert.strictEqual(tplRes.status, 201);
  const tplData = await tplRes.json();
  const templateId = tplData.data.id;

  // 2. Student creates dynamic record using that template
  const studentPayload = {
    templateId,
    productName: 'iPhone 17',
    price: 1200,
    color: 'Black',
    brand: 'Apple',
    inStock: true
  };

  const recRes = await fetch(`${baseUrl}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentPayload)
  });

  assert.strictEqual(recRes.status, 201);
  const recJson = await recRes.json();
  assert.strictEqual(recJson.success, true);
  assert.strictEqual(recJson.data.productName, 'iPhone 17');
  assert.strictEqual(recJson.data.price, 1200);
  assert.strictEqual(recJson.data.inStock, true);

  // 3. Student fetches dynamic endpoint directly (GET /api/data/:id)
  const getRec = await fetch(`${baseUrl}/api/data/${recJson.apiId}`);
  assert.strictEqual(getRec.status, 200);
  const studentOutput = await getRec.json();
  assert.strictEqual(studentOutput.id, recJson.apiId);
  assert.strictEqual(studentOutput.productName, 'iPhone 17');
  assert.strictEqual(studentOutput.brand, 'Apple');
  assert.strictEqual(studentOutput.price, 1200);

  // 4. Update dynamic record (PUT /api/data/:id)
  const putRes = await fetch(`${baseUrl}/api/data/${recJson.apiId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: 1100, color: 'Titanium Grey' })
  });
  assert.strictEqual(putRes.status, 200);
  const updatedData = await putRes.json();
  assert.strictEqual(updatedData.data.price, 1100);
  assert.strictEqual(updatedData.data.color, 'Titanium Grey');

  // 5. Delete dynamic record (DELETE /api/data/:id)
  const delRes = await fetch(`${baseUrl}/api/data/${recJson.apiId}`, {
    method: 'DELETE'
  });
  assert.strictEqual(delRes.status, 200);
});
