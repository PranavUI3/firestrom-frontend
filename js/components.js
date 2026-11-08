/**
 * TerraTrend - Earth Systems Trend Detective
 * components.js - Reusable UI Components: Sidebar, Header, Mobile Nav, Demo Badge, Modals & Notifications
 */

const TerraComponents = (function () {
  'use strict';

  // Navigation Items Specification
  const navItems = [
    { id: 'dashboard', label: 'Overview', url: 'dashboard.html', icon: 'layout-dashboard' },
    { id: 'variables', label: 'Explore Variables', url: 'variables.html', icon: 'layers' },
    { id: 'detective', label: 'Trend Detective', url: 'detective.html', icon: 'search-check', badge: 'Core' },
    { id: 'global-map', label: 'Global Trend Map', url: 'global-map.html', icon: 'globe' },
    { id: 'compare', label: 'Compare Regions', url: 'compare.html', icon: 'git-compare' },
    { id: 'demonstrations', label: 'Demonstrations', url: 'demonstrations.html', icon: 'sparkles' },
    { id: 'about', label: 'About & Methodology', url: 'about.html', icon: 'book-open' }
  ];

  /**
   * Determine active page from current filename
   */
  function getCurrentPageId() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    for (const item of navItems) {
      if (item.url === filename) return item.id;
    }
    if (filename === 'results.html') return 'detective';
    if (filename === 'index.html' || filename === '') return 'landing';
    return '';
  }

  /**
   * Render Sidebar in designated container (#tt-sidebar-container)
   */
  function initSidebar() {
    const container = document.getElementById('tt-sidebar-container');
    if (!container) return;

    const activeId = getCurrentPageId();
    const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';

    const sidebarHTML = `
      <aside class="tt-sidebar ${isCollapsed ? 'collapsed' : ''}" id="tt-sidebar">
        <!-- Sidebar Header -->
        <div class="tt-sidebar-header">
          <a href="index.html" class="tt-brand">
            <div class="tt-brand-logo">
              <i data-lucide="orbit" class="tt-logo-icon"></i>
            </div>
            <div class="tt-brand-text">
              <span class="tt-brand-title">TerraTrend</span>
              <span class="tt-brand-subtitle">NASA Space Apps</span>
            </div>
          </a>
          <button class="tt-sidebar-toggle-btn" id="tt-sidebar-collapse-btn" title="Toggle Sidebar">
            <i data-lucide="chevron-left" class="tt-toggle-icon"></i>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="tt-sidebar-nav">
          <div class="tt-nav-section-title">ANALYTICS SUITE</div>
          <ul class="tt-nav-list">
            ${navItems.map(item => `
              <li class="tt-nav-item">
                <a href="${item.url}" class="tt-nav-link ${item.id === activeId ? 'active' : ''}" data-nav-id="${item.id}">
                  <i data-lucide="${item.icon}" class="tt-nav-icon"></i>
                  <span class="tt-nav-label">${item.label}</span>
                  ${item.badge ? `<span class="tt-nav-badge">${item.badge}</span>` : ''}
                </a>
              </li>
            `).join('')}
          </ul>

          <div class="tt-nav-section-title">QUICK ACTIONS</div>
          <ul class="tt-nav-list">
            <li class="tt-nav-item">
              <a href="detective.html" class="tt-nav-action-btn">
                <i data-lucide="play" class="tt-nav-icon"></i>
                <span class="tt-nav-label">New Investigation</span>
              </a>
            </li>
            <li class="tt-nav-item">
              <a href="index.html" class="tt-nav-link">
                <i data-lucide="home" class="tt-nav-icon"></i>
                <span class="tt-nav-label">Return to Home</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Sidebar Footer Status -->
        <div class="tt-sidebar-footer">
          <div class="tt-data-mode-badge" id="tt-demo-mode-trigger" title="Click to configure backend API">
            <span class="tt-pulse-dot"></span>
            <div class="tt-mode-info">
              <span class="tt-mode-title">DEMO DATA MODE</span>
              <span class="tt-mode-subtitle">NASA Mock Synthetic</span>
            </div>
            <i data-lucide="settings-2" class="tt-mode-icon"></i>
          </div>
        </div>
      </aside>
      <div class="tt-sidebar-backdrop" id="tt-sidebar-backdrop"></div>
    `;

    container.innerHTML = sidebarHTML;

    // Attach Toggle Listener
    const collapseBtn = document.getElementById('tt-sidebar-collapse-btn');
    const sidebar = document.getElementById('tt-sidebar');
    const backdrop = document.getElementById('tt-sidebar-backdrop');

    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const collapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('tt_sidebar_collapsed', collapsed ? 'true' : 'false');
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('visible');
      });
    }

    // Attach Demo Data Modal trigger
    const demoTrigger = document.getElementById('tt-demo-mode-trigger');
    if (demoTrigger) {
      demoTrigger.addEventListener('click', openApiSettingsModal);
    }
  }

  /**
   * Render Top Navigation Bar (#tt-header-container)
   */
  function initHeader(pageTitle = 'Dashboard', subtitle = '') {
    const container = document.getElementById('tt-header-container');
    if (!container) return;

    const headerHTML = `
      <header class="tt-topbar">
        <div class="tt-topbar-left">
          <button class="tt-mobile-menu-btn" id="tt-mobile-menu-btn" aria-label="Open Navigation">
            <i data-lucide="menu"></i>
          </button>
          <div class="tt-page-title-box">
            <h1 class="tt-page-title">${pageTitle}</h1>
            ${subtitle ? `<span class="tt-page-subtitle">${subtitle}</span>` : ''}
          </div>
        </div>

        <div class="tt-topbar-center">
          <div class="tt-global-search">
            <i data-lucide="search" class="tt-search-icon"></i>
            <input type="text" id="tt-global-search-input" placeholder="Search variables, missions, regions... (Press '/' to focus)" aria-label="Search">
            <kbd class="tt-search-kbd">/</kbd>
          </div>
        </div>

        <div class="tt-topbar-right">
          <!-- Demo Data Indicator Badge -->
          <button class="tt-topbar-badge-demo" id="tt-header-demo-badge" title="Backend Connection Status">
            <span class="tt-badge-dot"></span>
            <span class="tt-badge-text">Demo Data</span>
          </button>

          <!-- Notifications trigger -->
          <div class="tt-topbar-dropdown-wrapper">
            <button class="tt-icon-btn" id="tt-notif-btn" title="NASA Observation Updates" aria-label="Notifications">
              <i data-lucide="bell"></i>
              <span class="tt-notif-badge">3</span>
            </button>
            <div class="tt-dropdown-panel tt-notif-panel" id="tt-notif-panel">
              <div class="tt-dropdown-header">
                <h3>Earth Observation Feeds</h3>
                <span class="tt-dropdown-tag">Demo Updates</span>
              </div>
              <ul class="tt-notif-list">
                <li class="tt-notif-item">
                  <span class="tt-notif-dot green"></span>
                  <div class="tt-notif-content">
                    <p class="tt-notif-title">MODIS Aqua 8-Day LST Grids</p>
                    <p class="tt-notif-desc">Global 1km thermal composites calibrated.</p>
                    <span class="tt-notif-time">2 hours ago</span>
                  </div>
                </li>
                <li class="tt-notif-item">
                  <span class="tt-notif-dot blue"></span>
                  <div class="tt-notif-content">
                    <p class="tt-notif-title">GPM IMERG V06 Precipitation</p>
                    <p class="tt-notif-desc">New monthly rainfall anomaly synthesis ready.</p>
                    <span class="tt-notif-time">5 hours ago</span>
                  </div>
                </li>
                <li class="tt-notif-item">
                  <span class="tt-notif-dot orange"></span>
                  <div class="tt-notif-content">
                    <p class="tt-notif-title">AIRS Tropospheric Profiles</p>
                    <p class="tt-notif-desc">High-latitude temperature anomalies indexed.</p>
                    <span class="tt-notif-time">Yesterday</span>
                  </div>
                </li>
              </ul>
              <div class="tt-dropdown-footer">
                <a href="about.html" class="tt-dropdown-link">View NASA Missions Guide &rarr;</a>
              </div>
            </div>
          </div>

          <!-- Quick Launch Detective -->
          <a href="detective.html" class="tt-btn tt-btn-primary tt-btn-sm tt-topbar-cta">
            <i data-lucide="sparkles"></i>
            <span>Trend Detective</span>
          </a>

          <!-- Profile / Mission Badge -->
          <div class="tt-user-badge" title="NASA Space Apps Challenge Participant">
            <span class="tt-user-avatar">TT</span>
            <span class="tt-user-role">Investigator</span>
          </div>
        </div>
      </header>
    `;

    container.innerHTML = headerHTML;

    // Mobile Hamburger
    const mobileBtn = document.getElementById('tt-mobile-menu-btn');
    const sidebar = document.getElementById('tt-sidebar');
    const backdrop = document.getElementById('tt-sidebar-backdrop');

    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('visible');
      });
    }

    // Global Search behavior
    const searchInput = document.getElementById('tt-global-search-input');
    if (searchInput) {
      // Hotkey '/' to focus
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput && !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
          e.preventDefault();
          searchInput.focus();
        }
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
          window.location.href = `variables.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
      });
    }

    // Notifications toggle
    const notifBtn = document.getElementById('tt-notif-btn');
    const notifPanel = document.getElementById('tt-notif-panel');
    if (notifBtn && notifPanel) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPanel.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!notifPanel.contains(e.target) && !notifBtn.contains(e.target)) {
          notifPanel.classList.remove('open');
        }
      });
    }

    // Header Demo badge click
    const headerDemoBadge = document.getElementById('tt-header-demo-badge');
    if (headerDemoBadge) {
      headerDemoBadge.addEventListener('click', openApiSettingsModal);
    }
  }

  /**
   * Modal to inspect and configure API Connection / Demo Mode
   */
  function openApiSettingsModal() {
    const currentUrl = TerraAPI.getApiBaseUrl();
    const isMock = TerraAPI.isMockMode();

    const modalHTML = `
      <div class="tt-modal-overlay" id="tt-api-modal-overlay">
        <div class="tt-modal-card">
          <div class="tt-modal-header">
            <div class="tt-modal-title-wrap">
              <i data-lucide="database" class="tt-modal-header-icon"></i>
              <h3>NASA Data Pipeline & Backend Service</h3>
            </div>
            <button class="tt-modal-close" id="tt-api-modal-close" aria-label="Close">&times;</button>
          </div>

          <div class="tt-modal-body">
            <div class="tt-alert ${isMock ? 'tt-alert-info' : 'tt-alert-success'}">
              <i data-lucide="${isMock ? 'info' : 'check-circle-2'}"></i>
              <div>
                <strong>Current Pipeline Status:</strong>
                ${isMock
                  ? 'Active in <b>Demo / Mock Mode</b> using high-fidelity NASA-inspired synthetic data generator. All statistical tests (Linear Regression, Mann-Kendall, p-values) are calculated dynamically in-browser.'
                  : `Connected to Live Backend API: <code>${currentUrl}</code>`
                }
              </div>
            </div>

            <p class="tt-text-muted">
              TerraTrend is built with an abstracted API service layer (<code>js/api.js</code>). When your Python/Node.js backend or NASA Earthdata API gateway is ready, connect it below:
            </p>

            <div class="tt-form-group">
              <label for="tt-api-url-input">Custom Backend API Base URL (optional):</label>
              <input type="url" id="tt-api-url-input" class="tt-input" placeholder="e.g. https://api.terratrend.org/v1" value="${currentUrl}">
              <span class="tt-help-text">Leave blank to retain client-side synthetic NASA mock dataset.</span>
            </div>

            <div class="tt-api-endpoints-preview">
              <span class="tt-preview-label">Ready API Contracts:</span>
              <ul class="tt-endpoints-list">
                <li><code>GET /variables</code> - Variable inventory & metadata</li>
                <li><code>POST /analyze</code> - Parameterized trend computation</li>
                <li><code>GET /global-trends</code> - Spatial anomaly points for map</li>
                <li><code>POST /compare</code> - Dual regional trend differentiation</li>
              </ul>
            </div>
          </div>

          <div class="tt-modal-footer">
            <button class="tt-btn tt-btn-outline" id="tt-api-modal-reset">Use Default Mock Data</button>
            <button class="tt-btn tt-btn-primary" id="tt-api-modal-save">Save & Apply</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing if any
    const existing = document.getElementById('tt-api-modal-overlay');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.lucide) window.lucide.createIcons();

    const overlay = document.getElementById('tt-api-modal-overlay');
    const closeBtn = document.getElementById('tt-api-modal-close');
    const saveBtn = document.getElementById('tt-api-modal-save');
    const resetBtn = document.getElementById('tt-api-modal-reset');
    const input = document.getElementById('tt-api-url-input');

    const closeModal = () => {
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 250);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    saveBtn.addEventListener('click', () => {
      const val = input.value.trim();
      TerraAPI.setApiBaseUrl(val);
      TerraUtils.showToast(val ? `Backend URL saved: ${val}` : 'Switched to Demo Mock Mode', 'success');
      closeModal();
      setTimeout(() => window.location.reload(), 400);
    });

    resetBtn.addEventListener('click', () => {
      TerraAPI.setApiBaseUrl('');
      TerraUtils.showToast('Reset to NASA Synthetic Demo Data', 'info');
      closeModal();
      setTimeout(() => window.location.reload(), 400);
    });
  }

  /**
   * Modal Manager for Variable Details
   */
  function openVariableModal(variable) {
    if (!variable) return;

    const modalHTML = `
      <div class="tt-modal-overlay" id="tt-var-modal-overlay">
        <div class="tt-modal-card tt-modal-lg">
          <div class="tt-modal-header">
            <div class="tt-modal-title-wrap">
              <span class="tt-category-pill pill-${variable.category}">${variable.categoryName}</span>
              <h2 class="tt-modal-title">${variable.name}</h2>
            </div>
            <button class="tt-modal-close" id="tt-var-modal-close" aria-label="Close">&times;</button>
          </div>

          <div class="tt-modal-body">
            <!-- Grid info -->
            <div class="tt-meta-grid">
              <div class="tt-meta-item">
                <span class="tt-meta-label">Scientific Unit</span>
                <span class="tt-meta-value highlight">${variable.unit}</span>
              </div>
              <div class="tt-meta-item">
                <span class="tt-meta-label">Associated NASA Mission</span>
                <span class="tt-meta-value">${variable.associatedDataset}</span>
              </div>
              <div class="tt-meta-item">
                <span class="tt-meta-label">Temporal Resolution</span>
                <span class="tt-meta-value">${variable.temporalResolution}</span>
              </div>
              <div class="tt-meta-item">
                <span class="tt-meta-label">Global Baseline Mean</span>
                <span class="tt-meta-value">${variable.baselineMean} ${variable.shortUnit}</span>
              </div>
            </div>

            <!-- Deep Scientific Sections -->
            <div class="tt-modal-section">
              <h4>What does this variable measure?</h4>
              <p>${variable.description}</p>
            </div>

            <div class="tt-modal-section">
              <h4>Why is it important in Earth Science?</h4>
              <p>${variable.importance}</p>
            </div>

            <div class="tt-modal-section">
              <h4>Potential Environmental & Societal Applications</h4>
              <ul class="tt-bullet-list">
                ${variable.applications.map(app => `<li><i data-lucide="check"></i> <span>${app}</span></li>`).join('')}
              </ul>
            </div>

            <div class="tt-alert tt-alert-info">
              <i data-lucide="satellite"></i>
              <div>
                <strong>Data Source Note:</strong> NASA Earthdata satellite observations are calibrated against ground validation networks before assimilation into models like MERRA-2 and GLDAS.
              </div>
            </div>
          </div>

          <div class="tt-modal-footer">
            <button class="tt-btn tt-btn-outline" id="tt-var-modal-dismiss">Close</button>
            <a href="detective.html?variable=${variable.id}" class="tt-btn tt-btn-primary">
              <i data-lucide="search-check"></i>
              <span>Investigate Variable in Detective</span>
            </a>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('tt-var-modal-overlay');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.lucide) window.lucide.createIcons();

    const overlay = document.getElementById('tt-var-modal-overlay');
    const closeBtn = document.getElementById('tt-var-modal-close');
    const dismissBtn = document.getElementById('tt-var-modal-dismiss');

    const closeModal = () => {
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 250);
    };

    closeBtn.addEventListener('click', closeModal);
    dismissBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Close on Escape
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        window.removeEventListener('keydown', onKey);
      }
    };
    window.addEventListener('keydown', onKey);
  }

  /**
   * Global initialization hook
   */
  function init() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  return {
    initSidebar,
    initHeader,
    openApiSettingsModal,
    openVariableModal,
    init
  };
})();

if (typeof window !== 'undefined') {
  window.TerraComponents = TerraComponents;
}
