import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'stickers.json');

// In-memory cache
let stickersCache = [];

/**
 * Generates an MD5 ID based on identifier and name
 */
function generateId(item) {
  const seed = `${item.identifier || ''}-${item.name || ''}-${item.author || ''}`;
  return crypto.createHash('md5').update(seed).digest('hex');
}

// Initial seed sticker packs (used ONLY if stickers.json does not exist)
const DEFAULT_STICKER_PACKS = [
  {
    name: "Neko Pack 120",
    identifier: "nekostickerpack120",
    telegramUrl: "https://t.me/addstickers/nekostickerpack120",
    author: "Neko Anime",
    authorUrl: "https://t.me/addstickers/nekostickerpack120",
    category: "Anime",
    totalStickers: 120,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png&w=200"
    ],
    description: "Cute Neko anime girl reactions, chibi expressions, and cute gestures.",
    tags: ["neko", "anime", "cute", "chibi", "catgirl"],
    downloads: 48200,
    rating: 4.9
  },
  {
    name: "Kang Robot Anime Pack",
    identifier: "kang_5852054126_by_Sticker_kang_robot",
    telegramUrl: "https://t.me/addstickers/kang_5852054126_by_Sticker_kang_robot",
    author: "Kang Robot",
    authorUrl: "https://t.me/addstickers/kang_5852054126_by_Sticker_kang_robot",
    category: "Anime",
    totalStickers: 50,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png&w=200"
    ],
    description: "Popular anime crossover stickers kanged by Sticker Kang Robot.",
    tags: ["kang", "anime", "action", "epic", "stickers"],
    downloads: 32400,
    rating: 4.8
  },
  {
    name: "Sousou No Frieren Anime",
    identifier: "SousouNoFrierenAnime",
    telegramUrl: "https://t.me/addstickers/SousouNoFrierenAnime",
    author: "Frieren Beyond Journey",
    authorUrl: "https://t.me/addstickers/SousouNoFrierenAnime",
    category: "Anime",
    totalStickers: 48,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/281.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/280.png&w=200"
    ],
    description: "Frieren, Fern, Stark, and Himmel emotional and comedic moments.",
    tags: ["frieren", "sousou", "anime", "fern", "stark", "fantasy"],
    downloads: 65100,
    rating: 5.0
  }
];

/**
 * Loads stickers from stickers.json.
 */
export function initStickerDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_STICKER_PACKS, null, 2), 'utf8');
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf8').replace(/^﻿/, '');
  let rawList = [];
  try {
    rawList = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing stickers.json:', err);
    rawList = [];
  }

  if (!Array.isArray(rawList)) {
    rawList = [];
  }

  const seen = new Set();
  const cleanList = [];
  let modified = false;

  for (const item of rawList) {
    const identifier = (item.identifier || item.name || '').trim();
    const standardized = {
      id: item.id || '',
      name: (item.name || 'Untitled Pack').trim(),
      identifier: identifier,
      telegramUrl: (item.telegramUrl || `https://t.me/addstickers/${identifier}`).trim(),
      author: (item.author || 'Anonymous').trim(),
      authorUrl: (item.authorUrl || '').trim(),
      category: (item.category || 'General').trim(),
      totalStickers: parseInt(item.totalStickers, 10) || 30,
      animated: Boolean(item.animated),
      thumbnail: (item.thumbnail || (item.previews && item.previews[0]) || '').trim(),
      previews: Array.isArray(item.previews) ? item.previews : (item.thumbnail ? [item.thumbnail] : []),
      description: (item.description || '').trim(),
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(s => s.trim()) : []),
      downloads: parseInt(item.downloads, 10) || 0,
      rating: parseFloat(item.rating) || 5.0
    };

    const fingerprint = `${standardized.identifier.toLowerCase()}::${standardized.name.toLowerCase()}`;
    if (seen.has(fingerprint)) {
      modified = true;
      continue;
    }
    seen.add(fingerprint);

    if (!standardized.id) {
      standardized.id = generateId(standardized);
      modified = true;
    }

    cleanList.push(standardized);
  }

  stickersCache = cleanList;

  if (modified) {
    saveToDisk();
    console.log(`Sticker database initialized/healed: Total Packs: ${stickersCache.length}`);
  } else {
    console.log(`Sticker database loaded. Total Packs: ${stickersCache.length}`);
  }
}

/**
 * Saves current memory cache back to stickers.json.
 */
function saveToDisk() {
  fs.writeFileSync(DB_PATH, JSON.stringify(stickersCache, null, 2), 'utf8');
}

export const stickerDb = {
  getAll() {
    return stickersCache;
  },

  getById(idOrSlug) {
    if (!idOrSlug) return null;
    const query = String(idOrSlug).toLowerCase().trim();
    return stickersCache.find(p => p.id === idOrSlug || p.identifier.toLowerCase() === query || p.id.toLowerCase() === query);
  },

  add(pack) {
    const newPack = {
      id: pack.id || generateId(pack),
      name: (pack.name || 'Untitled Pack').trim(),
      identifier: (pack.identifier || pack.name || '').trim(),
      telegramUrl: (pack.telegramUrl || `https://t.me/addstickers/${pack.identifier || ''}`).trim(),
      author: (pack.author || 'Anonymous').trim(),
      authorUrl: (pack.authorUrl || '').trim(),
      category: (pack.category || 'General').trim(),
      totalStickers: parseInt(pack.totalStickers, 10) || 30,
      animated: Boolean(pack.animated),
      thumbnail: (pack.thumbnail || (pack.previews && pack.previews[0]) || '').trim(),
      previews: Array.isArray(pack.previews) ? pack.previews : (pack.thumbnail ? [pack.thumbnail] : []),
      description: (pack.description || '').trim(),
      tags: Array.isArray(pack.tags) ? pack.tags : [],
      downloads: parseInt(pack.downloads, 10) || 0,
      rating: parseFloat(pack.rating) || 5.0
    };

    stickersCache.push(newPack);
    saveToDisk();
    return newPack;
  },

  update(id, updatedFields) {
    if (!id) return null;
    const query = String(id).toLowerCase().trim();
    const index = stickersCache.findIndex(p => p.id === id || p.identifier.toLowerCase() === query || p.id.toLowerCase() === query);
    if (index === -1) return null;

    const current = stickersCache[index];
    const updated = {
      ...current,
      ...updatedFields,
      id: current.id
    };

    if (updated.name) updated.name = updated.name.trim();
    if (updated.identifier) updated.identifier = updated.identifier.trim();
    if (updated.telegramUrl) updated.telegramUrl = updated.telegramUrl.trim();
    if (updated.author) updated.author = updated.author.trim();
    if (updated.category) updated.category = updated.category.trim();

    stickersCache[index] = updated;
    saveToDisk();
    return updated;
  },

  delete(id) {
    if (!id) return false;
    const query = String(id).toLowerCase().trim();
    const index = stickersCache.findIndex(p => p.id === id || p.identifier.toLowerCase() === query || p.id.toLowerCase() === query);
    if (index === -1) return false;

    stickersCache.splice(index, 1);
    saveToDisk();
    return true;
  }
};
