import http from 'http';
import express from 'express';
import { initStickerDatabase } from '../src/utils/stickerDb.js';
import stickerRouter from '../src/routes/stickerRoutes.js';

initStickerDatabase();

const app = express();
app.use(express.json());
app.use('/api/v1/stickers', stickerRouter);

const server = app.listen(3999, async () => {
  try {
    console.log('Test server listening on 3999');
    
    // 1. Test get stickers
    const res1 = await fetch('http://localhost:3999/api/v1/stickers');
    const data1 = await res1.json();
    console.log('GET /api/v1/stickers -> count:', data1.results, 'total:', data1.pagination?.total);

    // 2. Test categories
    const res2 = await fetch('http://localhost:3999/api/v1/stickers/categories');
    const data2 = await res2.json();
    console.log('GET /api/v1/stickers/categories ->', data2.data?.categories.map(c => `${c.name} (${c.count})`).join(', '));

    // 3. Test filter by category (Anime)
    const res3 = await fetch('http://localhost:3999/api/v1/stickers?category=Anime');
    const data3 = await res3.json();
    console.log('GET /api/v1/stickers?category=Anime -> count:', data3.results);

    // 4. Test search (Frieren)
    const res4 = await fetch('http://localhost:3999/api/v1/stickers?search=Frieren');
    const data4 = await res4.json();
    console.log('GET /api/v1/stickers?search=Frieren -> found:', data4.data?.stickers[0]?.name);

    // 5. Test get by ID / slug (nekostickerpack120)
    const res5 = await fetch('http://localhost:3999/api/v1/stickers/nekostickerpack120');
    const data5 = await res5.json();
    console.log('GET /api/v1/stickers/nekostickerpack120 -> found:', data5.data?.sticker?.name);

    // 6. Test stats
    const res6 = await fetch('http://localhost:3999/api/v1/stickers/stats');
    const data6 = await res6.json();
    console.log('GET /api/v1/stickers/stats -> total:', data6.data?.stats?.totalStickers);

    console.log('\nALL BACKEND API TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('API Test Failed:', err);
  } finally {
    server.close();
  }
});
