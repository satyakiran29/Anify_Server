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

let currentAdminTableMode = 'static'; // 'static', 'live', or 'ringtone'
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

// Table Toggles
const adminTableToggleStatic = document.getElementById('adminTableToggleStatic');
const adminTableToggleLive = document.getElementById('adminTableToggleLive');
const adminTableToggleRingtone = document.getElementById('adminTableToggleRingtone');

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
  loadExplorerWallpapers();
  loadLiveExplorerWallpapers();
  loadRingtones();
  setupExplorerFilters();
  setupLiveExplorerFilters();
  setupRingtoneFilters();
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

      // Special triggers on tab focus
      if (tabName === 'admin') {
        toggleAdminViewState();
      } else if (tabName === 'explorer') {
        loadExplorerWallpapers();
      } else if (tabName === 'live-explorer') {
        loadLiveExplorerWallpapers();
      } else if (tabName === 'ringtone-explorer') {
        loadRingtones();
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
    } else {
      loadAdminRingtones();
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
    if (wpFileInput.files.length > 0) {
      const file = wpFileInput.files[0];
      fileSelectedName.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      fileSelectedName.style.display = 'block';
    } else {
      fileSelectedName.style.display = 'none';
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
    if (wpRingtoneFileInput.files.length > 0) {
      const file = wpRingtoneFileInput.files[0];
      ringtoneSelectedName.textContent = `Selected Audio: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      ringtoneSelectedName.style.display = 'block';
    } else {
      ringtoneSelectedName.style.display = 'none';
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

  // Form Submit Handler
  wallpaperForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = wpTypeSelect.value; // 'static', 'live', or 'ringtone'
    const name = wpNameInput.value.trim();
    const author = wpAuthorInput.value.trim();
    const category = wpCategorySelect.value;
    const dimensions = wpDimensionsInput.value.trim();
    const copyright = wpCopyrightInput.value.trim();
    const duration = wpDurationInput.value.trim();
    const source = document.querySelector('input[name="imageSource"]:checked').value;
    
    // Construct FormData to handle binary uploads
    const formData = new FormData();
    formData.append('name', name);
    formData.append('author', author);

    let isEditMode = false;
    if (type === 'static') {
      isEditMode = !!selectedWallpaperIdForEdit;
    } else if (type === 'live') {
      isEditMode = !!selectedLiveWallpaperIdForEdit;
    } else {
      isEditMode = !!selectedRingtoneIdForEdit;
    }

    if (type === 'static') {
      formData.append('category', category);
      formData.append('dimensions', dimensions);
      formData.append('copyright', copyright);

      if (source === 'upload') {
        if (wpFileInput.files.length > 0) {
          formData.append('image', wpFileInput.files[0]);
        } else if (!isEditMode) {
          showToast('Please select an image file to upload.', 'error');
          return;
        }
      } else {
        const url = wpUrlInput.value.trim();
        if (!url) {
          showToast('Please provide a remote image URL.', 'error');
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
          return;
        }
        formData.append('url', videoUrl);
        if (thumbUrl) {
          formData.append('thumbnail', thumbUrl);
        } else {
          formData.append('thumbnail', videoUrl);
        }
      }
    } else { // 'ringtone'
      formData.append('duration', duration);

      if (source === 'upload') {
        if (wpRingtoneFileInput.files.length > 0) {
          formData.append('audio', wpRingtoneFileInput.files[0]);
        } else if (!isEditMode) {
          showToast('Please select an audio file to upload.', 'error');
          return;
        }
      } else {
        const audioUrl = wpRingtoneUrlInput.value.trim();
        if (!audioUrl) {
          showToast('Please provide a remote audio URL.', 'error');
          return;
        }
        formData.append('url', audioUrl);
      }
    }

    submitFormBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    submitFormBtn.disabled = true;

    try {
      let res;
      const headers = {
        'Authorization': `Bearer ${adminToken}`
      };
      
      let endpoint = '';
      if (type === 'static') {
        endpoint = isEditMode ? `/api/v1/wallpapers/${selectedWallpaperIdForEdit}` : '/api/v1/wallpapers';
      } else if (type === 'live') {
        endpoint = isEditMode ? `/api/v1/livewalls/${selectedLiveWallpaperIdForEdit}` : '/api/v1/livewalls';
      } else {
        endpoint = isEditMode ? `/api/v1/ringtones/${selectedRingtoneIdForEdit}` : '/api/v1/ringtones';
      }

      const method = isEditMode ? 'PUT' : 'POST';

      res = await fetch(endpoint, {
        method,
        headers,
        body: formData
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
        showToast(data.message || 'Saved successfully!');
        resetForm();
        loadStats();
        loadCategories();
        loadLiveCategories();
        if (type === 'static') {
          currentAdminTableMode = 'static';
          syncAdminTableToggleUI();
          loadAdminWallpapers();
        } else if (type === 'live') {
          currentAdminTableMode = 'live';
          syncAdminTableToggleUI();
          loadAdminLivewalls();
        } else {
          currentAdminTableMode = 'ringtone';
          syncAdminTableToggleUI();
          loadAdminRingtones();
        }
      } else {
        showToast(data.message || 'Failed to save.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Failed to save.', 'error');
      console.error(err);
    } finally {
      submitFormBtn.textContent = 'Save Wallpaper';
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
  wpIdInput.value = '';
  wpNameInput.value = '';
  wpAuthorInput.value = 'Anify';
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
  
  // Reset select elements
  wpTypeSelect.value = 'static';
  document.querySelector('input[name="imageSource"][value="upload"]').checked = true;

  // Sync field visibility
  toggleFormFields();

  formTitle.textContent = 'Add Wallpaper';
  submitFormBtn.textContent = 'Save Wallpaper';
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
      const wp = items.find(w => w.id === id);
      if (!wp) return;

      resetForm();

      wpIdInput.value = wp.id;
      wpNameInput.value = wp.name;
      wpAuthorInput.value = wp.author;
      if (wp.category) wpCategorySelect.value = wp.category;
      if (wp.dimensions) wpDimensionsInput.value = wp.dimensions;
      if (wp.copyright) wpCopyrightInput.value = wp.copyright;
      if (wp.duration) wpDurationInput.value = wp.duration;

      wpTypeSelect.value = type;

      // Check if URL is a local upload or a GitHub-hosted upload (not yet pushed = treat as local)
      const isLocal = wp.url.startsWith('/uploads/') || 
        (wp.url.includes('raw.githubusercontent.com') && wp.url.includes('/public/uploads/'));
      // Derive a display filename regardless of URL format
      const uploadFilename = wp.url.includes('/uploads/')
        ? wp.url.split('/uploads/').pop()
        : wp.url.split('/').pop();
      
      if (type === 'static') {
        selectedWallpaperIdForEdit = id;
        if (isLocal) {
          document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
          fileSelectedName.textContent = `Currently using uploaded file: ${uploadFilename}`;
          fileSelectedName.style.display = 'block';
        } else {
          document.querySelector('input[name="imageSource"][value="url"]').checked = true;
          wpUrlInput.value = wp.url;
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
          wpLiveVideoUrlInput.value = wp.url;
          wpLiveThumbUrlInput.value = wp.thumbnail || '';
        }
      } else { // 'ringtone'
        selectedRingtoneIdForEdit = id;
        if (isLocal) {
          document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
          ringtoneSelectedName.textContent = `Currently using uploaded audio: ${uploadFilename}`;
          ringtoneSelectedName.style.display = 'block';
        } else {
          document.querySelector('input[name="imageSource"][value="url"]').checked = true;
          wpRingtoneUrlInput.value = wp.url;
        }
      }

      // Sync inputs visibility
      toggleFormFields();

      formTitle.textContent = type === 'static' ? 'Edit Wallpaper' : (type === 'live' ? 'Edit Live Wallpaper' : 'Edit Ringtone');
      submitFormBtn.textContent = 'Update Details';
      cancelEditBtn.style.display = 'block';
      
      // Scroll to form smoothly
      document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
      wpNameInput.focus();
    });
  });

  // Delete Handlers
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const wpName = btn.closest('tr').querySelector('td:nth-child(2) div:first-child').textContent;
      
      if (!confirm(`Are you absolutely sure you want to delete "${wpName}"?`)) {
        return;
      }

      try {
        const endpoint = type === 'static' 
          ? `/api/v1/wallpapers/${id}` 
          : (type === 'live' ? `/api/v1/livewalls/${id}` : `/api/v1/ringtones/${id}`);
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
          showToast(`"${wpName}" deleted successfully.`);
          loadStats();
          loadCategories();
          loadLiveCategories();
          if (type === 'static') {
            loadAdminWallpapers();
            if (selectedWallpaperIdForEdit === id) resetForm();
          } else if (type === 'live') {
            loadAdminLivewalls();
            if (selectedLiveWallpaperIdForEdit === id) resetForm();
          } else {
            loadAdminRingtones();
            if (selectedRingtoneIdForEdit === id) resetForm();
          }
        } else {
          showToast(data.message || 'Failed to delete.', 'error');
        }
      } catch (err) {
        showToast('Connection error. Failed to delete.', 'error');
        console.error(err);
      }
    });
  });
}

// Setup Lightbox Modal event bindings
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
  const type = wpTypeSelect.value; // 'static', 'live', or 'ringtone'
  const source = document.querySelector('input[name="imageSource"]:checked').value; // 'upload' or 'url'

  const sourceLabel = document.getElementById('imageSourceGroup').querySelector('label');
  
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
  } else {
    // static or live
    if (categoryGroup) categoryGroup.style.display = 'block';
    if (dimensionsGroup) dimensionsGroup.style.display = 'block';
    if (copyrightGroup) copyrightGroup.style.display = 'block';
    if (ringtoneDurationGroup) ringtoneDurationGroup.style.display = 'none';
    
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
        wpFileInput.required = selectedWallpaperIdForEdit === null;
        wpUrlInput.required = false;
      } else {
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'block';
        liveUploadContainer.style.display = 'none';
        liveRemoteUrlContainer.style.display = 'none';
        ringtoneUploadContainer.style.display = 'none';
        ringtoneRemoteUrlContainer.style.display = 'none';
        wpFileInput.required = false;
        wpUrlInput.required = true;
      }
      wpLiveVideoFileInput.required = false;
      wpLiveVideoUrlInput.required = false;
      wpRingtoneFileInput.required = false;
      wpRingtoneUrlInput.required = false;
    } else { // 'live'
      if (sourceLabel) sourceLabel.textContent = 'Video Source';
      if (source === 'upload') {
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'none';
        liveUploadContainer.style.display = 'block';
        liveRemoteUrlContainer.style.display = 'none';
        ringtoneUploadContainer.style.display = 'none';
        ringtoneRemoteUrlContainer.style.display = 'none';
        wpLiveVideoFileInput.required = selectedLiveWallpaperIdForEdit === null;
        wpLiveVideoUrlInput.required = false;
      } else {
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'none';
        liveUploadContainer.style.display = 'none';
        liveRemoteUrlContainer.style.display = 'block';
        ringtoneUploadContainer.style.display = 'none';
        ringtoneRemoteUrlContainer.style.display = 'none';
        wpLiveVideoFileInput.required = false;
        wpLiveVideoUrlInput.required = true;
      }
      wpFileInput.required = false;
      wpUrlInput.required = false;
      wpRingtoneFileInput.required = false;
      wpRingtoneUrlInput.required = false;
    }
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
}

function syncAdminTableToggleUI() {
  if (!adminTableToggleStatic || !adminTableToggleLive || !adminTableToggleRingtone) return;
  if (currentAdminTableMode === 'static') {
    adminTableToggleStatic.className = 'btn btn-primary';
    adminTableToggleLive.className = 'btn btn-outline';
    adminTableToggleRingtone.className = 'btn btn-outline';
  } else if (currentAdminTableMode === 'live') {
    adminTableToggleStatic.className = 'btn btn-outline';
    adminTableToggleLive.className = 'btn btn-primary';
    adminTableToggleRingtone.className = 'btn btn-outline';
  } else {
    adminTableToggleStatic.className = 'btn btn-outline';
    adminTableToggleLive.className = 'btn btn-outline';
    adminTableToggleRingtone.className = 'btn btn-primary';
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

