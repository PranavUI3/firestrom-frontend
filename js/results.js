/**
 * TerraTrend – Earth Systems Trend Detective
 * results.js - Scientific Analysis Results & Statistical Visualization Controller
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // Initialize UI components
  TerraComponents.initSidebar();
  TerraComponents.initHeader('Analysis Results', 'Scientific trend evaluation and statistical significance report');

  let resultsChartInstance = null;
  let currentAnalysis = null;

  // Retrieve analysis payload from sessionStorage or query fallback
  currentAnalysis = loadAnalysisData();

  if (!currentAnalysis) {
    // Fallback: Run default analysis on Arctic Surface Air Temperature
    currentAnalysis = await TerraAPI.analyzeTrend({
      variableId: 'air_temp',
      regionId: 'arctic',
      regionName: 'Arctic Ocean & Svalbard Region',
      startYear: 2002,
      endYear: 2023,
      resolution: 'monthly',
      datasetId: 'AIRS',
      confidenceLevel: 0.95
    });
  }

  // Populate Page Sections
  renderAnalysisHeader(currentAnalysis);
  renderVerdictBanner(currentAnalysis);
  renderMainChart(currentAnalysis);
  renderStatisticsScorecards(currentAnalysis);
  renderInterpretations(currentAnalysis);
  renderMetadata(currentAnalysis);
  setupExportActions(currentAnalysis);

  if (window.lucide) window.lucide.createIcons();

  /**
   * Load data from sessionStorage or URL query
   */
  function loadAnalysisData() {
    try {
      const stored = sessionStorage.getItem('tt_latest_analysis');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not parse sessionStorage analysis data', e);
    }
    return null;
  }

  /**
   * Render Top Header Info
   */
  function renderAnalysisHeader(analysis) {
    const titleEl = document.getElementById('tt-results-title');
    const idEl = document.getElementById('tt-results-id');
    const dateEl = document.getElementById('tt-results-date');

    if (titleEl) {
      titleEl.textContent = `${analysis.metadata.variableName} Trend Analysis`;
    }
    if (idEl) {
      idEl.textContent = `REPORT ID: ${analysis.analysisId || 'NASA-TT-DEMO'}`;
    }
    if (dateEl) {
      const date = new Date(analysis.createdAt || Date.now());
      dateEl.textContent = `Generated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
  }

  /**
   * Render Trend Verdict Banner
   */
  function renderVerdictBanner(analysis) {
    const banner = document.getElementById('tt-verdict-banner');
    const iconContainer = document.getElementById('tt-verdict-icon-wrap');
    const verdictTitle = document.getElementById('tt-verdict-heading');
    const verdictSummary = document.getElementById('tt-verdict-summary-text');
    const rateVal = document.getElementById('tt-verdict-rate-display');
    const rateUnit = document.getElementById('tt-verdict-rate-unit');

    const dir = analysis.statistics.trendDirection;
    const isSig = analysis.statistics.significanceStatus === 'statistically_significant';

    let bannerClass = 'trend-neutral';
    let iconName = 'minus';
    let titleText = 'Stable / No Monotonic Trend';

    if (dir === 'increasing') {
      bannerClass = 'trend-increasing';
      iconName = 'trending-up';
      titleText = isSig ? 'Statistically Significant Increasing Trend' : 'Positive Upward Shift (Marginal)';
    } else if (dir === 'decreasing') {
      bannerClass = 'trend-decreasing';
      iconName = 'trending-down';
      titleText = isSig ? 'Statistically Significant Decreasing Trend' : 'Negative Downward Shift (Marginal)';
    }

    if (banner) {
      banner.className = `tt-verdict-banner ${bannerClass}`;
    }
    if (iconContainer) {
      iconContainer.innerHTML = `<i data-lucide="${iconName}" style="width: 30px; height: 30px;"></i>`;
    }
    if (verdictTitle) verdictTitle.textContent = titleText;
    if (verdictSummary) {
      verdictSummary.textContent = `${analysis.metadata.regionName} (${analysis.metadata.timePeriod}) &bull; ${analysis.statistics.significanceLabel}`;
    }

    if (rateVal) {
      rateVal.textContent = TerraUtils.formatRate(analysis.statistics.annualRate);
    }
    if (rateUnit) {
      rateUnit.textContent = `${analysis.metadata.unit} / year`;
    }
  }

  /**
   * Render Time-Series Chart with Fitted Trend Line & Confidence Bounds (Chart.js)
   */
  function renderMainChart(analysis) {
    const canvas = document.getElementById('tt-results-chart-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (resultsChartInstance) resultsChartInstance.destroy();

    const ts = analysis.timeSeries;
    const meta = analysis.metadata;

    resultsChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ts.timestamps,
        datasets: [
          {
            label: `Observed ${meta.variableName}`,
            data: ts.observations,
            borderColor: '#38BDF8',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            borderWidth: 1.8,
            fill: false,
            pointRadius: 2,
            pointHoverRadius: 6,
            tension: 0.15,
            order: 2
          },
          {
            label: `Linear Trend Line (Slope = ${TerraUtils.formatRate(analysis.statistics.annualRate, meta.unit + '/yr')})`,
            data: ts.fittedValues,
            borderColor: '#F59E0B',
            borderWidth: 3,
            borderDash: [5, 4],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0,
            order: 1
          },
          {
            label: 'Upper 95% Confidence Bound',
            data: ts.confidenceUpper,
            borderColor: 'rgba(34, 211, 238, 0.35)',
            borderWidth: 1,
            borderDash: [3, 3],
            fill: '+1', // Fill down to lower bound
            backgroundColor: 'rgba(56, 189, 248, 0.06)',
            pointRadius: 0,
            order: 3
          },
          {
            label: 'Lower 95% Confidence Bound',
            data: ts.confidenceLower,
            borderColor: 'rgba(34, 211, 238, 0.35)',
            borderWidth: 1,
            borderDash: [3, 3],
            fill: false,
            pointRadius: 0,
            order: 4
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
            display: false // Using custom legends bar above canvas
          },
          tooltip: {
            backgroundColor: '#141F30',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: 'rgba(56, 189, 248, 0.4)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)} ${meta.unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#64748B',
              maxTicksLimit: 14,
              font: { family: 'Inter', size: 11 }
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            title: {
              display: true,
              text: `${meta.variableName} (${meta.unit})`,
              color: '#94A3B8',
              font: { family: 'Inter', size: 12, weight: 600 }
            },
            ticks: {
              color: '#64748B',
              font: { family: 'Inter', size: 11 }
            }
          }
        }
      }
    });
  }

  /**
   * Render Statistical Metric Scorecards
   */
  function renderStatisticsScorecards(analysis) {
    const stats = analysis.statistics;
    const meta = analysis.metadata;

    const elSlope = document.getElementById('tt-score-slope');
    const elRate = document.getElementById('tt-score-annual-rate');
    const elPVal = document.getElementById('tt-score-p-value');
    const elR2 = document.getElementById('tt-score-r2');
    const elMannKendall = document.getElementById('tt-score-mann-kendall');
    const elSignificance = document.getElementById('tt-score-significance');

    if (elSlope) elSlope.textContent = TerraUtils.formatRate(stats.slope);
    if (elRate) elRate.textContent = `${TerraUtils.formatRate(stats.decadalRate)} ${meta.unit}/dec`;
    if (elPVal) elPVal.textContent = TerraUtils.formatPValue(stats.pValue);
    if (elR2) elR2.textContent = stats.rSquared.toFixed(3);
    if (elMannKendall) elMannKendall.textContent = `τ = ${stats.mannKendallTau.toFixed(3)} (Z = ${stats.mannKendallZ.toFixed(2)})`;
    if (elSignificance) {
      elSignificance.textContent = stats.significanceLabel.split('(')[0].trim();
      elSignificance.className = `tt-scorecard-val ${stats.significanceStatus === 'statistically_significant' ? 'tt-text-success' : 'tt-text-warning'}`;
    }
  }

  /**
   * Render Environmental & Significance Interpretations
   */
  function renderInterpretations(analysis) {
    const interp = analysis.interpretation;
    const elWhat = document.getElementById('tt-interp-what');
    const elWhere = document.getElementById('tt-interp-where');
    const elHowMuch = document.getElementById('tt-interp-how-much');
    const elHowConfident = document.getElementById('tt-interp-how-confident');
    const elCaveat = document.getElementById('tt-interp-caveat');

    if (elWhat) elWhat.textContent = interp.whatIsChanging;
    if (elWhere) elWhere.textContent = interp.whereIsChanging;
    if (elHowMuch) elHowMuch.textContent = interp.howMuchIsChanging;
    if (elHowConfident) elHowConfident.textContent = interp.howConfident;
    if (elCaveat) elCaveat.textContent = interp.scientificCaveat;
  }

  /**
   * Render Analysis Metadata Card
   */
  function renderMetadata(analysis) {
    const meta = analysis.metadata;
    const stats = analysis.statistics;

    const elDataset = document.getElementById('tt-meta-dataset');
    const elMethod = document.getElementById('tt-meta-method');
    const elPeriod = document.getElementById('tt-meta-period');
    const elObsCount = document.getElementById('tt-meta-obs-count');

    if (elDataset) elDataset.textContent = `${meta.datasetName} (${meta.datasetId})`;
    if (elMethod) elMethod.textContent = 'Ordinary Least Squares & Mann-Kendall Test';
    if (elPeriod) elPeriod.textContent = `${meta.timePeriod} (${meta.durationYears} years, ${meta.resolution})`;
    if (elObsCount) elObsCount.textContent = `${meta.observationCount} gridded temporal points`;
  }

  /**
   * Setup Export Actions (CSV, Print, Share Link)
   */
  function setupExportActions(analysis) {
    const csvBtn = document.getElementById('tt-export-csv-btn');
    const printBtn = document.getElementById('tt-print-report-btn');
    const copyLinkBtn = document.getElementById('tt-copy-link-btn');

    if (csvBtn) {
      csvBtn.addEventListener('click', () => {
        const csvContent = TerraUtils.generateCSV(
          analysis.timeSeries.timestamps,
          analysis.timeSeries.observations,
          analysis.timeSeries.fittedValues,
          {
            variableName: analysis.metadata.variableName,
            unit: analysis.metadata.unit,
            regionName: analysis.metadata.regionName,
            timePeriod: analysis.metadata.timePeriod,
            datasetName: analysis.metadata.datasetName,
            rateOfChange: `${TerraUtils.formatRate(analysis.statistics.annualRate)} ${analysis.metadata.unit}/year`,
            pValue: TerraUtils.formatPValue(analysis.statistics.pValue),
            significance: analysis.statistics.significanceLabel
          }
        );
        const filename = `TerraTrend_${analysis.metadata.variableId}_${analysis.metadata.timePeriod.replace(/\s+/g, '')}.csv`;
        TerraUtils.downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
        TerraUtils.showToast(`CSV Exported: ${filename}`, 'success');
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        TerraUtils.copyToClipboard(window.location.href);
        TerraUtils.showToast('Analysis report link copied to clipboard!', 'info');
      });
    }
  }
});
