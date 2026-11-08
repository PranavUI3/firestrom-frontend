# TerraTrend – Earth Systems Trend Detective
> **NASA Space Apps Challenge 2026**  
> An advanced scientific data analytics platform built with **HTML5, CSS3, and Vanilla JavaScript** to discover, visualize, and analyze environmental trends using NASA Earth science satellite missions and assimilation models.

---

## 🛰️ 1. Project Overview

**TerraTrend – Earth Systems Trend Detective** turns complex multi-decadal Earth observation data into actionable environmental insights. The platform answers five core scientific questions:

1. **What** is changing in the Earth's environmental system?
2. **Where** is it changing geographically?
3. **How much** is it changing (rate per year / per decade)?
4. **Is the observed trend statistically significant** or merely cyclical/seasonal weather noise?
5. **What environmental patterns** can be discovered from historical multi-mission records?

---

## 🎨 2. Design System & Aesthetics

TerraTrend is crafted with a dark scientific theme inspired by NASA Earth observation control rooms and modern geospatial intelligence interfaces:

- **Primary Background:** `#080D18`
- **Secondary Background:** `#101827`
- **Card Background:** `#141F30` (with glass-like border surfaces and subtle glows)
- **Primary Accent:** `#38BDF8` (Sky Blue)
- **Secondary Accent:** `#22D3EE` (Cyan)
- **Status Accents:** Success `#22C55E`, Warning `#F59E0B`, Danger `#EF4444`
- **Typography:** `Inter` for clean scientific hierarchy and `JetBrains Mono` for tabular telemetry and numerical statistics.
- **Responsiveness:** Fluid grid and drawer layout supporting Desktop, Tablet, and Mobile devices.

---

## 📂 3. Repository Structure

```
terratrend/
│
├── index.html              # Page 1: Impressive NASA-inspired Landing Page
├── dashboard.html          # Page 2: Scientific Analytics Overview Dashboard
├── variables.html          # Page 3: Searchable Environmental Variable Explorer
├── detective.html          # Page 4: Interactive Trend Detective Workspace (CORE)
├── results.html            # Page 5: In-depth Scientific Analysis Results & Report
├── global-map.html         # Page 6: Interactive Leaflet Geospatial Trend Map
├── compare.html            # Page 7: Dual Geographical Region Comparison Workspace
├── demonstrations.html     # Page 8: Curated Educational Demonstrations Gallery
├── about.html              # Page 9: Scientific Methodology & Mathematical Guide
│
├── css/
│   ├── style.css           # Design tokens, reset, buttons, badges, modals, toasts
│   ├── landing.css         # Hero graphics, orbit animations, feature cards
│   ├── dashboard.css       # Dashboard metrics grid, main chart, table styles
│   ├── detective.css       # 5-step wizard, interactive map picker, progress bar
│   ├── results.css         # Statistical scorecard, verdict banner, print stylesheet
│   ├── map.css             # Leaflet dark map theme, floating filters, popups
│   ├── compare.css         # Dual region comparison cards, differential metrics
│   └── responsive.css      # Breakpoints for tablet, mobile drawers, and cards
│
├── js/
│   ├── mockData.js         # Realistic NASA datasets, variables, regions & synthetic generator
│   ├── utils.js            # OLS Regression, Mann-Kendall test, CSV generator, toast alerts
│   ├── api.js              # API service layer with configurable API_BASE_URL & mock fallback
│   ├── components.js       # Reusable sidebar, topbar, mobile menu, API modal, variable modal
│   ├── dashboard.js        # Overview charts, quick stats, discovery table, mini-map
│   ├── variables.js        # Dynamic variable search and category filters
│   ├── detective.js        # 5-step workspace, Leaflet map pin dropper, animated analyzer
│   ├── results.js          # Time series Chart.js with 95% CI, statistical explanations, CSV export
│   ├── globalMap.js        # Leaflet world map with color-coded trend markers and filters
│   ├── compare.js          # Side-by-side regional comparison charts and delta analysis
│   └── demonstrations.js   # Interactive demonstration cards with live sparkline charts
│
└── README.md               # Complete architecture, methodology, and backend setup guide
```

---

## 🔬 4. Scientific Methodology

TerraTrend implements formal statistical tests commonly used in Earth system sciences and meteorology (WMO guidelines):

### A. Ordinary Least Squares (OLS) Linear Regression
Used to estimate the direction and constant rate of change over time:
$$\hat{Y}(t) = \beta_0 + \beta_1 \cdot t$$
- **$\beta_1 > 0$ (Positive slope):** Measured variable is increasing over the observation window.
- **$\beta_1 < 0$ (Negative slope):** Measured variable is decreasing over the observation window.
- **$\beta_1 \approx 0$ (Near-zero slope):** Little or no linear change detected.
- **$R^2$ (Coefficient of Determination):** Quantifies the fraction of total variance explained by the linear trajectory.

### B. Mann-Kendall Non-Parametric Monotonic Trend Test
Standard parametric regression assumes residuals are normally distributed. Environmental data, however, often contains seasonal skewness and episodic weather extremes. The Mann-Kendall test calculates rank correlation $S$:
$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \text{sgn}(Y_j - Y_k)$$
The standardized test statistic $Z$ and Kendall's Tau ($\tau$) evaluate whether a monotonic upward or downward trend exists without assuming a linear distribution.

### C. Hypothesis Testing & P-values
- **Null Hypothesis ($H_0$):** No monotonic trend exists ($\beta_1 = 0$).
- **Alternative Hypothesis ($H_1$):** A monotonic trend is present ($\beta_1 \neq 0$).
- **Significance Threshold ($\alpha = 0.05$):** A $p$-value $< 0.05$ indicates strong statistical evidence against $H_0$.

### D. Correlation vs. Causation
The platform explicitly warns users that **statistical significance does not automatically prove causation**. Complex coupled climate feedbacks (e.g. ice-albedo, vapor feedback, land use change) require domain modeling.

---

## 🛰️ 5. NASA Earth Observation Data Sources

1. **MODIS (Terra & Aqua):** 36 spectral bands providing daily global Land Surface Temperature (LST), Normalized Difference Vegetation Index (NDVI), and Aerosol Optical Depth (AOD).
2. **GPM (Global Precipitation Measurement Core Observatory):** Dual-frequency radar and IMERG multi-satellite synthesis tracking liquid and frozen precipitation rates every 3 hours.
3. **AIRS (Atmospheric Infrared Sounder):** High-spectral-resolution sounder aboard Aqua measuring vertical atmospheric temperature and water vapor profiles.
4. **OMI (Ozone Monitoring Instrument):** Ultraviolet-visible spectrometer on Aura monitoring stratospheric ozone layer recovery and tropospheric air quality.
5. **MERRA-2 (Modern-Era Retrospective analysis for Research and Applications-2):** NASA global atmospheric reanalysis combining numerical modeling with satellite assimilation.
6. **GLDAS (Global Land Data Assimilation System):** High-resolution terrestrial water storage, root zone soil moisture, and evapotranspiration models.

---

## 🔌 6. Backend Integration Guide

TerraTrend includes an abstracted, production-ready API service layer in `js/api.js`.

### How to Connect a Python or Node.js Backend:

1. **Default Mode (No Backend):**  
   The application runs automatically in **Demo Mode**, utilizing `js/mockData.js` and dynamic in-browser calculation of regressions, confidence intervals, and Mann-Kendall tests. A clear **"DEMO DATA"** indicator badge is visible on all pages.

2. **Connecting a Live API:**  
   Click the **"DEMO DATA"** badge in the sidebar or top navigation, or set the endpoint programmatically in your console:
   ```javascript
   TerraAPI.setApiBaseUrl('http://localhost:8000/api');
   ```

3. **Backend API Contracts Expected by `js/api.js`:**
   - `GET /variables?category=...&q=...` $\rightarrow$ Returns array of available environmental variables.
   - `GET /datasets` $\rightarrow$ Returns NASA satellite missions and instrument metadata.
   - `GET /regions` $\rightarrow$ Returns geographic boundary presets.
   - `POST /analyze` $\rightarrow$ Receives `{ variableId, regionId, lat, lon, startYear, endYear, resolution, datasetId, confidenceLevel }` and returns `{ timeSeries: { timestamps, observations, fittedValues, confidenceUpper, confidenceLower }, statistics: { slope, annualRate, pValue, rSquared, mannKendallTau, significanceStatus } }`.
   - `GET /global-trends?variable=...&significance=...` $\rightarrow$ Returns spatial points for the Leaflet world map.
   - `POST /compare` $\rightarrow$ Receives two regions and returns dual comparative time series with delta statistics.

---

## 🚀 7. Running & Testing Locally

Because the project strictly uses **HTML5, CSS3, and Vanilla JavaScript** with external visual libraries delivered via CDN, no package installations or build steps are required.

To run the local development server:

```powershell
# Option A: Using Python built-in HTTP server
python -m http.server 3000

# Option B: Using Node http-server or npx serve
npx serve -l 3000 .
```

Open your browser at `http://localhost:3000` to explore:
1. `index.html` $\rightarrow$ Landing Page
2. `dashboard.html` $\rightarrow$ Earth Systems Overview
3. `variables.html` $\rightarrow$ Environmental Variables Catalog
4. `detective.html` $\rightarrow$ Trend Detective Workspace
5. `results.html` $\rightarrow$ Scientific Analysis Results
6. `global-map.html` $\rightarrow$ Interactive Global Trend Map
7. `compare.html` $\rightarrow$ Compare Regions Tool
8. `demonstrations.html` $\rightarrow$ Educational Demonstrations
9. `about.html` $\rightarrow$ Scientific Methodology Guide
