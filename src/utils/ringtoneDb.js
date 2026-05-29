import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.resolve('ringtones.json');

// Memory cache for ringtones
let ringtonesCache = [];

/**
 * Generates a deterministic hash ID based on the ringtone's details.
 */
function generateId(rt) {
  const uniqueStr = `${rt.name || ''}-${rt.author || ''}-${rt.url || ''}`;
  return crypto.createHash('md5').update(uniqueStr).digest('hex');
}

/**
 * Loads ringtones, deduplicates exact duplicates, ensures all have IDs, and saves if changed.
 */
export function initRingtoneDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf8');
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, '');
  let rawList = [];
  try {
    rawList = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing ringtones.json, starting with empty database.', err);
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
      duration: (item.duration || '0:30').trim()
    };

    // Calculate a fingerprint to find duplicates
    const fingerprint = `${standardized.name}::${standardized.author}::${standardized.url}`;
    
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

  ringtonesCache = cleanList;

  if (modified) {
    saveToDisk();
    console.log(`Ringtone database self-healed: Cleaned duplicates/missing IDs. Total ringtones: ${ringtonesCache.length}`);
  } else {
    console.log(`Ringtone database loaded. Total ringtones: ${ringtonesCache.length}`);
  }
}

/**
 * Saves current memory cache back to ringtones.json.
 */
function saveToDisk() {
  fs.writeFileSync(DB_PATH, JSON.stringify(ringtonesCache, null, 2), 'utf8');
}

export const ringtoneDb = {
  getAll() {
    return ringtonesCache;
  },

  getById(id) {
    return ringtonesCache.find(rt => rt.id === id);
  },

  add(rt) {
    const newRt = {
      id: rt.id || generateId(rt),
      name: (rt.name || 'Untitled').trim(),
      author: (rt.author || 'Anonymous').trim(),
      url: (rt.url || '').trim(),
      duration: (rt.duration || '0:30').trim()
    };

    ringtonesCache.push(newRt);
    saveToDisk();
    return newRt;
  },

  update(id, updatedFields) {
    const index = ringtonesCache.findIndex(rt => rt.id === id);
    if (index === -1) return null;

    const current = ringtonesCache[index];
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
    if (updated.duration) updated.duration = updated.duration.trim();

    ringtonesCache[index] = updated;
    saveToDisk();
    return updated;
  },

  delete(id) {
    const index = ringtonesCache.findIndex(rt => rt.id === id);
    if (index === -1) return false;

    const deletedItem = ringtonesCache[index];
    ringtonesCache.splice(index, 1);
    saveToDisk();

    // If the audio file is a local upload, clean it up
    if (deletedItem.url && deletedItem.url.startsWith('/uploads/')) {
      const filePath = path.join('public', deletedItem.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted local ringtone file: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete local file: ${filePath}`, err);
        }
      }
    }

    return true;
  }
};
