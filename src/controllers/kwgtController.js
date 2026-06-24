import { kwgtDb as db } from '../utils/kwgtDb.js';
import fs from 'fs';
import path from 'path';
import { getAdminToken } from '../middleware/auth.js';
import { triggerGitSync, getRawGithubUrl } from '../utils/gitSync.js';

// Helper to normalized strings for matching
const normalize = (str) => (str || '').toLowerCase().trim();

export const kwgtController = {
  /**
   * Get paginated, searched, and sorted list of kwgts.
   */
  getKwgts(req, res, next) {
    try {
      let items = [...db.getAll()].reverse();

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
      const limitNum = limit === '0' ? 0 : (parseInt(limit, 10) || 1000);
      // limit=0 means return all items (admin use)
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
          kwgts: paginatedItems
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a single kwgt by its unique ID.
   */
  getKwgtById(req, res, next) {
    try {
      const { id } = req.params;
      const wp = db.getById(id);

      if (!wp) {
        return res.status(404).json({
          status: 'fail',
          message: `KWGT with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          kwgt: wp
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get one or more random kwgts.
   */
  getRandomKwgt(req, res, next) {
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
            kwgts: []
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
          kwgts: selected
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get unique categories list with counts and an icon/image.
   */
  getCategories(req, res, next) {
    try {
      const items = db.getAll();
      const categoryData = {};

      items.forEach(wp => {
        const cat = wp.category || 'General';
        if (!categoryData[cat]) {
          categoryData[cat] = {
            count: 0,
            icon: wp.thumbnail || wp.url || ''
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
            totalKwgts: items.length,
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
   * Create/upload a new kwgt.
   */
  createKwgt(req, res, next) {
    try {
      const { name, author, authorUrl, category, copyright } = req.body;
      let url = req.body.url;
      let thumbnail = req.body.thumbnail;

      const createdItems = [];

      // Check if files were uploaded via multer fields
      if (req.files && req.files.file && req.files.file.length > 0) {
        if (!category) {
          return res.status(400).json({
            status: 'fail',
            message: 'KWGT category is required for uploads.'
          });
        }

        const uploadedThumb = req.files.thumbnail && req.files.thumbnail.length > 0 ? req.files.thumbnail[0] : null;
        let thumbUrl = thumbnail || url;
        if (uploadedThumb) {
          const tPath = `/uploads/${uploadedThumb.filename}`;
          thumbUrl = getRawGithubUrl(tPath) || tPath;
        }

        for (let i = 0; i < req.files.file.length; i++) {
          const file = req.files.file[i];
          const relativePath = `/uploads/${file.filename}`;
          const fileUrl = getRawGithubUrl(relativePath) || relativePath;

          // Determine name:
          let wpName = '';
          if (name) {
            wpName = req.files.file.length > 1 ? `${name} - ${i + 1}` : name;
          } else {
            const ext = path.extname(file.originalname);
            wpName = path.basename(file.originalname, ext);
          }

          const newWp = db.add({
            name: wpName,
            author: author || 'Anonymous',
            authorUrl: authorUrl || '',
            url: fileUrl,
            thumbnail: thumbUrl || fileUrl,
            copyright: copyright || 'Free',
            category
          });
          createdItems.push(newWp);
        }

        // Trigger a single Git sync for the group upload
        const groupName = name || `${req.files.file.length} kwgts`;
        triggerGitSync(`Admin: Added group kwgts - ${groupName}`);

        return res.status(201).json({
          status: 'success',
          message: `${req.files.file.length} kwgts added successfully.`,
          data: {
            kwgts: createdItems
          }
        });
      }

      // Fallback/standard URL upload
      if (!name || !category) {
        return res.status(400).json({
          status: 'fail',
          message: 'KWGT name and category are required fields.'
        });
      }

      if (!url) {
        return res.status(400).json({
          status: 'fail',
          message: 'A file upload or external URL is required.'
        });
      }

      const newWp = db.add({
        name,
        author: author || 'Anonymous',
        authorUrl: authorUrl || '',
        url,
        thumbnail: thumbnail || url,
        copyright: copyright || 'Free',
        category
      });

      triggerGitSync(`Admin: Added kwgt - ${name}`);

      res.status(201).json({
        status: 'success',
        message: 'KWGT added successfully.',
        data: {
          kwgt: newWp
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing kwgt by ID.
   */
  updateKwgt(req, res, next) {
    try {
      const { id } = req.params;
      const existing = db.getById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: `KWGT with ID ${id} not found.`
        });
      }

      const updateData = { ...req.body };

      // Check if a new file is uploaded
      if (req.files) {
        if (req.files.file && req.files.file.length > 0) {
          const file = req.files.file[0];
          const relativePath = `/uploads/${file.filename}`;
          const githubUrl = getRawGithubUrl(relativePath) || relativePath;
          updateData.url = githubUrl;

          if (existing.url && existing.url.startsWith('/uploads/')) {
            const oldFilePath = path.join('public', existing.url);
            if (fs.existsSync(oldFilePath)) {
              try { fs.unlinkSync(oldFilePath); } catch (err) {}
            }
          }
        }
        if (req.files.thumbnail && req.files.thumbnail.length > 0) {
          const thumb = req.files.thumbnail[0];
          const relativePath = `/uploads/${thumb.filename}`;
          const githubUrl = getRawGithubUrl(relativePath) || relativePath;
          updateData.thumbnail = githubUrl;

          if (existing.thumbnail && existing.thumbnail.startsWith('/uploads/')) {
            const oldFilePath = path.join('public', existing.thumbnail);
            if (fs.existsSync(oldFilePath)) {
              try { fs.unlinkSync(oldFilePath); } catch (err) {}
            }
          }
        }
      }

      const updated = db.update(id, updateData);

      triggerGitSync(`Admin: Updated kwgt - ${updated.name || id}`);

      res.status(200).json({
        status: 'success',
        message: 'KWGT updated successfully.',
        data: {
          kwgt: updated
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a kwgt by ID.
   */
  deleteKwgt(req, res, next) {
    try {
      const { id } = req.params;
      const success = db.delete(id);

      if (!success) {
        return res.status(404).json({
          status: 'fail',
          message: `KWGT with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'KWGT deleted successfully.'
      });

      triggerGitSync(`Admin: Deleted kwgt - ${id}`);
    } catch (err) {
      next(err);
    }
  }
};
