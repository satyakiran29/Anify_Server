import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.resolve('stickers.json');

// Memory cache for stickers
let stickersCache = [];

/**
 * Generates a deterministic hash ID based on the sticker pack details.
 */
function generateId(pack) {
  const uniqueStr = `${pack.identifier || ''}-${pack.name || ''}-${pack.category || ''}`;
  return crypto.createHash('md5').update(uniqueStr).digest('hex');
}

/**
 * Default seed sticker packs
 */
const DEFAULT_STICKER_PACKS = [
  {
    name: "Neko Pack 120",
    identifier: "nekostickerpack120",
    telegramUrl: "https://t.me/addstickers/nekostickerpack120",
    author: "Neko Telegram",
    authorUrl: "https://t.me/addstickers/nekostickerpack120",
    category: "Anime",
    totalStickers: 48,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png&w=200"
    ],
    description: "Cute Neko Anime expressions and reactions for your daily WhatsApp chats.",
    tags: ["neko", "anime", "cute", "cat", "waifu"],
    downloads: 12450,
    rating: 4.9
  },
  {
    name: "Kang Robot Anime Pack",
    identifier: "kang_5852054126_by_Sticker_kang_robot",
    telegramUrl: "https://t.me/addstickers/kang_5852054126_by_Sticker_kang_robot",
    author: "Sticker Kang Robot",
    authorUrl: "https://t.me/Sticker_kang_robot",
    category: "Anime",
    totalStickers: 30,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png&w=200"
    ],
    description: "Curated anime reaction pack kanged by Sticker Kang Robot.",
    tags: ["anime", "kang", "reactions", "robot", "manga"],
    downloads: 8720,
    rating: 4.8
  },
  {
    name: "Sousou No Frieren Anime",
    identifier: "SousouNoFrierenAnime",
    telegramUrl: "https://t.me/addstickers/SousouNoFrierenAnime",
    author: "Frieren Beyond Journey's End",
    authorUrl: "https://t.me/addstickers/SousouNoFrierenAnime",
    category: "Anime",
    totalStickers: 40,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/281.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/280.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/359.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/471.png&w=200"
    ],
    description: "Official Frieren, Fern, Stark, and Himmel meme and cute reaction stickers.",
    tags: ["frieren", "sousou no frieren", "fern", "stark", "anime", "fantasy", "cute"],
    downloads: 18930,
    rating: 5.0
  },
  {
    name: "Anime Waifus Extended",
    identifier: "animewaifus",
    telegramUrl: "https://t.me/addstickers/animewaifus",
    author: "Anime Studio",
    authorUrl: "https://t.me/addstickers/animewaifus",
    category: "Anime",
    totalStickers: 35,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png&w=200"
    ],
    description: "Top popular anime waifu expressions for chat.",
    tags: ["waifu", "anime", "cute", "girls"],
    downloads: 24100,
    rating: 4.9
  },
  {
    name: "Cat Memes Supreme",
    identifier: "catmemes",
    telegramUrl: "https://t.me/addstickers/catmemes",
    author: "Meme Cats Collective",
    authorUrl: "https://t.me/addstickers/catmemes",
    category: "Memes",
    totalStickers: 30,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/53.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/300.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/301.png&w=200"
    ],
    description: "Hilarious cat memes, cursed cats, and goofy felines.",
    tags: ["cats", "memes", "funny", "animals"],
    downloads: 31200,
    rating: 4.9
  },
  {
    name: "Genshin Impact Chibi",
    identifier: "genshinpack",
    telegramUrl: "https://t.me/addstickers/genshinpack",
    author: "Teyvat Stickers",
    authorUrl: "https://t.me/addstickers/genshinpack",
    category: "Gaming",
    totalStickers: 45,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/470.png&w=200"
    ],
    description: "Chibi Genshin Impact emotes for WhatsApp chats.",
    tags: ["genshin", "gaming", "chibi", "anime", "paimon"],
    downloads: 19800,
    rating: 4.8
  },
  {
    name: "Jujutsu Kaisen Memes & Emotes",
    identifier: "jjk_stickers",
    telegramUrl: "https://t.me/addstickers/jjk_stickers",
    author: "JJK Sorcerers",
    authorUrl: "https://t.me/addstickers/jjk_stickers",
    category: "Anime",
    totalStickers: 32,
    animated: false,
    thumbnail: "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png&w=200",
    previews: [
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png&w=200",
      "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png&w=200"
    ],
    description: "Gojo, Sukuna, Megumi, and Itadori stickers & reactions.",
    tags: ["jjk", "jujutsu kaisen", "gojo", "sukuna", "anime"],
    downloads: 27400,
    rating: 4.9
  }
];

/**
 * Loads stickers, deduplicates exact duplicates, ensures all have IDs, and saves if changed.
 */
export function initStickerDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_STICKER_PACKS, null, 2), 'utf8');
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, '');
  let rawList = [];
  try {
    rawList = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing stickers.json, seeding default stickers.', err);
    rawList = DEFAULT_STICKER_PACKS;
  }

  if (!rawList || rawList.length === 0) {
    rawList = DEFAULT_STICKER_PACKS;
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

  for (const defPack of DEFAULT_STICKER_PACKS) {
    const exists = cleanList.some(p => p.identifier.toLowerCase() === defPack.identifier.toLowerCase());
    if (!exists) {
      const seeded = {
        ...defPack,
        id: generateId(defPack)
      };
      cleanList.push(seeded);
      modified = true;
    }
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
    return stickersCache.find(p => p.id === idOrSlug || p.identifier.toLowerCase() === idOrSlug.toLowerCase());
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
    const index = stickersCache.findIndex(p => p.id === id || p.identifier.toLowerCase() === id.toLowerCase());
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
    const index = stickersCache.findIndex(p => p.id === id || p.identifier.toLowerCase() === id.toLowerCase());
    if (index === -1) return false;

    stickersCache.splice(index, 1);
    saveToDisk();
    return true;
  }
};
