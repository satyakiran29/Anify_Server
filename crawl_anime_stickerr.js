import fs from 'fs';

async function crawlChannel() {
  console.log('Crawling https://t.me/s/anime_stickerr...');
  const packs = new Set();
  let maxPostId = 1000;
  
  // First fetch the main channel page to discover the latest message ID
  try {
    const mainRes = await fetch('https://t.me/s/anime_stickerr', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const mainHtml = await mainRes.text();
    const postIds = [...mainHtml.matchAll(/data-post="anime_stickerr\/(\d+)"/gi)].map(m => parseInt(m[1], 10));
    if (postIds.length > 0) {
      maxPostId = Math.max(...postIds) + 20;
    }
    const initialMatches = [...mainHtml.matchAll(/(?:addstickers\/|addstickers\?set=)([a-zA-Z0-9_]+)/gi)].map(m => m[1]);
    for (const m of initialMatches) packs.add(m);
    console.log(`Latest post ID detected around: ${maxPostId}`);
  } catch (e) {
    console.warn('Initial fetch error:', e.message);
  }

  // Paginate through all posts
  for (let before = maxPostId; before >= 1; before -= 12) {
    const url = `https://t.me/s/anime_stickerr?before=${before}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/(?:addstickers\/|addstickers\?set=)([a-zA-Z0-9_]+)/gi)].map(m => m[1]);
        for (const m of matches) packs.add(m);
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nCrawl complete! Total unique sticker packs found: ${packs.size}`);

  const existingRaw = fs.readFileSync('stickers.json', 'utf8').replace(/^﻿/, '');
  const existingList = JSON.parse(existingRaw);
  const existingSlugs = new Set(existingList.map(p => p.identifier.toLowerCase()));

  const allFound = [...packs];
  const newPacks = allFound.filter(slug => !existingSlugs.has(slug.toLowerCase()));

  console.log(`Existing in stickers.json: ${allFound.length - newPacks.length}`);
  console.log(`New packs to import: ${newPacks.length}`);
  console.log('List of new packs:', JSON.stringify(newPacks, null, 2));

  fs.writeFileSync('anime_stickerr_packs.json', JSON.stringify(allFound, null, 2), 'utf8');
}

crawlChannel().catch(err => console.error(err));
