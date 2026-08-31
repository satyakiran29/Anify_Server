import fs from 'fs';

async function crawlSegment(startBefore, endBefore) {
  const packs = new Set();
  let currentBefore = startBefore;
  let hasMore = true;
  let emptyCount = 0;

  while (hasMore && currentBefore > endBefore) {
    const url = `https://t.me/s/anime_stickerr?before=${currentBefore}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        currentBefore -= 20;
        continue;
      }

      const html = await res.text();
      const matches = [...html.matchAll(/(?:addstickers\/|addstickers\?set=)([a-zA-Z0-9_]+)/gi)].map(m => m[1]);
      for (const m of matches) packs.add(m);

      const postIds = [...html.matchAll(/data-post="anime_stickerr\/(\d+)"/gi)].map(m => parseInt(m[1], 10));
      const beforeMatch = html.match(/data-before="(\d+)"/i);

      if (postIds.length > 0) {
        const minId = Math.min(...postIds);
        if (beforeMatch && parseInt(beforeMatch[1], 10) < currentBefore) {
          currentBefore = parseInt(beforeMatch[1], 10);
        } else if (minId < currentBefore) {
          currentBefore = minId;
        } else {
          currentBefore -= 20;
        }
        emptyCount = 0;
      } else {
        emptyCount++;
        currentBefore -= 20;
        if (emptyCount > 5) hasMore = false;
      }
    } catch (e) {
      currentBefore -= 20;
    }
  }

  return packs;
}

async function run() {
  console.log('Starting high-speed multi-worker crawl of @anime_stickerr (0 to 33,350)...');
  const MAX_ID = 33350;
  const NUM_WORKERS = 20;
  const CHUNK_SIZE = Math.ceil(MAX_ID / NUM_WORKERS);

  const workerPromises = [];
  for (let w = 0; w < NUM_WORKERS; w++) {
    const start = MAX_ID - (w * CHUNK_SIZE);
    const end = Math.max(0, start - CHUNK_SIZE);
    console.log(`Worker ${w + 1}: segment [${start} -> ${end}]`);
    workerPromises.push(crawlSegment(start, end));
  }

  const results = await Promise.all(workerPromises);
  const allPacks = new Set();
  for (const set of results) {
    for (const p of set) allPacks.add(p);
  }

  console.log(`\n========================================`);
  console.log(`Total unique sticker packs discovered in @anime_stickerr: ${allPacks.size}`);
  
  const existingRaw = fs.readFileSync('stickers.json', 'utf8').replace(/^﻿/, '');
  const existingList = JSON.parse(existingRaw);
  const existingSlugs = new Set(existingList.map(p => p.identifier.toLowerCase()));

  const packList = Array.from(allPacks);
  const newPacks = packList.filter(slug => !existingSlugs.has(slug.toLowerCase()));

  console.log(`Already in stickers.json: ${packList.length - newPacks.length}`);
  console.log(`New packs ready to import: ${newPacks.length}`);

  fs.writeFileSync('anime_stickerr_all_packs.json', JSON.stringify(packList, null, 2), 'utf8');
  fs.writeFileSync('anime_stickerr_new_packs.json', JSON.stringify(newPacks, null, 2), 'utf8');
}

run().catch(err => console.error(err));
