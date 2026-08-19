import path from 'path';
import fs from 'fs';
import { bannerDb } from '../utils/bannerDb.js';
import { getRawGithubUrl, triggerGitSync } from '../utils/gitSync.js';

export const bannerController = {
  /**
   * Get all active banners (or all banners if requested by admin)
   */
  getBanners(req, res, next) {
    try {
      const includeInactive = req.query.all === 'true';
      const banners = bannerDb.getAll(includeInactive);

      res.status(200).json({
        status: 'success',
        results: banners.length,
        data: {
          banners
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get a single banner by ID
   */
  getBannerById(req, res, next) {
    try {
      const { id } = req.params;
      const banner = bannerDb.getById(id);

      if (!banner) {
        return res.status(404).json({
          status: 'fail',
          message: `Banner with ID ${id} not found.`
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          banner
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create a new banner
   */
  createBanner(req, res, next) {
    try {
      const { title, subtitle, tag, actionType, actionValue, order, active } = req.body;
      let imageUrl = req.body.imageUrl || req.body.url;

      if (req.file) {
        const relativePath = `/uploads/${req.file.filename}`;
        imageUrl = getRawGithubUrl(relativePath) || relativePath;
      }

      if (!title) {
        return res.status(400).json({
          status: 'fail',
          message: 'Banner title is required.'
        });
      }

      if (!imageUrl) {
        return res.status(400).json({
          status: 'fail',
          message: 'Banner image file upload or image URL is required.'
        });
      }

      const newBanner = bannerDb.add({
        title,
        subtitle: subtitle || '',
        imageUrl,
        tag: tag || 'FEATURED',
        actionType: actionType || 'none',
        actionValue: actionValue || '',
        active: active !== undefined ? (active === 'true' || active === true) : true,
        order: order !== undefined ? parseInt(order, 10) : undefined
      });

      triggerGitSync(`Admin: Added banner - ${title}`);

      res.status(201).json({
        status: 'success',
        message: 'Banner created successfully.',
        data: {
          banner: newBanner
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing banner by ID
   */
  updateBanner(req, res, next) {
    try {
      const { id } = req.params;
      const existing = bannerDb.getById(id);

      if (!existing) {
        return res.status(404).json({
          status: 'fail',
          message: `Banner with ID ${id} not found.`
        });
      }

      const updateData = { ...req.body };

      if (updateData.active !== undefined) {
        updateData.active = updateData.active === 'true' || updateData.active === true;
      }
      if (updateData.order !== undefined) {
        updateData.order = parseInt(updateData.order, 10);
      }
      if (updateData.url && !updateData.imageUrl) {
        updateData.imageUrl = updateData.url;
      }

      // Check if a new image file was uploaded
      if (req.file) {
        const relativePath = `/uploads/${req.file.filename}`;
        const githubUrl = getRawGithubUrl(relativePath) || relativePath;
        updateData.imageUrl = githubUrl;

        // Clean up old local file if replaced
        if (existing.imageUrl && existing.imageUrl.startsWith('/uploads/')) {
          const oldFilePath = path.join('public', existing.imageUrl);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              console.log(`Deleted replaced local banner image: ${oldFilePath}`);
            } catch (err) {
              console.error(`Failed to delete replaced local banner image: ${oldFilePath}`, err);
            }
          }
        }
      }

      const updated = bannerDb.update(id, updateData);

      triggerGitSync(`Admin: Updated banner - ${updated.title || id}`);

      res.status(200).json({
        status: 'success',
        message: 'Banner updated successfully.',
        data: {
          banner: updated
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a banner by ID
   */
  deleteBanner(req, res, next) {
    try {
      const { id } = req.params;
      const success = bannerDb.delete(id);

      if (!success) {
        return res.status(404).json({
          status: 'fail',
          message: `Banner with ID ${id} not found.`
        });
      }

      triggerGitSync(`Admin: Deleted banner - ${id}`);

      res.status(200).json({
        status: 'success',
        message: 'Banner deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};
