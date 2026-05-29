import { ringtoneDb } from '../utils/ringtoneDb.js';
import fs from 'fs';
import path from 'path';
import { triggerGitSync, getRawGithubUrl } from '../utils/gitSync.js';

// Helper to normalized strings for matching
const normalize = (str) => (str || '').toLowerCase().trim();

export const ringtoneController = {
  /**
   * Get paginated, searched, and sorted list of ringtones.
   */
  getRingtones(req, res, next) {
    try {
      let items = [...ringtoneDb.getAll()].reverse();

      // 1. Searching (name or author)
      const { search, sort, page, limit } = req.query;
      if (search) {
        const query = normalize(search);
        items = items.filter(rt => 
          normalize(rt.name).includes(query) || 
          normalize(rt.author).includes(query)
        );
      }

      // 2. Sorting
      if (sort) {
        const normSort = normalize(sort);
        if (normSort === 'name') {
          items = [...items].sort((a, b) => a.name.localeCompare(b.name));
        } else if (normSort === 'author') {
          items = [...items].sort((a, b) => a.author.localeCompare(b.author));
        }
      }

      // 3. Pagination
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
          ringtones: paginatedItems
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a single ringtone by its unique ID.
   */
  getRingtoneById(req, res, next) {
    try {
      const { id } = req.params;
      const rt = ringtoneDb.getById(id);

      if (!rt) {
        return res.status(404).json({
          status: 'fail',
          message: `Ringtone with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          ringtone: rt
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get one or more random ringtones.
   */
  getRandomRingtone(req, res, next) {
    try {
      let items = ringtoneDb.getAll();
      const { limit } = req.query;

      if (items.length === 0) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            ringtones: []
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
          ringtones: selected
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get general server metrics for ringtones.
   */
  getStats(req, res, next) {
    try {
      const items = ringtoneDb.getAll();
      const authors = new Set();

      items.forEach(rt => {
        if (rt.author) authors.add(rt.author);
      });

      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalRingtones: items.length,
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
   * Create/upload a new ringtone.
   */
  createRingtone(req, res, next) {
    try {
      const { name, author, duration } = req.body;
      let url = req.body.url;

      const createdRingtones = [];

      // Check if files were uploaded via multer (group upload)
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const relativePath = `/uploads/${file.filename}`;
          const fileUrl = getRawGithubUrl(relativePath) || relativePath;

          // Determine ringtone name:
          // If name is provided: "Name - 1", "Name - 2", etc.
          // Otherwise, use original filename without extension
          let rtName = '';
          if (name) {
            rtName = req.files.length > 1 ? `${name} - ${i + 1}` : name;
          } else {
            const ext = path.extname(file.originalname);
            rtName = path.basename(file.originalname, ext);
          }

          const newRt = ringtoneDb.add({
            name: rtName,
            author: author || 'Anonymous',
            url: fileUrl,
            duration: duration || '0:30'
          });
          createdRingtones.push(newRt);
        }

        // Trigger a single Git sync for the group upload
        const groupName = name || `${req.files.length} ringtones`;
        triggerGitSync(`Admin: Added group ringtones - ${groupName}`);

        return res.status(201).json({
          status: 'success',
          message: `${req.files.length} ringtones added successfully.`,
          data: {
            ringtones: createdRingtones
          }
        });
      }

      // Fallback/standard URL upload
      if (!name) {
        return res.status(400).json({
          status: 'fail',
          message: 'Ringtone name is a required field.'
        });
      }

      if (!url) {
        return res.status(400).json({
          status: 'fail',
          message: 'An audio file upload or external URL is required.'
        });
      }

      const newRt = ringtoneDb.add({
        name,
        author: author || 'Anonymous',
        url,
        duration: duration || '0:30'
      });

      triggerGitSync(`Admin: Added ringtone - ${name}`);

      res.status(201).json({
        status: 'success',
        message: 'Ringtone added successfully.',
        data: {
          ringtone: newRt
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing ringtone by ID.
   */
  updateRingtone(req, res, next) {
    try {
      const { id } = req.params;
      const existing = ringtoneDb.getById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: `Ringtone with ID ${id} not found.`
        });
      }

      const updateData = { ...req.body };

      // Check if new file is uploaded
      if (req.file) {
        const relativePath = `/uploads/${req.file.filename}`;
        updateData.url = getRawGithubUrl(relativePath) || relativePath;
        
        // Clean up old local file if it was a local asset
        if (existing.url && existing.url.startsWith('/uploads/')) {
          const oldFilePath = path.join('public', existing.url);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              console.log(`Deleted replaced local ringtone file: ${oldFilePath}`);
            } catch (err) {
              console.error(`Failed to delete replaced local ringtone file: ${oldFilePath}`, err);
            }
          }
        }
      }

      const updated = ringtoneDb.update(id, updateData);

      triggerGitSync(`Admin: Updated ringtone - ${updated.name || id}`);

      res.status(200).json({
        status: 'success',
        message: 'Ringtone updated successfully.',
        data: {
          ringtone: updated
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a ringtone by ID.
   */
  deleteRingtone(req, res, next) {
    try {
      const { id } = req.params;
      const success = ringtoneDb.delete(id);

      if (!success) {
        return res.status(404).json({
          status: 'fail',
          message: `Ringtone with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Ringtone deleted successfully.'
      });

      triggerGitSync(`Admin: Deleted ringtone - ${id}`);
    } catch (err) {
      next(err);
    }
  }
};
