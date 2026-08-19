import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.resolve('banners.json');

// Memory cache for banners
let bannersCache = [];

/**
 * Generates a deterministic hash ID based on the banner details.
 */
function generateId(banner) {
  const uniqueStr = `${banner.title || ''}-${banner.subtitle || ''}-${banner.imageUrl || ''}-${Date.now()}-${Math.random()}`;
  return crypto.createHash('md5').update(uniqueStr).digest('hex');
}

/**
 * Initial starter banners if banners.json is empty or newly created.
 */
const DEFAULT_BANNERS = [
  {
    id: "b1-creative-lab",
    title: "Creative Lab",
    subtitle: "Experiment & personalize your device with custom tools",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tag: "🔥 FEATURED",
    actionType: "creative_lab",
    actionValue: "",
    active: true,
    order: 1
  },
  {
    id: "b2-amoled-walls",
    title: "AMOLED Wallpapers",
    subtitle: "Deep blacks & vibrant 4K aesthetic collections",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
    tag: "✨ 290+ WALLPAPERS",
    actionType: "wallpapers",
    actionValue: "",
    active: true,
    order: 2
  },
  {
    id: "b3-stickers-studio",
    title: "Sticker Studio",
    subtitle: "Convert Telegram & custom packs for WhatsApp in seconds",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    tag: "⚡ STICKERS",
    actionType: "stickers",
    actionValue: "",
    active: true,
    order: 3
  },
  {
    id: "b4-kwgt-setups",
    title: "KWGT Setups",
    subtitle: "Clean minimalist Android home screen widgets & presets",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    tag: "🎨 KWGT",
    actionType: "kwgt",
    actionValue: "",
    active: true,
    order: 4
  }
];

/**
 * Loads banners, validates, and initializes database.
 */
export function initBannerDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_BANNERS, null, 2), 'utf8');
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, '');
  let rawList = [];
  try {
    rawList = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing banners.json, initializing with default starter banners.', err);
    rawList = DEFAULT_BANNERS;
  }

  if (rawList.length === 0) {
    rawList = DEFAULT_BANNERS;
  }

  // Deduplicate and assign unique IDs
  const cleanList = [];
  let modified = false;

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    const standardized = {
      id: item.id || generateId(item),
      title: (item.title || 'Featured').trim(),
      subtitle: (item.subtitle || '').trim(),
      imageUrl: (item.imageUrl || '').trim(),
      tag: (item.tag || 'FEATURED').trim(),
      actionType: (item.actionType || 'none').trim(),
      actionValue: (item.actionValue || '').trim(),
      active: item.active !== false,
      order: typeof item.order === 'number' ? item.order : (i + 1),
      createdAt: item.createdAt || new Date().toISOString()
    };

    if (!item.id) modified = true;
    cleanList.push(standardized);
  }

  bannersCache = cleanList;

  if (modified) {
    saveToDisk();
    console.log(`Banner database self-healed: Total banners: ${bannersCache.length}`);
  } else {
    console.log(`Banner database loaded. Total banners: ${bannersCache.length}`);
  }
}

/**
 * Saves current memory cache back to banners.json.
 */
function saveToDisk() {
  fs.writeFileSync(DB_PATH, JSON.stringify(bannersCache, null, 2), 'utf8');
}

export const bannerDb = {
  getAll(includeInactive = false) {
    const list = includeInactive ? bannersCache : bannersCache.filter(b => b.active !== false);
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getById(id) {
    return bannersCache.find(b => b.id === id);
  },

  add(banner) {
    const newBanner = {
      id: banner.id || generateId(banner),
      title: (banner.title || 'Featured').trim(),
      subtitle: (banner.subtitle || '').trim(),
      imageUrl: (banner.imageUrl || '').trim(),
      tag: (banner.tag || 'FEATURED').trim(),
      actionType: (banner.actionType || 'none').trim(),
      actionValue: (banner.actionValue || '').trim(),
      active: banner.active !== false,
      order: typeof banner.order === 'number' ? banner.order : (bannersCache.length + 1),
      createdAt: new Date().toISOString()
    };

    bannersCache.push(newBanner);
    saveToDisk();
    return newBanner;
  },

  update(id, updatedFields) {
    const index = bannersCache.findIndex(b => b.id === id);
    if (index === -1) return null;

    const current = bannersCache[index];
    const updated = {
      ...current,
      ...updatedFields,
      id: current.id // Retain original ID
    };

    if (updated.title) updated.title = updated.title.trim();
    if (updated.subtitle) updated.subtitle = updated.subtitle.trim();
    if (updated.imageUrl) updated.imageUrl = updated.imageUrl.trim();
    if (updated.tag) updated.tag = updated.tag.trim();
    if (updated.actionType) updated.actionType = updated.actionType.trim();
    if (updated.actionValue) updated.actionValue = updated.actionValue.trim();
    if (typeof updated.order === 'number') updated.order = updated.order;
    if (typeof updated.active === 'boolean') updated.active = updated.active;

    bannersCache[index] = updated;
    saveToDisk();
    return updated;
  },

  delete(id) {
    const index = bannersCache.findIndex(b => b.id === id);
    if (index === -1) return false;

    const deletedItem = bannersCache[index];
    bannersCache.splice(index, 1);
    saveToDisk();

    // If locally uploaded file, delete from disk
    if (deletedItem.imageUrl && deletedItem.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join('public', deletedItem.imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted local banner image: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete local banner image: ${filePath}`, err);
        }
      }
    }

    return true;
  }
};
