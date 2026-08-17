import { stickerDb } from '../utils/stickerDb.js';
import { triggerGitSync } from '../utils/gitSync.js';

// Helper to normalize strings for matching
const normalize = (str) => (str || '').toLowerCase().trim();

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

      items.forEach(pack => {
        if (pack.category) categories.add(pack.category);
        if (pack.author) authors.add(pack.author);
        totalDownloads += (pack.downloads || 0);
      });

      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalStickers: items.length,
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
   * Auto-fetch sticker pack metadata and previews from Telegram
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
      const tgRes = await fetch(tgUrl);
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

      for (let i = 0; i < Math.min(6, stickers.length); i++) {
        const s = stickers[i];
        try {
          const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${s.file_id}`);
          const fileData = await fileRes.json();
          if (fileData.ok && fileData.result?.file_path) {
            previews.push(`https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`);
          }
        } catch (_) {}
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
   * Create/Add a new sticker pack.
   */
  createStickerPack(req, res, next) {
    try {
      const { name, identifier, telegramUrl, author, authorUrl, category, totalStickers, animated, thumbnail, previews, description, tags } = req.body;

      if (!name || !identifier) {
        return res.status(400).json({
          status: 'fail',
          message: 'Sticker pack name and identifier are required.'
        });
      }

      // Convert previews string/array
      let previewList = [];
      if (Array.isArray(previews)) {
        previewList = previews;
      } else if (typeof previews === 'string' && previews.trim()) {
        previewList = previews.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      }

      // Convert tags string/array
      let tagList = [];
      if (Array.isArray(tags)) {
        tagList = tags;
      } else if (typeof tags === 'string' && tags.trim()) {
        tagList = tags.split(',').map(s => s.trim()).filter(Boolean);
      }

      const newPack = stickerDb.add({
        name,
        identifier,
        telegramUrl: telegramUrl || `https://t.me/addstickers/${identifier}`,
        author: author || 'Anonymous',
        authorUrl: authorUrl || '',
        category: category || 'General',
        totalStickers: parseInt(totalStickers, 10) || (previewList.length > 0 ? previewList.length : 30),
        animated: Boolean(animated),
        thumbnail: thumbnail || (previewList[0] || ''),
        previews: previewList,
        description: description || '',
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
  updateStickerPack(req, res, next) {
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
      if (typeof updateData.previews === 'string') {
        updateData.previews = updateData.previews.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      }
      if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(s => s.trim()).filter(Boolean);
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
   * Delete a sticker pack by ID or slug.
   */
  deleteStickerPack(req, res, next) {
    try {
      const { id } = req.params;
      const success = stickerDb.delete(id);

      if (!success) {
        return res.status(404).json({
          status: 'fail',
          message: `Sticker pack with ID/slug '${id}' not found.`
        });
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
