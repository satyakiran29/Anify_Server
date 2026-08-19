import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import { initBannerDatabase } from '../src/utils/bannerDb.js';
import bannerRouter from '../src/routes/bannerRoutes.js';
import { getAdminToken } from '../src/middleware/auth.js';

// Setup test app
const app = express();
app.use(express.json());
app.use('/api/v1/banners', bannerRouter);

let server;
let port;
let adminToken;

test.before(() => {
  initBannerDatabase();
  adminToken = getAdminToken();
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`Banner test server running on port ${port}`);
      resolve();
    });
  });
});

test.after(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /api/v1/banners returns default starter banners', async () => {
  const res = await fetch(`http://localhost:${port}/api/v1/banners`);
  assert.strictEqual(res.status, 200);

  const body = await res.json();
  assert.strictEqual(body.status, 'success');
  assert.ok(Array.isArray(body.data.banners));
  assert.ok(body.data.banners.length >= 1);
  
  const first = body.data.banners[0];
  assert.ok(first.title);
  assert.ok(first.imageUrl);
  assert.ok(first.actionType);
});

test('POST, GET, PUT, and DELETE banner lifecycle with authentication', async () => {
  // 1. Unauthorized creation fails
  const unauthorizedRes = await fetch(`http://localhost:${port}/api/v1/banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Unauthorized Banner',
      imageUrl: 'https://example.com/banner.jpg'
    })
  });
  assert.strictEqual(unauthorizedRes.status, 401);

  // 2. Authorized creation succeeds
  const createRes = await fetch(`http://localhost:${port}/api/v1/banners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Cool Dynamic Banner',
      subtitle: 'Testing new banner feature',
      imageUrl: 'https://example.com/dynamic-banner.jpg',
      tag: '🔥 HOT',
      actionType: 'wallpapers',
      actionValue: 'AMOLED',
      order: 99,
      active: true
    })
  });
  assert.strictEqual(createRes.status, 201);
  const createData = await createRes.json();
  assert.strictEqual(createData.status, 'success');
  assert.strictEqual(createData.data.banner.title, 'Cool Dynamic Banner');
  const bannerId = createData.data.banner.id;

  // 3. Fetch single banner by ID
  const getSingleRes = await fetch(`http://localhost:${port}/api/v1/banners/${bannerId}`);
  assert.strictEqual(getSingleRes.status, 200);
  const singleData = await getSingleRes.json();
  assert.strictEqual(singleData.data.banner.id, bannerId);
  assert.strictEqual(singleData.data.banner.tag, '🔥 HOT');

  // 4. Update banner
  const updateRes = await fetch(`http://localhost:${port}/api/v1/banners/${bannerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Updated Dynamic Banner',
      tag: '✨ UPDATED'
    })
  });
  assert.strictEqual(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.data.banner.title, 'Updated Dynamic Banner');
  assert.strictEqual(updateData.data.banner.tag, '✨ UPDATED');

  // 5. Delete banner
  const deleteRes = await fetch(`http://localhost:${port}/api/v1/banners/${bannerId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  assert.strictEqual(deleteRes.status, 200);

  // 6. Verify deletion
  const getDeletedRes = await fetch(`http://localhost:${port}/api/v1/banners/${bannerId}`);
  assert.strictEqual(getDeletedRes.status, 404);
});
