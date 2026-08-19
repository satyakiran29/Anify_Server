
// Helper to escape HTML and prevent XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// State management
let currentPage = 1;
let currentLimit = 12;
let currentSearch = '';
let currentCategory = '';
let currentSort = '';
let selectedWallpaperIdForEdit = null;

// Live uptime ticker
let _uptimeSeconds = 0;
let _uptimeTicker = null;


// Live State management
let currentLivePage = 1;
let currentLiveLimit = 12;
let currentLiveSearch = '';
let currentLiveCategory = '';
let currentLiveSort = '';
let selectedLiveWallpaperIdForEdit = null;

// Ringtone State management
let currentRingtonePage = 1;
let currentRingtoneLimit = 12;
let currentRingtoneSearch = '';
let currentRingtoneSort = '';
let selectedRingtoneIdForEdit = null;
let currentPlayingAudio = null; // Track active playing Audio
let currentPlayingButton = null; // Track active playing Button

// KWGT State management
let currentKwgtPage = 1;
let currentKwgtLimit = 12;
let currentKwgtSearch = '';
let currentKwgtCategory = '';
let currentKwgtSort = '';
let selectedKwgtIdForEdit = null;
let selectedBannerIdForEdit = null;
let selectedStickerIdForEdit = null;

let currentAdminTableMode = 'static'; // 'static', 'live', 'ringtone', or 'kwgt'
let currentActiveTerminalEndpoint = null;
let adminToken = localStorage.getItem('anify_admin_token') || null;

// DOM Elements
const toastContainer = document.getElementById('toastContainer');
const statTotal = document.getElementById('statTotal');
const statCategories = document.getElementById('statCategories');
const statAuthors = document.getElementById('statAuthors');
const statUptime = document.getElementById('statUptime');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Explorer DOM
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const limitFilter = document.getElementById('limitFilter');
const wallpaperGrid = document.getElementById('wallpaperGrid');
const paginationContainer = document.getElementById('paginationContainer');

// Live Explorer DOM
const liveSearchInput = document.getElementById('liveSearchInput');
const liveCategoryFilter = document.getElementById('liveCategoryFilter');
const liveSortFilter = document.getElementById('liveSortFilter');
const liveLimitFilter = document.getElementById('liveLimitFilter');
const liveWallpaperGrid = document.getElementById('liveWallpaperGrid');
const livePaginationContainer = document.getElementById('livePaginationContainer');

// Ringtone Explorer DOM
const ringtoneSearchInput = document.getElementById('ringtoneSearchInput');
const ringtoneSortFilter = document.getElementById('ringtoneSortFilter');
const ringtoneLimitFilter = document.getElementById('ringtoneLimitFilter');
const ringtoneGrid = document.getElementById('ringtoneGrid');
const ringtonePaginationContainer = document.getElementById('ringtonePaginationContainer');

// KWGT Explorer DOM
const kwgtSearchInput = document.getElementById('kwgtSearchInput');
const kwgtCategoryFilter = document.getElementById('kwgtCategoryFilter');
const kwgtSortFilter = document.getElementById('kwgtSortFilter');
const kwgtLimitFilter = document.getElementById('kwgtLimitFilter');
const kwgtGrid = document.getElementById('kwgtGrid');
const kwgtPaginationContainer = document.getElementById('kwgtPaginationContainer');

// API Console DOM
const apiCards = document.querySelectorAll('.api-endpoint-card');
const jsonPre = document.getElementById('jsonPre');
const copyJsonBtn = document.getElementById('copyJsonBtn');

// Admin DOM
const wallpaperForm = document.getElementById('wallpaperForm');
const wpIdInput = document.getElementById('wpId');
const wpTypeSelect = document.getElementById('wpType');
const wpNameInput = document.getElementById('wpName');
const wpAuthorInput = document.getElementById('wpAuthor');
const wpCategorySelect = document.getElementById('wpCategory');
const wpDimensionsInput = document.getElementById('wpDimensions');
const wpCopyrightInput = document.getElementById('wpCopyright');
const imageSourceGroup = document.getElementsByName('imageSource');
const fileUploadContainer = document.getElementById('fileUploadContainer');
const remoteUrlContainer = document.getElementById('remoteUrlContainer');
const wpFileInput = document.getElementById('wpFile');
const wpUrlInput = document.getElementById('wpUrl');
const dropArea = document.getElementById('dropArea');
const fileSelectedName = document.getElementById('fileSelectedName');
const submitFormBtn = document.getElementById('submitFormBtn');
const formTitle = document.getElementById('formTitle').firstElementChild;
const cancelEditBtn = document.getElementById('cancelEditBtn');
const adminTableBody = document.getElementById('adminTableBody');
const adminListCount = document.getElementById('adminListCount');
const adminSearchInput = document.getElementById('adminSearchInput');

// Live Admin DOM
const liveUploadContainer = document.getElementById('liveUploadContainer');
const wpLiveVideoFileInput = document.getElementById('wpLiveVideoFile');
const wpLiveThumbFileInput = document.getElementById('wpLiveThumbFile');
const liveVideoDropArea = document.getElementById('liveVideoDropArea');
const liveThumbDropArea = document.getElementById('liveThumbDropArea');
const liveVideoSelectedName = document.getElementById('liveVideoSelectedName');
const liveThumbSelectedName = document.getElementById('liveThumbSelectedName');
const liveRemoteUrlContainer = document.getElementById('liveRemoteUrlContainer');
const wpLiveVideoUrlInput = document.getElementById('wpLiveVideoUrl');
const wpLiveThumbUrlInput = document.getElementById('wpLiveThumbUrl');

// Ringtone Admin DOM
const wpDurationInput = document.getElementById('wpDuration');
const ringtoneDurationGroup = document.getElementById('ringtoneDurationGroup');
const ringtoneUploadContainer = document.getElementById('ringtoneUploadContainer');
const wpRingtoneFileInput = document.getElementById('wpRingtoneFile');
const ringtoneDropArea = document.getElementById('ringtoneDropArea');
const ringtoneSelectedName = document.getElementById('ringtoneSelectedName');
const ringtoneRemoteUrlContainer = document.getElementById('ringtoneRemoteUrlContainer');
const wpRingtoneUrlInput = document.getElementById('wpRingtoneUrl');

// KWGT Admin DOM
const authorUrlGroup = document.getElementById('authorUrlGroup');
const wpAuthorUrlInput = document.getElementById('wpAuthorUrl');
const kwgtUploadContainer = document.getElementById('kwgtUploadContainer');
const wpKwgtFileInput = document.getElementById('wpKwgtFile');
const wpKwgtThumbFileInput = document.getElementById('wpKwgtThumbFile');
const kwgtDropArea = document.getElementById('kwgtDropArea');
const kwgtThumbDropArea = document.getElementById('kwgtThumbDropArea');
const kwgtSelectedName = document.getElementById('kwgtSelectedName');
const kwgtThumbSelectedName = document.getElementById('kwgtThumbSelectedName');
const kwgtRemoteUrlContainer = document.getElementById('kwgtRemoteUrlContainer');
const wpKwgtUrlInput = document.getElementById('wpKwgtUrl');
const wpKwgtThumbUrlInput = document.getElementById('wpKwgtThumbUrl');

// Table Toggles
const adminTableToggleStatic = document.getElementById('adminTableToggleStatic');
const adminTableToggleLive = document.getElementById('adminTableToggleLive');
const adminTableToggleRingtone = document.getElementById('adminTableToggleRingtone');
const adminTableToggleKwgt = document.getElementById('adminTableToggleKwgt');
const adminTableToggleSticker = document.getElementById('adminTableToggleSticker');

// Auth elements
const adminLoginCard = document.getElementById('adminLoginCard');
const adminPortalHeader = document.getElementById('adminPortalHeader');
const adminPanelContent = document.getElementById('adminPanelContent');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPasswordInput = document.getElementById('adminPassword');
const togglePasswordVisibility = document.getElementById('togglePasswordVisibility');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Lightbox elements
const wpLightbox = document.getElementById('wpLightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxAuthor = document.getElementById('lightboxAuthor');
const lightboxResolution = document.getElementById('lightboxResolution');
const lightboxLicense = document.getElementById('lightboxLicense');
const lightboxDownloadBtn = document.getElementById('lightboxDownloadBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  loadStats();
  loadCategories();
  loadLiveCategories();
  loadKwgtCategories();
  loadExplorerWallpapers();
  loadLiveExplorerWallpapers();
  loadRingtones();
  loadKwgts();
  setupExplorerFilters();
  setupLiveExplorerFilters();
  setupRingtoneFilters();
  setupKwgtFilters();
  setupApiConsole();
  setupAdminPanel();
  setupLightbox();
  
  // Refresh stats every 30 seconds
  setInterval(loadStats, 30000);
});

// Toast System
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = document.createElement('i');
  icon.className = type === 'success' 
    ? 'fa-solid fa-circle-check' 
    : 'fa-solid fa-circle-exclamation';
  icon.style.color = type === 'success' ? 'var(--success)' : 'var(--danger)';
  
  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast-message';
  msgSpan.textContent = message;
  
  toast.appendChild(icon);
  toast.appendChild(msgSpan);
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Tab Switching
function setupTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      // Update active tab buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active tab sections
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName) {
          content.classList.add('active');
        }
      });

      // Stop audio playback if navigating away from Ringtones
      if (tabName !== 'ringtone-explorer' && tabName !== 'admin') {
        stopRingtoneAudio();
      }

      // Smooth scroll active tab button into view on mobile
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      // Special triggers on tab focus
      if (tabName === 'admin') {
        toggleAdminViewState();
      } else if (tabName === 'explorer') {
        loadExplorerWallpapers();
      } else if (tabName === 'live-explorer') {
        loadLiveExplorerWallpapers();
      } else if (tabName === 'ringtone-explorer') {
        loadRingtones();
      } else if (tabName === 'kwgt-explorer') {
        loadKwgts();
      } else if (tabName === 'sticker-explorer') {
        loadStickers();
      } else if (tabName === 'banner-explorer') {
        loadBanners();
      }
    });
  });
}

// Load System Statistics
async function loadStats() {
  try {
    const fetchStart = Date.now();
    const res = await fetch('/api/v1/wallpapers/stats');
    const data = await res.json();
    if (data.status === 'success') {
      const s = data.data.stats;
      statTotal.textContent = s.totalWallpapers;
      statCategories.textContent = s.totalCategories;
      statAuthors.textContent = s.totalAuthors;

      // Seed the live counter: server uptime + round-trip latency
      _uptimeSeconds = s.serverUptimeSeconds + Math.round((Date.now() - fetchStart) / 1000);

      // Start (or restart) the 1-second local ticker
      if (_uptimeTicker) clearInterval(_uptimeTicker);
      _uptimeTicker = setInterval(() => {
        _uptimeSeconds++;
        renderUptime(_uptimeSeconds);
      }, 1000);

      renderUptime(_uptimeSeconds);
    }
  } catch (err) {
    console.error('Failed to load server stats', err);
  }
}

function renderUptime(totalSecs) {
  const hrs  = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  statUptime.textContent =
    `${String(hrs).padStart(2,'0')}h ${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s`;
}


// Load Unique Categories for Filter Dropdown
async function loadCategories() {
  try {
    const res = await fetch('/api/v1/wallpapers/categories');
    const data = await res.json();
    if (data.status === 'success') {
      const cats = data.data.categories;
      
      // Save for reference, then populate dropdown
      categoryFilter.innerHTML = '<option value="">All Categories</option>';
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = `${c.name} (${c.count})`;
        categoryFilter.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

// Explorer Filters listeners
function setupExplorerFilters() {
  searchInput.addEventListener('input', debounce(() => {
    currentSearch = searchInput.value;
    currentPage = 1;
    loadExplorerWallpapers();
  }, 300));

  categoryFilter.addEventListener('change', () => {
    currentCategory = categoryFilter.value;
    currentPage = 1;
    loadExplorerWallpapers();
  });

  sortFilter.addEventListener('change', () => {
    currentSort = sortFilter.value;
    currentPage = 1;
    loadExplorerWallpapers();
  });

  limitFilter.addEventListener('change', () => {
    currentLimit = parseInt(limitFilter.value, 10);
    currentPage = 1;
    loadExplorerWallpapers();
  });
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Load Wallpapers for Explorer Tab
async function loadExplorerWallpapers() {
  try {
    wallpaperGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>Loading Wallpapers...</div>';
    
    // Construct query parameters
    const params = new URLSearchParams({
      page: currentPage,
      limit: currentLimit
    });
    if (currentSearch) params.append('search', currentSearch);
    if (currentCategory) params.append('category', currentCategory);
    if (currentSort) params.append('sort', currentSort);

    const res = await fetch(`/api/v1/wallpapers?${params.toString()}`);
    const data = await res.json();
    
    if (data.status === 'success') {
      const wallpapers = data.data.wallpapers;
      const pagination = data.pagination;
      
      if (wallpapers.length === 0) {
        wallpaperGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-image-slash" style="margin-right:8px; font-size:1.5rem;"></i>No wallpapers found matching your criteria.</div>';
        paginationContainer.innerHTML = '';
        return;
      }

      wallpaperGrid.innerHTML = '';
      wallpapers.forEach(wp => {
        const card = document.createElement('div');
        card.className = 'wp-card';
        
        // Render preview image
        const thumbUrl = wp.thumbnail;
        const localFallback = thumbUrl.includes('raw.githubusercontent.com') && thumbUrl.includes('/public/uploads/')
          ? thumbUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : 'https://placehold.co/400x600/120e2e/00f2fe?text=Image+Not+Found';
        
        card.innerHTML = `
          <div class="wp-thumbnail-container">
            <img src="${thumbUrl}" alt="${wp.name}" onerror="this.onerror=null;this.src='${localFallback}'">
            <div class="wp-overlay">
              <span class="wp-category-badge">${wp.category}</span>
              <h3 class="wp-name">${wp.name}</h3>
              <p class="wp-author">by ${wp.author}</p>
              <div class="wp-meta-specs">
                <span><i class="fa-solid fa-expand"></i> ${wp.dimensions}</span>
                <span><i class="fa-solid fa-copyright"></i> ${wp.copyright}</span>
              </div>
              <div class="wp-actions">
                <button class="btn btn-primary open-lightbox-btn"><i class="fa-solid fa-eye"></i> View Details</button>
              </div>
            </div>
          </div>
          <div class="wp-card-details">
            <div class="wp-title-row">
              <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${wp.name}</span>
              <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:600; text-transform:uppercase;">${wp.category}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">by ${wp.author}</div>
          </div>
        `;

        // Bind Lightbox trigger clicks
        const openLightboxBtn = card.querySelector('.open-lightbox-btn');
        openLightboxBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openLightbox(wp);
        });

        const thumbContainer = card.querySelector('.wp-thumbnail-container');
        thumbContainer.addEventListener('click', () => {
          openLightbox(wp);
        });

        wallpaperGrid.appendChild(card);
      });

      renderPagination(pagination);
    }
  } catch (err) {
    console.error('Failed to load explorer wallpapers', err);
    wallpaperGrid.innerHTML = '<div class="terminal-prompt" style="grid-column:1/-1; color:var(--danger); text-align:center;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading wallpapers. Is the backend server running?</div>';
  }
}

// Render pagination buttons
function renderPagination(pagination) {
  paginationContainer.innerHTML = '';
  
  if (pagination.pages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-outline';
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
  prevBtn.disabled = pagination.page === 1;
  prevBtn.addEventListener('click', () => {
    currentPage = pagination.page - 1;
    loadExplorerWallpapers();
  });
  paginationContainer.appendChild(prevBtn);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
  paginationContainer.appendChild(pageInfo);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-outline';
  nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
  nextBtn.disabled = pagination.page === pagination.pages;
  nextBtn.addEventListener('click', () => {
    currentPage = pagination.page + 1;
    loadExplorerWallpapers();
  });
  paginationContainer.appendChild(nextBtn);
}

// API Console playground setup
function setupApiConsole() {
  apiCards.forEach(card => {
    card.addEventListener('click', async () => {
      // Highlight card
      apiCards.forEach(c => c.style.borderColor = 'var(--border-glass)');
      card.style.borderColor = 'var(--accent-cyan)';
      
      const desc = card.getAttribute('data-desc');
      let endpoint = card.getAttribute('data-endpoint');
      currentActiveTerminalEndpoint = endpoint;
      
      jsonPre.textContent = '';
      
      // If fetching a single item, append first ID from stats/explorer if possible
      if (endpoint.includes('/:id')) {
        try {
          const res = await fetch('/api/v1/wallpapers?limit=1');
          const data = await res.json();
          if (data.status === 'success' && data.data.wallpapers.length > 0) {
            const firstId = data.data.wallpapers[0].id;
            endpoint = `/api/v1/wallpapers/${firstId}`;
          } else {
            endpoint = '/api/v1/wallpapers/nonexistent-id';
          }
        } catch {
          endpoint = '/api/v1/wallpapers/sample-id';
        }
      }

      document.querySelector('.terminal-prompt').innerHTML = `
        <span style="color:var(--text-secondary)">$ curl -X GET http://localhost:${window.location.port || 3000}${endpoint}</span><br>
        <span style="color:var(--accent-cyan); font-size:0.8rem; font-weight:normal;"># ${desc}</span>
      `;
      
      jsonPre.innerHTML = '<span style="color:var(--accent-purple)"><i class="fa-solid fa-spinner fa-spin"></i> Executing request...</span>';

      try {
        const startTime = performance.now();
        const res = await fetch(endpoint);
        const duration = (performance.now() - startTime).toFixed(1);
        const data = await res.json();

        // Print response metadata + prettified JSON
        const statusColor = res.ok ? 'var(--success)' : 'var(--danger)';
        const headerText = `HTTP/1.1 ${res.status} ${res.statusText}\nTime: ${duration}ms\nContent-Type: application/json\n\n`;
        
        const highlightedJson = syntaxHighlight(data);
        
        jsonPre.innerHTML = `
          <span style="color:var(--text-secondary)">${headerText}</span>
          ${highlightedJson}
        `;
      } catch (err) {
        jsonPre.innerHTML = `<span style="color:var(--danger)">Connection Error: Failed to fetch endpoint. ${err.message}</span>`;
      }
    });
  });

  // Copy payload to clipboard
  copyJsonBtn.addEventListener('click', () => {
    const text = jsonPre.innerText;
    if (!text || text.includes('Executing request')) {
      showToast('Nothing to copy!', 'error');
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => showToast('Payload copied to clipboard!'))
      .catch(() => showToast('Failed to copy text', 'error'));
  });
}

// Toggle Admin Views (Login vs CRUD controls)
function toggleAdminViewState() {
  if (adminToken) {
    adminLoginCard.style.display = 'none';
    adminPortalHeader.style.display = 'flex';
    adminPanelContent.style.display = 'grid';
    setupAdminTableToggles();
    syncAdminTableToggleUI();
    if (currentAdminTableMode === 'static') {
      loadAdminWallpapers();
    } else if (currentAdminTableMode === 'live') {
      loadAdminLivewalls();
    } else if (currentAdminTableMode === 'ringtone') {
      loadAdminRingtones();
    } else if (currentAdminTableMode === 'kwgt') {
      loadAdminKwgts();
    } else if (currentAdminTableMode === 'sticker') {
      loadAdminStickers();
    } else if (currentAdminTableMode === 'banner') {
      loadAdminBanners();
    }
  } else {
    adminLoginCard.style.display = 'block';
    adminPortalHeader.style.display = 'none';
    adminPanelContent.style.display = 'none';
  }
}

// Admin Panel functions
function setupAdminPanel() {
  // Password Visibility Toggle
  togglePasswordVisibility.addEventListener('click', () => {
    const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    adminPasswordInput.setAttribute('type', type);
    togglePasswordVisibility.classList.toggle('fa-eye');
    togglePasswordVisibility.classList.toggle('fa-eye-slash');
  });

  // Admin Login submit
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = adminPasswordInput.value;
    try {
      const res = await fetch('/api/v1/wallpapers/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        adminToken = data.data.token;
        localStorage.setItem('anify_admin_token', adminToken);
        showToast('Authentication successful!');
        adminPasswordInput.value = '';
        toggleAdminViewState();
      } else {
        showToast(data.message || 'Login failed.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Failed to authenticate.', 'error');
      console.error(err);
    }
  });

  // Logout Handler
  adminLogoutBtn.addEventListener('click', () => {
    adminToken = null;
    localStorage.removeItem('anify_admin_token');
    showToast('Logged out successfully.');
    resetForm();
    toggleAdminViewState();
  });

  // Type change & Source change triggers
  wpTypeSelect.addEventListener('change', toggleFormFields);
  imageSourceGroup.forEach(radio => {
    radio.addEventListener('change', toggleFormFields);
  });

  // File selected displays (Static Image)
  wpFileInput.addEventListener('change', () => {
    const files = wpFileInput.files;
    if (files.length > 0) {
      if (files.length === 1) {
        fileSelectedName.textContent = `Selected: ${files[0].name} (${(files[0].size / 1024 / 1024).toFixed(2)} MB)`;
        wpNameInput.required = (selectedWallpaperIdForEdit === null);
      } else {
        let totalSize = 0;
        for (let i = 0; i < files.length; i++) {
          totalSize += files[i].size;
        }
        fileSelectedName.textContent = `Selected: ${files.length} files (Total ${(totalSize / 1024 / 1024).toFixed(2)} MB)`;
        wpNameInput.required = false; // Name optional for group uploads
      }
      fileSelectedName.style.display = 'block';
    } else {
      fileSelectedName.style.display = 'none';
      wpNameInput.required = (selectedWallpaperIdForEdit === null);
    }
  });

  // File selected displays (Live Video)
  wpLiveVideoFileInput.addEventListener('change', () => {
    if (wpLiveVideoFileInput.files.length > 0) {
      const file = wpLiveVideoFileInput.files[0];
      liveVideoSelectedName.textContent = `Selected Video: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      liveVideoSelectedName.style.display = 'block';
    } else {
      liveVideoSelectedName.style.display = 'none';
    }
  });

  // File selected displays (Live Thumbnail)
  wpLiveThumbFileInput.addEventListener('change', () => {
    if (wpLiveThumbFileInput.files.length > 0) {
      const file = wpLiveThumbFileInput.files[0];
      liveThumbSelectedName.textContent = `Selected Thumbnail: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      liveThumbSelectedName.style.display = 'block';
    } else {
      liveThumbSelectedName.style.display = 'none';
    }
  });

  // File selected displays (Ringtone Audio)
  wpRingtoneFileInput.addEventListener('change', () => {
    const files = wpRingtoneFileInput.files;
    if (files.length > 0) {
      if (files.length === 1) {
        ringtoneSelectedName.textContent = `Selected Audio: ${files[0].name} (${(files[0].size / 1024 / 1024).toFixed(2)} MB)`;
        wpNameInput.required = (selectedRingtoneIdForEdit === null);
      } else {
        let totalSize = 0;
        for (let i = 0; i < files.length; i++) {
          totalSize += files[i].size;
        }
        ringtoneSelectedName.textContent = `Selected: ${files.length} files (Total ${(totalSize / 1024 / 1024).toFixed(2)} MB)`;
        wpNameInput.required = false; // Name optional for group uploads
      }
      ringtoneSelectedName.style.display = 'block';
    } else {
      ringtoneSelectedName.style.display = 'none';
      wpNameInput.required = (selectedRingtoneIdForEdit === null);
    }
  });

  // File selected displays (KWGT)
  wpKwgtFileInput.addEventListener('change', () => {
    const files = wpKwgtFileInput.files;
    if (files.length > 0) {
      if (files.length === 1) {
        kwgtSelectedName.textContent = `Selected File: ${files[0].name} (${(files[0].size / 1024 / 1024).toFixed(2)} MB)`;
        wpNameInput.required = (selectedKwgtIdForEdit === null);
      } else {
        let totalSize = 0;
        for (let i = 0; i < files.length; i++) {
          totalSize += files[i].size;
        }
        kwgtSelectedName.textContent = `Selected: ${files.length} files (Total ${(totalSize / 1024 / 1024).toFixed(2)} MB)`;
        wpNameInput.required = false;
      }
      kwgtSelectedName.style.display = 'block';
    } else {
      kwgtSelectedName.style.display = 'none';
      wpNameInput.required = (selectedKwgtIdForEdit === null);
    }
  });

  // File selected displays (KWGT Thumbnail)
  wpKwgtThumbFileInput.addEventListener('change', () => {
    if (wpKwgtThumbFileInput.files.length > 0) {
      const file = wpKwgtThumbFileInput.files[0];
      kwgtThumbSelectedName.textContent = `Selected Thumbnail: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      kwgtThumbSelectedName.style.display = 'block';
    } else {
      kwgtThumbSelectedName.style.display = 'none';
    }
  });

  // Drag & drop handlers for Static Drop Area
  setupDragAndDrop(dropArea, wpFileInput);
  
  // Drag & drop handlers for Live Video Drop Area
  setupDragAndDrop(liveVideoDropArea, wpLiveVideoFileInput);

  // Drag & drop handlers for Live Thumbnail Drop Area
  setupDragAndDrop(liveThumbDropArea, wpLiveThumbFileInput);

  // Drag & drop handlers for Ringtone Drop Area
  setupDragAndDrop(ringtoneDropArea, wpRingtoneFileInput);

  // Drag & drop handlers for KWGT Drop Area
  setupDragAndDrop(kwgtDropArea, wpKwgtFileInput);
  setupDragAndDrop(kwgtThumbDropArea, wpKwgtThumbFileInput);

  // Form Submit Handler
  wallpaperForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = wpTypeSelect.value; // 'static', 'live', 'ringtone', 'kwgt', or 'sticker'
    const name = wpNameInput.value.trim();
    const author = wpAuthorInput.value.trim();
    const authorUrl = wpAuthorUrlInput ? wpAuthorUrlInput.value.trim() : '';
    const category = wpCategorySelect.value;
    const dimensions = wpDimensionsInput.value.trim();
    const copyright = wpCopyrightInput.value.trim();
    const duration = wpDurationInput.value.trim();
    const sourceRadio = document.querySelector('input[name="imageSource"]:checked');
    const source = sourceRadio ? sourceRadio.value : 'upload';
    
    let isEditMode = false;
    if (type === 'static') {
      isEditMode = !!selectedWallpaperIdForEdit;
    } else if (type === 'live') {
      isEditMode = !!selectedLiveWallpaperIdForEdit;
    } else if (type === 'ringtone') {
      isEditMode = !!selectedRingtoneIdForEdit;
    } else if (type === 'kwgt') {
      isEditMode = !!selectedKwgtIdForEdit;
    } else if (type === 'banner') {
        const title = wpNameInput.value.trim();
        const subtitle = (wpBannerSubtitle ? wpBannerSubtitle.value : '').trim();
        const tag = (wpBannerTag ? wpBannerTag.value : '🔥 FEATURED').trim();
        const order = parseInt(wpBannerOrder ? wpBannerOrder.value : '1', 10) || 1;
        const actionType = (wpBannerActionType ? wpBannerActionType.value : 'wallpapers').trim();
        const actionValue = (wpBannerActionValue ? wpBannerActionValue.value : '').trim();
        const active = Boolean(wpBannerActive ? wpBannerActive.checked : true);

        const isEditMode = !!selectedBannerIdForEdit;
        const url = isEditMode ? `/api/v1/banners/${selectedBannerIdForEdit}` : '/api/v1/banners';
        const method = isEditMode ? 'PUT' : 'POST';
        let bannerRes;

        if (source === 'upload') {
          const formData = new FormData();
          formData.append('title', title);
          formData.append('subtitle', subtitle);
          formData.append('tag', tag);
          formData.append('order', order);
          formData.append('actionType', actionType);
          formData.append('actionValue', actionValue);
          formData.append('active', active);
          if (wpFileInput && wpFileInput.files && wpFileInput.files[0]) {
            formData.append('image', wpFileInput.files[0]);
          } else if (!isEditMode) {
            showToast('Please select a banner image file to upload.', 'error');
            submitFormBtn.disabled = false;
            submitFormBtn.innerHTML = 'Save Banner';
            return;
          }

          bannerRes = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${adminToken}` },
            body: formData
          });
        } else {
          const imageUrl = wpUrlInput ? wpUrlInput.value.trim() : '';
          if (!imageUrl && !isEditMode) {
            showToast('Please enter an image URL.', 'error');
            submitFormBtn.disabled = false;
            submitFormBtn.innerHTML = 'Save Banner';
            return;
          }

          bannerRes = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
              title, subtitle, tag, order, actionType, actionValue, active, imageUrl
            })
          });
        }

        const bannerJson = await bannerRes.json();
        if (bannerJson.status === 'success') {
          showToast(isEditMode ? 'Banner updated successfully!' : 'Banner created successfully!', 'success');
          resetForm();
          loadAdminBanners();
          loadBanners();
        } else {
          showToast('Failed to save banner: ' + (bannerJson.message || 'Unknown error'), 'error');
        }
        submitFormBtn.disabled = false;
        submitFormBtn.innerHTML = 'Save Banner';
        return;
      } else if (type === 'sticker') {
      isEditMode = !!selectedStickerIdForEdit;
    }

    submitFormBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    submitFormBtn.disabled = true;

    try {
      let res;

      if (type === 'sticker') {
        const tgUrl = (wpTelegramUrl ? wpTelegramUrl.value : '').trim();
        const previewsVal = (wpStickerPreviews ? wpStickerPreviews.value : '').trim();
        let totalCount = parseInt(wpStickerCount ? wpStickerCount.value : '0', 10) || 0;
        const isAnimated = Boolean(wpStickerAnimated && wpStickerAnimated.checked);

        const previewList = previewsVal.split(/[\n,]/).map(s => s.trim()).filter(Boolean);

        // Auto calculate sticker count if missing
        if (totalCount <= 0 && previewList.length > 0) {
          totalCount = previewList.length;
        }

        const payload = {
          name,
          identifier: tgUrl.replace(/^https?:\/\/t\.me\/addstickers\//i, '').replace(/\/.*$/, '') || name,
          telegramUrl: tgUrl.startsWith('http') ? tgUrl : (tgUrl ? `https://t.me/addstickers/${tgUrl}` : ''),
          author: author || 'Anonymous',
          authorUrl: authorUrl || '',
          category: category || 'Anime',
          totalStickers: totalCount,
          animated: isAnimated,
          thumbnail: previewList[0] || '',
          previews: previewList
        };

        const endpoint = isEditMode ? `/api/v1/stickers/${selectedStickerIdForEdit}` : '/api/v1/stickers';
        const method = isEditMode ? 'PUT' : 'POST';

        res = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Construct FormData for binary uploads
        const formData = new FormData();
        formData.append('name', name);
        formData.append('author', author);
        if (authorUrl) formData.append('authorUrl', authorUrl);

        if (type === 'static') {
          formData.append('category', category);
          formData.append('dimensions', dimensions);
          formData.append('copyright', copyright);

          if (source === 'upload') {
            if (wpFileInput.files.length > 0) {
              for (let i = 0; i < wpFileInput.files.length; i++) {
                formData.append('image', wpFileInput.files[i]);
              }
            } else if (!isEditMode) {
              showToast('Please select an image file to upload.', 'error');
              submitFormBtn.textContent = 'Save Wallpaper';
              submitFormBtn.disabled = false;
              return;
            }
          } else {
            const url = wpUrlInput.value.trim();
            if (!url) {
              showToast('Please provide a remote image URL.', 'error');
              submitFormBtn.textContent = 'Save Wallpaper';
              submitFormBtn.disabled = false;
              return;
            }
            formData.append('url', url);
            formData.append('thumbnail', url);
          }
        } else if (type === 'live') {
          formData.append('category', category);
          formData.append('dimensions', dimensions);
          formData.append('copyright', copyright);

          if (source === 'upload') {
            if (wpLiveVideoFileInput.files.length > 0) {
              formData.append('video', wpLiveVideoFileInput.files[0]);
            } else if (!isEditMode) {
              showToast('Please select a video file to upload.', 'error');
              submitFormBtn.textContent = 'Save Live Wallpaper';
              submitFormBtn.disabled = false;
              return;
            }
            if (wpLiveThumbFileInput.files.length > 0) {
              formData.append('thumbnail', wpLiveThumbFileInput.files[0]);
            }
          } else {
            const videoUrl = wpLiveVideoUrlInput.value.trim();
            const thumbUrl = wpLiveThumbUrlInput.value.trim();
            if (!videoUrl) {
              showToast('Please provide a remote video URL.', 'error');
              submitFormBtn.textContent = 'Save Live Wallpaper';
              submitFormBtn.disabled = false;
              return;
            }
            formData.append('url', videoUrl);
            formData.append('thumbnail', thumbUrl || videoUrl);
          }
        } else if (type === 'ringtone') {
          formData.append('duration', duration);

          if (source === 'upload') {
            if (wpRingtoneFileInput.files.length > 0) {
              for (let i = 0; i < wpRingtoneFileInput.files.length; i++) {
                formData.append('audio', wpRingtoneFileInput.files[i]);
              }
            } else if (!isEditMode) {
              showToast('Please select an audio file to upload.', 'error');
              submitFormBtn.textContent = 'Save Ringtone';
              submitFormBtn.disabled = false;
              return;
            }
          } else {
            const audioUrl = wpRingtoneUrlInput.value.trim();
            if (!audioUrl) {
              showToast('Please provide a remote audio URL.', 'error');
              submitFormBtn.textContent = 'Save Ringtone';
              submitFormBtn.disabled = false;
              return;
            }
            formData.append('url', audioUrl);
          }
        } else if (type === 'kwgt') {
          formData.append('category', category);
          formData.append('copyright', copyright);

          if (source === 'upload') {
            if (wpKwgtFileInput.files.length > 0) {
              for (let i = 0; i < wpKwgtFileInput.files.length; i++) {
                formData.append('file', wpKwgtFileInput.files[i]);
              }
            } else if (!isEditMode) {
              showToast('Please select a kwgt file to upload.', 'error');
              submitFormBtn.textContent = 'Save KWGT';
              submitFormBtn.disabled = false;
              return;
            }
            if (wpKwgtThumbFileInput.files.length > 0) {
              formData.append('thumbnail', wpKwgtThumbFileInput.files[0]);
            }
          } else {
            const kwgtUrl = wpKwgtUrlInput.value.trim();
            const thumbUrl = wpKwgtThumbUrlInput.value.trim();
            if (!kwgtUrl) {
              showToast('Please provide a remote file URL.', 'error');
              submitFormBtn.textContent = 'Save KWGT';
              submitFormBtn.disabled = false;
              return;
            }
            formData.append('url', kwgtUrl);
            if (thumbUrl) formData.append('thumbnail', thumbUrl);
          }
        }

        let endpoint = '';
        if (type === 'static') {
          endpoint = isEditMode ? `/api/v1/wallpapers/${selectedWallpaperIdForEdit}` : '/api/v1/wallpapers';
        } else if (type === 'live') {
          endpoint = isEditMode ? `/api/v1/livewalls/${selectedLiveWallpaperIdForEdit}` : '/api/v1/livewalls';
        } else if (type === 'ringtone') {
          endpoint = isEditMode ? `/api/v1/ringtones/${selectedRingtoneIdForEdit}` : '/api/v1/ringtones';
        } else if (type === 'kwgt') {
          endpoint = isEditMode ? `/api/v1/kwgts/${selectedKwgtIdForEdit}` : '/api/v1/kwgts';
        }

        const method = isEditMode ? 'PUT' : 'POST';

        res = await fetch(endpoint, {
          method,
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          body: formData
        });
      }

      if (res.status === 401) {
        adminToken = null;
        localStorage.removeItem('anify_admin_token');
        showToast('Session expired. Please log in again.', 'error');
        toggleAdminViewState();
        return;
      }

      const data = await res.json();
      
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Saved successfully!');
        resetForm();
        loadStats();
        if (type === 'static') {
          loadCategories();
          loadExplorerWallpapers();
          if (currentAdminTableMode === 'static') loadAdminWallpapers();
        } else if (type === 'live') {
          loadLiveCategories();
          loadLiveExplorerWallpapers();
          if (currentAdminTableMode === 'live') loadAdminLivewalls();
        } else if (type === 'ringtone') {
          loadRingtones();
          if (currentAdminTableMode === 'ringtone') loadAdminRingtones();
        } else if (type === 'kwgt') {
          loadKwgtCategories();
          loadKwgts();
          if (currentAdminTableMode === 'kwgt') loadAdminKwgts();
        } else if (type === 'sticker') {
          loadStickerCategories();
          loadStickers();
          if (currentAdminTableMode === 'sticker') loadAdminStickers();
        }
      } else {
        showToast(data.message || 'Failed to save.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Failed to save: ' + err.message, 'error');
      console.error(err);
    } finally {
      submitFormBtn.textContent = 'Save';
      submitFormBtn.disabled = false;
    }
  });

  // Cancel Edit Mode Handler
  cancelEditBtn.addEventListener('click', resetForm);

  // Admin Table Search Row Filter
  adminSearchInput.addEventListener('input', () => {
    const query = adminSearchInput.value.toLowerCase().trim();
    const rows = adminTableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
      const name = row.querySelector('td:nth-child(2) div:first-child').textContent.toLowerCase();
      const id = row.querySelector('td:nth-child(2) div:last-child').textContent.toLowerCase();
      
      // Category/Author columns may vary, so check safe selectors
      const col3 = row.querySelector('td:nth-child(3)');
      const col4 = row.querySelector('td:nth-child(4)');
      
      const category = col3 ? col3.textContent.toLowerCase() : '';
      const author = col4 ? col4.textContent.toLowerCase() : '';
      
      if (name.includes(query) || id.includes(query) || category.includes(query) || author.includes(query)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    adminListCount.textContent = `showing ${visibleCount} of ${rows.length}`;
  });
}

// Reset form fields back to Add Mode
function resetForm() {
  selectedWallpaperIdForEdit = null;
  selectedLiveWallpaperIdForEdit = null;
  selectedRingtoneIdForEdit = null;
  selectedKwgtIdForEdit = null;
  selectedBannerIdForEdit = null;
  if (typeof wpBannerSubtitle !== 'undefined' && wpBannerSubtitle) wpBannerSubtitle.value = '';
  if (typeof wpBannerTag !== 'undefined' && wpBannerTag) wpBannerTag.value = '🔥 FEATURED';
  if (typeof wpBannerOrder !== 'undefined' && wpBannerOrder) wpBannerOrder.value = '1';
  if (typeof wpBannerActionType !== 'undefined' && wpBannerActionType) wpBannerActionType.value = 'wallpapers';
  if (typeof wpBannerActionValue !== 'undefined' && wpBannerActionValue) wpBannerActionValue.value = '';
  if (typeof wpBannerActive !== 'undefined' && wpBannerActive) wpBannerActive.checked = true;
  wpIdInput.value = '';
  wpNameInput.value = '';
  wpNameInput.required = true;
  wpAuthorInput.value = 'Anify';
  wpAuthorUrlInput.value = '';
  wpAuthorUrlInput.value = '';
  wpCategorySelect.value = 'Anime';
  wpDimensionsInput.value = '1080p';
  wpCopyrightInput.value = 'Free';
  wpDurationInput.value = '0:30';
  
  // Clear file inputs and display names
  wpFileInput.value = '';
  wpUrlInput.value = '';
  if (fileSelectedName) fileSelectedName.style.display = 'none';

  wpLiveVideoFileInput.value = '';
  wpLiveThumbFileInput.value = '';
  wpLiveVideoUrlInput.value = '';
  wpLiveThumbUrlInput.value = '';
  liveVideoSelectedName.style.display = 'none';
  liveThumbSelectedName.style.display = 'none';

  wpRingtoneFileInput.value = '';
  wpRingtoneUrlInput.value = '';
  if (ringtoneSelectedName) ringtoneSelectedName.style.display = 'none';
  
  wpKwgtFileInput.value = '';
  wpKwgtThumbFileInput.value = '';
  wpKwgtUrlInput.value = '';
  wpKwgtThumbUrlInput.value = '';
  if (kwgtSelectedName) kwgtSelectedName.style.display = 'none';
  if (kwgtThumbSelectedName) kwgtThumbSelectedName.style.display = 'none';

  // Reset select elements
  wpTypeSelect.value = 'static';
  document.querySelector('input[name="imageSource"][value="upload"]').checked = true;

  // Sync field visibility
  toggleFormFields();

  // Title and button text updated dynamically via toggleFormFields
  toggleFormFields();
  cancelEditBtn.style.display = 'none';
}

// Load List of Wallpapers for Admin Panel
async function loadAdminWallpapers() {
  try {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> Loading Wallpapers...</td></tr>';
    adminListCount.textContent = 'Loading...';

    // Fetch all wallpapers for admin management
    const res = await fetch('/api/v1/wallpapers?limit=0');
    const data = await res.json();
    
    if (data.status === 'success') {
      const wallpapers = data.data.wallpapers;
      adminSearchInput.value = ''; // Reset search input on load
      adminListCount.textContent = `showing ${wallpapers.length} of ${data.pagination.total}`;
      
      if (wallpapers.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No wallpapers found in database.</td></tr>';
        return;
      }

      adminTableBody.innerHTML = '';
      wallpapers.forEach(wp => {
        const row = document.createElement('tr');
        
        // Standardize thumbnail URL
        const thumbUrl = wp.thumbnail;
        // Local fallback: if GitHub URL isn't live yet, serve from local disk
        const localFallback = thumbUrl.includes('raw.githubusercontent.com') && thumbUrl.includes('/public/uploads/')
          ? thumbUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : 'https://placehold.co/45x60/120e2e/00f2fe?text=Err';

        row.innerHTML = `
          <td>
            <img class="table-thumbnail" src="${thumbUrl}" alt="preview" onerror="this.onerror=null;this.src='${localFallback}'">
          </td>
          <td>
            <div style="font-weight: 600;">${wp.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${wp.id}</div>
          </td>
          <td><span class="wp-category-badge" style="margin: 0; background:rgba(0,242,254,0.1); border:1px solid var(--accent-cyan); color:var(--accent-cyan)">${wp.category}</span></td>
          <td>${wp.author}</td>
          <td style="text-align: right;">
            <div class="wp-actions" style="justify-content: flex-end;">
              <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${wp.id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger delete-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${wp.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        adminTableBody.appendChild(row);
      });

      // Bind action handlers
      setupAdminTableActions(wallpapers, 'static');
    }
  } catch (err) {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">Error loading admin database.</td></tr>';
    adminListCount.textContent = 'Connection Error';
    console.error(err);
  }
}

// Load List of Live Wallpapers for Admin Panel
async function loadAdminLivewalls() {
  try {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> Loading Live Wallpapers...</td></tr>';
    adminListCount.textContent = 'Loading...';

    const res = await fetch('/api/v1/livewalls?limit=0');
    const data = await res.json();
    
    if (data.status === 'success') {
      const wallpapers = data.data.livewalls;
      adminSearchInput.value = '';
      adminListCount.textContent = `showing ${wallpapers.length} of ${data.pagination.total}`;
      
      if (wallpapers.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No live wallpapers found in database.</td></tr>';
        return;
      }

      adminTableBody.innerHTML = '';
      wallpapers.forEach(wp => {
        const row = document.createElement('tr');
        
        const thumbUrl = wp.thumbnail || wp.url;
        const localFallback = thumbUrl.includes('raw.githubusercontent.com') && thumbUrl.includes('/public/uploads/')
          ? thumbUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : 'https://placehold.co/45x60/120e2e/00f2fe?text=Video';

        row.innerHTML = `
          <td>
            <div style="position:relative; width:45px; height:60px; overflow:hidden; border-radius:4px; border:1px solid rgba(255,255,255,0.1)">
              <img class="table-thumbnail" src="${thumbUrl}" alt="preview" onerror="this.onerror=null;this.src='${localFallback}'" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">
              <i class="fa-solid fa-film" style="position:absolute; bottom:3px; right:3px; font-size:10px; color:#fff; background:rgba(0,0,0,0.6); padding:2px; border-radius:2px;"></i>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${wp.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${wp.id}</div>
          </td>
          <td><span class="wp-category-badge" style="margin: 0; background:rgba(138,75,243,0.1); border:1px solid var(--accent-purple); color:var(--accent-purple)">${wp.category}</span></td>
          <td>${wp.author}</td>
          <td style="text-align: right;">
            <div class="wp-actions" style="justify-content: flex-end;">
              <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${wp.id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger delete-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${wp.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        adminTableBody.appendChild(row);
      });

      setupAdminTableActions(wallpapers, 'live');
    }
  } catch (err) {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">Error loading admin database.</td></tr>';
    adminListCount.textContent = 'Connection Error';
    console.error(err);
  }
}

// Bind Edit & Delete functions
function setupAdminTableActions(items, type = 'static') {
  // Edit Handlers
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const wp = items.find(w => w.id === id || w.identifier === id);
      if (!wp) return;

      resetForm();

      wpIdInput.value = wp.id || id;
      wpNameInput.value = wp.name || '';
      wpAuthorInput.value = wp.author || '';
      if (wp.category) wpCategorySelect.value = wp.category;
      if (wp.dimensions) wpDimensionsInput.value = wp.dimensions;
      if (wp.copyright) wpCopyrightInput.value = wp.copyright;
      if (wp.duration) wpDurationInput.value = wp.duration;
      if (wp.authorUrl && wpAuthorUrlInput) wpAuthorUrlInput.value = wp.authorUrl;

      wpTypeSelect.value = type;

      if (type === 'sticker') {
        selectedStickerIdForEdit = wp.id || id;
        if (wpTelegramUrl) wpTelegramUrl.value = wp.telegramUrl || wp.identifier || '';
        if (wpStickerCount) wpStickerCount.value = wp.totalStickers || 30;
        if (wpStickerAnimated) wpStickerAnimated.checked = Boolean(wp.animated);
        if (wpStickerPreviews && Array.isArray(wp.previews)) {
          wpStickerPreviews.value = wp.previews.join('\n');
        }
        formTitle.textContent = 'Edit Sticker Pack';
        submitFormBtn.textContent = 'Update Details';
        cancelEditBtn.style.display = 'block';
        toggleFormFields();
        document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
        wpNameInput.focus();
        return;
      }

      // Check if URL is local upload
      const urlStr = wp.url || '';
      const isLocal = urlStr.startsWith('/uploads/') || (urlStr.includes('raw.githubusercontent.com') && urlStr.includes('/public/uploads/'));
      const uploadFilename = urlStr.includes('/uploads/') ? urlStr.split('/uploads/').pop() : urlStr.split('/').pop();

      if (type === 'kwgt') {
        selectedKwgtIdForEdit = id;
        if (isLocal) {
          document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
          if (typeof kwgtSelectedName !== 'undefined' && kwgtSelectedName) {
            kwgtSelectedName.textContent = `Currently using uploaded file: ${uploadFilename}`;
            kwgtSelectedName.style.display = 'block';
          }
        } else {
          document.querySelector('input[name="imageSource"][value="url"]').checked = true;
          if (typeof wpKwgtUrlInput !== 'undefined') wpKwgtUrlInput.value = wp.url || '';
          if (typeof wpKwgtThumbUrlInput !== 'undefined') wpKwgtThumbUrlInput.value = wp.thumbnail || '';
        }
      } else if (type === 'static') {
        selectedWallpaperIdForEdit = id;
        if (isLocal) {
          document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
          fileSelectedName.textContent = `Currently using uploaded file: ${uploadFilename}`;
          fileSelectedName.style.display = 'block';
        } else {
          document.querySelector('input[name="imageSource"][value="url"]').checked = true;
          wpUrlInput.value = wp.url || '';
        }
      } else if (type === 'live') {
        selectedLiveWallpaperIdForEdit = id;
        if (isLocal) {
          document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
          liveVideoSelectedName.textContent = `Currently using uploaded video: ${uploadFilename}`;
          liveVideoSelectedName.style.display = 'block';
          if (wp.thumbnail && (wp.thumbnail.startsWith('/uploads/') || (wp.thumbnail.includes('raw.githubusercontent.com') && wp.thumbnail.includes('/public/uploads/')))) {
            const thumbFilename = wp.thumbnail.includes('/uploads/') ? wp.thumbnail.split('/uploads/').pop() : wp.thumbnail.split('/').pop();
            liveThumbSelectedName.textContent = `Currently using uploaded thumbnail: ${thumbFilename}`;
            liveThumbSelectedName.style.display = 'block';
          }
        } else {
          document.querySelector('input[name="imageSource"][value="url"]').checked = true;
          wpLiveVideoUrlInput.value = wp.url || '';
          wpLiveThumbUrlInput.value = wp.thumbnail || '';
        }
      } else if (type === 'ringtone') {
        selectedRingtoneIdForEdit = id;
        if (isLocal) {
          document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
          ringtoneSelectedName.textContent = `Currently using uploaded audio: ${uploadFilename}`;
          ringtoneSelectedName.style.display = 'block';
        } else {
          document.querySelector('input[name="imageSource"][value="url"]').checked = true;
          wpRingtoneUrlInput.value = wp.url || '';
        }
      }

      toggleFormFields();
      formTitle.textContent = type === 'static' ? 'Edit Wallpaper' : (type === 'live' ? 'Edit Live Wallpaper' : (type === 'ringtone' ? 'Edit Ringtone' : 'Edit KWGT'));
      submitFormBtn.textContent = 'Update Details';
      cancelEditBtn.style.display = 'block';
      
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
      wpNameInput.focus();
    });
  });

  // Delete Handlers
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const row = btn.closest('tr');
      const itemName = row ? (row.querySelector('td:nth-child(2) div:first-child')?.textContent || id) : id;

      if (!adminToken) {
        showToast('Admin authorization required to delete.', 'error');
        return;
      }

      if (!confirm(`Are you absolutely sure you want to delete "${itemName}"?`)) {
        return;
      }

      try {
        let endpoint = '';
        if (type === 'static') {
          endpoint = `/api/v1/wallpapers/${id}`;
        } else if (type === 'live') {
          endpoint = `/api/v1/livewalls/${id}`;
        } else if (type === 'ringtone') {
          endpoint = `/api/v1/ringtones/${id}`;
        } else if (type === 'kwgt') {
          endpoint = `/api/v1/kwgts/${id}`;
        } else if (type === 'sticker') {
          endpoint = `/api/v1/stickers/${id}`;
        }

        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (res.status === 401) {
          adminToken = null;
          localStorage.removeItem('anify_admin_token');
          showToast('Session expired. Please log in again.', 'error');
          toggleAdminViewState();
          return;
        }

        const data = await res.json();

        if (res.ok && data.status === 'success') {
          showToast(`"${itemName}" deleted successfully.`);
          loadStats();
          if (type === 'static') {
            loadAdminWallpapers();
            loadExplorerWallpapers();
            loadCategories();
            if (selectedWallpaperIdForEdit === id) resetForm();
          } else if (type === 'live') {
            loadAdminLivewalls();
            loadLiveExplorerWallpapers();
            loadLiveCategories();
            if (selectedLiveWallpaperIdForEdit === id) resetForm();
          } else if (type === 'ringtone') {
            loadAdminRingtones();
            loadRingtones();
            if (selectedRingtoneIdForEdit === id) resetForm();
          } else if (type === 'kwgt') {
            loadAdminKwgts();
            loadKwgts();
            loadKwgtCategories();
            if (selectedKwgtIdForEdit === id) resetForm();
          } else if (type === 'sticker') {
            loadAdminStickers();
            loadStickers();
            loadStickerCategories();
            if (selectedStickerIdForEdit === id) resetForm();
          }
        } else {
          showToast(data.message || 'Failed to delete.', 'error');
        }
      } catch (err) {
        showToast('Connection error. Failed to delete: ' + err.message, 'error');
        console.error(err);
      }
    });
  });
}

function setupLightbox() {
  // Close triggers
  lightboxClose.addEventListener('click', closeLightbox);
  
  wpLightbox.addEventListener('click', (e) => {
    if (e.target === wpLightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wpLightbox.style.display === 'flex') {
      closeLightbox();
    }
  });
}

// Open Lightbox with wallpaper data
function openLightbox(wp) {
  const isVideo = wp.url.endsWith('.mp4') || wp.url.endsWith('.webm') || wp.url.endsWith('.mov') || wp.url.includes('livewall-');

  // Helper to get local fallback URL if it's a GitHub URL
  const getFallbackUrl = (url) => {
    if (url && url.includes('raw.githubusercontent.com') && url.includes('/public/uploads/')) {
      return url.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '');
    }
    return url;
  };

  const mainUrl = wp.url;
  const fallbackUrl = getFallbackUrl(mainUrl);

  if (isVideo) {
    lightboxImg.style.display = 'none';
    lightboxVideo.style.display = 'block';
    
    // Set source and setup onerror handler
    lightboxVideo.src = mainUrl;
    lightboxVideo.onerror = () => {
      // Avoid infinite loop if fallback also fails
      if (lightboxVideo.src !== window.location.origin + fallbackUrl && lightboxVideo.getAttribute('src') !== fallbackUrl) {
        console.log('Video failed to load from GitHub, trying local fallback:', fallbackUrl);
        lightboxVideo.src = fallbackUrl;
        lightboxVideo.play().catch(err => console.log('Autoplay prevented:', err));
      }
    };
    lightboxVideo.play().catch(err => console.log('Autoplay prevented:', err));
  } else {
    lightboxImg.style.display = 'block';
    lightboxVideo.style.display = 'none';
    
    // Set source and setup onerror handler
    lightboxImg.src = mainUrl;
    lightboxImg.onerror = () => {
      // Avoid infinite loop if fallback also fails
      if (lightboxImg.src !== window.location.origin + fallbackUrl && lightboxImg.getAttribute('src') !== fallbackUrl) {
        console.log('Image failed to load from GitHub, trying local fallback:', fallbackUrl);
        lightboxImg.src = fallbackUrl;
      }
    };
    lightboxVideo.src = '';
  }

  lightboxCategory.textContent = wp.category;
  lightboxTitle.textContent = wp.name;
  lightboxAuthor.textContent = `by ${wp.author}`;
  lightboxResolution.textContent = wp.dimensions || (isVideo ? '1080x1920' : '1080p');
  lightboxLicense.textContent = wp.copyright || 'Free';
  lightboxDownloadBtn.href = fallbackUrl;

  wpLightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Disable background scrolling
}

// Close Lightbox Modal
function closeLightbox() {
  wpLightbox.style.display = 'none';
  document.body.style.overflow = ''; // Re-enable background scrolling
  lightboxImg.src = ''; // Clear source to stop loading
  lightboxVideo.pause();
  lightboxVideo.src = '';
}

// Prettify & Syntax Highlight JSON payload
function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="json-' + cls + '">' + match + '</span>';
  });
}

// ----------------------------------------------------
// LIVE WALLPAPER UTILITIES & INTERACTIVE UI
// ----------------------------------------------------

// Load Live Wallpapers for Explorer Tab
async function loadLiveExplorerWallpapers() {
  try {
    liveWallpaperGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>Loading Live Wallpapers...</div>';
    
    const params = new URLSearchParams({
      page: currentLivePage,
      limit: currentLiveLimit
    });
    if (currentLiveSearch) params.append('search', currentLiveSearch);
    if (currentLiveCategory) params.append('category', currentLiveCategory);
    if (currentLiveSort) params.append('sort', currentLiveSort);

    const res = await fetch(`/api/v1/livewalls?${params.toString()}`);
    const data = await res.json();
    
    if (data.status === 'success') {
      const wallpapers = data.data.livewalls;
      const pagination = data.pagination;
      
      if (wallpapers.length === 0) {
        liveWallpaperGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-image-slash" style="margin-right:8px; font-size:1.5rem;"></i>No live wallpapers found.</div>';
        livePaginationContainer.innerHTML = '';
        return;
      }

      liveWallpaperGrid.innerHTML = '';
      wallpapers.forEach(wp => {
        const card = document.createElement('div');
        card.className = 'wp-card';
        
        const thumbUrl = wp.thumbnail || wp.url;
        const localFallback = thumbUrl.includes('raw.githubusercontent.com') && thumbUrl.includes('/public/uploads/')
          ? thumbUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : 'https://placehold.co/400x600/120e2e/00f2fe?text=Video+Preview';
        
        card.innerHTML = `
          <div class="wp-thumbnail-container">
            <img src="${thumbUrl}" alt="${wp.name}" onerror="this.onerror=null;this.src='${localFallback}'">
            <div class="wp-overlay">
              <span class="wp-category-badge" style="background:var(--accent-purple); border-color:var(--accent-purple);">${wp.category}</span>
              <h3 class="wp-name">${wp.name}</h3>
              <p class="wp-author">by ${wp.author}</p>
              <div class="wp-meta-specs">
                <span><i class="fa-solid fa-expand"></i> ${wp.dimensions}</span>
                <span><i class="fa-solid fa-film"></i> Live</span>
              </div>
              <div class="wp-actions">
                <button class="btn btn-primary open-lightbox-btn" style="background:var(--accent-purple);"><i class="fa-solid fa-play"></i> Play Preview</button>
              </div>
            </div>
          </div>
          <div class="wp-card-details">
            <div class="wp-title-row">
              <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${wp.name}</span>
              <span style="font-size:0.75rem; color:var(--accent-purple); font-weight:600; text-transform:uppercase;">Live</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">by ${wp.author}</div>
          </div>
        `;

        // Click actions
        const playBtn = card.querySelector('.open-lightbox-btn');
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openLightbox(wp);
        });

        const container = card.querySelector('.wp-thumbnail-container');
        container.addEventListener('click', () => openLightbox(wp));

        liveWallpaperGrid.appendChild(card);
      });

      renderLivePagination(pagination);
    }
  } catch (err) {
    console.error('Failed to load live explorer wallpapers', err);
    liveWallpaperGrid.innerHTML = '<div class="terminal-prompt" style="grid-column:1/-1; color:var(--danger); text-align:center;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading live wallpapers.</div>';
  }
}

// Load Unique Categories for Live Dropdown
async function loadLiveCategories() {
  try {
    const res = await fetch('/api/v1/livewalls/categories');
    const data = await res.json();
    if (data.status === 'success') {
      const cats = data.data.categories;
      liveCategoryFilter.innerHTML = '<option value="">All Categories</option>';
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = `${c.name} (${c.count})`;
        liveCategoryFilter.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Failed to load live categories', err);
  }
}

// Live Explorer Filters listeners
function setupLiveExplorerFilters() {
  liveSearchInput.addEventListener('input', debounce(() => {
    currentLiveSearch = liveSearchInput.value;
    currentLivePage = 1;
    loadLiveExplorerWallpapers();
  }, 300));

  liveCategoryFilter.addEventListener('change', () => {
    currentLiveCategory = liveCategoryFilter.value;
    currentLivePage = 1;
    loadLiveExplorerWallpapers();
  });

  liveSortFilter.addEventListener('change', () => {
    currentLiveSort = liveSortFilter.value;
    currentLivePage = 1;
    loadLiveExplorerWallpapers();
  });

  liveLimitFilter.addEventListener('change', () => {
    currentLiveLimit = parseInt(liveLimitFilter.value, 10);
    currentLivePage = 1;
    loadLiveExplorerWallpapers();
  });
}

// Render Live pagination buttons
function renderLivePagination(pagination) {
  livePaginationContainer.innerHTML = '';
  if (pagination.pages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-outline';
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
  prevBtn.disabled = pagination.page === 1;
  prevBtn.addEventListener('click', () => {
    currentLivePage = pagination.page - 1;
    loadLiveExplorerWallpapers();
  });
  livePaginationContainer.appendChild(prevBtn);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
  livePaginationContainer.appendChild(pageInfo);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-outline';
  nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
  nextBtn.disabled = pagination.page === pagination.pages;
  nextBtn.addEventListener('click', () => {
    currentLivePage = pagination.page + 1;
    loadLiveExplorerWallpapers();
  });
  livePaginationContainer.appendChild(nextBtn);
}

// Form Drag and Drop Helper
function setupDragAndDrop(area, input) {
  if (!area || !input) return;

  // Add click to select file
  area.addEventListener('click', () => input.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    area.addEventListener(eventName, (e) => {
      e.preventDefault();
      area.style.borderColor = 'var(--accent-cyan)';
      area.style.backgroundColor = 'rgba(0, 242, 254, 0.05)';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    area.addEventListener(eventName, (e) => {
      e.preventDefault();
      area.style.borderColor = 'var(--border-glass)';
      area.style.backgroundColor = 'rgba(10, 5, 25, 0.4)';
    }, false);
  });

  area.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      input.files = files;
      const event = new Event('change');
      input.dispatchEvent(event);
    }
  });
}

// Form Field Toggler
function toggleFormFields() {
  const type = wpTypeSelect.value;
  const bannerGroup = document.getElementById('bannerSpecificGroup');
  const authorGroup = document.getElementById('wpAuthor') ? document.getElementById('wpAuthor').closest('.form-group') : null;
  const authorUrlGroup = document.getElementById('wpAuthorUrl') ? document.getElementById('wpAuthorUrl').closest('.form-group') : null;

  if (type === 'banner') {
    if (bannerGroup) bannerGroup.style.display = 'block';
    const sourceLabel = document.getElementById('imageSourceGroup') ? document.getElementById('imageSourceGroup').querySelector('label') : null;
    if (sourceLabel) sourceLabel.textContent = 'Banner Image Source';

    const source = document.querySelector('input[name="imageSource"]:checked').value;
    if (source === 'upload') {
      fileUploadContainer.style.display = 'block';
      remoteUrlContainer.style.display = 'none';
    } else {
      fileUploadContainer.style.display = 'none';
      remoteUrlContainer.style.display = 'block';
    }

    if (authorGroup) authorGroup.style.display = 'none';
    if (authorUrlGroup) authorUrlGroup.style.display = 'none';
    if (wpCategorySelect && wpCategorySelect.closest('.form-group')) wpCategorySelect.closest('.form-group').style.display = 'none';
    if (wpDimensionsInput && wpDimensionsInput.closest('.form-group')) wpDimensionsInput.closest('.form-group').style.display = 'none';
    if (wpCopyrightInput && wpCopyrightInput.closest('.form-group')) wpCopyrightInput.closest('.form-group').style.display = 'none';
    if (typeof ringtoneDurationGroup !== 'undefined' && ringtoneDurationGroup) ringtoneDurationGroup.style.display = 'none';
    if (typeof kwgtUploadContainer !== 'undefined' && kwgtUploadContainer) kwgtUploadContainer.style.display = 'none';
    if (typeof kwgtRemoteUrlContainer !== 'undefined' && kwgtRemoteUrlContainer) kwgtRemoteUrlContainer.style.display = 'none';
    if (typeof liveUploadContainer !== 'undefined' && liveUploadContainer) liveUploadContainer.style.display = 'none';
    if (typeof liveRemoteUrlContainer !== 'undefined' && liveRemoteUrlContainer) liveRemoteUrlContainer.style.display = 'none';
    if (typeof ringtoneUploadContainer !== 'undefined' && ringtoneUploadContainer) ringtoneUploadContainer.style.display = 'none';
    if (typeof ringtoneRemoteUrlContainer !== 'undefined' && ringtoneRemoteUrlContainer) ringtoneRemoteUrlContainer.style.display = 'none';
    if (typeof stickerMetaGroup !== 'undefined' && stickerMetaGroup) stickerMetaGroup.style.display = 'none';
    if (typeof stickerPreviewsGroup !== 'undefined' && stickerPreviewsGroup) stickerPreviewsGroup.style.display = 'none';
    if (typeof stickerTelegramGroup !== 'undefined' && stickerTelegramGroup) stickerTelegramGroup.style.display = 'none';

    if (wpNameLabel) wpNameLabel.textContent = 'Banner Title *';
    submitFormBtn.textContent = selectedBannerIdForEdit ? 'Update Banner' : 'Save Banner';
    if (typeof updateBannerLivePreview === 'function') updateBannerLivePreview();
    return;
  } else {
    if (bannerGroup) bannerGroup.style.display = 'none';
    if (authorGroup) authorGroup.style.display = 'block';
  }

  const sourceLabel = document.getElementById('imageSourceGroup') ? document.getElementById('imageSourceGroup').querySelector('label') : null;
  
  // Show/Hide category, dimensions, copyright, duration
  const categoryGroup = wpCategorySelect.closest('.form-group');
  const dimensionsGroup = wpDimensionsInput.closest('.form-group');
  const copyrightGroup = document.getElementById('wpCopyrightGroup') || wpCopyrightInput.closest('.form-group');

  if (type === 'ringtone') {
    if (sourceLabel) sourceLabel.textContent = 'Audio Source';
    
    if (categoryGroup) categoryGroup.style.display = 'none';
    if (dimensionsGroup) dimensionsGroup.style.display = 'none';
    if (copyrightGroup) copyrightGroup.style.display = 'none';
    if (ringtoneDurationGroup) ringtoneDurationGroup.style.display = 'block';
    
    // Manage input requirements
    wpCategorySelect.required = false;
    wpDimensionsInput.required = false;
    wpCopyrightInput.required = false;
    wpDurationInput.required = true;
    
    // Manage source containers
    if (source === 'upload') {
      fileUploadContainer.style.display = 'none';
      remoteUrlContainer.style.display = 'none';
      liveUploadContainer.style.display = 'none';
      liveRemoteUrlContainer.style.display = 'none';
      ringtoneUploadContainer.style.display = 'block';
      ringtoneRemoteUrlContainer.style.display = 'none';
      wpRingtoneFileInput.required = selectedRingtoneIdForEdit === null;
      wpRingtoneUrlInput.required = false;
    } else {
      fileUploadContainer.style.display = 'none';
      remoteUrlContainer.style.display = 'none';
      liveUploadContainer.style.display = 'none';
      liveRemoteUrlContainer.style.display = 'none';
      ringtoneUploadContainer.style.display = 'none';
      ringtoneRemoteUrlContainer.style.display = 'block';
      wpRingtoneFileInput.required = false;
      wpRingtoneUrlInput.required = true;
    }
    
    // Disable other type file requirements
    wpFileInput.required = false;
    wpUrlInput.required = false;
    wpLiveVideoFileInput.required = false;
    wpLiveVideoUrlInput.required = false;
    wpKwgtFileInput.required = false;
    wpKwgtUrlInput.required = false;
  } else if (type === 'sticker') {
    if (sourceLabel) sourceLabel.textContent = 'Sticker Source';
    if (categoryGroup) categoryGroup.style.display = 'block';
    if (dimensionsGroup) dimensionsGroup.style.display = 'none';
    if (copyrightGroup) copyrightGroup.style.display = 'none';
    if (ringtoneDurationGroup) ringtoneDurationGroup.style.display = 'none';
    
    const sTgGroup = document.getElementById('stickerTelegramGroup');
    const sPrevGroup = document.getElementById('stickerPreviewsGroup');
    const sMetaGroup = document.getElementById('stickerMetaGroup');
    const imgSourceGrp = document.getElementById('imageSourceGroup');

    if (sTgGroup) sTgGroup.style.display = 'block';
    if (sPrevGroup) sPrevGroup.style.display = 'block';
    if (sMetaGroup) sMetaGroup.style.display = 'block';
    if (imgSourceGrp) imgSourceGrp.style.display = 'none';

    fileUploadContainer.style.display = 'none';
    remoteUrlContainer.style.display = 'none';
    liveUploadContainer.style.display = 'none';
    liveRemoteUrlContainer.style.display = 'none';
    ringtoneUploadContainer.style.display = 'none';
    ringtoneRemoteUrlContainer.style.display = 'none';
    if (typeof kwgtUploadContainer !== 'undefined' && kwgtUploadContainer) kwgtUploadContainer.style.display = 'none';
    if (typeof kwgtRemoteUrlContainer !== 'undefined' && kwgtRemoteUrlContainer) kwgtRemoteUrlContainer.style.display = 'none';
    
    wpCategorySelect.required = true;
    wpDimensionsInput.required = false;
    wpCopyrightInput.required = false;
    wpDurationInput.required = false;
    wpFileInput.required = false;
    wpUrlInput.required = false;
    if (wpTelegramUrl) wpTelegramUrl.required = true;
  } else if (type === 'kwgt') {
    if (sourceLabel) sourceLabel.textContent = 'File Source';
    
    if (categoryGroup) categoryGroup.style.display = 'block';
    if (dimensionsGroup) dimensionsGroup.style.display = 'none';
    if (copyrightGroup) copyrightGroup.style.display = 'block';
    if (ringtoneDurationGroup) ringtoneDurationGroup.style.display = 'none';
    if (authorUrlGroup) authorUrlGroup.style.display = 'block';
    
    // Manage input requirements
    wpCategorySelect.required = true;
    wpDimensionsInput.required = false;
    wpCopyrightInput.required = false;
    wpDurationInput.required = false;
    
    // Manage source containers
    if (source === 'upload') {
      fileUploadContainer.style.display = 'none';
      remoteUrlContainer.style.display = 'none';
      liveUploadContainer.style.display = 'none';
      liveRemoteUrlContainer.style.display = 'none';
      ringtoneUploadContainer.style.display = 'none';
      ringtoneRemoteUrlContainer.style.display = 'none';
      kwgtUploadContainer.style.display = 'block';
      kwgtRemoteUrlContainer.style.display = 'none';
      wpKwgtFileInput.required = selectedKwgtIdForEdit === null;
      wpKwgtUrlInput.required = false;
    } else {
      fileUploadContainer.style.display = 'none';
      remoteUrlContainer.style.display = 'none';
      liveUploadContainer.style.display = 'none';
      liveRemoteUrlContainer.style.display = 'none';
      ringtoneUploadContainer.style.display = 'none';
      ringtoneRemoteUrlContainer.style.display = 'none';
      kwgtUploadContainer.style.display = 'none';
      kwgtRemoteUrlContainer.style.display = 'block';
      wpKwgtFileInput.required = false;
      wpKwgtUrlInput.required = true;
    }
    
    // Disable other type file requirements
    wpFileInput.required = false;
    wpUrlInput.required = false;
    wpLiveVideoFileInput.required = false;
    wpLiveVideoUrlInput.required = false;
    wpRingtoneFileInput.required = false;
    wpRingtoneUrlInput.required = false;
  } else {
    // static or live
    if (categoryGroup) categoryGroup.style.display = 'block';
    if (dimensionsGroup) dimensionsGroup.style.display = 'block';
    if (copyrightGroup) copyrightGroup.style.display = 'block';
    if (ringtoneDurationGroup) ringtoneDurationGroup.style.display = 'none';
    if (authorUrlGroup) authorUrlGroup.style.display = 'none';
    
    wpCategorySelect.required = true;
    wpDurationInput.required = false;
    
    if (type === 'static') {
      if (sourceLabel) sourceLabel.textContent = 'Image Source';
      if (source === 'upload') {
        fileUploadContainer.style.display = 'block';
        remoteUrlContainer.style.display = 'none';
        liveUploadContainer.style.display = 'none';
        liveRemoteUrlContainer.style.display = 'none';
        ringtoneUploadContainer.style.display = 'none';
        ringtoneRemoteUrlContainer.style.display = 'none';
        kwgtUploadContainer.style.display = 'none';
        kwgtRemoteUrlContainer.style.display = 'none';
        wpFileInput.required = selectedWallpaperIdForEdit === null;
        wpUrlInput.required = false;
      } else {
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'block';
        liveUploadContainer.style.display = 'none';
        liveRemoteUrlContainer.style.display = 'none';
        ringtoneUploadContainer.style.display = 'none';
        ringtoneRemoteUrlContainer.style.display = 'none';
        kwgtUploadContainer.style.display = 'none';
        kwgtRemoteUrlContainer.style.display = 'none';
        wpFileInput.required = false;
        wpUrlInput.required = true;
      }
      wpLiveVideoFileInput.required = false;
      wpLiveVideoUrlInput.required = false;
      wpRingtoneFileInput.required = false;
      wpRingtoneUrlInput.required = false;
      wpKwgtFileInput.required = false;
      wpKwgtUrlInput.required = false;
    } else { // 'live'
      if (sourceLabel) sourceLabel.textContent = 'Video Source';
      if (source === 'upload') {
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'none';
        liveUploadContainer.style.display = 'block';
        liveRemoteUrlContainer.style.display = 'none';
        ringtoneUploadContainer.style.display = 'none';
        ringtoneRemoteUrlContainer.style.display = 'none';
        kwgtUploadContainer.style.display = 'none';
        kwgtRemoteUrlContainer.style.display = 'none';
        wpLiveVideoFileInput.required = selectedLiveWallpaperIdForEdit === null;
        wpLiveVideoUrlInput.required = false;
      } else {
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'none';
        liveUploadContainer.style.display = 'none';
        liveRemoteUrlContainer.style.display = 'block';
        ringtoneUploadContainer.style.display = 'none';
        ringtoneRemoteUrlContainer.style.display = 'none';
        kwgtUploadContainer.style.display = 'none';
        kwgtRemoteUrlContainer.style.display = 'none';
        wpLiveVideoFileInput.required = false;
        wpLiveVideoUrlInput.required = true;
      }
      wpFileInput.required = false;
      wpUrlInput.required = false;
      wpRingtoneFileInput.required = false;
      wpRingtoneUrlInput.required = false;
      wpKwgtFileInput.required = false;
      wpKwgtUrlInput.required = false;
    }
  }

  // Dynamic Name Label & Placeholder based on active type
  const wpNameLabel = document.getElementById('wpNameLabel') || document.querySelector('label[for="wpName"]');
  if (type === 'sticker') {
    if (wpNameLabel) wpNameLabel.textContent = 'Sticker Pack Name *';
    if (wpNameInput) wpNameInput.placeholder = 'e.g. Sousou No Frieren Anime';
    if (wpAuthorInput) wpAuthorInput.placeholder = 'e.g. Frieren Beyond Journey';
  } else if (type === 'kwgt') {
    if (wpNameLabel) wpNameLabel.textContent = 'Widget Name *';
    if (wpNameInput) wpNameInput.placeholder = 'e.g. Cyberpunk Clock Widget';
    if (wpAuthorInput) wpAuthorInput.placeholder = 'e.g. Widget Creator';
  } else if (type === 'ringtone') {
    if (wpNameLabel) wpNameLabel.textContent = 'Ringtone Name *';
    if (wpNameInput) wpNameInput.placeholder = 'e.g. Gurenge Opening Theme';
    if (wpAuthorInput) wpAuthorInput.placeholder = 'e.g. Anime Artist';
  } else if (type === 'live') {
    if (wpNameLabel) wpNameLabel.textContent = 'Live Wallpaper Name *';
    if (wpNameInput) wpNameInput.placeholder = 'e.g. Cyberpunk City Loop';
    if (wpAuthorInput) wpAuthorInput.placeholder = 'e.g. Creator / Animator';
  } else {
    if (wpNameLabel) wpNameLabel.textContent = 'Wallpaper Name *';
    if (wpNameInput) wpNameInput.placeholder = 'e.g. Kakashi Naruto 1';
    if (wpAuthorInput) wpAuthorInput.placeholder = 'e.g. Anify';
  }

  // Update Form Heading & Button Text dynamically based on active resource type
  let isEditMode = false;
  if (type === 'static') isEditMode = !!selectedWallpaperIdForEdit;
  else if (type === 'live') isEditMode = !!selectedLiveWallpaperIdForEdit;
  else if (type === 'ringtone') isEditMode = !!selectedRingtoneIdForEdit;
  else if (type === 'kwgt') isEditMode = !!selectedKwgtIdForEdit;
  else if (type === 'sticker') isEditMode = !!selectedStickerIdForEdit;

  if (type === 'sticker') {
    formTitle.textContent = isEditMode ? 'Edit Sticker Pack' : 'Add Sticker Pack';
    submitFormBtn.textContent = isEditMode ? 'Update Sticker Pack' : 'Save Sticker Pack';
  } else if (type === 'live') {
    formTitle.textContent = isEditMode ? 'Edit Live Wallpaper' : 'Add Live Wallpaper';
    submitFormBtn.textContent = isEditMode ? 'Update Live Wallpaper' : 'Save Live Wallpaper';
  } else if (type === 'ringtone') {
    formTitle.textContent = isEditMode ? 'Edit Ringtone' : 'Add Ringtone';
    submitFormBtn.textContent = isEditMode ? 'Update Ringtone' : 'Save Ringtone';
  } else if (type === 'kwgt') {
    formTitle.textContent = isEditMode ? 'Edit KWGT' : 'Add KWGT';
    submitFormBtn.textContent = isEditMode ? 'Update KWGT' : 'Save KWGT';
  } else {
    formTitle.textContent = isEditMode ? 'Edit Wallpaper' : 'Add Wallpaper';
    submitFormBtn.textContent = isEditMode ? 'Update Wallpaper' : 'Save Wallpaper';
  }
}

// Setup Admin table toggles Static vs Live vs Ringtone lists
function setupAdminTableToggles() {
  if (!adminTableToggleStatic || !adminTableToggleLive || !adminTableToggleRingtone) return;

  adminTableToggleStatic.addEventListener('click', () => {
    currentAdminTableMode = 'static';
    syncAdminTableToggleUI();
    loadAdminWallpapers();
  });

  adminTableToggleLive.addEventListener('click', () => {
    currentAdminTableMode = 'live';
    syncAdminTableToggleUI();
    loadAdminLivewalls();
  });

  adminTableToggleRingtone.addEventListener('click', () => {
    currentAdminTableMode = 'ringtone';
    syncAdminTableToggleUI();
    loadAdminRingtones();
  });

  adminTableToggleKwgt.addEventListener('click', () => {
    currentAdminTableMode = 'kwgt';
    syncAdminTableToggleUI();
    loadAdminKwgts();
  });

  if (adminTableToggleSticker) {
    adminTableToggleSticker.addEventListener('click', () => {
      currentAdminTableMode = 'sticker';
      syncAdminTableToggleUI();
      loadAdminStickers();
    });
  }
}

const adminTableHeading = document.getElementById('adminTableHeading');
const thCol1 = document.getElementById('thCol1');
const thCol2 = document.getElementById('thCol2');
const thCol3 = document.getElementById('thCol3');
const thCol4 = document.getElementById('thCol4');
const thCol5 = document.getElementById('thCol5');

function syncAdminTableToggleUI() {
  const allToggles = [
    { btn: adminTableToggleStatic, mode: 'static' },
    { btn: adminTableToggleLive, mode: 'live' },
    { btn: adminTableToggleRingtone, mode: 'ringtone' },
    { btn: adminTableToggleKwgt, mode: 'kwgt' },
    { btn: adminTableToggleSticker, mode: 'sticker' },
    { btn: adminTableToggleBanner, mode: 'banner' }
  ];

  allToggles.forEach(t => {
    if (t.btn) {
      t.btn.className = (currentAdminTableMode === t.mode) ? 'btn btn-primary' : 'btn btn-outline';
    }
  });

  if (currentAdminTableMode === 'static') {
    if (adminTableHeading) adminTableHeading.textContent = 'Manage Static Wallpapers';
    if (thCol1) thCol1.textContent = 'Preview';
    if (thCol2) thCol2.textContent = 'Wallpaper Title';
    if (thCol3) thCol3.textContent = 'Category';
    if (thCol4) thCol4.textContent = 'Author';
  } else if (currentAdminTableMode === 'live') {
    if (adminTableHeading) adminTableHeading.textContent = 'Manage Live Wallpapers';
    if (thCol1) thCol1.textContent = 'Preview';
    if (thCol2) thCol2.textContent = 'Video Title';
    if (thCol3) thCol3.textContent = 'Category';
    if (thCol4) thCol4.textContent = 'Author';
  } else if (currentAdminTableMode === 'ringtone') {
    if (adminTableHeading) adminTableHeading.textContent = 'Manage Ringtones';
    if (thCol1) thCol1.textContent = 'Audio';
    if (thCol2) thCol2.textContent = 'Ringtone Title';
    if (thCol3) thCol3.textContent = 'Duration';
    if (thCol4) thCol4.textContent = 'Author';
  } else if (currentAdminTableMode === 'kwgt') {
    if (adminTableHeading) adminTableHeading.textContent = 'Manage KWGTs';
    if (thCol1) thCol1.textContent = 'Preview';
    if (thCol2) thCol2.textContent = 'Widget Title';
    if (thCol3) thCol3.textContent = 'Category';
    if (thCol4) thCol4.textContent = 'Author';
  } else if (currentAdminTableMode === 'sticker') {
    if (adminTableHeading) adminTableHeading.textContent = 'Manage Sticker Packs';
    if (thCol1) thCol1.textContent = 'Preview';
    if (thCol2) thCol2.textContent = 'Sticker Pack Title';
    if (thCol3) thCol3.textContent = 'Category';
    if (thCol4) thCol4.textContent = 'Type & Count';
  }
}

// ----------------------------------------------------
// RINGTONE UTILITIES & INTERACTIVE UI
// ----------------------------------------------------

// Load Ringtones for Explorer Tab
async function loadRingtones() {
  try {
    ringtoneGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>Loading Ringtones...</div>';
    
    const params = new URLSearchParams({
      page: currentRingtonePage,
      limit: currentRingtoneLimit
    });
    if (currentRingtoneSearch) params.append('search', currentRingtoneSearch);
    if (currentRingtoneSort) params.append('sort', currentRingtoneSort);

    const res = await fetch(`/api/v1/ringtones?${params.toString()}`);
    const data = await res.json();
    
    if (data.status === 'success') {
      const ringtones = data.data.ringtones;
      const pagination = data.pagination;
      
      if (ringtones.length === 0) {
        ringtoneGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-music-slash" style="margin-right:8px; font-size:1.5rem;"></i>No ringtones found.</div>';
        ringtonePaginationContainer.innerHTML = '';
        return;
      }

      ringtoneGrid.innerHTML = '';
      ringtones.forEach(rt => {
        const card = document.createElement('div');
        card.className = 'wp-card ringtone-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.padding = '20px';
        card.style.height = '180px';
        card.style.background = 'var(--bg-card)';
        card.style.border = '1px solid var(--border-glass)';
        card.style.borderRadius = '16px';
        card.style.position = 'relative';
        card.style.transition = 'all 0.3s ease';

        const rtUrl = rt.url;
        const localFallback = rtUrl.includes('raw.githubusercontent.com') && rtUrl.includes('/public/uploads/')
          ? rtUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : rtUrl;

        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 15px; width: calc(100% - 60px);">
              <div class="audio-play-btn" data-url="${rtUrl}" style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3); transition: transform 0.2s ease;">
                <i class="fa-solid fa-play" style="color: #fff; font-size: 1.1rem; margin-left: 2px;"></i>
              </div>
              <div style="overflow: hidden; width: 100%;">
                <h3 style="font-size: 1.05rem; font-weight: 700; margin: 0; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${rt.name}">${rt.name}</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 3px 0 0 0;">by ${rt.author}</p>
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <span class="wp-category-badge" style="background: rgba(0, 242, 254, 0.1); border-color: var(--accent-cyan); color: var(--accent-cyan); margin: 0;">${rt.duration}</span>
            </div>
          </div>
          <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 15px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;">ID: ${rt.id}</span>
            <a href="${localFallback}" download="${rt.name}" target="_blank" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.75rem; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-download"></i> Download
            </a>
          </div>
        `;

        card.addEventListener('mouseenter', () => {
          card.style.borderColor = 'var(--accent-cyan)';
          card.style.transform = 'translateY(-3px)';
          card.style.boxShadow = '0 10px 25px rgba(0, 242, 254, 0.15)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.borderColor = 'var(--border-glass)';
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'none';
        });

        const playBtn = card.querySelector('.audio-play-btn');
        if (playBtn) {
          playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playRingtone(rt.url, playBtn);
          });
        }

        ringtoneGrid.appendChild(card);
      });

      renderRingtonePagination(pagination);
    }
  } catch (err) {
    console.error('Failed to load explorer ringtones', err);
    ringtoneGrid.innerHTML = '<div class="terminal-prompt" style="grid-column:1/-1; color:var(--danger); text-align:center;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading ringtones.</div>';
  }
}

// Render Ringtone pagination buttons
function renderRingtonePagination(pagination) {
  ringtonePaginationContainer.innerHTML = '';
  if (pagination.pages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-outline';
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
  prevBtn.disabled = pagination.page === 1;
  prevBtn.addEventListener('click', () => {
    currentRingtonePage = pagination.page - 1;
    loadRingtones();
  });
  ringtonePaginationContainer.appendChild(prevBtn);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
  ringtonePaginationContainer.appendChild(pageInfo);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-outline';
  nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
  nextBtn.disabled = pagination.page === pagination.pages;
  nextBtn.addEventListener('click', () => {
    currentRingtonePage = pagination.page + 1;
    loadRingtones();
  });
  ringtonePaginationContainer.appendChild(nextBtn);
}

// Ringtone Filters listeners
function setupRingtoneFilters() {
  if (!ringtoneSearchInput) return;
  
  ringtoneSearchInput.addEventListener('input', debounce(() => {
    currentRingtoneSearch = ringtoneSearchInput.value;
    currentRingtonePage = 1;
    loadRingtones();
  }, 300));

  ringtoneSortFilter.addEventListener('change', () => {
    currentRingtoneSort = ringtoneSortFilter.value;
    currentRingtonePage = 1;
    loadRingtones();
  });

  ringtoneLimitFilter.addEventListener('change', () => {
    currentRingtoneLimit = parseInt(ringtoneLimitFilter.value, 10);
    currentRingtonePage = 1;
    loadRingtones();
  });
}

// Play/Pause Ringtone Audio
function playRingtone(url, btn) {
  const icon = btn.querySelector('i');
  
  if (currentPlayingAudio && currentPlayingButton === btn) {
    if (!currentPlayingAudio.paused) {
      currentPlayingAudio.pause();
      icon.className = 'fa-solid fa-play';
      icon.style.marginLeft = '2px';
      btn.style.transform = 'scale(1)';
    } else {
      currentPlayingAudio.play().catch(err => {
        showToast('Playback failed. Please check the URL.', 'error');
        console.error(err);
      });
      icon.className = 'fa-solid fa-pause';
      icon.style.marginLeft = '0';
      btn.style.transform = 'scale(1.05)';
    }
    return;
  }
  
  stopRingtoneAudio();
  
  // Reconstruct local fallback if github raw URL isn't live yet
  const localFallback = url.includes('raw.githubusercontent.com') && url.includes('/public/uploads/')
    ? url.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
    : null;

  const audio = new Audio(url);
  currentPlayingAudio = audio;
  currentPlayingButton = btn;
  
  icon.className = 'fa-solid fa-spinner fa-spin';
  icon.style.marginLeft = '0';
  
  audio.play()
    .then(() => {
      icon.className = 'fa-solid fa-pause';
      icon.style.marginLeft = '0';
      btn.style.transform = 'scale(1.05)';
    })
    .catch(err => {
      if (localFallback && audio.src !== window.location.origin + localFallback) {
        console.log('Ringtone GitHub URL failed, trying local fallback:', localFallback);
        const fallbackAudio = new Audio(localFallback);
        currentPlayingAudio = fallbackAudio;
        fallbackAudio.play()
          .then(() => {
            icon.className = 'fa-solid fa-pause';
            icon.style.marginLeft = '0';
            btn.style.transform = 'scale(1.05)';
          })
          .catch(fallbackErr => {
            showToast('Failed to play audio. Check URL or network.', 'error');
            console.error(fallbackErr);
            stopRingtoneAudio();
          });
        fallbackAudio.addEventListener('ended', () => {
          stopRingtoneAudio();
        });
      } else {
        showToast('Failed to play audio. Check URL or network.', 'error');
        console.error(err);
        stopRingtoneAudio();
      }
    });
    
  audio.addEventListener('ended', () => {
    stopRingtoneAudio();
  });
}

// Stop current active playing ringtone
function stopRingtoneAudio() {
  if (currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingAudio = null;
  }
  if (currentPlayingButton) {
    const icon = currentPlayingButton.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-play';
      icon.style.marginLeft = '2px';
    }
    currentPlayingButton.style.transform = 'scale(1)';
    currentPlayingButton = null;
  }
}

// Load List of Ringtones for Admin Panel
async function loadAdminRingtones() {
  try {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> Loading Ringtones...</td></tr>';
    adminListCount.textContent = 'Loading...';

    const res = await fetch('/api/v1/ringtones?limit=0');
    const data = await res.json();
    
    if (data.status === 'success') {
      const ringtones = data.data.ringtones;
      adminSearchInput.value = '';
      adminListCount.textContent = `showing ${ringtones.length} of ${data.pagination.total}`;
      
      if (ringtones.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No ringtones found in database.</td></tr>';
        return;
      }

      adminTableBody.innerHTML = '';
      ringtones.forEach(rt => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>
            <div style="width:45px; height:45px; display:flex; align-items:center; justify-content:center; background:rgba(0,242,254,0.1); border:1px solid var(--accent-cyan); border-radius:8px; color:var(--accent-cyan)">
              <i class="fa-solid fa-music" style="font-size:18px;"></i>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${rt.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${rt.id}</div>
          </td>
          <td><span class="wp-category-badge" style="margin: 0; background:rgba(0,242,254,0.1); border:1px solid var(--accent-cyan); color:var(--accent-cyan)">${rt.duration}</span></td>
          <td>${rt.author}</td>
          <td style="text-align: right;">
            <div class="wp-actions" style="justify-content: flex-end;">
              <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${rt.id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger delete-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${rt.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        adminTableBody.appendChild(row);
      });

      setupAdminTableActions(ringtones, 'ringtone');
    }
  } catch (err) {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">Error loading admin database.</td></tr>';
    adminListCount.textContent = 'Connection Error';
    console.error(err);
  }
}



// ----------------------------------------------------
// KWGT UTILITIES & INTERACTIVE UI
// ----------------------------------------------------


// Load List of Stickers for Admin Panel
async function loadAdminStickers() {
  currentAdminTableMode = 'sticker';
  syncAdminTableToggleUI();
  try {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> Loading Stickers...</td></tr>';
    adminListCount.textContent = 'Loading...';

    const res = await fetch('/api/v1/stickers?limit=0');
    const data = await res.json();

    if (data.status === 'success') {
      const stickers = data.data.stickers;
      adminSearchInput.value = '';
      adminListCount.textContent = `${stickers.length} Stickers Total`;

      if (stickers.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No sticker packs found in database.</td></tr>';
        return;
      }

      adminTableBody.innerHTML = '';
      stickers.forEach(pack => {
        const row = document.createElement('tr');
        const thumbUrl = pack.thumbnail || (pack.previews && pack.previews[0]) || '';

        row.innerHTML = `
          <td>
            <div style="width: 44px; height: 44px; border-radius: 10px; overflow: hidden; background: rgba(0,242,254,0.08); display: flex; align-items: center; justify-content: center;">
              ${thumbUrl ? `<img src="${thumbUrl}" alt="${pack.name}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'">` : '<i class="fa-solid fa-face-smile" style="color: var(--accent-cyan);"></i>'}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">${pack.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">Slug: ${pack.identifier || pack.id}</div>
          </td>
          <td>
            <span class="category-badge">${pack.category || 'General'}</span>
          </td>
          <td>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${pack.animated ? '🎬 Animated' : '⚡ Static'}</div>
            <div style="font-size: 0.75rem; color: var(--accent-cyan);"><i class="fa-solid fa-layer-group"></i> ${pack.totalStickers || 30} stickers</div>
          </td>
          <td>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${pack.id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger delete-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${pack.id}" title="Admin Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        adminTableBody.appendChild(row);
      });

      setupAdminTableActions(stickers, 'sticker');
    }
  } catch (err) {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">Error loading sticker database.</td></tr>';
    adminListCount.textContent = 'Connection Error';
    console.error(err);
  }
}


async function loadAdminKwgts() {
  try {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> Loading KWGTs...</td></tr>';
    adminListCount.textContent = 'Loading...';

    const res = await fetch('/api/v1/kwgts?limit=0');
    const data = await res.json();
    
    if (data.status === 'success') {
      const kwgts = data.data.kwgts;
      adminSearchInput.value = '';
      adminListCount.textContent = `showing ${kwgts.length} of ${data.pagination.total}`;
      
      if (kwgts.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No KWGT files found in database.</td></tr>';
        return;
      }

      adminTableBody.innerHTML = '';
      kwgts.forEach(kwgt => {
        const row = document.createElement('tr');
        
        const thumbUrl = kwgt.thumbnail;
        const localFallback = thumbUrl.includes('raw.githubusercontent.com') && thumbUrl.includes('/public/uploads/')
          ? thumbUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : 'https://placehold.co/45x60/120e2e/00f2fe?text=KWGT';

        row.innerHTML = `
          <td>
            <div style="position:relative; width:45px; height:60px; overflow:hidden; border-radius:4px; border:1px solid rgba(255,255,255,0.1)">
              <img class="table-thumbnail" src="${thumbUrl}" alt="preview" onerror="this.onerror=null;this.src='${localFallback}'" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${kwgt.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${kwgt.id}</div>
          </td>
          <td><span class="wp-category-badge" style="margin: 0; background:rgba(255,105,180,0.1); border:1px solid var(--accent-purple); color:var(--accent-purple)">${kwgt.category}</span></td>
          <td>${kwgt.author}</td>
          <td style="text-align: right;">
            <div class="wp-actions" style="justify-content: flex-end;">
              <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${kwgt.id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger delete-btn" style="padding: 6px 12px; font-size: 0.8rem;" data-id="${kwgt.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        adminTableBody.appendChild(row);
      });

      setupAdminTableActions(kwgts, 'kwgt');
    }
  } catch (err) {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">Error loading admin database.</td></tr>';
    adminListCount.textContent = 'Connection Error';
    console.error(err);
  }
}

async function loadKwgts() {
  try {
    kwgtGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>Loading KWGTs...</div>';
    
    const params = new URLSearchParams({
      page: currentKwgtPage,
      limit: currentKwgtLimit
    });
    if (currentKwgtSearch) params.append('search', currentKwgtSearch);
    if (currentKwgtCategory) params.append('category', currentKwgtCategory);
    if (currentKwgtSort) params.append('sort', currentKwgtSort);

    const res = await fetch(`/api/v1/kwgts?${params.toString()}`);
    const data = await res.json();
    
    if (data.status === 'success') {
      const kwgts = data.data.kwgts;
      const pagination = data.pagination;
      
      if (kwgts.length === 0) {
        kwgtGrid.innerHTML = '<div class="terminal-prompt" style="grid-column: 1/-1; text-align:center;"><i class="fa-solid fa-shapes" style="margin-right:8px; font-size:1.5rem;"></i>No KWGT files found.</div>';
        kwgtPaginationContainer.innerHTML = '';
        return;
      }

      kwgtGrid.innerHTML = '';
      kwgts.forEach(kwgt => {
        const card = document.createElement('div');
        card.className = 'wp-card';
        
        const thumbUrl = kwgt.thumbnail;
        const localFallbackThumb = thumbUrl.includes('raw.githubusercontent.com') && thumbUrl.includes('/public/uploads/')
          ? thumbUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : 'https://placehold.co/400x600/120e2e/00f2fe?text=KWGT';
          
        const fileUrl = kwgt.url;
        const localFallbackFile = fileUrl.includes('raw.githubusercontent.com') && fileUrl.includes('/public/uploads/')
          ? fileUrl.replace(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public/, '')
          : fileUrl;
        
        card.innerHTML = `
          <div class="wp-thumbnail-container">
            <img src="${thumbUrl}" alt="${kwgt.name}" onerror="this.onerror=null;this.src='${localFallbackThumb}'">
            <div class="wp-overlay">
              <span class="wp-category-badge" style="background:var(--accent-purple); border-color:var(--accent-purple);">${kwgt.category}</span>
              <h3 class="wp-name">${kwgt.name}</h3>
              <p class="wp-author">by <a href="${kwgt.authorUrl || '#'}" target="_blank" style="color: #fff; text-decoration: underline;">${kwgt.author}</a></p>
              <div class="wp-actions" style="margin-top: 10px;">
                <a href="${localFallbackFile}" download="${kwgt.name}.kwgt" class="btn btn-primary" style="background:var(--accent-purple);"><i class="fa-solid fa-download"></i> Download .kwgt</a>
              </div>
            </div>
          </div>
          <div class="wp-card-details">
            <div class="wp-title-row">
              <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${kwgt.name}</span>
              <span style="font-size:0.75rem; color:var(--accent-purple); font-weight:600; text-transform:uppercase;">KWGT</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">by <a href="${kwgt.authorUrl || '#'}" target="_blank" style="color: var(--text-secondary); text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${kwgt.author}</a></div>
          </div>
        `;
        
        // Let user view the thumbnail image as preview
        const container = card.querySelector('.wp-thumbnail-container');
        container.addEventListener('click', (e) => {
           if (e.target.tagName !== 'A') {
               const dummyWp = {
                 ...kwgt,
                 url: thumbUrl,
                 dimensions: 'Preview'
               };
               openLightbox(dummyWp);
           }
        });

        kwgtGrid.appendChild(card);
      });

      renderKwgtPagination(pagination);
    }
  } catch (err) {
    console.error('Failed to load KWGT explorer files', err);
    kwgtGrid.innerHTML = '<div class="terminal-prompt" style="grid-column:1/-1; color:var(--danger); text-align:center;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading KWGT files.</div>';
  }
}

async function loadKwgtCategories() {
  try {
    const res = await fetch('/api/v1/kwgts/categories');
    const data = await res.json();
    if (data.status === 'success') {
      const cats = data.data.categories;
      kwgtCategoryFilter.innerHTML = '<option value="">All Categories</option>';
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = `${c.name} (${c.count})`;
        kwgtCategoryFilter.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Failed to load KWGT categories', err);
  }
}

function setupKwgtFilters() {
  if (!kwgtSearchInput) return;
  kwgtSearchInput.addEventListener('input', debounce(() => {
    currentKwgtSearch = kwgtSearchInput.value;
    currentKwgtPage = 1;
    loadKwgts();
  }, 300));

  kwgtCategoryFilter.addEventListener('change', () => {
    currentKwgtCategory = kwgtCategoryFilter.value;
    currentKwgtPage = 1;
    loadKwgts();
  });

  kwgtSortFilter.addEventListener('change', () => {
    currentKwgtSort = kwgtSortFilter.value;
    currentKwgtPage = 1;
    loadKwgts();
  });

  kwgtLimitFilter.addEventListener('change', () => {
    currentKwgtLimit = parseInt(kwgtLimitFilter.value, 10);
    currentKwgtPage = 1;
    loadKwgts();
  });
}

function renderKwgtPagination(pagination) {
  kwgtPaginationContainer.innerHTML = '';
  if (pagination.pages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-outline';
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
  prevBtn.disabled = pagination.page === 1;
  prevBtn.addEventListener('click', () => {
    currentKwgtPage = pagination.page - 1;
    loadKwgts();
  });
  kwgtPaginationContainer.appendChild(prevBtn);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
  kwgtPaginationContainer.appendChild(pageInfo);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-outline';
  nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
  nextBtn.disabled = pagination.page === pagination.pages;
  nextBtn.addEventListener('click', () => {
    currentKwgtPage = pagination.page + 1;
    loadKwgts();
  });
  kwgtPaginationContainer.appendChild(nextBtn);
}


// =========================================================================
// 8. STICKER STORE & EXPLORER MODULE
// =========================================================================

let currentStickerPage = 1;
let currentStickerLimit = 12;
let currentStickerSearch = '';
let currentStickerCategory = '';
let currentStickerSort = '';

// Sticker DOM elements
const stickerSearchInput = document.getElementById('stickerSearchInput');
const stickerCategoryFilter = document.getElementById('stickerCategoryFilter');
const stickerSortFilter = document.getElementById('stickerSortFilter');
const stickerLimitFilter = document.getElementById('stickerLimitFilter');
const stickerGrid = document.getElementById('stickerGrid');
const stickerPaginationControls = document.getElementById('stickerPaginationControls');

const stickerTelegramGroup = document.getElementById('stickerTelegramGroup');
const wpTelegramUrl = document.getElementById('wpTelegramUrl');
const autoFetchStickerBtn = document.getElementById('autoFetchStickerBtn');
const stickerPreviewsGroup = document.getElementById('stickerPreviewsGroup');
const wpStickerPreviews = document.getElementById('wpStickerPreviews');
const stickerMetaGroup = document.getElementById('stickerMetaGroup');
const wpStickerCount = document.getElementById('wpStickerCount');
const wpStickerAnimated = document.getElementById('wpStickerAnimated');

// Auto-fetch metadata from Telegram
if (autoFetchStickerBtn) {
  autoFetchStickerBtn.addEventListener('click', async () => {
    const inputVal = (wpTelegramUrl ? wpTelegramUrl.value : '').trim();
    if (!inputVal) {
      showToast('Please enter a Telegram pack link or slug first.', 'error');
      return;
    }

    autoFetchStickerBtn.disabled = true;
    autoFetchStickerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching...';

    try {
      const res = await fetch('/api/v1/stickers/auto-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packNameOrUrl: inputVal })
      });
      const data = await res.json();

      if (data.status === 'success' && data.data) {
        const item = data.data;
        if (wpNameInput) wpNameInput.value = item.name || '';
        if (wpTelegramUrl) wpTelegramUrl.value = item.telegramUrl || item.identifier || '';
        if (wpStickerCount) wpStickerCount.value = item.totalStickers || 30;
        if (wpStickerAnimated) wpStickerAnimated.checked = Boolean(item.animated);
        if (wpStickerPreviews && Array.isArray(item.previews)) {
          wpStickerPreviews.value = item.previews.join('\n');
        }
        showToast('Successfully fetched sticker pack details from Telegram!', 'success');
      } else {
        showToast(data.message || 'Failed to fetch pack from Telegram.', 'error');
      }
    } catch (err) {
      showToast('Error connecting to Telegram fetch service: ' + err.message, 'error');
    } finally {
      autoFetchStickerBtn.disabled = false;
      autoFetchStickerBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Fetch';
    }
  });
}

// Load Sticker categories
async function loadStickerCategories() {
  if (!stickerCategoryFilter) return;
  try {
    const res = await fetch('/api/v1/stickers/categories');
    const json = await res.json();
    if (json.status === 'success' && json.data?.categories) {
      const currentVal = stickerCategoryFilter.value;
      stickerCategoryFilter.innerHTML = '<option value="">All Categories</option>';
      json.data.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = `${cat.name} (${cat.count})`;
        stickerCategoryFilter.appendChild(opt);
      });
      stickerCategoryFilter.value = currentVal;
    }
  } catch (err) {
    console.error('Failed to load sticker categories:', err);
  }
}

// Load Sticker packs
async function loadStickers() {
  if (!stickerGrid) return;
  stickerGrid.innerHTML = '<div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--accent-cyan);"></i><p style="margin-top: 10px; color: var(--text-secondary);">Loading sticker packs...</p></div>';

  try {
    const params = new URLSearchParams({
      page: currentStickerPage,
      limit: currentStickerLimit
    });
    if (currentStickerSearch) params.append('search', currentStickerSearch);
    if (currentStickerCategory) params.append('category', currentStickerCategory);
    if (currentStickerSort) params.append('sort', currentStickerSort);

    const res = await fetch(`/api/v1/stickers?${params.toString()}`);
    const json = await res.json();

    if (json.status === 'success' && json.data?.stickers) {
      renderStickers(json.data.stickers);
      if (json.pagination && stickerPaginationControls) {
        renderStickerPagination(json.pagination);
      }
    } else {
      stickerGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>No sticker packs found.</p></div>';
    }
  } catch (err) {
    stickerGrid.innerHTML = `<div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);"><p>Error loading stickers: ${err.message}</p></div>`;
  }
}

function renderStickers(stickers) {
  if (!stickerGrid) return;
  stickerGrid.innerHTML = '';

  if (stickers.length === 0) {
    stickerGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>No sticker packs found matching your criteria.</p></div>';
    return;
  }

  stickers.forEach(pack => {
    const card = document.createElement('div');
    card.className = 'wallpaper-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.padding = '14px';
    card.style.borderRadius = '16px';
    card.style.background = 'var(--bg-card)';
    card.style.border = '1px solid var(--border-color)';

    const previews = Array.isArray(pack.previews) ? pack.previews : [];
    const thumbUrl = pack.thumbnail || previews[0] || '';

    // Generate preview thumbnails HTML
    let previewsHtml = '';
    if (previews.length > 0) {
      previewsHtml = `<div style="display: flex; gap: 6px; margin: 10px 0; overflow-x: auto; padding-bottom: 4px;">
        ${previews.slice(0, 4).map(p => `
          <img src="${p}" alt="Preview" style="width: 48px; height: 48px; border-radius: 8px; object-fit: contain; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);" loading="lazy" onerror="this.style.display='none'">
        `).join('')}
      </div>`;
    }

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(0,242,254,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
          ${thumbUrl ? `<img src="${thumbUrl}" alt="${pack.name}" style="width:100%; height:100%; object-fit: contain;" onerror="this.style.display='none'">` : '<i class="fa-solid fa-face-smile" style="color: var(--accent-cyan); font-size: 1.4rem;"></i>'}
        </div>
        <div style="flex: 1; min-width: 0;">
          <h4 style="margin: 0; font-size: 1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pack.name}</h4>
          <p style="margin: 2px 0 0 0; font-size: 0.78rem; color: var(--text-secondary);">by ${pack.author || 'Anonymous'}</p>
        </div>
      </div>

      <div style="display: flex; gap: 6px; align-items: center; margin-top: 8px; flex-wrap: wrap;">
        <span class="category-badge" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 6px; background: rgba(138,75,243,0.15); color: var(--accent-purple); font-weight: 600;">${pack.category || 'Anime'}</span>
        <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.08); color: var(--text-secondary);">${pack.animated ? '🎬 Animated' : '⚡ Static'}</span>
        <span style="font-size: 0.72rem; color: var(--text-secondary);"><i class="fa-solid fa-layer-group"></i> ${pack.totalStickers || 30}</span>
      </div>

      ${previewsHtml}

      <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 10px; align-items: center;">
        <a href="${pack.telegramUrl}" target="_blank" class="btn btn-outline" style="flex: 1; text-align: center; font-size: 0.78rem; padding: 6px 10px; display: flex; align-items: center; justify-content: center; gap: 5px;">
          <i class="fa-brands fa-telegram"></i> Telegram
        </a>
        ${adminToken ? `
          <button class="btn btn-danger delete-sticker-explorer-btn" data-id="${pack.id}" data-name="${pack.name}" style="padding: 6px 10px; font-size: 0.78rem;" title="Admin Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        ` : ''}
      </div>
    `;

    stickerGrid.appendChild(card);
  });

  // Attach Admin Delete button listeners in Explorer View
  const explorerDeleteBtns = stickerGrid.querySelectorAll('.delete-sticker-explorer-btn');
  explorerDeleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');

      if (!adminToken) {
        showToast('Admin login required to delete sticker packs.', 'error');
        return;
      }

      if (!confirm(`Are you sure you want to delete sticker pack "${name}"? (Admin action)`)) {
        return;
      }

      try {
        const res = await fetch(`/api/v1/stickers/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (res.status === 401) {
          showToast('Session expired. Please log in again as admin.', 'error');
          return;
        }

        const data = await res.json();
        if (data.status === 'success') {
          showToast(`Sticker pack "${name}" deleted successfully.`, 'success');
          loadStickers();
          loadStickerCategories();
          loadStats();
          if (currentAdminTableMode === 'sticker') loadAdminStickers();
        } else {
          showToast(data.message || 'Failed to delete sticker pack.', 'error');
        }
      } catch (err) {
        showToast('Error deleting sticker pack: ' + err.message, 'error');
      }
    });
  });

}

function renderStickerPagination(pagination) {
  if (!stickerPaginationControls) return;
  stickerPaginationControls.innerHTML = '';
  if (pagination.pages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-outline';
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
  prevBtn.disabled = pagination.page === 1;
  prevBtn.addEventListener('click', () => {
    currentStickerPage = pagination.page - 1;
    loadStickers();
  });
  stickerPaginationControls.appendChild(prevBtn);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
  stickerPaginationControls.appendChild(pageInfo);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-outline';
  nextBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
  nextBtn.disabled = pagination.page === pagination.pages;
  nextBtn.addEventListener('click', () => {
    currentStickerPage = pagination.page + 1;
    loadStickers();
  });
  stickerPaginationControls.appendChild(nextBtn);
}

// Attach Sticker Explorer Filter Listeners
if (stickerSearchInput) {
  let debounceTimeout;
  stickerSearchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      currentStickerSearch = stickerSearchInput.value.trim();
      currentStickerPage = 1;
      loadStickers();
    }, 300);
  });
}

if (stickerCategoryFilter) {
  stickerCategoryFilter.addEventListener('change', () => {
    currentStickerCategory = stickerCategoryFilter.value;
    currentStickerPage = 1;
    loadStickers();
  });
}

if (stickerSortFilter) {
  stickerSortFilter.addEventListener('change', () => {
    currentStickerSort = stickerSortFilter.value;
    currentStickerPage = 1;
    loadStickers();
  });
}

if (stickerLimitFilter) {
  stickerLimitFilter.addEventListener('change', () => {
    currentStickerLimit = parseInt(stickerLimitFilter.value, 10);
    currentStickerPage = 1;
    loadStickers();
  });
}

// Initial fetch for sticker explorer
loadStickerCategories();
loadStickers();


// ==========================================
// BANNER MANAGEMENT & LIVE PREVIEW
// ==========================================
const bannerGrid = document.getElementById('bannerGrid');
const bannerActiveCount = document.getElementById('bannerActiveCount');
const bannerSpecificGroup = document.getElementById('bannerSpecificGroup');
const wpBannerSubtitle = document.getElementById('wpBannerSubtitle');
const wpBannerTag = document.getElementById('wpBannerTag');
const wpBannerOrder = document.getElementById('wpBannerOrder');
const wpBannerActionType = document.getElementById('wpBannerActionType');
const wpBannerActionValue = document.getElementById('wpBannerActionValue');
const wpBannerActive = document.getElementById('wpBannerActive');
const adminTableToggleBanner = document.getElementById('adminTableToggleBanner');

const bannerMockupBg = document.getElementById('bannerMockupBg');
const bannerMockupBadge = document.getElementById('bannerMockupBadge');
const bannerMockupTitle = document.getElementById('bannerMockupTitle');
const bannerMockupSubtitle = document.getElementById('bannerMockupSubtitle');

function updateBannerLivePreview() {
  if (!bannerMockupTitle) return;
  const title = (wpNameInput.value || 'Banner Title').trim();
  const subtitle = (wpBannerSubtitle ? wpBannerSubtitle.value : 'Banner Subtitle will appear here').trim() || 'Banner Subtitle will appear here';
  const tag = (wpBannerTag ? wpBannerTag.value : '🔥 FEATURED').trim() || '🔥 FEATURED';
  const sourceRadio = document.querySelector('input[name="imageSource"]:checked');
  const source = sourceRadio ? sourceRadio.value : 'upload';

  bannerMockupTitle.textContent = title;
  bannerMockupSubtitle.textContent = subtitle;
  bannerMockupBadge.textContent = tag;

  if (source === 'url' && wpUrlInput && wpUrlInput.value.trim()) {
    bannerMockupBg.style.backgroundImage = `url("${wpUrlInput.value.trim()}")`;
  } else if (source === 'upload' && wpFileInput && wpFileInput.files && wpFileInput.files[0]) {
    const file = wpFileInput.files[0];
    const objUrl = URL.createObjectURL(file);
    bannerMockupBg.style.backgroundImage = `url("${objUrl}")`;
  } else {
    bannerMockupBg.style.backgroundImage = 'linear-gradient(135deg, #1e124a 0%, #0d284a 100%)';
  }
}

// Attach live preview listeners
if (wpNameInput) wpNameInput.addEventListener('input', () => { if (wpTypeSelect.value === 'banner') updateBannerLivePreview(); });
if (wpBannerSubtitle) wpBannerSubtitle.addEventListener('input', updateBannerLivePreview);
if (wpBannerTag) wpBannerTag.addEventListener('input', updateBannerLivePreview);
if (wpUrlInput) wpUrlInput.addEventListener('input', () => { if (wpTypeSelect.value === 'banner') updateBannerLivePreview(); });
if (wpFileInput) wpFileInput.addEventListener('change', () => { if (wpTypeSelect.value === 'banner') updateBannerLivePreview(); });

async function loadBanners() {
  if (!bannerGrid) return;
  bannerGrid.innerHTML = '<div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--accent-cyan);"></i><p style="margin-top: 10px; color: var(--text-secondary);">Loading dynamic banners...</p></div>';

  try {
    const res = await fetch('/api/v1/banners?all=true');
    const json = await res.json();

    if (json.status === 'success' && Array.isArray(json.data?.banners)) {
      renderBanners(json.data.banners);
      if (bannerActiveCount) {
        const activeNum = json.data.banners.filter(b => b.active !== false).length;
        bannerActiveCount.textContent = `${activeNum} Active / ${json.data.banners.length} Total`;
      }
    } else {
      bannerGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>No banners configured.</p></div>';
    }
  } catch (err) {
    bannerGrid.innerHTML = `<div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);"><p>Error loading banners: ${err.message}</p></div>`;
  }
}

function renderBanners(banners) {
  if (!bannerGrid) return;
  bannerGrid.innerHTML = '';

  if (banners.length === 0) {
    bannerGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>No banners created yet. Add one in the Admin tab!</p></div>';
    return;
  }

  banners.forEach(b => {
    const card = document.createElement('div');
    card.className = 'banner-card';

    const bgUrl = b.imageUrl || '';
    const isActive = b.active !== false;

    card.innerHTML = `
      <div class="banner-card-bg" style="background-image: url('${bgUrl}');"></div>
      <div class="banner-card-scrim"></div>
      <div class="banner-card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span class="banner-card-badge">${escapeHtml(b.tag || 'FEATURED')}</span>
          <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; background: ${isActive ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)'}; color: ${isActive ? '#00ff88' : '#ff4444'};">
            ${isActive ? '● ACTIVE' : '○ INACTIVE'}
          </span>
        </div>
        <h3 class="banner-card-title">${escapeHtml(b.title || 'Untitled Banner')}</h3>
        <p class="banner-card-subtitle">${escapeHtml(b.subtitle || '')}</p>
        <div class="banner-card-footer">
          <span class="banner-card-chip"><i class="fa-solid fa-bolt"></i> Action: ${escapeHtml(b.actionType || 'none')}</span>
          <span class="banner-card-order">Order #${b.order || 1}</span>
        </div>
      </div>
    `;

    card.style.cursor = 'pointer';
    card.setAttribute('title', 'Click to edit banner in Admin Panel');
    card.addEventListener('click', () => {
      editBanner(b);
      const adminTabBtn = document.querySelector('.tab-btn[data-tab="admin"]');
      if (adminTabBtn) {
        adminTabBtn.click();
        showToast(`Editing banner: ${b.title}`, 'info');
      }
    });
    bannerGrid.appendChild(card);
  });
}

async function loadAdminBanners() {
  if (!adminTableBody) return;
  adminTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading banners...</td></tr>';

  try {
    const res = await fetch('/api/v1/banners?all=true');
    const json = await res.json();

    if (json.status === 'success' && Array.isArray(json.data?.banners)) {
      renderAdminBanners(json.data.banners);
      if (adminListCount) adminListCount.textContent = `${json.data.banners.length} Banners`;
    } else {
      adminTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">No banners found.</td></tr>';
    }
  } catch (err) {
    adminTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 30px;">Error: ${err.message}</td></tr>`;
  }
}

function renderAdminBanners(banners) {
  if (!adminTableBody) return;
  adminTableBody.innerHTML = '';

  if (banners.length === 0) {
    adminTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">No banners created yet.</td></tr>';
    return;
  }

  // Update table header for banners
  const thead = adminTableBody.closest('table').querySelector('thead');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th style="width: 100px;">Preview</th>
        <th>Title & Subtitle</th>
        <th>Tag</th>
        <th>Action Target</th>
        <th>Order</th>
        <th>Status</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
  }

  banners.forEach(b => {
    const tr = document.createElement('tr');
    const isActive = b.active !== false;

    tr.innerHTML = `
      <td>
        <img src="${b.imageUrl}" alt="Banner" style="width: 90px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
      </td>
      <td>
        <div style="font-weight: 700; color: #fff;">${escapeHtml(b.title)}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(b.subtitle || '')}</div>
      </td>
      <td>
        <span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--accent-cyan); font-size: 0.75rem;">${escapeHtml(b.tag || 'FEATURED')}</span>
      </td>
      <td>
        <span style="font-family: monospace; font-size: 0.82rem; color: #e0e0e0;"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${escapeHtml(b.actionType || 'none')}</span>
      </td>
      <td>
        <span style="font-weight: 600;">#${b.order || 1}</span>
      </td>
      <td>
        <button class="btn btn-outline toggle-banner-active-btn" data-id="${b.id}" data-active="${isActive}" style="padding: 3px 8px; font-size: 0.75rem; color: ${isActive ? '#00ff88' : '#ff5555'}; border-color: ${isActive ? 'rgba(0,255,136,0.3)' : 'rgba(255,85,85,0.3)'};">
          ${isActive ? 'Active' : 'Hidden'}
        </button>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-outline edit-banner-btn" data-id="${b.id}" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;" title="Edit Banner">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn btn-outline delete-banner-btn" data-id="${b.id}" data-title="${escapeHtml(b.title)}" style="padding: 5px 10px; font-size: 0.8rem; color: var(--danger); border-color: rgba(255,68,68,0.3);" title="Delete Banner">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    // Edit button listener
    tr.querySelector('.edit-banner-btn').addEventListener('click', () => {
      editBanner(b);
    });

    // Delete button listener
    tr.querySelector('.delete-banner-btn').addEventListener('click', async () => {
      if (!confirm(`Are you sure you want to delete banner "${b.title}"?`)) return;
      try {
        const delRes = await fetch(`/api/v1/banners/${b.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const delJson = await delRes.json();
        if (delJson.status === 'success') {
          showToast('Banner deleted successfully!', 'success');
          loadAdminBanners();
          loadBanners();
        } else {
          showToast('Failed to delete banner: ' + (delJson.message || 'Unknown error'), 'error');
        }
      } catch (err) {
        showToast('Error deleting banner: ' + err.message, 'error');
      }
    });

    // Toggle active status listener
    tr.querySelector('.toggle-banner-active-btn').addEventListener('click', async () => {
      try {
        const newStatus = !isActive;
        const patchRes = await fetch(`/api/v1/banners/${b.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ active: newStatus })
        });
        const patchJson = await patchRes.json();
        if (patchJson.status === 'success') {
          showToast(`Banner marked as ${newStatus ? 'Active' : 'Hidden'}`, 'success');
          loadAdminBanners();
          loadBanners();
        }
      } catch (err) {
        showToast('Error updating banner status: ' + err.message, 'error');
      }
    });

    adminTableBody.appendChild(tr);
  });
}

function editBanner(b) {
  selectedBannerIdForEdit = b.id;
  selectedWallpaperIdForEdit = null;
  selectedLiveWallpaperIdForEdit = null;
  selectedRingtoneIdForEdit = null;
  selectedKwgtIdForEdit = null;
  selectedStickerIdForEdit = null;
  wpTypeSelect.value = 'banner';
  wpNameInput.value = b.title || '';
  if (wpBannerSubtitle) wpBannerSubtitle.value = b.subtitle || '';
  if (wpBannerTag) wpBannerTag.value = b.tag || '🔥 FEATURED';
  if (wpBannerOrder) wpBannerOrder.value = b.order || 1;
  if (wpBannerActionType) wpBannerActionType.value = b.actionType || 'wallpapers';
  if (wpBannerActionValue) wpBannerActionValue.value = b.actionValue || '';
  if (wpBannerActive) wpBannerActive.checked = b.active !== false;

  // Set remote URL if not uploaded
  document.querySelector('input[name="imageSource"][value="url"]').checked = true;
  if (wpUrlInput) wpUrlInput.value = b.imageUrl || '';

  toggleFormFields();
  updateBannerLivePreview();

  formTitle.textContent = `Edit Banner: ${b.title}`;
  submitFormBtn.innerHTML = '<i class="fa-solid fa-save"></i> Update Banner';
  cancelEditBtn.style.display = 'inline-block';

  // Scroll to form
  const adminTabBtn = document.querySelector('.tab-btn[data-tab="admin"]');
  if (adminTabBtn && !adminTabBtn.classList.contains('active')) {
    adminTabBtn.click();
  }

  const adminFormCard = document.querySelector('.form-card');
  if (adminFormCard) adminFormCard.scrollIntoView({ behavior: 'smooth' });
}

// Initial banner fetch
loadBanners();
