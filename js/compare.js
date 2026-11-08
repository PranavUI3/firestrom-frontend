/**
 * TerraTrend – Earth Systems Trend Detective
 * compare.js - Dual Regional Environmental Comparison Controller
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize UI components
  TerraComponents.initSidebar();
  TerraComponents.initHeader('Compare Regions', 'Contrast environmental variables and trend dynamics across distinct geographical biomes');

  let chartInstanceA = null;
  let chartInstanceB = null;

  // DOM Elements
  const regionASelect = document.getElementById('tt-comp-region-a');
  const regionBSelect = document.getElementById('tt-comp-region-b');
  const variableSelect = document.getElementById('tt-comp-variable');
  const periodSelect = document.getElementById('tt-comp-period');
  const compareBtn = document.getElementById('tt-comp-run-btn');

  // Populate Dropdowns
  populateSelectors();
  setupPresetComparisons();

  // Run initial comparison
  await executeComparison();

  if (window.lucide) window.lucide.createIcons();

  /**
   * Populate Dropdowns
   */
  function populateSelectors() {
    if (regionASelect) {
      regionASelect.innerHTML = TerraMockData.regions.map((r, i) => `
        <option value="${r.id}" ${i === 0 ? 'selected' : ''}>${r.name} (${r.country})</option>
      `).join('');
    }

    if (regionBSelect) {
      regionBSelect.innerHTML = TerraMockData.regions.map((r, i) => `
        <option value="${r.id}" ${i === 1 ? 'selected' : ''}>${r.name} (${r.country})</option>
      `).join('');
    }

    if (variableSelect) {
      variableSelect.innerHTML = TerraMockData.variables.map(v => `
        <option value="${v.id}" ${v.id === 'lst' ? 'selected' : ''}>${v.name} (${v.shortUnit})</option>
      `).join('');
    }

    if (compareBtn) {
      compareBtn.addEventListener('click', executeComparison);
    }
  }

  /**
   * Quick Preset Comparison Buttons
   */
  function setupPresetComparisons() {
    const presets = document.querySelectorAll('.tt-comp-preset-pill');
    presets.forEach(btn => {
      btn.addEventListener('click', () => {
        const regA = btn.getAttribute('data-rega');
        const regB = btn.getAttribute('data-regb');
        const varId = btn.getAttribute('data-var');

        if (regionASelect) regionASelect.value = regA;
        if (regionBSelect) regionBSelect.value = regB;
        if (variableSelect) variableSelect.value = varId;

        executeComparison();
      });
    });
  }

  /**
   * Execute Dual Regional Comparison
   */
  async function executeComparison() {
    const regAId = regionASelect ? regionASelect.value : 'amazon';
    const regBId = regionBSelect ? regionBSelect.value : 'sahara';
    const varId = variableSelect ? variableSelect.value : 'lst';

    if (regAId === regBId) {
      TerraUtils.showToast('Please select two different regions to compare.', 'warning');
      return;
    }

    let startYr = 2005;
    let endYr = 2023;
    if (periodSelect) {
      const parts = periodSelect.value.split('-');
      startYr = parseInt(parts[0], 10);
      endYr = parseInt(parts[1], 10);
    }

    const res = await TerraAPI.compareRegions({
      regionAId: regAId,
      regionBId: regBId,
      variableId: varId,
      startYear: startYr,
      endYear: endYr,
      resolution: 'monthly'
    });

    renderComparisonHeader(res);
    renderCharts(res);
    renderDifferentialSummary(res);

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Render Region A & B Metric Cards
   */
  function renderComparisonHeader(data) {
    const rA = data.regionA;
    const rB = data.regionB;
    const unit = data.variable.shortUnit;

    // Region A
    const nameA = document.getElementById('tt-comp-name-a');
    const climA = document.getElementById('tt-comp-clim-a');
    const rateA = document.getElementById('tt-comp-rate-a');
    const sigA = document.getElementById('tt-comp-sig-a');

    if (nameA) nameA.textContent = rA.metadata.name;
    if (climA) climA.textContent = `${rA.metadata.country} &bull; ${rA.metadata.climateType}`;
    if (rateA) rateA.textContent = `${TerraUtils.formatRate(rA.annualRate)} ${unit}/yr`;
    if (sigA) sigA.textContent = rA.regression.pValue < 0.05 ? 'Significant (p < 0.05)' : 'Not Significant';

    // Region B
    const nameB = document.getElementById('tt-comp-name-b');
    const climB = document.getElementById('tt-comp-clim-b');
    const rateB = document.getElementById('tt-comp-rate-b');
    const sigB = document.getElementById('tt-comp-sig-b');

    if (nameB) nameB.textContent = rB.metadata.name;
    if (climB) climB.textContent = `${rB.metadata.country} &bull; ${rB.metadata.climateType}`;
    if (rateB) rateB.textContent = `${TerraUtils.formatRate(rB.annualRate)} ${unit}/yr`;
    if (sigB) sigB.textContent = rB.regression.pValue < 0.05 ? 'Significant (p < 0.05)' : 'Not Significant';
  }

  /**
   * Render Dual Side-by-Side Charts
   */
  function renderCharts(data) {
    const canvasA = document.getElementById('tt-comp-chart-a');
    const canvasB = document.getElementById('tt-comp-chart-b');

    if (!canvasA || !canvasB) return;

    if (chartInstanceA) chartInstanceA.destroy();
    if (chartInstanceB) chartInstanceB.destroy();

    const unit = data.variable.shortUnit;

    // Chart A
    chartInstanceA = new Chart(canvasA.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.regionA.timeSeries.timestamps,
        datasets: [
          {
            label: `${data.regionA.metadata.name} Observations`,
            data: data.regionA.timeSeries.observations,
            borderColor: '#38BDF8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderWidth: 1.5,
            pointRadius: 1,
            fill: true,
            tension: 0.2
          },
          {
            label: `Trend Fit (${TerraUtils.formatRate(data.regionA.annualRate)}/yr)`,
            data: data.regionA.regression.predicted,
            borderColor: '#F59E0B',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0
          }
        ]
      },
      options: getCommonChartOptions(unit)
    });

    // Chart B
    chartInstanceB = new Chart(canvasB.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.regionB.timeSeries.timestamps,
        datasets: [
          {
            label: `${data.regionB.metadata.name} Observations`,
            data: data.regionB.timeSeries.observations,
            borderColor: '#22D3EE',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            borderWidth: 1.5,
            pointRadius: 1,
            fill: true,
            tension: 0.2
          },
          {
            label: `Trend Fit (${TerraUtils.formatRate(data.regionB.annualRate)}/yr)`,
            data: data.regionB.regression.predicted,
            borderColor: '#F59E0B',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0
          }
        ]
      },
      options: getCommonChartOptions(unit)
    });
  }

  function getCommonChartOptions(unit) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }
        },
        tooltip: {
          backgroundColor: '#141F30',
          titleColor: '#F8FAFC',
          bodyColor: '#94A3B8',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: function (ctx) {
              return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} ${unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748B', maxTicksLimit: 8, font: { family: 'Inter', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748B', font: { family: 'Inter', size: 10 } }
        }
      }
    };
  }

  /**
   * Render Differential Statistical Summary & Narrative
   */
  function renderDifferentialSummary(data) {
    const slopeDiffEl = document.getElementById('tt-diff-slope');
    const meanDiffEl = document.getElementById('tt-diff-mean');
    const narrativeEl = document.getElementById('tt-diff-narrative-text');

    const unit = data.variable.shortUnit;
    const rateA = data.regionA.annualRate;
    const rateB = data.regionB.annualRate;
    const deltaSlope = rateA - rateB;

    if (slopeDiffEl) {
      slopeDiffEl.textContent = `${deltaSlope > 0 ? '+' : ''}${deltaSlope.toFixed(3)} ${unit}/yr`;
      slopeDiffEl.style.color = deltaSlope !== 0 ? '#38BDF8' : '#94A3B8';
    }

    if (meanDiffEl) {
      meanDiffEl.textContent = `${data.delta.meanDifference > 0 ? '+' : ''}${data.delta.meanDifference} ${unit}`;
    }

    if (narrativeEl) {
      const nameA = data.regionA.metadata.name;
      const nameB = data.regionB.metadata.name;
      const varName = data.variable.name;

      narrativeEl.innerHTML = `
        <strong>Regional Divergence Synthesis:</strong> While examining <em>${varName}</em> over <strong>${data.timePeriod}</strong>, 
        <strong>${nameA}</strong> experienced a rate of change of <code>${TerraUtils.formatRate(rateA)} ${unit}/year</code>, 
        whereas <strong>${nameB}</strong> recorded <code>${TerraUtils.formatRate(rateB)} ${unit}/year</code>. 
        <br><br>
        This demonstrates how global planetary radiative forcing produces sharply divergent localized responses across biomes. 
        Factors such as vegetation canopy cover, albedo feedback loops, soil moisture buffering capacity, and regional atmospheric circulation cells 
        drive pronounced regional heterogeneity in Earth systems response.
      `;
    }
  }
});
