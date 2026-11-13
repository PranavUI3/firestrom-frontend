/**
 * TerraTrend - Earth Systems Trend Detective
 * api.js - Unified API Service Layer with configurable backend endpoint & Mock Fallback
 */

const TerraAPI = (function () {
  'use strict';

  // Configurable Backend URL (defaults to connected local backend)
  let API_BASE_URL = window.TERRA_API_BASE_URL || localStorage.getItem('tt_api_base_url') || 'http://localhost:8000/api';

  // Mode tracking
  let isUsingMock = true;

  function setApiBaseUrl(url) {
    API_BASE_URL = url || '';
    if (url) {
      localStorage.setItem('tt_api_base_url', url);
    } else {
      localStorage.removeItem('tt_api_base_url');
    }
  }

  function getApiBaseUrl() {
    return API_BASE_URL;
  }

  function isMockMode() {
    return isUsingMock;
  }

  function simulateLatency(ms = 350) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch all environmental variables with optional filtering
   */
  async function getVariables(category = null, search = '') {
    if (API_BASE_URL) {
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'all') queryParams.append('category', category);
        if (search) queryParams.append('q', search);
        const res = await fetch(`${API_BASE_URL}/variables?${queryParams.toString()}`);
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Real API endpoint unreachable, falling back to mockData.', err);
      }
    }

    // Fallback: Local Mock Data
    isUsingMock = true;
    await simulateLatency(150);
    let list = TerraMockData.variables.slice();

    if (category && category !== 'all') {
      list = list.filter(v => v.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.categoryName.toLowerCase().includes(q) ||
        v.associatedDataset.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      isMockData: true,
      count: list.length,
      data: list
    };
  }

  /**
   * Get single variable details
   */
  async function getVariableById(id) {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/variables/${encodeURIComponent(id)}`);
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Endpoint unreachable, using mock data.');
      }
    }

    isUsingMock = true;
    await simulateLatency(100);
    const variable = TerraMockData.variables.find(v => v.id === id) || null;
    return {
      success: !!variable,
      isMockData: true,
      data: variable
    };
  }

  /**
   * Fetch NASA missions and datasets
   */
  async function getDatasets() {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/datasets`);
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Datasets endpoint unreachable, using mock data.');
      }
    }

    isUsingMock = true;
    await simulateLatency(120);
    return {
      success: true,
      isMockData: true,
      data: TerraMockData.datasets
    };
  }

  /**
   * Fetch preset geographical regions
   */
  async function getRegions() {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/regions`);
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Regions endpoint unreachable, using mock data.');
      }
    }

    isUsingMock = true;
    await simulateLatency(100);
    return {
      success: true,
      isMockData: true,
      data: TerraMockData.regions
    };
  }

  /**
   * Execute Step-by-Step Environmental Trend Investigation
   */
  async function analyzeTrend(params) {
    const {
      variableId = 'air_temp',
      regionId = null,
      regionName = 'Custom Region',
      lat = null,
      lon = null,
      bounds = null,
      startYear = 2005,
      endYear = 2023,
      resolution = 'monthly',
      datasetId = 'AIRS',
      confidenceLevel = 0.95
    } = params;

    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Analyze endpoint unreachable, synthesizing mock analysis.', err);
      }
    }

    // Synthetic scientific computation using local mock generator
    isUsingMock = true;
    await simulateLatency(650);

    const matchedRegion = regionId
      ? TerraMockData.regions.find(r => r.id === regionId)
      : (lat && lon ? { id: 'custom', name: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`, lat, lon } : null);

    const timeSeries = TerraMockData.generateTimeSeries({
      variableId,
      region: matchedRegion,
      startYear: parseInt(startYear, 10),
      endYear: parseInt(endYear, 10),
      resolution
    });

    const regression = TerraUtils.calculateLinearRegression(timeSeries.xIndices, timeSeries.observations);
    const mannKendall = TerraUtils.calculateMannKendall(timeSeries.observations);

    let trendDirection = 'no_trend';
    if (regression.slope > 0.0001) trendDirection = 'increasing';
    else if (regression.slope < -0.0001) trendDirection = 'decreasing';

    const isStatisticallySignificant = regression.pValue < 0.05 && mannKendall.pValue < 0.05;
    const isMarginal = (regression.pValue < 0.10 || mannKendall.pValue < 0.10) && !isStatisticallySignificant;

    let significanceStatus = 'not_significant';
    let significanceLabel = 'Not Statistically Significant';

    if (isStatisticallySignificant) {
      significanceStatus = 'statistically_significant';
      significanceLabel = 'Statistically Significant (p < 0.05)';
    } else if (isMarginal) {
      significanceStatus = 'inconclusive';
      significanceLabel = 'Inconclusive / Marginally Significant (p < 0.10)';
    }

    const matchedDataset = TerraMockData.datasets.find(d => d.id === datasetId) || {
      id: datasetId,
      name: datasetId,
      description: 'NASA Satellite Observation / Model Assimilation'
    };

    const annualRate = regression.slope;
    const decadalRate = regression.slope * 10;

    const analysisPayload = {
      success: true,
      isMockData: true,
      analysisId: 'ANALYSIS-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
      metadata: {
        variable: timeSeries.variable,
        variableId: timeSeries.variable.id,
        variableName: timeSeries.variable.name,
        unit: timeSeries.variable.shortUnit,
        fullUnit: timeSeries.variable.unit,
        region: matchedRegion || { name: regionName || 'Global Study Area' },
        regionName: matchedRegion ? matchedRegion.name : regionName,
        timePeriod: `${startYear} - ${endYear}`,
        startYear: parseInt(startYear, 10),
        endYear: parseInt(endYear, 10),
        durationYears: endYear - startYear + 1,
        resolution,
        dataset: matchedDataset,
        datasetId: matchedDataset.id,
        datasetName: matchedDataset.name,
        observationCount: timeSeries.count
      },
      timeSeries: {
        timestamps: timeSeries.timestamps,
        observations: timeSeries.observations,
        anomalies: timeSeries.observations.map(v => v - 15.0),
        movingAvg12m: timeSeries.observations,
        movingAvg5y: timeSeries.observations,
        xIndices: timeSeries.xIndices,
        fittedValues: regression.predicted,
        confidenceUpper: regression.confidenceUpper,
        confidenceLower: regression.confidenceLower
      },
      statistics: {
        trendDirection,
        slope: regression.slope,
        annualRate: annualRate,
        decadalRate: decadalRate,
        intercept: regression.intercept,
        rSquared: regression.r2,
        standardError: regression.stdErr,
        tStatistic: regression.tStat,
        pValue: regression.pValue,
        mannKendallScore: mannKendall.s,
        mannKendallTau: mannKendall.tau,
        mannKendallZ: mannKendall.z,
        mannKendallPValue: mannKendall.pValue,
        significanceStatus,
        significanceLabel,
        confidenceLevel
      },
      interpretation: {
        whatIsChanging: `The observed ${timeSeries.variable.name} shows a measurable ${trendDirection === 'increasing' ? 'positive (upward)' : (trendDirection === 'decreasing' ? 'negative (downward)' : 'neutral')} linear trajectory.`,
        whereIsChanging: `Within the ${matchedRegion ? matchedRegion.name : regionName} geographic boundary.`,
        howMuchIsChanging: `Changing at an estimated rate of ${TerraUtils.formatRate(annualRate, timeSeries.variable.shortUnit)} per year (${TerraUtils.formatRate(decadalRate, timeSeries.variable.shortUnit)} per decade).`,
        howConfident: isStatisticallySignificant
          ? `High scientific confidence (p = ${TerraUtils.formatPValue(regression.pValue)}). The probability that this trajectory arose from random environmental noise alone is less than 5%.`
          : (isMarginal
            ? `Moderate / suggestive confidence (p = ${TerraUtils.formatPValue(regression.pValue)}). The trend direction is visible but exceeds the strict 95% threshold; longer satellite records are recommended.`
            : `Low statistical significance (p = ${TerraUtils.formatPValue(regression.pValue)}). The observed changes cannot be reliably distinguished from natural climate variability or seasonal noise.`),
        scientificCaveat: 'Statistical significance quantifies the strength of empirical evidence against the null hypothesis of no trend, but does not independently prove causation or rule out unmodeled sensor calibration drifts.'
      },
      anomalies: []
    };

    return analysisPayload;
  }

  /**
   * Fetch Global Trend Points for Map Visualization
   */
  async function getGlobalTrends(filters = {}) {
    if (API_BASE_URL) {
      try {
        const queryParams = new URLSearchParams(filters);
        const res = await fetch(`${API_BASE_URL}/global-trends?${queryParams.toString()}`);
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Global trends endpoint unreachable, using mock data.');
      }
    }

    isUsingMock = true;
    await simulateLatency(200);

    let points = TerraMockData.globalTrendPoints.slice();

    if (filters.variable && filters.variable !== 'all') {
      points = points.filter(p => p.variable === filters.variable);
    }
    if (filters.significance && filters.significance !== 'all') {
      points = points.filter(p => p.significance === filters.significance);
    }
    if (filters.dataset && filters.dataset !== 'all') {
      points = points.filter(p => p.dataset.toLowerCase().includes(filters.dataset.toLowerCase()));
    }

    return {
      success: true,
      isMockData: true,
      count: points.length,
      data: points
    };
  }

  /**
   * Compare Two Regions on a selected variable and time period
   */
  async function compareRegions(params) {
    const {
      regionAId = 'amazon',
      regionBId = 'sahara',
      variableId = 'lst',
      startYear = 2005,
      endYear = 2023,
      resolution = 'monthly'
    } = params;

    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Compare endpoint unreachable, using local analysis synthesis.');
      }
    }

    isUsingMock = true;
    await simulateLatency(500);

    const regionA = TerraMockData.regions.find(r => r.id === regionAId) || TerraMockData.regions[0];
    const regionB = TerraMockData.regions.find(r => r.id === regionBId) || TerraMockData.regions[1];
    const variable = TerraMockData.variables.find(v => v.id === variableId) || TerraMockData.variables[0];

    const tsA = TerraMockData.generateTimeSeries({
      variableId,
      region: regionA,
      startYear: parseInt(startYear, 10),
      endYear: parseInt(endYear, 10),
      resolution,
      noiseSeed: 101
    });

    const tsB = TerraMockData.generateTimeSeries({
      variableId,
      region: regionB,
      startYear: parseInt(startYear, 10),
      endYear: parseInt(endYear, 10),
      resolution,
      noiseSeed: 202
    });

    const regA = TerraUtils.calculateLinearRegression(tsA.xIndices, tsA.observations);
    const regB = TerraUtils.calculateLinearRegression(tsB.xIndices, tsB.observations);

    const mkA = TerraUtils.calculateMannKendall(tsA.observations);
    const mkB = TerraUtils.calculateMannKendall(tsB.observations);

    return {
      success: true,
      isMockData: true,
      variable,
      timePeriod: `${startYear} - ${endYear}`,
      regionA: {
        metadata: regionA,
        timeSeries: tsA,
        regression: regA,
        mannKendall: mkA,
        annualRate: regA.slope,
        decadalRate: regA.slope * 10
      },
      regionB: {
        metadata: regionB,
        timeSeries: tsB,
        regression: regB,
        mannKendall: mkB,
        annualRate: regB.slope,
        decadalRate: regB.slope * 10
      },
      delta: {
        slopeDifference: parseFloat((regA.slope - regB.slope).toFixed(5)),
        meanDifference: parseFloat((
          (tsA.observations.reduce((a, b) => a + b, 0) / tsA.count) -
          (tsB.observations.reduce((a, b) => a + b, 0) / tsB.count)
        ).toFixed(2))
      }
    };
  }

  /**
   * Fetch featured demonstration investigations
   */
  async function getDemonstrations() {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/demonstrations`);
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Demonstrations endpoint unreachable, using mock data.');
      }
    }

    isUsingMock = true;
    await simulateLatency(100);
    return {
      success: true,
      isMockData: true,
      data: TerraMockData.demonstrations
    };
  }

  /**
   * Get single demonstration by ID
   */
  async function getDemoById(id) {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/demonstrations/${encodeURIComponent(id)}`);
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Single demonstration unreachable, using mock data.');
      }
    }

    isUsingMock = true;
    await simulateLatency(80);
    const demo = TerraMockData.demonstrations.find(d => d.id === id) || null;
    return {
      success: !!demo,
      isMockData: true,
      data: demo
    };
  }

  /**
   * Full-Stack Feature 2: Climatological Seasonal Decomposition
   */
  async function getSeasonalDecomposition(params) {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/decomposition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Decomposition endpoint unreachable.');
      }
    }
    return { success: false, error: 'Decomposition service currently offline.' };
  }

  /**
   * Full-Stack Feature 3: Custom Coordinates & Geo-Point Analysis
   */
  async function analyzeCustomPoint(lat, lon, variableId = 'air_temp', startYear = 2000, endYear = 2023) {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/custom-point`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: lat, longitude: lon, variableId, startYear, endYear })
        });
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Custom point endpoint unreachable.');
      }
    }
    return await analyzeTrend({ lat, lon, variableId, regionId: 'custom', regionName: `Custom Point (${lat.toFixed(2)}, ${lon.toFixed(2)})`, startYear, endYear });
  }

  /**
   * Full-Stack Feature 4: Extreme Climate Anomaly Scanner
   */
  async function getExtremeAnomalies(params) {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/anomalies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Anomalies scanner unreachable.');
      }
    }
    return { success: false, totalAnomaliesDetected: 0, anomalies: [] };
  }

  /**
   * Full-Stack Feature 5: Scientific Audit Report & Provenance Generator
   */
  async function getAuditReport(analysisParams) {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/export/audit-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysisParams)
        });
        if (res.ok) {
          isUsingMock = false;
          return await res.json();
        }
      } catch (err) {
        console.warn('[TerraAPI] Audit report endpoint unreachable.');
      }
    }
    return { success: false, error: 'Audit generation failed.' };
  }

  /**
   * User Feature 4: Saved Investigations & Bookmarks Manager
   */
  function saveInvestigation(analysis) {
    try {
      const saved = getSavedInvestigations();
      const item = {
        id: analysis.analysisId,
        savedAt: new Date().toISOString(),
        variableId: analysis.metadata.variableId,
        variableName: analysis.metadata.variableName,
        regionName: analysis.metadata.regionName,
        timePeriod: analysis.metadata.timePeriod,
        rateOfChange: `${analysis.statistics.decadalRate >= 0 ? '+' : ''}${analysis.statistics.decadalRate} ${analysis.metadata.unit}/dec`,
        significance: analysis.statistics.significanceLabel,
        fullAnalysis: analysis
      };
      const updated = [item, ...saved.filter(s => s.id !== item.id)].slice(0, 20);
      localStorage.setItem('tt_saved_investigations', JSON.stringify(updated));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getSavedInvestigations() {
    try {
      const raw = localStorage.getItem('tt_saved_investigations');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function deleteSavedInvestigation(id) {
    try {
      const saved = getSavedInvestigations().filter(s => s.id !== id);
      localStorage.setItem('tt_saved_investigations', JSON.stringify(saved));
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    setApiBaseUrl,
    getApiBaseUrl,
    isMockMode,
    getVariables,
    getVariableById,
    getDatasets,
    getRegions,
    analyzeTrend,
    getGlobalTrends,
    compareRegions,
    getDemonstrations,
    getDemoById,
    getSeasonalDecomposition,
    analyzeCustomPoint,
    getExtremeAnomalies,
    getAuditReport,
    saveInvestigation,
    getSavedInvestigations,
    deleteSavedInvestigation
  };
})();

if (typeof window !== 'undefined') {
  window.TerraAPI = TerraAPI;
}
