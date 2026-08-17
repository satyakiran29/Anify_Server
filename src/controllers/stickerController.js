import fs from 'fs';
import path from 'path';
import { stickerDb } from '../utils/stickerDb.js';
import { triggerGitSync, getRawGithubUrl } from '../utils/gitSync.js';
import { downloadAndConvertToWebp } from '../utils/stickerConverter.js';

// Helper to normalize strings for matching
const normalize = (str) => (str || '').toLowerCase().trim();

/**
 * Helper to fetch pack info and sticker count from Telegram
 */
async function fetchTelegramSetInfo(packIdentifier, botToken) {
  try {
    const token = (botToken || process.env.TELEGRAM_BOT_TOKEN || '8882853635:AAErWEKyhb5ESo8ffWrHiO5-udSnnMwUTBk').trim();
    const cleanSlug = packIdentifier.replace(/^(?:https?:\/\/)?t\.me\/addstickers\//i, '').replace(/\/.*$/, '').trim();
    
    const tgUrl = `https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(cleanSlug)}`;
    const tgRes = await fetch(tgUrl, { signal: AbortSignal.timeout(6000) });
    const tgData = await tgRes.json();

    if (tgData.ok && tgData.result) {
      const set = tgData.result;
      const stickers = set.stickers || [];
      return {
        ok: true,
        title: set.title || cleanSlug,
        identifier: cleanSlug,
        telegramUrl: `https://t.me/addstickers/${cleanSlug}`,
        totalStickers: stickers.length,
        animated: Boolean(set.is_animated || set.is_video),
        stickers,
        thumbnail: set.thumbnail || set.thumb || null
      };
    }
  } catch (err) {
    console.warn(`[StickerController] Telegram fetch failed for ${packIdentifier}:`, err.message);
  }
  return { ok: false };
}

export const stickerController = {
  /**
   * Get paginated, searched, and sorted list of sticker packs.
   */
  getStickers(req, res, next) {
    try {
      let items = [...stickerDb.getAll()].reverse();

      // 1. Filtering by Category
      const { category, search, sort, page, limit } = req.query;
      if (category && category !== 'All') {
        const normCat = normalize(category);
        items = items.filter(pack => normalize(pack.category) === normCat);
      }

      // 2. Searching (name, identifier, author, tags)
      if (search) {
        const query = normalize(search);
        items = items.filter(pack =>
          normalize(pack.name).includes(query) ||
          normalize(pack.identifier).includes(query) ||
          normalize(pack.author).includes(query) ||
          (Array.isArray(pack.tags) && pack.tags.some(t => normalize(t).includes(query)))
        );
      }

      // 3. Sorting
      if (sort) {
        const normSort = normalize(sort);
        if (normSort === 'name') {
          items = [...items].sort((a, b) => a.name.localeCompare(b.name));
        } else if (normSort === 'category') {
          items = [...items].sort((a, b) => a.category.localeCompare(b.category));
        } else if (normSort === 'downloads') {
          items = [...items].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        } else if (normSort === 'rating') {
          items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
      }

      // 4. Pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = limit === '0' ? 0 : (parseInt(limit, 10) || 12);
      const sanitizedLimit = limitNum === 0 ? 0 : Math.min(Math.max(limitNum, 1), 1000);
      const totalItems = items.length;
      const paginatedItems = sanitizedLimit === 0 ? items : items.slice((pageNum - 1) * sanitizedLimit, pageNum * sanitizedLimit);
      const totalPages = sanitizedLimit === 0 ? 1 : Math.ceil(totalItems / sanitizedLimit);

      res.status(200).json({
        status: 'success',
        results: paginatedItems.length,
        pagination: {
          total: totalItems,
          page: pageNum,
          limit: sanitizedLimit,
          pages: totalPages
        },
        data: {
          stickers: paginatedItems
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a single sticker pack by its unique ID or identifier slug.
   */
  getStickerById(req, res, next) {
    try {
      const { id } = req.params;
      const item = stickerDb.getById(id);

      if (!item) {
        return res.status(404).json({
          status: 'fail',
          message: `Sticker pack with ID/slug '${id}' not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          sticker: item
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get random sticker packs.
   */
  getRandomStickers(req, res, next) {
    try {
      const { category, limit = 5 } = req.query;
      let items = [...stickerDb.getAll()];

      if (category && category !== 'All') {
        const normCat = normalize(category);
        items = items.filter(pack => normalize(pack.category) === normCat);
      }

      if (items.length === 0) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            stickers: []
          }
        });
      }

      const limitNum = parseInt(limit, 10) || 1;
      const count = Math.min(Math.max(limitNum, 1), items.length);
      const selected = [];
      const tempPool = [...items];

      for (let i = 0; i < count; i++) {
        const randIndex = Math.floor(Math.random() * tempPool.length);
        selected.push(tempPool.splice(randIndex, 1)[0]);
      }

      res.status(200).json({
        status: 'success',
        results: selected.length,
        data: {
          stickers: selected
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get unique categories list with counts and preview icon.
   */
  getCategories(req, res, next) {
    try {
      const items = stickerDb.getAll();
      const categoryData = {};

      items.forEach(pack => {
        const cat = pack.category || 'General';
        if (!categoryData[cat]) {
          categoryData[cat] = {
            count: 0,
            icon: pack.thumbnail || (pack.previews && pack.previews[0]) || ''
          };
        }
        categoryData[cat].count += 1;
      });

      const categories = Object.keys(categoryData).map(name => ({
        name,
        count: categoryData[name].count,
        icon: categoryData[name].icon
      })).sort((a, b) => a.name.localeCompare(b.name));

      res.status(200).json({
        status: 'success',
        data: {
          categories
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get general metrics for Sticker Store.
   */
  getStats(req, res, next) {
    try {
      const items = stickerDb.getAll();
      const categories = new Set();
      const authors = new Set();
      let totalDownloads = 0;
      let totalIndividualStickers = 0;

      items.forEach(pack => {
        if (pack.category) categories.add(pack.category);
        if (pack.author) authors.add(pack.author);
        totalDownloads += (pack.downloads || 0);
        totalIndividualStickers += (parseInt(pack.totalStickers, 10) || (pack.previews ? pack.previews.length : 30));
      });

      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalStickers: items.length,
            totalPacks: items.length,
            totalIndividualStickers,
            totalCategories: categories.size,
            totalAuthors: authors.size,
            totalDownloads,
            serverUptimeSeconds: Math.floor(process.uptime())
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Auto-fetch sticker pack metadata, preview URLs, and convert video .webm stickers to clean .webp
   */
  async autoFetchTelegram(req, res, next) {
    try {
      const { packNameOrUrl, botToken } = req.body;
      const token = (botToken || process.env.TELEGRAM_BOT_TOKEN || '8882853635:AAErWEKyhb5ESo8ffWrHiO5-udSnnMwUTBk').trim();

      if (!packNameOrUrl) {
        return res.status(400).json({
          status: 'fail',
          message: 'Telegram pack URL or name is required.'
        });
      }

      const trimmed = packNameOrUrl.trim();
      const match = trimmed.match(/(?:https?:\/\/)?t\.me\/addstickers\/([\w]+)/i);
      const packName = match ? match[1] : trimmed.split('/').pop().trim();

      const tgUrl = `https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(packName)}`;
      const tgRes = await fetch(tgUrl, { signal: AbortSignal.timeout(8000) });
      const tgData = await tgRes.json();

      if (!tgData.ok || !tgData.result) {
        return res.status(400).json({
          status: 'fail',
          message: tgData.description || 'Sticker set not found on Telegram.'
        });
      }

      const resultSet = tgData.result;
      const stickers = resultSet.stickers || [];
      const previews = [];

      // Download and convert previews to clean .webp files
      for (let i = 0; i < Math.min(8, stickers.length); i++) {
        const s = stickers[i];
        try {
          // If sticker has a static thumbnail file, prefer it for speed/quality
          const fileId = (s.thumbnail?.file_id || s.thumb?.file_id) || s.file_id;
          const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`, { signal: AbortSignal.timeout(5000) });
          const fileData = await fileRes.json();

          if (fileData.ok && fileData.result?.file_path) {
            const rawFileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
            const webpUrl = await downloadAndConvertToWebp(rawFileUrl, packName, `preview_${i}.webp`);
            previews.push(webpUrl || rawFileUrl);
          }
        } catch (itemErr) {
          console.warn(`[StickerController] Failed to process preview ${i} for ${packName}:`, itemErr.message);
        }
      }

      const thumbnail = previews[0] || '';

      res.status(200).json({
        status: 'success',
        data: {
          name: resultSet.title || packName,
          identifier: packName,
          telegramUrl: `https://t.me/addstickers/${packName}`,
          totalStickers: stickers.length,
          animated: Boolean(resultSet.is_animated || resultSet.is_video),
          thumbnail,
          previews
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create/Add a new sticker pack with previews converted to .webp in public/stickers/{pack}
   */
  async createStickerPack(req, res, next) {
    try {
      const { name, identifier, telegramUrl, author, authorUrl, category, animated, thumbnail, previews, description, tags } = req.body;
      let totalStickers = parseInt(req.body.totalStickers, 10) || 0;

      if (!name) {
        return res.status(400).json({
          status: 'fail',
          message: 'Sticker pack name is required.'
        });
      }

      const cleanSlug = (identifier || telegramUrl || name).replace(/^(?:https?:\/\/)?t\.me\/addstickers\//i, '').replace(/\/.*$/, '').trim();

      // Convert previews string/array
      let previewList = [];
      if (Array.isArray(previews)) {
        previewList = previews.filter(Boolean);
      } else if (typeof previews === 'string' && previews.trim()) {
        previewList = previews.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      }

      // Convert and save all previews to .webp
      const savedPreviews = [];
      for (let i = 0; i < previewList.length; i++) {
        const pUrl = previewList[i];
        if (pUrl.startsWith('http://') || pUrl.startsWith('https://')) {
          const webpUrl = await downloadAndConvertToWebp(pUrl, cleanSlug, `preview_${i}.webp`);
          savedPreviews.push(webpUrl);
        } else {
          savedPreviews.push(pUrl);
        }
      }

      // Automatically calculate sticker count if missing
      if (totalStickers <= 0) {
        if (cleanSlug) {
          const tgInfo = await fetchTelegramSetInfo(cleanSlug);
          if (tgInfo.ok && tgInfo.totalStickers > 0) {
            totalStickers = tgInfo.totalStickers;
          }
        }
        if (totalStickers <= 0) {
          totalStickers = savedPreviews.length > 0 ? savedPreviews.length : 30;
        }
      }

      // Convert tags string/array
      let tagList = [];
      if (Array.isArray(tags)) {
        tagList = tags;
      } else if (typeof tags === 'string' && tags.trim()) {
        tagList = tags.split(',').map(s => s.trim()).filter(Boolean);
      }

      let finalThumb = (thumbnail || (savedPreviews[0] || '')).trim();
      if (finalThumb.startsWith('http://') || finalThumb.startsWith('https://')) {
        finalThumb = await downloadAndConvertToWebp(finalThumb, cleanSlug, `thumbnail.webp`);
      }

      const newPack = stickerDb.add({
        name: name.trim(),
        identifier: cleanSlug || name.trim(),
        telegramUrl: telegramUrl || (cleanSlug ? `https://t.me/addstickers/${cleanSlug}` : ''),
        author: (author || 'Anonymous').trim(),
        authorUrl: (authorUrl || '').trim(),
        category: (category || 'General').trim(),
        totalStickers,
        animated: Boolean(animated),
        thumbnail: finalThumb,
        previews: savedPreviews,
        description: (description || '').trim(),
        tags: tagList,
        downloads: 0,
        rating: 5.0
      });

      triggerGitSync(`Admin: Added sticker pack - ${name}`);

      res.status(201).json({
        status: 'success',
        message: 'Sticker pack added successfully.',
        data: {
          sticker: newPack
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing sticker pack by ID or slug.
   */
  async updateStickerPack(req, res, next) {
    try {
      const { id } = req.params;
      const existing = stickerDb.getById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: `Sticker pack with ID/slug '${id}' not found.`
        });
      }

      const updateData = { ...req.body };
      const slug = updateData.identifier || existing.identifier || existing.id;

      if (typeof updateData.previews === 'string') {
        updateData.previews = updateData.previews.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      }

      if (Array.isArray(updateData.previews)) {
        const savedPreviews = [];
        for (let i = 0; i < updateData.previews.length; i++) {
          const pUrl = updateData.previews[i];
          if (pUrl.startsWith('http://') || pUrl.startsWith('https://')) {
            const webpUrl = await downloadAndConvertToWebp(pUrl, slug, `preview_${i}.webp`);
            savedPreviews.push(webpUrl);
          } else {
            savedPreviews.push(pUrl);
          }
        }
        updateData.previews = savedPreviews;
      }

      if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Auto calculate count if 0 or missing
      if (!updateData.totalStickers || parseInt(updateData.totalStickers, 10) <= 0) {
        if (slug) {
          const tgInfo = await fetchTelegramSetInfo(slug);
          if (tgInfo.ok && tgInfo.totalStickers > 0) {
            updateData.totalStickers = tgInfo.totalStickers;
          }
        }
        if (!updateData.totalStickers) {
          updateData.totalStickers = updateData.previews ? updateData.previews.length : existing.totalStickers;
        }
      } else {
        updateData.totalStickers = parseInt(updateData.totalStickers, 10);
      }

      const updated = stickerDb.update(id, updateData);

      triggerGitSync(`Admin: Updated sticker pack - ${updated.name || id}`);

      res.status(200).json({
        status: 'success',
        message: 'Sticker pack updated successfully.',
        data: {
          sticker: updated
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a sticker pack and clean up public/stickers/{pack} directory.
   */
  deleteStickerPack(req, res, next) {
    try {
      const { id } = req.params;
      const existing = stickerDb.getById(id);
      const success = stickerDb.delete(id);

      if (!success) {
        return res.status(404).json({
          status: 'fail',
          message: `Sticker pack with ID/slug '${id}' not found.`
        });
      }

      // Delete folder public/stickers/{packSlug}
      if (existing) {
        const slug = existing.identifier || existing.id;
        const packDir = path.join(process.cwd(), 'public', 'stickers', slug);
        if (fs.existsSync(packDir)) {
          try {
            fs.rmSync(packDir, { recursive: true, force: true });
          } catch (err) {
            console.warn(`[StickerController] Could not remove sticker dir ${packDir}:`, err.message);
          }
        }
      }

      triggerGitSync(`Admin: Deleted sticker pack - ${id}`);

      res.status(200).json({
        status: 'success',
        message: 'Sticker pack deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};
