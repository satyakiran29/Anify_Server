import { db } from '../utils/db.js';
import fs from 'fs';
import path from 'path';
import { getAdminToken } from '../middleware/auth.js';
import { triggerGitSync, getRawGithubUrl } from '../utils/gitSync.js';

// Helper to normalized strings for matching
const normalize = (str) => (str || '').toLowerCase().trim();

export const wallpaperController = {
  /**
   * Get paginated, searched, and sorted list of wallpapers.
   */
  getWallpapers(req, res, next) {
    try {
      let items = db.getAll();

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
          wallpapers: paginatedItems
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a single wallpaper by its unique ID.
   */
  getWallpaperById(req, res, next) {
    try {
      const { id } = req.params;
      const wp = db.getById(id);

      if (!wp) {
        return res.status(404).json({
          status: 'fail',
          message: `Wallpaper with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          wallpaper: wp
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get one or more random wallpapers.
   */
  getRandomWallpaper(req, res, next) {
    try {
      let items = db.getAll();
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
            wallpapers: []
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
          wallpapers: selected
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
      const items = db.getAll();
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
   * Get general server metrics.
   */
  getStats(req, res, next) {
    try {
      const items = db.getAll();
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
            totalWallpapers: items.length,
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
   * Create/upload a new wallpaper.
   */
  createWallpaper(req, res, next) {
    try {
      const { name, author, category, dimensions, copyright } = req.body;
      let url = req.body.url;
      let thumbnail = req.body.thumbnail;

      // Check if a file was uploaded via multer
      if (req.file) {
        const relativePath = `/uploads/${req.file.filename}`;
        url = getRawGithubUrl(relativePath) || relativePath;
        thumbnail = url;
      }

      // Validations
      if (!name || !category) {
        return res.status(400).json({
          status: 'fail',
          message: 'Wallpaper name and category are required fields.'
        });
      }

      if (!url) {
        return res.status(400).json({
          status: 'fail',
          message: 'An image file upload or external URL is required.'
        });
      }

      const newWp = db.add({
        name,
        author: author || 'Anonymous',
        url,
        thumbnail: thumbnail || url,
        dimensions: dimensions || '1080p',
        copyright: copyright || 'Free',
        category
      });

      triggerGitSync(`Admin: Added wallpaper - ${name}`);

      res.status(201).json({
        status: 'success',
        message: 'Wallpaper added successfully.',
        data: {
          wallpaper: newWp
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing wallpaper by ID.
   */
  updateWallpaper(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.getById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: `Wallpaper with ID ${id} not found.`
        });
      }

      const updateData = { ...req.body };

      // Check if a new file is uploaded
      if (req.file) {
        const relativePath = `/uploads/${req.file.filename}`;
        const githubUrl = getRawGithubUrl(relativePath) || relativePath;
        updateData.url = githubUrl;
        updateData.thumbnail = githubUrl;

        // Clean up the old uploaded file if it was a local asset
        if (existing.url && existing.url.startsWith('/uploads/')) {
          const oldFilePath = path.join('public', existing.url);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              console.log(`Deleted replaced local file: ${oldFilePath}`);
            } catch (err) {
              console.error(`Failed to delete replaced local file: ${oldFilePath}`, err);
            }
          }
        }
      }

      const updated = db.update(id, updateData);

      triggerGitSync(`Admin: Updated wallpaper - ${updated.name || id}`);

      res.status(200).json({
        status: 'success',
        message: 'Wallpaper updated successfully.',
        data: {
          wallpaper: updated
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a wallpaper by ID.
   */
  deleteWallpaper(req, res, next) {
    try {
      const { id } = req.params;
      const success = db.delete(id);

      if (!success) {
        return res.status(404).json({
          status: 'fail',
          message: `Wallpaper with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Wallpaper deleted successfully.'
      });

      triggerGitSync(`Admin: Deleted wallpaper - ${id}`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Admin Authentication / Login handler
   */
  loginAdmin(req, res, next) {
    try {
      const { password } = req.body;
      const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (!password || password !== expectedPassword) {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid password. Please try again.'
        });
      }

      const token = getAdminToken();

      res.status(200).json({
        status: 'success',
        message: 'Login successful.',
        data: {
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
