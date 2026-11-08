/**
 * TerraTrend – Earth Systems Trend Detective
 * variables.js - Environmental Variable Explorer with Dynamic Search, Filters & Details Modal
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize UI components
  TerraComponents.initSidebar();
  TerraComponents.initHeader('Environmental Variables', 'Search and explore Earth system variables captured by NASA satellite instruments');

  const searchInput = document.getElementById('tt-var-search');
  const filterPills = document.querySelectorAll('.tt-category-filter-btn');
  const container = document.getElementById('tt-variables-grid');
  const resultsCounter = document.getElementById('tt-vars-result-count');

  let activeCategory = 'all';
  let currentSearchQuery = '';

  // Parse URL query parameters if present
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  const catParam = urlParams.get('category');

  if (qParam && searchInput) {
    searchInput.value = qParam;
    currentSearchQuery = qParam;
  }

  if (catParam) {
    activeCategory = catParam;
    filterPills.forEach(pill => {
      if (pill.getAttribute('data-category') === catParam) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Initial render
  await renderVariables();

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
      currentSearchQuery = e.target.value.trim();
      await renderVariables();
    });
  }

  // Category filters
  filterPills.forEach(pill => {
    pill.addEventListener('click', async () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category') || 'all';
      await renderVariables();
    });
  });

  /**
   * Fetch and render matching variables
   */
  async function renderVariables() {
    if (!container) return;

    // Show skeleton/loading state
    container.innerHTML = `
      <div class="tt-skeleton" style="height: 220px; border-radius: 16px;"></div>
      <div class="tt-skeleton" style="height: 220px; border-radius: 16px;"></div>
      <div class="tt-skeleton" style="height: 220px; border-radius: 16px;"></div>
    `;

    const res = await TerraAPI.getVariables(activeCategory, currentSearchQuery);
    const list = res.data || [];

    if (resultsCounter) {
      resultsCounter.textContent = `${list.length} variable${list.length === 1 ? '' : 's'} found`;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="tt-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <i data-lucide="search-x" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">No variables match your query</h3>
          <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto 1.5rem;">Try adjusting your keyword or reset category filters to view all available NASA Earth observations.</p>
          <button class="tt-btn tt-btn-outline" id="tt-reset-filters-btn">Clear Search & Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('tt-reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          currentSearchQuery = '';
          activeCategory = 'all';
          filterPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === 'all'));
          renderVariables();
        });
      }

      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const iconsMap = {
      air_temp: 'thermometer',
      ozone: 'shield-alert',
      humidity: 'cloud',
      aod: 'eye',
      lst: 'sun',
      soil_moisture: 'droplets',
      ndvi: 'trees',
      evapotranspiration: 'wind',
      precipitation: 'cloud-rain',
      rainfall_rate: 'cloud-lightning',
      runoff: 'waves',
      streamflow: 'git-commit',
      sst: 'thermometer-snowflake',
      chlorophyll: 'biohazard',
      sea_level: 'trending-up'
    };

    container.innerHTML = list.map(v => `
      <div class="tt-card tt-var-card-preview">
        <div>
          <div class="tt-var-card-top">
            <div class="tt-var-card-icon">
              <i data-lucide="${iconsMap[v.id] || 'activity'}"></i>
            </div>
            <span class="tt-category-pill pill-${v.category}">${v.categoryName}</span>
          </div>

          <h3 class="tt-var-card-name">${v.name}</h3>
          <div class="tt-var-card-unit">Unit: ${v.unit}</div>
          <p class="tt-var-card-desc">${v.description}</p>
        </div>

        <div>
          <div class="tt-var-card-footer">
            <span class="tt-var-card-source">
              <i data-lucide="satellite" style="width: 14px; height: 14px; display: inline-block; vertical-align: -2px; margin-right: 4px;"></i>
              ${v.associatedDataset}
            </span>
            <span class="tt-var-card-source">${v.temporalResolution.split('&')[0]}</span>
          </div>

          <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
            <button class="tt-btn tt-btn-outline tt-btn-sm tt-details-btn" data-var-id="${v.id}" style="flex: 1;">
              <i data-lucide="info"></i>
              <span>Details</span>
            </button>
            <a href="detective.html?variable=${v.id}" class="tt-btn tt-btn-primary tt-btn-sm" style="flex: 1.2;">
              <i data-lucide="search-check"></i>
              <span>Investigate</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Details modal listeners
    container.querySelectorAll('.tt-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-var-id');
        const vObj = TerraMockData.variables.find(item => item.id === id);
        if (vObj) {
          TerraComponents.openVariableModal(vObj);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
});
