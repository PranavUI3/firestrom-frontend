/**
 * TerraTrend – Earth Systems Trend Detective
 * detective.js - Interactive Investigation Workspace & Multi-Step Analysis Controller
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize UI components
  TerraComponents.initSidebar();
  TerraComponents.initHeader('Trend Detective', 'Interactive environmental trend investigation workspace');

  // Form State
  const state = {
    variableId: 'air_temp',
    regionId: 'amazon',
    regionName: 'Amazon Rainforest Basin',
    country: 'Brazil / Peru / Colombia',
    lat: -3.4653,
    lon: -62.2159,
    startYear: 2005,
    endYear: 2023,
    resolution: 'monthly',
    datasetId: 'AIRS',
    tests: {
      linearRegression: true,
      mannKendall: true,
      confidenceInterval: 0.95
    }
  };

  let detectiveMap = null;
  let mapMarker = null;

  // DOM Elements
  const variableSelect = document.getElementById('tt-det-variable-select');
  const varPreviewName = document.getElementById('tt-var-preview-name');
  const varPreviewCategory = document.getElementById('tt-var-preview-category');
  const varPreviewDesc = document.getElementById('tt-var-preview-desc');
  const varPreviewUnit = document.getElementById('tt-var-preview-unit');
  const varPreviewDataset = document.getElementById('tt-var-preview-dataset');

  const regionSelect = document.getElementById('tt-det-region-select');
  const countryInput = document.getElementById('tt-det-country-input');
  const latInput = document.getElementById('tt-det-lat-input');
  const lonInput = document.getElementById('tt-det-lon-input');
  const startYearSelect = document.getElementById('tt-det-start-year');
  const endYearSelect = document.getElementById('tt-det-end-year');

  const analyzeBtn = document.getElementById('tt-analyze-submit-btn');
  const progressOverlay = document.getElementById('tt-analysis-progress');
  const progressFill = document.getElementById('tt-progress-fill-bar');
  const progressStageText = document.getElementById('tt-progress-stage-label');

  // Summary Sidebar Elements
  const sumVar = document.getElementById('tt-sum-variable');
  const sumRegion = document.getElementById('tt-sum-region');
  const sumTime = document.getElementById('tt-sum-time');
  const sumSource = document.getElementById('tt-sum-source');
  const sumMethod = document.getElementById('tt-sum-method');

  // Check URL params to prefill from other pages (e.g. from Variables, Demos or Map)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('variable')) {
    state.variableId = urlParams.get('variable');
  }
  if (urlParams.get('region')) {
    state.regionId = urlParams.get('region');
  }
  if (urlParams.get('regionName')) {
    state.regionName = urlParams.get('regionName');
  }
  if (urlParams.get('lat') && urlParams.get('lon')) {
    state.lat = parseFloat(urlParams.get('lat'));
    state.lon = parseFloat(urlParams.get('lon'));
  }
  if (urlParams.get('dataset')) {
    state.datasetId = urlParams.get('dataset');
  }

  // Populate Dropdowns & Options
  await populateVariablesDropdown();
  await populateRegionsDropdown();
  initPresetBenchmarkButtons();
  populateYearsDropdown();
  initLeafletMap();
  initDataSources();
  initResolutionToggle();
  initSettingsCheckboxes();
  updateVariablePreview();
  updateSummarySidebar();

  if (window.lucide) window.lucide.createIcons();

  /**
   * Populate Variables Select Dropdown
   */
  async function populateVariablesDropdown() {
    if (!variableSelect) return;
    let list = TerraMockData.variables;
    try {
      const res = await TerraAPI.getVariables();
      if (res && res.data && res.data.length > 0) list = res.data;
    } catch (e) {
      console.warn('Using local variable list', e);
    }
    variableSelect.innerHTML = list.map(v => `
      <option value="${v.id}" ${v.id === state.variableId ? 'selected' : ''}>
        ${v.name} (${v.categoryName || v.category}) - [${v.shortUnit || v.unit}]
      </option>
    `).join('');

    variableSelect.addEventListener('change', () => {
      state.variableId = variableSelect.value;
      updateVariablePreview();
      updateSummarySidebar();
    });
  }

  /**
   * Update Variable Preview Box
   */
  function updateVariablePreview() {
    const v = TerraMockData.variables.find(item => item.id === state.variableId);
    if (!v) return;

    if (varPreviewName) varPreviewName.textContent = v.name;
    if (varPreviewCategory) {
      varPreviewCategory.textContent = v.categoryName;
      varPreviewCategory.className = `tt-category-pill pill-${v.category}`;
    }
    if (varPreviewDesc) varPreviewDesc.textContent = v.description;
    if (varPreviewUnit) varPreviewUnit.textContent = v.unit;
    if (varPreviewDataset) varPreviewDataset.textContent = v.associatedDataset;

    // Auto-align default dataset if applicable
    if (v.datasetId && document.querySelector(`[data-source-id="${v.datasetId}"]`)) {
      selectDataSource(v.datasetId);
    }
  }

  /**
   * Populate Preset Regions Dropdown
   */
  async function populateRegionsDropdown() {
    if (!regionSelect) return;
    let list = TerraMockData.regions;
    try {
      const res = await TerraAPI.getRegions();
      if (res && res.data && res.data.length > 0) list = res.data;
    } catch (e) {
      console.warn('Using local region list', e);
    }
    regionSelect.innerHTML = `
      <option value="custom">-- Custom Coordinates / Map Selection --</option>
      ${list.map(r => `
        <option value="${r.id}" ${r.id === state.regionId ? 'selected' : ''}>
          ${r.name} (${r.country || 'Global'})
        </option>
      `).join('')}
    `;

    regionSelect.addEventListener('change', () => {
      const selectedId = regionSelect.value;
      if (selectedId === 'custom') {
        state.regionId = null;
        state.regionName = 'Custom Geographical Coordinate';
      } else {
        const r = TerraMockData.regions.find(item => item.id === selectedId);
        if (r) {
          state.regionId = r.id;
          state.regionName = r.name;
          state.country = r.country;
          state.lat = r.lat;
          state.lon = r.lon;
          if (latInput) latInput.value = r.lat;
          if (lonInput) lonInput.value = r.lon;
          if (countryInput) countryInput.value = r.country;

          if (detectiveMap) {
            detectiveMap.setView([r.lat, r.lon], r.zoom || 5);
            if (mapMarker) mapMarker.setLatLng([r.lat, r.lon]);
          }
        }
      }
      updateSummarySidebar();
    });

    // Preset pills click listeners
    const presetPills = document.querySelectorAll('.tt-preset-pill');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        presetPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const rId = pill.getAttribute('data-region-id');
        if (regionSelect) {
          regionSelect.value = rId;
          regionSelect.dispatchEvent(new Event('change'));
        }
      });
    });

    // Lat/Lon manual inputs
    if (latInput) {
      latInput.value = state.lat;
      latInput.addEventListener('change', () => {
        const val = parseFloat(latInput.value);
        if (!isNaN(val) && val >= -90 && val <= 90) {
          state.lat = val;
          if (regionSelect) regionSelect.value = 'custom';
          state.regionId = null;
          state.regionName = `Lat: ${val.toFixed(2)}, Lon: ${state.lon.toFixed(2)}`;
          if (detectiveMap) {
            detectiveMap.setView([state.lat, state.lon], 5);
            if (mapMarker) mapMarker.setLatLng([state.lat, state.lon]);
          }
          updateSummarySidebar();
        }
      });
    }

    if (lonInput) {
      lonInput.value = state.lon;
      lonInput.addEventListener('change', () => {
        const val = parseFloat(lonInput.value);
        if (!isNaN(val) && val >= -180 && val <= 180) {
          state.lon = val;
          if (regionSelect) regionSelect.value = 'custom';
          state.regionId = null;
          state.regionName = `Lat: ${state.lat.toFixed(2)}, Lon: ${val.toFixed(2)}`;
          if (detectiveMap) {
            detectiveMap.setView([state.lat, state.lon], 5);
            if (mapMarker) mapMarker.setLatLng([state.lat, state.lon]);
          }
          updateSummarySidebar();
        }
      });
    }
  }

  /**
   * Leaflet Map Initialization for Location Selection
   */
  function initLeafletMap() {
    const mapContainer = document.getElementById('tt-detective-leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    detectiveMap = L.map('tt-detective-leaflet-map', {
      center: [state.lat, state.lon],
      zoom: 4,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(detectiveMap);

    mapMarker = L.marker([state.lat, state.lon], { draggable: true }).addTo(detectiveMap);
    mapMarker.bindPopup(`<b>Investigation Focus Point</b><br>${state.regionName}`).openPopup();

    mapMarker.on('dragend', function (e) {
      const pos = e.target.getLatLng();
      updateCoordinatesFromMap(pos.lat, pos.lng);
    });

    detectiveMap.on('click', function (e) {
      mapMarker.setLatLng(e.latlng);
      updateCoordinatesFromMap(e.latlng.lat, e.latlng.lng);
    });
  }

  function updateCoordinatesFromMap(lat, lon) {
    state.lat = parseFloat(lat.toFixed(4));
    state.lon = parseFloat(lon.toFixed(4));
    state.regionId = null;
    state.regionName = `Custom (${state.lat}, ${state.lon})`;
    if (latInput) latInput.value = state.lat;
    if (lonInput) lonInput.value = state.lon;
    if (regionSelect) regionSelect.value = 'custom';
    mapMarker.bindPopup(`<b>Custom Target Location</b><br>Lat: ${state.lat}, Lon: ${state.lon}`).openPopup();
    updateSummarySidebar();
  }

  /**
   * Populate Year Selectors
   */
  function populateYearsDropdown() {
    if (!startYearSelect || !endYearSelect) return;
    const currentYear = 2023;
    let startOptions = '';
    let endOptions = '';

    for (let yr = 2000; yr <= currentYear; yr++) {
      startOptions += `<option value="${yr}" ${yr === state.startYear ? 'selected' : ''}>${yr}</option>`;
      endOptions += `<option value="${yr}" ${yr === state.endYear ? 'selected' : ''}>${yr}</option>`;
    }

    startYearSelect.innerHTML = startOptions;
    endYearSelect.innerHTML = endOptions;

    startYearSelect.addEventListener('change', () => {
      const s = parseInt(startYearSelect.value, 10);
      const e = parseInt(endYearSelect.value, 10);
      if (s >= e) {
        TerraUtils.showToast('Start year must be earlier than End year.', 'warning');
        startYearSelect.value = state.startYear;
      } else {
        state.startYear = s;
        updateSummarySidebar();
      }
    });

    endYearSelect.addEventListener('change', () => {
      const s = parseInt(startYearSelect.value, 10);
      const e = parseInt(endYearSelect.value, 10);
      if (e <= s) {
        TerraUtils.showToast('End year must be later than Start year.', 'warning');
        endYearSelect.value = state.endYear;
      } else {
        state.endYear = e;
        updateSummarySidebar();
      }
    });
  }

  /**
   * Resolution Toggle (Monthly vs Daily)
   */
  function initResolutionToggle() {
    const resOptions = document.querySelectorAll('.tt-res-option');
    resOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        resOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        state.resolution = opt.getAttribute('data-res') || 'monthly';
        updateSummarySidebar();
      });
    });
  }

  /**
   * Data Source Selection
   */
  function initDataSources() {
    const sourceOptions = document.querySelectorAll('.tt-source-option');
    sourceOptions.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-source-id');
        selectDataSource(id);
      });
    });
  }

  function selectDataSource(id) {
    state.datasetId = id;
    const sourceOptions = document.querySelectorAll('.tt-source-option');
    sourceOptions.forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-source-id') === id);
    });

    const datasetObj = TerraMockData.datasets.find(d => d.id === id);
    const detailBox = document.getElementById('tt-source-detail-text');
    if (detailBox && datasetObj) {
      detailBox.textContent = `${datasetObj.name} - ${datasetObj.description}`;
    }
    updateSummarySidebar();
  }

  /**
   * Statistical Analysis Settings
   */
  function initSettingsCheckboxes() {
    const chkRegression = document.getElementById('tt-check-linear-reg');
    const chkMannKendall = document.getElementById('tt-check-mann-kendall');
    const confidenceSelect = document.getElementById('tt-conf-level-select');

    if (chkRegression) {
      chkRegression.addEventListener('change', (e) => {
        state.tests.linearRegression = e.target.checked;
        updateSummarySidebar();
      });
    }

    if (chkMannKendall) {
      chkMannKendall.addEventListener('change', (e) => {
        state.tests.mannKendall = e.target.checked;
        updateSummarySidebar();
      });
    }

    if (confidenceSelect) {
      confidenceSelect.addEventListener('change', (e) => {
        state.tests.confidenceInterval = parseFloat(e.target.value);
        updateSummarySidebar();
      });
    }
  }

  /**
   * Update Right Sticky Summary
   */
  function updateSummarySidebar() {
    const v = TerraMockData.variables.find(item => item.id === state.variableId);
    if (sumVar) sumVar.textContent = v ? `${v.name} (${v.shortUnit})` : state.variableId;
    if (sumRegion) sumRegion.textContent = state.regionName;
    if (sumTime) sumTime.textContent = `${state.startYear} - ${state.endYear} (${state.resolution.toUpperCase()})`;
    if (sumSource) sumSource.textContent = state.datasetId;

    const methods = [];
    if (state.tests.linearRegression) methods.push('OLS Regression');
    if (state.tests.mannKendall) methods.push('Mann-Kendall');
    methods.push(`${(state.tests.confidenceInterval * 100).toFixed(0)}% CI`);
    if (sumMethod) sumMethod.textContent = methods.join(' + ');
  }

  /**
   * Submit and Execute Trend Investigation
   */
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      // Form validation
      if (!state.variableId) {
        TerraUtils.showToast('Please select an environmental variable.', 'warning');
        return;
      }
      if (state.startYear >= state.endYear) {
        TerraUtils.showToast('Start year must be strictly earlier than end year.', 'danger');
        return;
      }

      // Show Animated Progress Execution
      if (progressOverlay) progressOverlay.classList.add('visible');
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `<i data-lucide="loader" class="tt-toggle-icon" style="animation: spin 1s linear infinite;"></i> <span>Analyzing Earth Data...</span>`;
      if (window.lucide) window.lucide.createIcons();

      const stages = [
        { progress: 20, text: 'Stage 1/4: Ingesting satellite gridded tiles from NASA Earthdata archive...' },
        { progress: 45, text: 'Stage 2/4: Extracting geographical boundary time series & applying quality masks...' },
        { progress: 75, text: 'Stage 3/4: Computing Ordinary Least Squares regression & Mann-Kendall S-statistic...' },
        { progress: 95, text: 'Stage 4/4: Evaluating confidence intervals & calculating significance p-values...' }
      ];

      for (const st of stages) {
        if (progressFill) progressFill.style.width = `${st.progress}%`;
        if (progressStageText) progressStageText.textContent = st.text;
        await new Promise(r => setTimeout(r, 380));
      }

      try {
        // Run analytical pipeline through API Service Layer
        const analysisResult = await TerraAPI.analyzeTrend({
          variableId: state.variableId,
          regionId: state.regionId,
          regionName: state.regionName,
          lat: state.lat,
          lon: state.lon,
          startYear: state.startYear,
          endYear: state.endYear,
          resolution: state.resolution,
          datasetId: state.datasetId,
          confidenceLevel: state.tests.confidenceInterval
        });

        // Store result in sessionStorage for the Results page
        sessionStorage.setItem('tt_latest_analysis', JSON.stringify(analysisResult));

        if (progressFill) progressFill.style.width = '100%';
        if (progressStageText) progressStageText.textContent = 'Analysis complete! Redirecting to results...';

        await new Promise(r => setTimeout(r, 400));
        window.location.href = `results.html?analysisId=${analysisResult.analysisId}`;
      } catch (err) {
        console.error('Analysis execution error:', err);
        TerraUtils.showToast('Failed to complete analysis pipeline. Please check parameters.', 'danger');
        if (progressOverlay) progressOverlay.classList.remove('visible');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `<i data-lucide="play"></i> <span>Analyze Environmental Trend</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
});

  /**
   * User Feature 5: Preset NASA Benchmark Case Studies
   */
  function initPresetBenchmarkButtons() {
    const presetBtns = document.querySelectorAll('.tt-preset-case-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const vId = btn.getAttribute('data-var');
        const rId = btn.getAttribute('data-region');
        const dsId = btn.getAttribute('data-dataset');
        const sYr = parseInt(btn.getAttribute('data-start') || '2000', 10);
        const eYr = parseInt(btn.getAttribute('data-end') || '2023', 10);

        if (variableSelect) {
          variableSelect.value = vId;
          state.variableId = vId;
        }
        if (regionSelect) {
          regionSelect.value = rId;
          state.regionId = rId;
          const matched = TerraMockData.regions.find(item => item.id === rId);
          if (matched) {
            state.regionName = matched.name;
            state.lat = matched.lat;
            state.lon = matched.lon;
            if (latInput) latInput.value = matched.lat;
            if (lonInput) lonInput.value = matched.lon;
            if (detectiveMap) {
              detectiveMap.setView([matched.lat, matched.lon], 5);
              if (mapMarker) mapMarker.setLatLng([matched.lat, matched.lon]);
            }
          }
        }
        if (startYearSelect) {
          startYearSelect.value = sYr.toString();
          state.startYear = sYr;
        }
        if (endYearSelect) {
          endYearSelect.value = eYr.toString();
          state.endYear = eYr;
        }
        if (dsId) {
          state.datasetId = dsId;
          selectDataSource(dsId);
        }

        updateVariablePreview();
        updateSummarySidebar();
        TerraUtils.showToast(`Loaded benchmark preset: ${btn.textContent.trim()}`, 'success');
      });
    });
  }
