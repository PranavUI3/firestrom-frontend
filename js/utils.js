/**
 * TerraTrend - Earth Systems Trend Detective
 * utils.js - Scientific calculation algorithms, statistical tests, formatting & UI helpers
 */

const TerraUtils = (function () {
  'use strict';

  /**
   * Ordinary Least Squares Linear Regression
   * Calculates slope, intercept, R², standard error, t-statistic, p-value and confidence band
   * @param {Array<number>} x
   * @param {Array<number>} y
   */
  function calculateLinearRegression(x, y) {
    const n = x.length;
    if (n < 3) {
      return {
        slope: 0,
        intercept: y[0] || 0,
        r2: 0,
        stdErr: 0,
        tStat: 0,
        pValue: 1.0,
        predicted: y.slice(),
        confidenceUpper: y.slice(),
        confidenceLower: y.slice()
      };
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
      sumYY += y[i] * y[i];
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    const denominator = sumXX - (sumX * sumX) / n;
    const slope = denominator !== 0 ? (sumXY - (sumX * sumY) / n) / denominator : 0;
    const intercept = meanY - slope * meanX;

    // Residuals and R²
    let ssRes = 0;
    let ssTot = 0;
    const predicted = [];

    for (let i = 0; i < n; i++) {
      const pred = intercept + slope * x[i];
      predicted.push(parseFloat(pred.toFixed(4)));
      const res = y[i] - pred;
      ssRes += res * res;
      const dev = y[i] - meanY;
      ssTot += dev * dev;
    }

    const r2 = ssTot !== 0 ? Math.max(0, 1 - (ssRes / ssTot)) : 0;
    const df = Math.max(1, n - 2);
    const residualVariance = ssRes / df;
    const stdErrSlope = denominator > 0 ? Math.sqrt(residualVariance / denominator) : 0;
    const tStat = stdErrSlope > 0 ? Math.abs(slope / stdErrSlope) : 0;

    // Approximate p-value from t-statistic using regularized incomplete beta / erf approximation
    const pValue = approximatePValueFromT(tStat, df);

    // 95% Confidence interval for trend line (t critical ~ 1.96 for n > 30)
    const tCrit = df > 30 ? 1.96 : (df > 15 ? 2.13 : 2.31);
    const confidenceUpper = [];
    const confidenceLower = [];

    for (let i = 0; i < n; i++) {
      const xDev = x[i] - meanX;
      const seFit = Math.sqrt(residualVariance * (1 / n + (xDev * xDev) / denominator));
      const margin = tCrit * seFit;
      confidenceUpper.push(parseFloat((predicted[i] + margin).toFixed(4)));
      confidenceLower.push(parseFloat((predicted[i] - margin).toFixed(4)));
    }

    return {
      slope: parseFloat(slope.toFixed(5)),
      intercept: parseFloat(intercept.toFixed(4)),
      r2: parseFloat(r2.toFixed(4)),
      stdErr: parseFloat(stdErrSlope.toFixed(5)),
      tStat: parseFloat(tStat.toFixed(3)),
      pValue: parseFloat(pValue.toFixed(5)),
      predicted,
      confidenceUpper,
      confidenceLower
    };
  }

  /**
   * Approximate two-tailed p-value from t-statistic and degrees of freedom
   */
  function approximatePValueFromT(t, df) {
    if (isNaN(t) || t <= 0) return 1.0;
    // For large df, approaches normal standard distribution
    const x = t / Math.sqrt(df);
    // Sigmoid/logistic polynomial approximation for normal CDF tails
    const z = Math.abs(t);
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;

    const k = 1.0 / (1.0 + p * z);
    const poly = ((((b5 * k + b4) * k + b3) * k + b2) * k + b1) * k;
    const normalTail = c * Math.exp(-0.5 * z * z) * poly;
    const pVal = 2.0 * normalTail; // two-tailed

    return Math.max(0.00001, Math.min(1.0, pVal));
  }

  /**
   * Mann-Kendall Non-Parametric Monotonic Trend Test
   * Evaluates rank correlation S, variance, Z-score, Kendall's Tau, and p-value
   * @param {Array<number>} data
   */
  function calculateMannKendall(data) {
    const n = data.length;
    if (n < 4) {
      return {
        s: 0,
        tau: 0,
        z: 0,
        pValue: 1.0,
        trend: 'no_trend',
        status: 'Insufficient data'
      };
    }

    let s = 0;
    const ties = {};

    for (let k = 0; k < n - 1; k++) {
      for (let j = k + 1; j < n; j++) {
        const diff = data[j] - data[k];
        if (diff > 1e-7) s += 1;
        else if (diff < -1e-7) s -= 1;
      }
      const rounded = data[k].toFixed(3);
      ties[rounded] = (ties[rounded] || 0) + 1;
    }

    // Variance calculation accounting for ties
    let tieSum = 0;
    for (const key in ties) {
      const t = ties[key];
      if (t > 1) {
        tieSum += t * (t - 1) * (2 * t + 5);
      }
    }

    const varS = (n * (n - 1) * (2 * n + 5) - tieSum) / 18.0;
    const stdDevS = Math.sqrt(Math.max(1e-5, varS));

    let z = 0;
    if (s > 0) z = (s - 1) / stdDevS;
    else if (s < 0) z = (s + 1) / stdDevS;

    const maxPairs = (n * (n - 1)) / 2;
    const tau = s / maxPairs;

    // Approximate p-value from Z
    const absZ = Math.abs(z);
    const pVal = 2.0 * (1.0 - normalCdf(absZ));

    let trend = 'no_trend';
    let status = 'Not Statistically Significant';

    if (pVal < 0.05) {
      if (s > 0) {
        trend = 'increasing';
        status = 'Statistically Significant (Upward)';
      } else {
        trend = 'decreasing';
        status = 'Statistically Significant (Downward)';
      }
    } else if (pVal < 0.10) {
      trend = s > 0 ? 'increasing' : 'decreasing';
      status = 'Marginally Significant (p < 0.10)';
    }

    return {
      s,
      tau: parseFloat(tau.toFixed(4)),
      z: parseFloat(z.toFixed(3)),
      pValue: parseFloat(pVal.toFixed(5)),
      trend,
      status
    };
  }

  /**
   * Cumulative distribution function for standard normal
   */
  function normalCdf(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.SQRT2;

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Number formatting with unit
   */
  function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '–';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Format p-value for scientific display
   */
  function formatPValue(p) {
    if (typeof p === 'string') return p;
    if (p < 0.0001) return '< 0.0001';
    if (p < 0.001) return '< 0.001';
    return p.toFixed(4);
  }

  /**
   * Format rate of change with explicit positive sign
   */
  function formatRate(rate, unit = '') {
    if (isNaN(rate)) return '0.00';
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate.toFixed(3)} ${unit}`.trim();
  }

  /**
   * Toast notification system
   */
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('tt-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tt-toast-container';
      container.className = 'tt-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `tt-toast tt-toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'danger' || type === 'error') iconName = 'alert-circle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="tt-toast-icon"></i>
      <span class="tt-toast-message">${message}</span>
      <button class="tt-toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);
    if (window.lucide) {
      window.lucide.createIcons({ root: toast });
    }

    const closeBtn = toast.querySelector('.tt-toast-close');
    const dismiss = () => {
      toast.classList.add('tt-toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  }

  /**
   * Generate CSV file content
   */
  function generateCSV(timestamps, rawValues, predictedValues, metadata) {
    let csv = '';
    // Metadata comments
    csv += `# TerraTrend Environmental Analysis Export\n`;
    csv += `# Generated: ${new Date().toISOString()}\n`;
    csv += `# Variable: ${metadata.variableName || 'N/A'} (${metadata.unit || ''})\n`;
    csv += `# Region: ${metadata.regionName || 'Custom Coordinates'}\n`;
    csv += `# Time Period: ${metadata.timePeriod || 'N/A'}\n`;
    csv += `# Dataset: ${metadata.datasetName || 'NASA Reanalysis/Satellite'}\n`;
    csv += `# Method: ${metadata.method || 'Linear Regression & Mann-Kendall'}\n`;
    csv += `# Rate of Change: ${metadata.rateOfChange || 'N/A'}\n`;
    csv += `# Significance: ${metadata.significance || 'N/A'} (p = ${metadata.pValue || 'N/A'})\n`;
    csv += `# DATA TYPE: SAMPLE / DEMO DATA ONLY\n`;
    csv += `\n`;
    // Headers
    csv += `Timestamp,Observed_Value,Trend_Fitted_Value,Unit\n`;

    for (let i = 0; i < timestamps.length; i++) {
      const time = timestamps[i];
      const obs = rawValues[i] !== undefined ? rawValues[i] : '';
      const fit = predictedValues && predictedValues[i] !== undefined ? predictedValues[i] : '';
      const unit = metadata.unit || '';
      csv += `"${time}",${obs},${fit},"${unit}"\n`;
    }

    return csv;
  }

  /**
   * Trigger browser file download
   */
  function downloadFile(filename, content, mimeType = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy string to clipboard
   */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((resolve, reject) => {
        document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
        textArea.remove();
      });
    }
  }

  /**
   * Return HTML string for trend badge
   */
  function getTrendBadgeHTML(trend, significance) {
    let colorClass = 'badge-neutral';
    let icon = 'minus';
    let text = 'No Trend';

    if (trend === 'increasing') {
      colorClass = significance === 'statistically_significant' ? 'badge-danger' : 'badge-warning';
      icon = 'trending-up';
      text = 'Increasing';
    } else if (trend === 'decreasing') {
      colorClass = significance === 'statistically_significant' ? 'badge-primary' : 'badge-warning';
      icon = 'trending-down';
      text = 'Decreasing';
    } else {
      colorClass = 'badge-success';
      icon = 'activity';
      text = 'Stable / No Trend';
    }

    return `
      <span class="tt-badge ${colorClass}">
        <i data-lucide="${icon}" class="tt-badge-icon"></i>
        <span>${text}</span>
      </span>
    `;
  }

  return {
    calculateLinearRegression,
    calculateMannKendall,
    formatNumber,
    formatPValue,
    formatRate,
    showToast,
    generateCSV,
    downloadFile,
    copyToClipboard,
    getTrendBadgeHTML
  };
})();

if (typeof window !== 'undefined') {
  window.TerraUtils = TerraUtils;
}
