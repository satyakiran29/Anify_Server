// State management
let currentPage = 1;
let currentLimit = 12;
let currentSearch = '';
let currentCategory = '';
let currentSort = '';
let selectedWallpaperIdForEdit = null;
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

// API Console DOM
const apiCards = document.querySelectorAll('.api-endpoint-card');
const jsonPre = document.getElementById('jsonPre');
const copyJsonBtn = document.getElementById('copyJsonBtn');

// Admin DOM
const wallpaperForm = document.getElementById('wallpaperForm');
const wpIdInput = document.getElementById('wpId');
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
  loadExplorerWallpapers();
  setupExplorerFilters();
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

      // Special triggers on tab focus
      if (tabName === 'admin') {
        toggleAdminViewState();
      } else if (tabName === 'explorer') {
        loadExplorerWallpapers();
      }
    });
  });
}

// Load System Statistics
async function loadStats() {
  try {
    const res = await fetch('/api/v1/wallpapers/stats');
    const data = await res.json();
    if (data.status === 'success') {
      const s = data.data.stats;
      statTotal.textContent = s.totalWallpapers;
      statCategories.textContent = s.totalCategories;
      statAuthors.textContent = s.totalAuthors;
      
      // Format uptime
      const hrs = Math.floor(s.serverUptimeSeconds / 3600);
      const mins = Math.floor((s.serverUptimeSeconds % 3600) / 60);
      const secs = s.serverUptimeSeconds % 60;
      statUptime.textContent = `${hrs}h ${mins}m ${secs}s`;
    }
  } catch (err) {
    console.error('Failed to load server stats', err);
  }
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
        
        card.innerHTML = `
          <div class="wp-thumbnail-container">
            <img src="${thumbUrl}" alt="${wp.name}" onerror="this.src='https://placehold.co/400x600/120e2e/00f2fe?text=Image+Not+Found'">
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
    loadAdminWallpapers();
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

  // Source Toggle Listener
  imageSourceGroup.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'upload') {
        fileUploadContainer.style.display = 'block';
        remoteUrlContainer.style.display = 'none';
        wpFileInput.required = selectedWallpaperIdForEdit === null; // only required on add
        wpUrlInput.required = false;
      } else {
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'block';
        wpFileInput.required = false;
        wpUrlInput.required = true;
      }
    });
  });

  // File selected display
  wpFileInput.addEventListener('change', () => {
    if (wpFileInput.files.length > 0) {
      const file = wpFileInput.files[0];
      fileSelectedName.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      fileSelectedName.style.display = 'block';
    } else {
      fileSelectedName.style.display = 'none';
    }
  });

  // Drag & drop handlers
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--accent-cyan)';
      dropArea.style.backgroundColor = 'rgba(0, 242, 254, 0.05)';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'var(--border-glass)';
      dropArea.style.backgroundColor = 'rgba(10, 5, 25, 0.4)';
    }, false);
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      wpFileInput.files = files;
      // Trigger file display
      const event = new Event('change');
      wpFileInput.dispatchEvent(event);
    }
  });

  // Form Submit Handler
  wallpaperForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = wpNameInput.value.trim();
    const author = wpAuthorInput.value.trim();
    const category = wpCategorySelect.value;
    const dimensions = wpDimensionsInput.value.trim();
    const copyright = wpCopyrightInput.value.trim();
    const source = document.querySelector('input[name="imageSource"]:checked').value;
    
    // Construct FormData to handle binary uploads
    const formData = new FormData();
    formData.append('name', name);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('dimensions', dimensions);
    formData.append('copyright', copyright);

    if (source === 'upload') {
      if (wpFileInput.files.length > 0) {
        formData.append('image', wpFileInput.files[0]);
      } else if (!selectedWallpaperIdForEdit) {
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

    submitFormBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    submitFormBtn.disabled = true;

    try {
      let res;
      const headers = {
        'Authorization': `Bearer ${adminToken}`
      };
      if (selectedWallpaperIdForEdit) {
        // Edit Endpoint
        res = await fetch(`/api/v1/wallpapers/${selectedWallpaperIdForEdit}`, {
          method: 'PUT',
          headers,
          body: formData
        });
      } else {
        // Add Endpoint
        res = await fetch('/api/v1/wallpapers', {
          method: 'POST',
          headers,
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
        showToast(data.message || 'Wallpaper saved successfully!');
        resetForm();
        loadStats();
        loadCategories();
        loadAdminWallpapers();
      } else {
        showToast(data.message || 'Failed to save wallpaper.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Failed to save wallpaper.', 'error');
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
      const category = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
      const author = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
      
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
  wpIdInput.value = '';
  wpNameInput.value = '';
  wpAuthorInput.value = 'Anify';
  wpCategorySelect.value = 'Anime';
  wpDimensionsInput.value = '1080p';
  wpCopyrightInput.value = 'Free';
  wpFileInput.value = '';
  wpUrlInput.value = '';
  fileSelectedName.style.display = 'none';
  
  // Set upload back to checked
  document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
  fileUploadContainer.style.display = 'block';
  remoteUrlContainer.style.display = 'none';
  wpFileInput.required = true;
  wpUrlInput.required = false;

  formTitle.textContent = 'Add Wallpaper';
  submitFormBtn.textContent = 'Save Wallpaper';
  cancelEditBtn.style.display = 'none';
}

// Load List of Wallpapers for Admin Panel
async function loadAdminWallpapers() {
  try {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';
    adminListCount.textContent = 'Loading...';

    // Fetch all wallpapers for admin management
    const res = await fetch('/api/v1/wallpapers?limit=1000');
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

        row.innerHTML = `
          <td>
            <img class="table-thumbnail" src="${thumbUrl}" alt="preview" onerror="this.src='https://placehold.co/45x60/120e2e/00f2fe?text=Err'">
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
      setupAdminTableActions(wallpapers);
    }
  } catch (err) {
    adminTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">Error loading admin database.</td></tr>';
    adminListCount.textContent = 'Connection Error';
    console.error(err);
  }
}

// Bind Edit & Delete functions
function setupAdminTableActions(wallpapers) {
  // Edit Handlers
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const wp = wallpapers.find(w => w.id === id);
      if (!wp) return;

      selectedWallpaperIdForEdit = id;
      wpIdInput.value = wp.id;
      wpNameInput.value = wp.name;
      wpAuthorInput.value = wp.author;
      wpCategorySelect.value = wp.category;
      wpDimensionsInput.value = wp.dimensions;
      wpCopyrightInput.value = wp.copyright;

      // Check if URL is local upload or remote
      if (wp.url.startsWith('/uploads/')) {
        document.querySelector('input[name="imageSource"][value="upload"]').checked = true;
        fileUploadContainer.style.display = 'block';
        remoteUrlContainer.style.display = 'none';
        fileSelectedName.textContent = `Currently using uploaded file: ${wp.url.replace('/uploads/', '')}`;
        fileSelectedName.style.display = 'block';
        wpFileInput.required = false; // file not required on edits
        wpUrlInput.required = false;
      } else {
        document.querySelector('input[name="imageSource"][value="url"]').checked = true;
        fileUploadContainer.style.display = 'none';
        remoteUrlContainer.style.display = 'block';
        wpUrlInput.value = wp.url;
        wpFileInput.required = false;
        wpUrlInput.required = true;
      }

      formTitle.textContent = 'Edit Wallpaper';
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
        const res = await fetch(`/api/v1/wallpapers/${id}`, {
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
          loadAdminWallpapers();
          
          // If deleted wallpaper was currently being edited, reset the form
          if (selectedWallpaperIdForEdit === id) {
            resetForm();
          }
        } else {
          showToast(data.message || 'Failed to delete wallpaper.', 'error');
        }
      } catch (err) {
        showToast('Connection error. Failed to delete wallpaper.', 'error');
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
  lightboxImg.src = wp.url;
  lightboxCategory.textContent = wp.category;
  lightboxTitle.textContent = wp.name;
  lightboxAuthor.textContent = `by ${wp.author}`;
  lightboxResolution.textContent = wp.dimensions || '1080p';
  lightboxLicense.textContent = wp.copyright || 'Free';
  lightboxDownloadBtn.href = wp.url;

  wpLightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Disable background scrolling
}

// Close Lightbox Modal
function closeLightbox() {
  wpLightbox.style.display = 'none';
  document.body.style.overflow = ''; // Re-enable background scrolling
  lightboxImg.src = ''; // Clear source to stop loading
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
