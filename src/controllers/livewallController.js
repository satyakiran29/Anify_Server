import { liveDb } from '../utils/liveDb.js';
import fs from 'fs';
import path from 'path';
import { triggerGitSync, getRawGithubUrl } from '../utils/gitSync.js';

// Helper to normalized strings for matching
const normalize = (str) => (str || '').toLowerCase().trim();

export const livewallController = {
  /**
   * Get paginated, searched, and sorted list of live wallpapers.
   */
  getLivewalls(req, res, next) {
    try {
      let items = [...liveDb.getAll()].reverse();

      // 1. Filtering by Category
      const { category, search, sort, page, limit } = req.query;
      if (category) {
        const normCat = normalize(category);
        items = items.filter(wp => normalize(wp.category) === normCat);
      }

      // 2. Searching (name or author)
      if (search) {
        const query = normalize(search);
        items = items.filter(wp => 
          normalize(wp.name).includes(query) || 
          normalize(wp.author).includes(query)
        );
      }

      // 3. Sorting
      if (sort) {
        const normSort = normalize(sort);
        if (normSort === 'name') {
          items = [...items].sort((a, b) => a.name.localeCompare(b.name));
        } else if (normSort === 'category') {
          items = [...items].sort((a, b) => a.category.localeCompare(b.category));
        }
      }

      // 4. Pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = limit === '0' ? 0 : (parseInt(limit, 10) || 10);
      // limit=0 means return all items (admin use)
      const sanitizedLimit = limitNum === 0 ? 0 : Math.min(Math.max(limitNum, 1), 50);
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
          livewalls: paginatedItems
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a single live wallpaper by its unique ID.
   */
  getLivewallById(req, res, next) {
    try {
      const { id } = req.params;
      const wp = liveDb.getById(id);

      if (!wp) {
        return res.status(404).json({
          status: 'fail',
          message: `Live wallpaper with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          livewall: wp
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get one or more random live wallpapers.
   */
  getRandomLivewall(req, res, next) {
    try {
      let items = liveDb.getAll();
      const { category, limit } = req.query;

      // Filter pool if category provided
      if (category) {
        const normCat = normalize(category);
        items = items.filter(wp => normalize(wp.category) === normCat);
      }

      if (items.length === 0) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            livewalls: []
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
          livewalls: selected
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get unique categories list with counts.
   */
  getCategories(req, res, next) {
    try {
      const items = liveDb.getAll();
      const categoryCounts = {};

      items.forEach(wp => {
        const cat = wp.category || 'General';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const categories = Object.keys(categoryCounts).map(name => ({
        name,
        count: categoryCounts[name]
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
   * Get general server metrics for live wallpapers.
   */
  getStats(req, res, next) {
    try {
      const items = liveDb.getAll();
      const categories = new Set();
      const authors = new Set();

      items.forEach(wp => {
        if (wp.category) categories.add(wp.category);
        if (wp.author) authors.add(wp.author);
      });

      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalLivewalls: items.length,
            totalCategories: categories.size,
            totalAuthors: authors.size,
            serverUptimeSeconds: Math.floor(process.uptime())
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create/upload a new live wallpaper.
   */
  createLivewall(req, res, next) {
    try {
      const { name, author, category, dimensions, copyright } = req.body;
      let url = req.body.url;
      let thumbnail = req.body.thumbnail;

      // Check if files were uploaded via multer fields
      if (req.files) {
        if (req.files['video'] && req.files['video'][0]) {
          const rel = `/uploads/${req.files['video'][0].filename}`;
          url = getRawGithubUrl(rel) || rel;
        }
        if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
          const rel = `/uploads/${req.files['thumbnail'][0].filename}`;
          thumbnail = getRawGithubUrl(rel) || rel;
        }
      }

      // Validations
      if (!name || !category) {
        return res.status(400).json({
          status: 'fail',
          message: 'Live wallpaper name and category are required fields.'
        });
      }

      if (!url) {
        return res.status(400).json({
          status: 'fail',
          message: 'A video file upload or external URL is required.'
        });
      }

      const newWp = liveDb.add({
        name,
        author: author || 'Anonymous',
        url,
        thumbnail: thumbnail || url, // If no thumbnail file, fallback to video URL/path
        dimensions: dimensions || '1080x1920',
        copyright: copyright || 'Free',
        category
      });

      triggerGitSync(`Admin: Added live wallpaper - ${name}`);

      res.status(201).json({
        status: 'success',
        message: 'Live wallpaper added successfully.',
        data: {
          livewall: newWp
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing live wallpaper by ID.
   */
  updateLivewall(req, res, next) {
    try {
      const { id } = req.params;
      const existing = liveDb.getById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: `Live wallpaper with ID ${id} not found.`
        });
      }

      const updateData = { ...req.body };

      // Check if new files are uploaded via multer fields
      if (req.files) {
        // Video file update
        if (req.files['video'] && req.files['video'][0]) {
          const rel = `/uploads/${req.files['video'][0].filename}`;
          updateData.url = getRawGithubUrl(rel) || rel;
          
          // Clean up old local video file if it was a local asset
          if (existing.url && existing.url.startsWith('/uploads/')) {
            const oldFilePath = path.join('public', existing.url);
            if (fs.existsSync(oldFilePath)) {
              try {
                fs.unlinkSync(oldFilePath);
                console.log(`Deleted replaced local video file: ${oldFilePath}`);
              } catch (err) {
                console.error(`Failed to delete replaced local video file: ${oldFilePath}`, err);
              }
            }
          }
        }

        // Thumbnail file update
        if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
          const rel = `/uploads/${req.files['thumbnail'][0].filename}`;
          updateData.thumbnail = getRawGithubUrl(rel) || rel;

          // Clean up old local thumbnail file if it was a local asset and not identical to the video URL
          if (existing.thumbnail && existing.thumbnail.startsWith('/uploads/') && existing.thumbnail !== existing.url) {
            const oldThumbPath = path.join('public', existing.thumbnail);
            if (fs.existsSync(oldThumbPath)) {
              try {
                fs.unlinkSync(oldThumbPath);
                console.log(`Deleted replaced local thumbnail file: ${oldThumbPath}`);
              } catch (err) {
                console.error(`Failed to delete replaced local thumbnail file: ${oldThumbPath}`, err);
              }
            }
          }
        }
      }

      const updated = liveDb.update(id, updateData);

      triggerGitSync(`Admin: Updated live wallpaper - ${updated.name || id}`);

      res.status(200).json({
        status: 'success',
        message: 'Live wallpaper updated successfully.',
        data: {
          livewall: updated
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a live wallpaper by ID.
   */
  deleteLivewall(req, res, next) {
    try {
      const { id } = req.params;
      const success = liveDb.delete(id);

      if (!success) {
        return res.status(404).json({
          status: 'fail',
          message: `Live wallpaper with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Live wallpaper deleted successfully.'
      });

      triggerGitSync(`Admin: Deleted live wallpaper - ${id}`);
    } catch (err) {
      next(err);
    }
  }
};
