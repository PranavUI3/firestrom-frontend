/**
 * TerraTrend – Earth Systems Trend Detective
 * globalMap.js - Interactive Geospatial Trend Map & Multi-Parameter Filter Controller
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize UI components
  TerraComponents.initSidebar();
  TerraComponents.initHeader('Global Trend Map', 'Interactive geospatial intelligence for global Earth observations');

  let leafletMap = null;
  let markersLayer = null;
  let allPoints = [];

  // Filter elements
  const varFilterSelect = document.getElementById('tt-map-var-filter');
  const datasetFilterSelect = document.getElementById('tt-map-dataset-filter');
  const sigFilterSelect = document.getElementById('tt-map-sig-filter');
  const countDisplay = document.getElementById('tt-map-points-count');
  const resetBtn = document.getElementById('tt-map-reset-btn');

  // Initialize Map
  initMap();
  await loadAndRenderPoints();
  setupFilterListeners();

  if (window.lucide) window.lucide.createIcons();

  /**
   * Leaflet World Map Initialization
   */
  function initMap() {
    const container = document.getElementById('tt-leaflet-global-map');
    if (!container || typeof L === 'undefined') return;

    leafletMap = L.map('tt-leaflet-global-map', {
      center: [20, 10],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 10,
      worldCopyJump: true
    });

    // Dark-styled NASA Earth observation basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; NASA Earthdata',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(leafletMap);

    markersLayer = L.layerGroup().addTo(leafletMap);
  }

  /**
   * Load Trend Data Points and Apply Filter
   */
  async function loadAndRenderPoints() {
    if (!leafletMap || !markersLayer) return;

    markersLayer.clearLayers();

    const filters = {
      variable: varFilterSelect ? varFilterSelect.value : 'all',
      dataset: datasetFilterSelect ? datasetFilterSelect.value : 'all',
      significance: sigFilterSelect ? sigFilterSelect.value : 'all'
    };

    const res = await TerraAPI.getGlobalTrends(filters);
    allPoints = res.data || [];

    if (countDisplay) {
      countDisplay.textContent = `${allPoints.length} sites displayed`;
    }

    allPoints.forEach(pt => {
      // Create stylized circular SVG pulse marker
      const marker = L.circleMarker(pt.coords, {
        radius: 8,
        fillColor: pt.color,
        color: '#FFFFFF',
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.85
      });

      const popupContent = `
        <div class="tt-map-popup-card">
          <div class="tt-popup-header">
            <span class="tt-popup-region">${pt.region}</span>
            <span class="tt-badge ${pt.significance === 'statistically_significant' ? 'badge-danger' : (pt.significance === 'not_significant' ? 'badge-success' : 'badge-neutral')}">
              ${pt.statusLabel.split('(')[0].trim()}
            </span>
          </div>

          <div class="tt-popup-var">${pt.variableName}</div>

          <div class="tt-popup-details">
            <div class="tt-popup-row">
              <span>Rate of Change:</span>
              <strong style="color: ${pt.color}; font-family: var(--font-mono);">${pt.rateOfChange}</strong>
            </div>
            <div class="tt-popup-row">
              <span>NASA Source:</span>
              <strong>${pt.dataset}</strong>
            </div>
            <div class="tt-popup-row">
              <span>p-value:</span>
              <strong style="font-family: var(--font-mono);">${pt.pValue}</strong>
            </div>
          </div>

          <p style="font-size: 0.75rem; color: #94A3B8; margin-bottom: 0.75rem;">${pt.detail}</p>

          <a href="detective.html?variable=${pt.variable}&regionName=${encodeURIComponent(pt.region)}&lat=${pt.coords[0]}&lon=${pt.coords[1]}" class="tt-btn tt-btn-primary tt-btn-sm tt-popup-cta">
            <i data-lucide="search-check"></i>
            <span>Deep Dive in Detective</span>
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 320 });
      markersLayer.addLayer(marker);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Filter Event Listeners
   */
  function setupFilterListeners() {
    if (varFilterSelect) varFilterSelect.addEventListener('change', loadAndRenderPoints);
    if (datasetFilterSelect) datasetFilterSelect.addEventListener('change', loadAndRenderPoints);
    if (sigFilterSelect) sigFilterSelect.addEventListener('change', loadAndRenderPoints);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (varFilterSelect) varFilterSelect.value = 'all';
        if (datasetFilterSelect) datasetFilterSelect.value = 'all';
        if (sigFilterSelect) sigFilterSelect.value = 'all';
        loadAndRenderPoints();
        TerraUtils.showToast('Map filters reset to default', 'info');
      });
    }
  }
});
