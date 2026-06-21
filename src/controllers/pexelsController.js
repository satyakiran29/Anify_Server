/**
 * Controller to bridge the server with the Pexels API using the provided API key.
 */
export const pexelsController = {
  /**
   * Search for photos on Pexels.
   * GET /api/v1/pexels/search?query=xxx&page=1&per_page=12
   */
  async searchPhotos(req, res, next) {
    try {
      const apiKey = process.env.PEXELS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          status: 'error',
          message: 'Pexels API key is not configured on the server.'
        });
      }

      const { query, page, per_page, orientation, size, color } = req.query;

      if (!query) {
        return res.status(400).json({
          status: 'fail',
          message: 'Query parameter "query" is required for searching Pexels.'
        });
      }

      const pageNum = parseInt(page, 10) || 1;
      const perPageNum = parseInt(per_page, 10) || 12;

      // Build Pexels Search URL
      const searchUrl = new URL('https://api.pexels.com/v1/search');
      searchUrl.searchParams.append('query', query);
      searchUrl.searchParams.append('page', pageNum);
      searchUrl.searchParams.append('per_page', perPageNum);
      
      if (orientation) searchUrl.searchParams.append('orientation', orientation);
      if (size) searchUrl.searchParams.append('size', size);
      if (color) searchUrl.searchParams.append('color', color);

      console.log(`[Pexels] Requesting search: ${searchUrl.toString()}`);

      const response = await fetch(searchUrl.toString(), {
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Pexels] API search error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({
          status: 'error',
          message: `Pexels API responded with status ${response.status}`
        });
      }

      const data = await response.json();
      const photos = data.photos || [];

      // Transform Pexels photos to Anify Wallpaper schema format
      const wallpapers = photos.map(photo => ({
        id: `pexels_${photo.id}`,
        name: photo.alt ? photo.alt.trim() : `Pexels Photo ${photo.id}`,
        author: photo.photographer || 'Pexels Creator',
        url: photo.src.original,
        thumbnail: photo.src.large2x || photo.src.large || photo.src.medium,
        dimensions: `${photo.width}x${photo.height}`,
        copyright: 'Pexels License',
        category: query.charAt(0).toUpperCase() + query.slice(1) // Capitalize category query
      }));

      const totalResults = data.total_results || 0;
      const totalPages = Math.ceil(totalResults / perPageNum);

      res.status(200).json({
        status: 'success',
        results: wallpapers.length,
        pagination: {
          total: totalResults,
          page: pageNum,
          limit: perPageNum,
          pages: totalPages
        },
        data: {
          wallpapers
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get curated/trending photos from Pexels.
   * GET /api/v1/pexels/curated?page=1&per_page=12
   */
  async getCuratedPhotos(req, res, next) {
    try {
      const apiKey = process.env.PEXELS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          status: 'error',
          message: 'Pexels API key is not configured on the server.'
        });
      }

      const { page, per_page } = req.query;
      const pageNum = parseInt(page, 10) || 1;
      const perPageNum = parseInt(per_page, 10) || 12;

      // Build Pexels Curated URL
      const curatedUrl = new URL('https://api.pexels.com/v1/curated');
      curatedUrl.searchParams.append('page', pageNum);
      curatedUrl.searchParams.append('per_page', perPageNum);

      console.log(`[Pexels] Requesting curated: ${curatedUrl.toString()}`);

      const response = await fetch(curatedUrl.toString(), {
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Pexels] API curated error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({
          status: 'error',
          message: `Pexels API responded with status ${response.status}`
        });
      }

      const data = await response.json();
      const photos = data.photos || [];

      // Transform Pexels photos to Anify Wallpaper schema format
      const wallpapers = photos.map(photo => ({
        id: `pexels_${photo.id}`,
        name: photo.alt ? photo.alt.trim() : `Curated Photo ${photo.id}`,
        author: photo.photographer || 'Pexels Creator',
        url: photo.src.original,
        thumbnail: photo.src.large2x || photo.src.large || photo.src.medium,
        dimensions: `${photo.width}x${photo.height}`,
        copyright: 'Pexels License',
        category: 'Pexels Curated'
      }));

      const totalResults = data.total_results || 0;
      const totalPages = Math.ceil(totalResults / perPageNum);

      res.status(200).json({
        status: 'success',
        results: wallpapers.length,
        pagination: {
          total: totalResults,
          page: pageNum,
          limit: perPageNum,
          pages: totalPages
        },
        data: {
          wallpapers
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
