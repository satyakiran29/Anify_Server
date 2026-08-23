import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';
import crypto from 'crypto';

const execPromise = util.promisify(exec);
const token = '8882853635:AAErWEKyhb5ESo8ffWrHiO5-udSnnMwUTBk';
const rawPacks = [
  'nekostickerpack670',
  'nekostickerpack9',
  'nekostickerpack2',
  'nekostickerpack735',
  'nekostickerpack733'
];

const packs = [...new Set(rawPacks)];

function generateId(item) {
  const seed = `${item.identifier || ''}-${item.name || ''}-${item.author || ''}`;
  return crypto.createHash('md5').update(seed).digest('hex');
}

async function downloadAndConvertToWebp(remoteUrl, packSlug, filename) {
  try {
    if (!remoteUrl || typeof remoteUrl !== 'string') return '';
    
    const dir = path.join(process.cwd(), 'public', 'stickers', packSlug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const baseName = path.parse(filename).name;
    const finalFilename = `${baseName}.webp`;
    const finalFilePath = path.join(dir, finalFilename);

    const res = await fetch(remoteUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.warn(`[StickerConverter] Failed to fetch ${remoteUrl}: HTTP ${res.status}`);
      return remoteUrl;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const isWebm = remoteUrl.toLowerCase().includes('.webm') || buffer.slice(0, 4).toString('hex') === '1a45dfa3';

    if (isWebm && ffmpegPath) {
      const tempWebmPath = path.join(dir, `_temp_${baseName}.webm`);
      fs.writeFileSync(tempWebmPath, buffer);

      try {
        const cmd = `"${ffmpegPath}" -y -ss 00:00:00.050 -i "${tempWebmPath}" -vframes 1 -vf "scale=512:512:force_original_aspect_ratio=decrease" -q:v 85 "${finalFilePath}"`;
        await execPromise(cmd);
      } catch (convErr) {
        try {
          const fallbackCmd = `"${ffmpegPath}" -y -i "${tempWebmPath}" -vframes 1 -q:v 85 "${finalFilePath}"`;
          await execPromise(fallbackCmd);
        } catch (fbErr) {
          console.error(`[StickerConverter] ffmpeg conversion failed for ${remoteUrl}:`, fbErr.message);
          fs.writeFileSync(finalFilePath, buffer);
        }
      } finally {
        if (fs.existsSync(tempWebmPath)) {
          try { fs.unlinkSync(tempWebmPath); } catch (_) {}
        }
      }
    } else {
      fs.writeFileSync(finalFilePath, buffer);
    }

    return `https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/stickers/${packSlug}/${finalFilename}`;
  } catch (err) {
    console.error(`[StickerConverter] Error converting ${remoteUrl}:`, err.message);
    return remoteUrl;
  }
}

async function processPack(packName) {
  console.log(`\nFetching sticker set info for ${packName}...`);
  const tgUrl = `https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(packName)}`;
  const tgRes = await fetch(tgUrl, { signal: AbortSignal.timeout(10000) });
  const tgData = await tgRes.json();

  if (!tgData.ok || !tgData.result) {
    console.error(`Error for ${packName}:`, tgData.description);
    return null;
  }

  const set = tgData.result;
  const stickers = set.stickers || [];
  console.log(`Found: "${set.title}", stickers: ${stickers.length}, animated: ${Boolean(set.is_animated || set.is_video)}`);

  const previews = [];
  const previewCount = Math.min(8, stickers.length);

  for (let i = 0; i < previewCount; i++) {
    const s = stickers[i];
    try {
      const fileId = (s.thumbnail?.file_id || s.thumb?.file_id) || s.file_id;
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`, { signal: AbortSignal.timeout(10000) });
      const fileData = await fileRes.json();

      if (fileData.ok && fileData.result?.file_path) {
        const rawFileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
        const webpUrl = await downloadAndConvertToWebp(rawFileUrl, packName, `preview_${i}.webp`);
        previews.push(webpUrl);
        console.log(`  [${i + 1}/${previewCount}] Saved preview_${i}.webp -> ${webpUrl}`);
      }
    } catch (e) {
      console.warn(`  Failed preview ${i}:`, e.message);
    }
  }

  const thumbnail = previews[0] || '';

  const packObj = {
    id: generateId({ identifier: packName, name: set.title || packName, author: 'Anify' }),
    name: set.title || packName,
    identifier: packName,
    telegramUrl: `https://t.me/addstickers/${packName}`,
    author: 'Anify',
    authorUrl: '',
    category: 'Anime',
    totalStickers: stickers.length,
    animated: Boolean(set.is_animated || set.is_video),
    thumbnail: thumbnail,
    previews: previews,
    description: '',
    tags: [],
    downloads: 0,
    rating: 5
  };

  return packObj;
}

async function run() {
  console.log(`Starting processing of ${packs.length} packs...`);
  const newPacks = [];
  for (const p of packs) {
    const res = await processPack(p);
    if (res) {
      newPacks.push(res);
    }
  }

  console.log(`\nSuccessfully processed ${newPacks.length} sticker packs.`);

  const stickersFilePath = path.join(process.cwd(), 'stickers.json');
  const existingRaw = fs.readFileSync(stickersFilePath, 'utf8').replace(/^﻿/, '');
  const existingList = JSON.parse(existingRaw);

  for (const newPack of newPacks) {
    const existingIndex = existingList.findIndex(p => p.identifier.toLowerCase() === newPack.identifier.toLowerCase());
    if (existingIndex >= 0) {
      console.log(`Updating existing pack in stickers.json: ${newPack.identifier}`);
      existingList[existingIndex] = {
        ...existingList[existingIndex],
        ...newPack
      };
    } else {
      console.log(`Adding new pack to stickers.json: ${newPack.identifier} (${newPack.name})`);
      existingList.unshift(newPack);
    }
  }

  fs.writeFileSync(stickersFilePath, JSON.stringify(existingList, null, 2), 'utf8');
  console.log(`Updated ${stickersFilePath} successfully. Total packs now: ${existingList.length}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
