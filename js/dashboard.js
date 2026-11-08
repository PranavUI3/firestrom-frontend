/**
 * TerraTrend – Earth Systems Trend Detective
 * dashboard.js - Overview Analytics Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize UI components
  TerraComponents.initSidebar();
  TerraComponents.initHeader('Earth Systems Overview', 'Explore environmental observations and discover how our planet is changing');

  let globalTempChartInstance = null;
  let miniMapInstance = null;

  // Initialize Dashboard Sections
  initQuickStats();
  await initGlobalTrendChart('all');
  initFeaturedVariables();
  initRecentDiscoveries();
  initMiniMap();
  initRecentDatasets();
  setupEventListeners();

  if (window.lucide) window.lucide.createIcons();

  /**
   * Statistical Overview Cards
   */
  function initQuickStats() {
    // Demo numbers labeled as sample data
    const varsCount = TerraMockData.variables.length;
    const regionsCount = TerraMockData.regions.length;
    const sigTrendsCount = TerraMockData.globalTrendPoints.filter(p => p.significance === 'statistically_significant').length;
    const datasetsCount = TerraMockData.datasets.length;

    const elVars = document.getElementById('tt-stat-vars-count');
    const elRegions = document.getElementById('tt-stat-regions-count');
    const elTrends = document.getElementById('tt-stat-trends-count');
    const elDatasets = document.getElementById('tt-stat-datasets-count');

    if (elVars) elVars.textContent = varsCount;
    if (elRegions) elRegions.textContent = regionsCount;
    if (elTrends) elTrends.textContent = `${sigTrendsCount} / ${TerraMockData.globalTrendPoints.length}`;
    if (elDatasets) elDatasets.textContent = datasetsCount;
  }

  /**
   * Main Global Environmental Trend Line Chart (Chart.js)
   */
  async function initGlobalTrendChart(filterRange = 'all') {
    const canvas = document.getElementById('tt-dashboard-main-chart');
    if (!canvas) return;

    let startYr = 2000;
    const endYr = 2023;

    if (filterRange === '10y') startYr = 2013;
    else if (filterRange === '5y') startYr = 2018;

    // Generate Global Temperature anomaly time series
    const tsData = TerraMockData.generateTimeSeries({
      variableId: 'air_temp',
      startYear: startYr,
      endYear: endYr,
      resolution: 'monthly',
      region: { id: 'global', name: 'Global Surface Troposphere' },
      noiseSeed: 88
    });

    const reg = TerraUtils.calculateLinearRegression(tsData.xIndices, tsData.observations);

    const ctx = canvas.getContext('2d');
    if (globalTempChartInstance) {
      globalTempChartInstance.destroy();
    }

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    globalTempChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: tsData.timestamps,
        datasets: [
          {
            label: 'Observed Monthly Temperature (°C)',
            data: tsData.observations,
            borderColor: '#38BDF8',
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            pointRadius: 1.5,
            pointHoverRadius: 5,
            tension: 0.3
          },
          {
            label: `Linear Trend Line (+${(reg.slope * 10).toFixed(2)} °C/decade)`,
            data: reg.predicted,
            borderColor: '#F59E0B',
            borderWidth: 2.5,
            borderDash: [6, 4],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94A3B8',
              font: { family: 'Inter', size: 12 },
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            backgroundColor: '#141F30',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} °C`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#64748B',
              maxTicksLimit: 12,
              font: { family: 'Inter', size: 11 }
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#64748B',
              font: { family: 'Inter', size: 11 },
              callback: function (val) {
                return val.toFixed(1) + ' °C';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Environmental Variables Cards
   */
  function initFeaturedVariables() {
    const container = document.getElementById('tt-dashboard-vars-container');
    if (!container) return;

    // Pick 6 primary core variables
    const featured = TerraMockData.variables.filter(v => 
      ['air_temp', 'precipitation', 'soil_moisture', 'ndvi', 'evapotranspiration', 'ozone'].includes(v.id)
    );

    const iconsMap = {
      air_temp: 'thermometer',
      precipitation: 'cloud-rain',
      soil_moisture: 'droplets',
      ndvi: 'trees',
      evapotranspiration: 'wind',
      ozone: 'shield-alert'
    };

    container.innerHTML = featured.map(v => `
      <div class="tt-dash-var-card">
        <div>
          <div class="tt-dash-var-header">
            <div class="tt-dash-var-icon">
              <i data-lucide="${iconsMap[v.id] || 'activity'}"></i>
            </div>
            <div>
              <h4 class="tt-dash-var-name">${v.name}</h4>
              <span class="tt-category-pill pill-${v.category}">${v.categoryName}</span>
            </div>
          </div>
          <p class="tt-dash-var-desc">${v.description.substring(0, 110)}...</p>
        </div>
        <div class="tt-dash-var-footer">
          <span class="tt-dash-var-unit">${v.shortUnit}</span>
          <a href="detective.html?variable=${v.id}" class="tt-dash-var-btn">
            <span>Explore</span>
            <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </div>
    `).join('');
  }

  /**
   * Recent Trend Discoveries Table
   */
  function initRecentDiscoveries() {
    const tbody = document.getElementById('tt-discoveries-tbody');
    if (!tbody) return;

    const discoveries = TerraMockData.globalTrendPoints.slice(0, 5);

    tbody.innerHTML = discoveries.map(item => {
      const isUp = item.trendDirection === 'increasing';
      const isDown = item.trendDirection === 'decreasing';
      const rateClass = isUp ? 'tt-rate-up' : (isDown ? 'tt-rate-down' : '');
      const badgeHTML = TerraUtils.getTrendBadgeHTML(item.trendDirection, item.significance);

      return `
        <tr>
          <td>
            <strong>${item.variableName}</strong>
            <span class="tt-text-muted d-block" style="font-size: 0.72rem;">${item.dataset}</span>
          </td>
          <td>${item.region}</td>
          <td>${badgeHTML}</td>
          <td><span class="tt-table-rate ${rateClass}">${item.rateOfChange}</span></td>
          <td>
            <span class="tt-badge ${item.significance === 'statistically_significant' ? 'badge-success' : 'badge-neutral'}">
              ${item.statusLabel}
            </span>
          </td>
          <td>
            <a href="detective.html?variable=${item.variable}&regionName=${encodeURIComponent(item.region)}&lat=${item.coords[0]}&lon=${item.coords[1]}" class="tt-btn tt-btn-outline tt-btn-sm">
              <i data-lucide="search-check"></i>
              <span>Inspect</span>
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Mini Map Preview using Leaflet
   */
  function initMiniMap() {
    const mapContainer = document.getElementById('tt-dashboard-map-container');
    if (!mapContainer || typeof L === 'undefined') return;

    miniMapInstance = L.map('tt-dashboard-map-container', {
      center: [20, 0],
      zoom: 1.5,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(miniMapInstance);

    // Add illustrative trend markers
    TerraMockData.globalTrendPoints.slice(0, 10).forEach(point => {
      const circle = L.circleMarker(point.coords, {
        radius: 6,
        fillColor: point.color,
        color: '#FFFFFF',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.8
      }).addTo(miniMapInstance);

      circle.bindPopup(`
        <div style="font-size: 0.8rem; padding: 4px;">
          <strong>${point.region}</strong><br>
          <span style="color: #38BDF8;">${point.variableName}</span><br>
          Rate: <b>${point.rateOfChange}</b>
        </div>
      `);
    });
  }

  /**
   * Recently Analyzed Datasets List
   */
  function initRecentDatasets() {
    const container = document.getElementById('tt-recent-datasets-list');
    if (!container) return;

    container.innerHTML = TerraMockData.datasets.slice(0, 4).map(d => `
      <div class="tt-dash-dataset-item">
        <div class="tt-dataset-main">
          <span class="tt-dataset-badge">${d.id}</span>
          <div>
            <h5 class="tt-dataset-title">${d.name.split('(')[0].trim()}</h5>
            <span class="tt-dataset-coverage">Coverage: ${d.temporalCoverage} &bull; ${d.spatialResolution}</span>
          </div>
        </div>
        <a href="detective.html?dataset=${d.id}" class="tt-btn tt-btn-outline tt-btn-sm" title="Investigate with ${d.id}">
          <i data-lucide="play"></i>
        </a>
      </div>
    `).join('');
  }

  /**
   * Event Listeners for Range Toggles
   */
  function setupEventListeners() {
    const toggleButtons = document.querySelectorAll('[data-chart-range]');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const range = btn.getAttribute('data-chart-range');
        initGlobalTrendChart(range);
      });
    });
  }
});
