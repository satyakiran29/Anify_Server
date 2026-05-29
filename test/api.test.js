import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import { initDatabase } from '../src/utils/db.js';
import wallpaperRouter from '../src/routes/wallpaperRoutes.js';

// Setup lightweight application for tests
const app = express();
app.use(express.json());
app.use('/api/v1/wallpapers', wallpaperRouter);

let server;
let port;

test.before(() => {
  // Initialize database (checks wallpapers.json exists and formats it)
  initDatabase();
  
  // Start server on a random ephemeral port
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });
});

test.after(() => {
  // Close server when finished
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /api/v1/wallpapers returns valid paginated list', async () => {
  const res = await fetch(`http://localhost:${port}/api/v1/wallpapers?limit=5`);
  assert.strictEqual(res.status, 200);
  
  const data = await res.json();
  assert.strictEqual(data.status, 'success');
  assert.ok(Array.isArray(data.data.wallpapers));
  assert.strictEqual(data.results <= 5, true);
  assert.ok(data.pagination);
  assert.ok(data.pagination.total >= 0);
});

test('GET /api/v1/wallpapers/categories returns categories and counts', async () => {
  const res = await fetch(`http://localhost:${port}/api/v1/wallpapers/categories`);
  assert.strictEqual(res.status, 200);
  
  const data = await res.json();
  assert.strictEqual(data.status, 'success');
  assert.ok(Array.isArray(data.data.categories));
  if (data.data.categories.length > 0) {
    const firstCat = data.data.categories[0];
    assert.ok(firstCat.name);
    assert.ok(firstCat.count > 0);
  }
});

test('GET /api/v1/wallpapers/stats returns server metrics', async () => {
  const res = await fetch(`http://localhost:${port}/api/v1/wallpapers/stats`);
  assert.strictEqual(res.status, 200);
  
  const data = await res.json();
  assert.strictEqual(data.status, 'success');
  const stats = data.data.stats;
  assert.ok(stats.totalWallpapers >= 0);
  assert.ok(stats.totalCategories >= 0);
  assert.ok(stats.totalAuthors >= 0);
  assert.ok(typeof stats.serverUptimeSeconds === 'number');
});

test('POST, GET, PUT, and DELETE wallpaper lifecycle with authentication', async () => {
  // 1. Attempt login with wrong password
  const failLoginRes = await fetch(`http://localhost:${port}/api/v1/wallpapers/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrongpassword' })
  });
  assert.strictEqual(failLoginRes.status, 401);
  const failLoginData = await failLoginRes.json();
  assert.strictEqual(failLoginData.status, 'fail');

  // 2. Login with correct password
  const successLoginRes = await fetch(`http://localhost:${port}/api/v1/wallpapers/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'admin123' })
  });
  assert.strictEqual(successLoginRes.status, 200);
  const successLoginData = await successLoginRes.json();
  assert.strictEqual(successLoginData.status, 'success');
  const token = successLoginData.data.token;
  assert.ok(token);

  // 3. Attempt POST without token (should fail)
  const newWallpaper = {
    name: 'Temporary Test Wallpaper',
    author: 'Test Suite',
    url: 'https://raw.githubusercontent.com/skdev0299/Anify/refs/heads/main/wallpapers/w/GTA/GTA%20(1).jpg',
    category: 'GTA'
  };

  const failCreateRes = await fetch(`http://localhost:${port}/api/v1/wallpapers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newWallpaper)
  });
  assert.strictEqual(failCreateRes.status, 401);

  // 4. Create a new wallpaper with auth token
  const createRes = await fetch(`http://localhost:${port}/api/v1/wallpapers`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(newWallpaper)
  });

  assert.strictEqual(createRes.status, 201);
  const createData = await createRes.json();
  assert.strictEqual(createData.status, 'success');
  
  const createdWp = createData.data.wallpaper;
  assert.strictEqual(createdWp.name, newWallpaper.name);
  assert.strictEqual(createdWp.author, newWallpaper.author);
  assert.ok(createdWp.id);
  const wpId = createdWp.id;

  // 5. Fetch single wallpaper by ID (public access, no token needed)
  const fetchRes = await fetch(`http://localhost:${port}/api/v1/wallpapers/${wpId}`);
  assert.strictEqual(fetchRes.status, 200);
  const fetchData = await fetchRes.json();
  assert.strictEqual(fetchData.data.wallpaper.name, newWallpaper.name);

  // 6. Update wallpaper details with auth token
  const updatePayload = {
    name: 'Updated Temporary Name',
    dimensions: '4K'
  };

  const updateRes = await fetch(`http://localhost:${port}/api/v1/wallpapers/${wpId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatePayload)
  });

  assert.strictEqual(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.data.wallpaper.name, updatePayload.name);
  assert.strictEqual(updateData.data.wallpaper.dimensions, updatePayload.dimensions);

  // 7. Delete the wallpaper with auth token
  const deleteRes = await fetch(`http://localhost:${port}/api/v1/wallpapers/${wpId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  assert.strictEqual(deleteRes.status, 200);

  // 8. Verify deletion
  const verifyRes = await fetch(`http://localhost:${port}/api/v1/wallpapers/${wpId}`);
  assert.strictEqual(verifyRes.status, 404);
});
