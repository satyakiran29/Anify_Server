import express from 'express';
import { initStickerDatabase, stickerDb } from '../src/utils/stickerDb.js';
import stickerRouter from '../src/routes/stickerRoutes.js';
import { getAdminToken } from '../src/middleware/auth.js';

initStickerDatabase();

const app = express();
app.use(express.json());
app.use('/api/v1/stickers', stickerRouter);

const server = app.listen(3998, async () => {
  try {
    console.log('Testing Admin-Only Delete Functionality on port 3998...');
    const adminToken = getAdminToken();

    // 1. Add a temporary test pack
    const addRes = await fetch('http://localhost:3998/api/v1/stickers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Test Delete Pack',
        identifier: 'test_delete_pack_123',
        telegramUrl: 'https://t.me/addstickers/test_delete_pack_123',
        category: 'Test',
        totalStickers: 10
      })
    });
    const addData = await addRes.json();
    const testId = addData.data?.sticker?.id;
    console.log('1. Created test pack -> ID:', testId, 'Status:', addRes.status);

    // 2. Try deleting WITHOUT token -> MUST FAIL (401)
    const unauthorizedRes = await fetch(`http://localhost:3998/api/v1/stickers/${testId}`, {
      method: 'DELETE'
    });
    console.log('2. Unauthorized DELETE without token -> Status:', unauthorizedRes.status, '(Expected 401)');
    if (unauthorizedRes.status !== 401) throw new Error('Expected 401 Unauthorized');

    // 3. Try deleting WITH INVALID token -> MUST FAIL (401)
    const invalidTokenRes = await fetch(`http://localhost:3998/api/v1/stickers/${testId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer wrong_token_123'
      }
    });
    console.log('3. Unauthorized DELETE with invalid token -> Status:', invalidTokenRes.status, '(Expected 401)');
    if (invalidTokenRes.status !== 401) throw new Error('Expected 401 for invalid token');

    // 4. Delete WITH VALID ADMIN token -> MUST SUCCEED (200)
    const authorizedRes = await fetch(`http://localhost:3998/api/v1/stickers/${testId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const delData = await authorizedRes.json();
    console.log('4. Authorized DELETE with admin token -> Status:', authorizedRes.status, 'Message:', delData.message);
    if (authorizedRes.status !== 200) throw new Error('Expected 200 Success for admin delete');

    // 5. Verify pack is gone from DB
    const checkItem = stickerDb.getById(testId);
    console.log('5. Verify item is removed from database -> Exists:', !!checkItem, '(Expected false)');
    if (checkItem) throw new Error('Item still exists in database after deletion');

    console.log('\nADMIN-ONLY DELETE VERIFICATION PASSED WITH 100% SUCCESS!\n');
  } catch (err) {
    console.error('Admin Delete Test Failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
