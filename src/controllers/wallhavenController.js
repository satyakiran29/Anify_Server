/**
 * Controller to bridge the server with the free Wallhaven API.
 */

// Helper to transform Wallhaven response to Anify Wallpaper schema
const transformWallhavenWallpaper = (photo, titlePrefix = 'Wallhaven') => {
  const cleanId = photo.id.toUpperCase();
  return {
    id: `wallhaven_${photo.id}`,
    name: `${titlePrefix} Art #${cleanId}`,
    author: photo.source ? 'WH Contributor' : 'Unknown',
    url: photo.path,
    thumbnail: photo.thumbs.large || photo.thumbs.original,
    dimensions: photo.resolution || `${photo.dimension_x}x${photo.dimension_y}`,
    copyright: 'Free License',
    category: photo.category === 'anime' ? 'Anime' : (photo.category === 'general' ? 'General' : titlePrefix)
  };
};

export const wallhavenController = {
  /**
   * Search for mobile wallpapers on Wallhaven.
   * GET /api/v1/wallhaven/search?query=xxx&page=1
   */
  async searchWallpapers(req, res, next) {
    try {
      const { query, page } = req.query;

      if (!query) {
        return res.status(400).json({
          status: 'fail',
          message: 'Query parameter "query" is required for searching Wallhaven.'
        });
      }

      const pageNum = parseInt(page, 10) || 1;

      console.log(`[Wallhaven] Requesting mobile search: query="${query}", page=${pageNum}`);

      // Wallhaven API: pure=100 (SFW only), ratios=9x16,10x16 (mobile typical vertical ratios)
      const searchUrl = new URL('https://wallhaven.cc/api/v1/search');
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('page', pageNum);
      searchUrl.searchParams.append('purity', '100'); // SFW
      searchUrl.searchParams.append('ratios', '9x16,10x16'); // Vertical resolutions only

      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Wallhaven] API search error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({
          status: 'error',
          message: `Wallhaven API responded with status ${response.status}`
        });
      }

      const data = await response.json();
      const photos = data.data || [];

      // Transform to Anify Wallpaper schema
      const categoryQuery = query.charAt(0).toUpperCase() + query.slice(1);
      const wallpapers = photos.map(photo => transformWallhavenWallpaper(photo, categoryQuery));

      const meta = data.meta || {};
      res.status(200).json({
        status: 'success',
        results: wallpapers.length,
        pagination: {
          total: meta.total || 0,
          page: meta.current_page || pageNum,
          limit: meta.per_page || wallpapers.length,
          pages: meta.last_page || 1
        },
        data: {
          wallpapers
        }
      });
    } catch (err) {
      console.error(`[Wallhaven] Server error during search:`, err);
      next(err);
    }
  },

  /**
   * Get random mobile wallpapers from Wallhaven.
   * GET /api/v1/wallhaven/random?page=1
   */
  async getRandomWallpapers(req, res, next) {
    try {
      const { page } = req.query;
      const pageNum = parseInt(page, 10) || 1;

      console.log(`[Wallhaven] Requesting random mobile wallpapers (page: ${pageNum})`);

      // Wallhaven API random: pure=100 (SFW), ratios=9x16,10x16 (vertical), sorting=random
      const randomUrl = new URL('https://wallhaven.cc/api/v1/search');
      randomUrl.searchParams.append('page', pageNum);
      randomUrl.searchParams.append('purity', '100'); // SFW
      randomUrl.searchParams.append('ratios', '9x16,10x16'); // Vertical resolutions
      randomUrl.searchParams.append('sorting', 'random');

      const response = await fetch(randomUrl.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Wallhaven] API random error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({
          status: 'error',
          message: `Wallhaven API responded with status ${response.status}`
        });
      }

      const data = await response.json();
      const photos = data.data || [];

      // Transform to Anify Wallpaper schema
      const wallpapers = photos.map(photo => transformWallhavenWallpaper(photo, 'Random Mobile'));

      const meta = data.meta || {};
      res.status(200).json({
        status: 'success',
        results: wallpapers.length,
        pagination: {
          total: meta.total || 0,
          page: meta.current_page || pageNum,
          limit: meta.per_page || wallpapers.length,
          pages: meta.last_page || 1
        },
        data: {
          wallpapers
        }
      });
    } catch (err) {
      console.error(`[Wallhaven] Server error during random:`, err);
      next(err);
    }
  }
};
