import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import util from 'util';
import ffmpegPath from 'ffmpeg-static';

const execPromise = util.promisify(exec);

const TOKENS = [
  '8883818509:AAE_wQmtpVhemH2UqJfBWSGItJjHETUxpEk',
  '6556274064:AAFV-2AIOxQN1XkcF5FOCvbLgGPD39xuqsA',
  '7128451799:AAGzyhNwA3NgEjpk6uPisjfahWFlX3CDWiY',
  '7394606920:AAFtE10MtKfQjWNLAOu6H1CJxlmWY6JDAks',
  '7517006452:AAETuLnLu_x5KQ_-il_kB9rStOdXn_T2Byo',
  '8662564827:AAGgwwszF1xjS8i5MOGMmAcTJA9C7xi0vCo'
];

let tokenCounter = 0;
function getNextToken() {
  const token = TOKENS[tokenCounter % TOKENS.length];
  tokenCounter++;
  return token;
}

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

    if (fs.existsSync(finalFilePath) && fs.statSync(finalFilePath).size > 100) {
      return `https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/stickers/${packSlug}/${finalFilename}`;
    }

    const res = await fetch(remoteUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) {
      return '';
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
    return '';
  }
}

async function processPack(slug) {
  const token = getNextToken();
  const tgUrl = `https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(slug)}`;
  let tgData = null;

  try {
    const tgRes = await fetch(tgUrl, { signal: AbortSignal.timeout(8000) });
    tgData = await tgRes.json();
  } catch (err) {
    return null;
  }

  if (!tgData || !tgData.ok || !tgData.result) {
    return null;
  }

  const set = tgData.result;
  const stickers = set.stickers || [];
  if (stickers.length === 0) return null;

  const title = set.title || slug;
  const isAnimated = Boolean(set.is_animated || set.is_video);

  const previews = [];
  const previewCount = Math.min(8, stickers.length);

  for (let i = 0; i < previewCount; i++) {
    const s = stickers[i];
    try {
      const fileId = (s.thumbnail?.file_id || s.thumb?.file_id) || s.file_id;
      const fileToken = getNextToken();
      const fileRes = await fetch(`https://api.telegram.org/bot${fileToken}/getFile?file_id=${fileId}`, { signal: AbortSignal.timeout(8000) });
      const fileData = await fileRes.json();

      if (fileData.ok && fileData.result?.file_path) {
        const rawFileUrl = `https://api.telegram.org/file/bot${fileToken}/${fileData.result.file_path}`;
        const webpUrl = await downloadAndConvertToWebp(rawFileUrl, slug, `preview_${i}.webp`);
        if (webpUrl) {
          previews.push(webpUrl);
        }
      }
    } catch (e) {}
  }

  if (previews.length === 0) return null;

  const thumbnail = previews[0] || '';

  return {
    id: generateId({ identifier: slug, name: title, author: 'Anify' }),
    name: title,
    identifier: slug,
    telegramUrl: `https://t.me/addstickers/${slug}`,
    author: 'Anify',
    authorUrl: '',
    category: 'Anime',
    totalStickers: stickers.length,
    animated: isAnimated,
    thumbnail: thumbnail,
    previews: previews,
    description: '',
    tags: [],
    downloads: 0,
    rating: 5
  };
}

function saveDb(newPacks) {
  const stickersFilePath = path.join(process.cwd(), 'stickers.json');
  const existingRaw = fs.readFileSync(stickersFilePath, 'utf8').replace(/^﻿/, '');
  let existingList = JSON.parse(existingRaw);

  for (const pack of newPacks) {
    const idx = existingList.findIndex(p => p.identifier.toLowerCase() === pack.identifier.toLowerCase());
    if (idx >= 0) {
      existingList[idx] = pack;
    } else {
      existingList.unshift(pack);
    }
  }

  fs.writeFileSync(stickersFilePath, JSON.stringify(existingList, null, 2), 'utf8');
}

async function run() {
  const allNewSlugs = JSON.parse(fs.readFileSync('anime_stickerr_new_packs.json', 'utf8'));
  console.log(`Starting bulk import of ${allNewSlugs.length} packs from @anime_stickerr...`);

  const BATCH_SIZE = 6;
  let successCount = 0;
  let skippedCount = 0;
  let batchBuffer = [];

  for (let i = 0; i < allNewSlugs.length; i += BATCH_SIZE) {
    const chunk = allNewSlugs.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(chunk.map(slug => processPack(slug)));

    for (const res of results) {
      if (res) {
        batchBuffer.push(res);
        successCount++;
      } else {
        skippedCount++;
      }
    }

    if (batchBuffer.length >= 18 || i + BATCH_SIZE >= allNewSlugs.length) {
      saveDb(batchBuffer);
      batchBuffer = [];
    }

    if ((i / BATCH_SIZE) % 5 === 0 || i + BATCH_SIZE >= allNewSlugs.length) {
      const progressPct = ((i + chunk.length) / allNewSlugs.length * 100).toFixed(1);
      console.log(`Progress: ${i + chunk.length}/${allNewSlugs.length} (${progressPct}%) | Added: ${successCount} | Inactive/Skipped: ${skippedCount}`);
    }

    await new Promise(r => setTimeout(r, 400));
  }

  if (batchBuffer.length > 0) {
    saveDb(batchBuffer);
  }

  const finalList = JSON.parse(fs.readFileSync('stickers.json', 'utf8'));
  console.log(`\n========================================`);
  console.log(`Bulk import complete! Successfully imported ${successCount} packs.`);
  console.log(`Total packs currently in stickers.json: ${finalList.length}`);
}

run().catch(err => {
  console.error('Bulk import fatal error:', err);
  process.exit(1);
});
