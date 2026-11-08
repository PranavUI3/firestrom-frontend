/**
 * TerraTrend – Earth Systems Trend Detective
 * demonstrations.js - Interactive Demonstration Investigations Gallery & Chart Controller
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize UI components
  TerraComponents.initSidebar();
  TerraComponents.initHeader('Demonstrations Library', 'Curated Earth science case studies illustrating detected multi-decadal trends');

  const container = document.getElementById('tt-demos-container');
  const chartInstances = {};

  await renderDemonstrations();

  if (window.lucide) window.lucide.createIcons();

  /**
   * Render all Demonstration Cards with Live Sparkline / Preview Charts
   */
  async function renderDemonstrations() {
    if (!container) return;

    const res = await TerraAPI.getDemonstrations();
    const demos = res.data || [];

    container.innerHTML = demos.map(d => `
      <div class="tt-demo-card">
        <div class="tt-demo-chart-box">
          <canvas id="tt-demo-canvas-${d.id}"></canvas>
        </div>

        <div class="tt-demo-body">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="tt-badge ${d.trendDirection === 'increasing' ? 'badge-danger' : 'badge-primary'}">
                ${d.trendDirection === 'increasing' ? 'Increasing' : 'Decreasing'} (${d.rateOfChange})
              </span>
              <span class="tt-category-pill pill-climate">${d.datasetId}</span>
            </div>

            <h3 class="tt-demo-title">${d.title}</h3>
            <div class="tt-demo-meta">${d.regionName} &bull; ${d.timePeriod}</div>
            <p class="tt-demo-desc">${d.summary}</p>

            <div class="tt-demo-findings">
              <strong>Key Scientific Findings:</strong>
              <ul style="padding-left: 1rem; list-style: disc;">
                ${d.keyFindings.map(f => `<li style="margin-bottom: 0.2rem;">${f}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">
              Confidence: <b style="color: var(--color-success);">${d.statusLabel.split('(')[0]}</b>
            </span>
            <a href="detective.html?variable=${d.variableId}&region=${d.regionId}&dataset=${d.datasetId}&startYear=${d.startYear}&endYear=${d.endYear}" class="tt-btn tt-btn-primary tt-btn-sm">
              <i data-lucide="play"></i>
              <span>Launch Investigation</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Initialize mini preview charts for each card
    demos.forEach(d => {
      initPreviewChart(d);
    });
  }

  /**
   * Render Chart.js preview line inside each card
   */
  function initPreviewChart(demo) {
    const canvas = document.getElementById(`tt-demo-canvas-${demo.id}`);
    if (!canvas) return;

    const labels = demo.previewPoints.map(p => p.year.toString());
    const dataVals = demo.previewPoints.map(p => p.val);

    const isUp = demo.trendDirection === 'increasing';
    const lineColor = isUp ? '#EF4444' : '#38BDF8';
    const bgGradient = isUp ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)';

    const ctx = canvas.getContext('2d');
    chartInstances[demo.id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${demo.variableName} (${demo.unit})`,
          data: dataVals,
          borderColor: lineColor,
          backgroundColor: bgGradient,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#141F30',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                return `${ctx.parsed.y} ${demo.unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748B', font: { family: 'Inter', size: 9 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#64748B', font: { family: 'Inter', size: 9 } }
          }
        }
      }
    });
  }
});
