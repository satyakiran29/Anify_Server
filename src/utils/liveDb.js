import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.resolve('livewalls.json');

// Memory cache for live wallpapers
let livewallsCache = [];

/**
 * Generates a deterministic hash ID based on the live wallpaper's details.
 */
function generateId(wp) {
  const uniqueStr = `${wp.name || ''}-${wp.author || ''}-${wp.url || ''}-${wp.category || ''}`;
  return crypto.createHash('md5').update(uniqueStr).digest('hex');
}

/**
 * Loads live wallpapers, deduplicates exact duplicates, ensures all have IDs, and saves if changed.
 */
export function initLiveDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf8');
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, '');
  let rawList = [];
  try {
    rawList = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing livewalls.json, starting with empty database.', err);
    rawList = [];
  }

  // Deduplicate and assign unique IDs
  const seen = new Set();
  const cleanList = [];
  let modified = false;

  for (const item of rawList) {
    // Standardize object properties
    const standardized = {
      id: item.id || '',
      name: (item.name || '').trim(),
      author: (item.author || '').trim(),
      url: (item.url || '').trim(),
      thumbnail: (item.thumbnail || '').trim(),
      dimensions: (item.dimensions || '1080x1920').trim(),
      copyright: (item.copyright || 'Free').trim(),
      category: (item.category || 'General').trim()
    };

    // Calculate a fingerprint to find duplicates
    const fingerprint = `${standardized.name}::${standardized.author}::${standardized.url}::${standardized.category}`;
    
    if (seen.has(fingerprint)) {
      modified = true; // Exclude duplicate
      continue;
    }
    seen.add(fingerprint);

    // If ID is missing, generate one
    if (!standardized.id) {
      standardized.id = generateId(standardized);
      modified = true;
    }

    cleanList.push(standardized);
  }

  livewallsCache = cleanList;

  if (modified) {
    saveToDisk();
    console.log(`Live database self-healed: Cleaned duplicates/missing IDs. Total live wallpapers: ${livewallsCache.length}`);
  } else {
    console.log(`Live database loaded. Total live wallpapers: ${livewallsCache.length}`);
  }
}

/**
 * Saves current memory cache back to livewalls.json.
 */
function saveToDisk() {
  fs.writeFileSync(DB_PATH, JSON.stringify(livewallsCache, null, 2), 'utf8');
}

export const liveDb = {
  getAll() {
    return livewallsCache;
  },

  getById(id) {
    return livewallsCache.find(wp => wp.id === id);
  },

  add(wp) {
    const newWp = {
      id: wp.id || generateId(wp),
      name: (wp.name || 'Untitled').trim(),
      author: (wp.author || 'Anonymous').trim(),
      url: (wp.url || '').trim(),
      thumbnail: (wp.thumbnail || '').trim(),
      dimensions: (wp.dimensions || '1080x1920').trim(),
      copyright: (wp.copyright || 'Free').trim(),
      category: (wp.category || 'General').trim()
    };

    livewallsCache.push(newWp);
    saveToDisk();
    return newWp;
  },

  update(id, updatedFields) {
    const index = livewallsCache.findIndex(wp => wp.id === id);
    if (index === -1) return null;

    const current = livewallsCache[index];
    const updated = {
      ...current,
      ...updatedFields,
      // Keep original ID
      id: current.id
    };

    // Clean fields
    if (updated.name) updated.name = updated.name.trim();
    if (updated.author) updated.author = updated.author.trim();
    if (updated.url) updated.url = updated.url.trim();
    if (updated.thumbnail) updated.thumbnail = updated.thumbnail.trim();
    if (updated.dimensions) updated.dimensions = updated.dimensions.trim();
    if (updated.copyright) updated.copyright = updated.copyright.trim();
    if (updated.category) updated.category = updated.category.trim();

    livewallsCache[index] = updated;
    saveToDisk();
    return updated;
  },

  delete(id) {
    const index = livewallsCache.findIndex(wp => wp.id === id);
    if (index === -1) return false;

    const deletedItem = livewallsCache[index];
    livewallsCache.splice(index, 1);
    saveToDisk();

    // If the video file is a local upload, clean it up
    if (deletedItem.url && deletedItem.url.startsWith('/uploads/')) {
      const filePath = path.join('public', deletedItem.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted local live video file: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete local file: ${filePath}`, err);
        }
      }
    }

    // If the thumbnail is a local upload, clean it up too
    if (deletedItem.thumbnail && deletedItem.thumbnail.startsWith('/uploads/') && deletedItem.thumbnail !== deletedItem.url) {
      const thumbPath = path.join('public', deletedItem.thumbnail);
      if (fs.existsSync(thumbPath)) {
        try {
          fs.unlinkSync(thumbPath);
          console.log(`Deleted local live thumbnail file: ${thumbPath}`);
        } catch (err) {
          console.error(`Failed to delete local thumbnail: ${thumbPath}`, err);
        }
      }
    }

    return true;
  }
};
