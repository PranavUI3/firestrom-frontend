/**
 * TerraTrend - Earth Systems Trend Detective
 * mockData.js - NASA-inspired scientific mock dataset & synthetic observations generator
 * Note: All data provided here is illustrative sample data for demonstration and frontend testing.
 */

const TerraMockData = (function () {
  'use strict';

  // 1. NASA Datasets & Missions
  const datasets = [
    {
      id: 'MODIS',
      name: 'MODIS (Moderate Resolution Imaging Spectroradiometer)',
      satellites: ['Terra (EOS AM-1)', 'Aqua (EOS PM-1)'],
      description: 'Provides high-radiometric sensitivity across 36 spectral bands, observing land surface, oceans, and atmospheric dynamics globally every 1 to 2 days.',
      temporalCoverage: '2000 - Present',
      spatialResolution: '250m - 1km',
      primaryVariables: ['Land Surface Temperature', 'Vegetation Index (NDVI)', 'Aerosol Optical Depth', 'Sea Surface Temperature'],
      agency: 'NASA Goddard Space Flight Center'
    },
    {
      id: 'GPM',
      name: 'GPM (Global Precipitation Measurement Core Observatory)',
      satellites: ['GPM Core', 'International Constellation'],
      description: 'Advanced radar and radiometer satellite system providing global rain and snowfall observations every 3 hours for weather and climate research.',
      temporalCoverage: '2014 - Present (IMERG extended from 2000)',
      spatialResolution: '0.1° (~10 km)',
      primaryVariables: ['Precipitation Rate', 'Accumulated Rainfall', 'Precipitation Anomalies'],
      agency: 'NASA / JAXA'
    },
    {
      id: 'AIRS',
      name: 'AIRS (Atmospheric Infrared Sounder)',
      satellites: ['Aqua'],
      description: 'High-spectral-resolution grating spectrometer measuring 3D atmospheric temperature, water vapor profiles, and trace greenhouse gases.',
      temporalCoverage: '2002 - Present',
      spatialResolution: '1° x 1° atmospheric grids',
      primaryVariables: ['Air Temperature Profiles', 'Atmospheric Humidity', 'Total Column Ozone', 'Carbon Monoxide'],
      agency: 'NASA Jet Propulsion Laboratory (JPL)'
    },
    {
      id: 'OMI',
      name: 'OMI (Ozone Monitoring Instrument)',
      satellites: ['Aura'],
      description: 'Nadir-viewing ultraviolet-visible spectrometer measuring atmospheric ozone layer recovery, UV radiation, and key tropospheric pollutants.',
      temporalCoverage: '2004 - Present',
      spatialResolution: '13 x 24 km',
      primaryVariables: ['Total Column Ozone', 'Sulfur Dioxide (SO2)', 'Nitrogen Dioxide (NO2)', 'UV Index'],
      agency: 'NASA / KNMI / NSO'
    },
    {
      id: 'MERRA-2',
      name: 'MERRA-2 (Modern-Era Retrospective analysis for Research and Applications-2)',
      satellites: ['Global Earth System Model Assimilation'],
      description: 'NASA atmospheric reanalysis for the satellite era using the Goddard Earth Observing System Model (GEOS) with atmospheric aerosol data assimilation.',
      temporalCoverage: '1980 - Present',
      spatialResolution: '0.5° x 0.625°',
      primaryVariables: ['Air Temperature', 'Precipitation', 'Streamflow', 'Evapotranspiration', 'Wind Vectors'],
      agency: 'NASA Global Modeling and Assimilation Office (GMAO)'
    },
    {
      id: 'GLDAS',
      name: 'GLDAS (Global Land Data Assimilation System)',
      satellites: ['Multiple Sensor Assimilation'],
      description: 'Generates optimal fields of land surface states and fluxes by ingesting satellite- and ground-based observational data into advanced land surface models.',
      temporalCoverage: '2000 - Present',
      spatialResolution: '0.25° x 0.25°',
      primaryVariables: ['Soil Moisture', 'Evapotranspiration', 'Surface Runoff', 'Snow Water Equivalent'],
      agency: 'NASA GSFC / NOAA NCEP'
    }
  ];

  // 2. Earth System Environmental Variables
  const variables = [
    // Atmosphere
    {
      id: 'air_temp',
      name: 'Surface Air Temperature',
      category: 'atmosphere',
      categoryName: 'Atmosphere',
      unit: '°C (Celsius)',
      shortUnit: '°C',
      description: 'Near-surface air temperature measured at 2 meters above ground, representing fundamental thermal dynamics in the lower troposphere.',
      associatedDataset: 'AIRS / MERRA-2',
      datasetId: 'AIRS',
      temporalResolution: 'Daily & Monthly averages',
      baselineMean: 14.8,
      baselineTrendSlope: 0.028, // ~ +0.28°C per decade globally
      annualCycleAmplitude: 4.2,
      noiseStdDev: 0.45,
      importance: 'Surface air temperature is the primary baseline metric for global climate change, driving atmospheric circulation, evaporation rates, and weather extremes.',
      applications: ['Climate anomaly monitoring', 'Extreme heatwave diagnostics', 'Urban heat island detection', 'Agricultural growing degree days']
    },
    {
      id: 'ozone',
      name: 'Atmospheric Ozone Column',
      category: 'atmosphere',
      categoryName: 'Atmosphere',
      unit: 'Dobson Units (DU)',
      shortUnit: 'DU',
      description: 'Total vertical column abundance of atmospheric ozone molecules between Earth’s surface and the top of the stratosphere.',
      associatedDataset: 'OMI / Aura',
      datasetId: 'OMI',
      temporalResolution: 'Daily orbital swath & Monthly grid',
      baselineMean: 295.0,
      baselineTrendSlope: 0.22, // Slow recovery post-Montreal Protocol
      annualCycleAmplitude: 28.0,
      noiseStdDev: 5.2,
      importance: 'Stratospheric ozone shields terrestrial biology from harmful ultraviolet-B radiation, while tropospheric ozone acts as a greenhouse gas and respiratory hazard.',
      applications: ['Montreal Protocol recovery tracking', 'Antarctic ozone hole diagnostics', 'UV radiation index calculation', 'Photochemical smog assessment']
    },
    {
      id: 'humidity',
      name: 'Atmospheric Specific Humidity',
      category: 'atmosphere',
      categoryName: 'Atmosphere',
      unit: 'g/kg (grams of vapor per kg dry air)',
      shortUnit: 'g/kg',
      description: 'Mass of water vapor per unit mass of moist air, indicating atmospheric moisture holding capacity.',
      associatedDataset: 'AIRS / Aqua',
      datasetId: 'AIRS',
      temporalResolution: 'Monthly grids (1°x1°)',
      baselineMean: 9.6,
      baselineTrendSlope: 0.015,
      annualCycleAmplitude: 2.1,
      noiseStdDev: 0.3,
      importance: 'As temperatures rise, the Clausius-Clapeyron relation indicates the atmosphere holds approximately 7% more moisture per degree Celsius of warming, fueling intensified storm systems.',
      applications: ['Atmospheric river tracking', 'Heavy rainfall hazard forecasting', 'Drought severity quantification', 'Thermal comfort indexing']
    },
    {
      id: 'aod',
      name: 'Aerosol Optical Depth (AOD)',
      category: 'atmosphere',
      categoryName: 'Atmosphere',
      unit: 'Dimensionless (Optical Depth at 550nm)',
      shortUnit: 'τ (tau)',
      description: 'Measure of light extinction caused by airborne particulate matter (dust, smoke, sulfates, nitrates, sea salt) along the vertical column.',
      associatedDataset: 'MODIS (Terra/Aqua)',
      datasetId: 'MODIS',
      temporalResolution: 'Daily & Monthly composites',
      baselineMean: 0.18,
      baselineTrendSlope: -0.0012,
      annualCycleAmplitude: 0.06,
      noiseStdDev: 0.025,
      importance: 'Aerosols reflect incoming solar radiation (direct cooling) and alter cloud formation microphysics (indirect radiative forcing), affecting global energy balance.',
      applications: ['Wildfire smoke plume tracking', 'Saharan dust storm transport', 'Urban particulate air quality monitoring', 'Solar radiation dimming studies']
    },

    // Land
    {
      id: 'lst',
      name: 'Land Surface Temperature (LST)',
      category: 'land',
      categoryName: 'Land',
      unit: '°C (Celsius)',
      shortUnit: '°C',
      description: 'Radiative skin temperature of the Earth’s land surface, capturing instantaneous thermal response of soil, vegetation, and manmade structures.',
      associatedDataset: 'MODIS (Terra/Aqua)',
      datasetId: 'MODIS',
      temporalResolution: '8-day & Monthly composites (1km)',
      baselineMean: 19.5,
      baselineTrendSlope: 0.034,
      annualCycleAmplitude: 8.5,
      noiseStdDev: 0.8,
      importance: 'LST modulates surface-atmosphere sensible heat fluxes, drives evapotranspiration rates, and reveals urban thermal stress more directly than air temperature.',
      applications: ['Agricultural drought identification', 'Urban heat island mapping', 'Permafrost thaw monitoring', 'Forest fire thermal anomaly spotting']
    },
    {
      id: 'soil_moisture',
      name: 'Root Zone Soil Moisture',
      category: 'land',
      categoryName: 'Land',
      unit: 'm³/m³ (Volumetric Water Fraction)',
      shortUnit: 'm³/m³',
      description: 'Fractional volume of liquid water contained within the active plant root zone (top 100 cm of soil column).',
      associatedDataset: 'GLDAS / SMAP',
      datasetId: 'GLDAS',
      temporalResolution: 'Daily & Monthly averages (0.25°)',
      baselineMean: 0.24,
      baselineTrendSlope: -0.0011,
      annualCycleAmplitude: 0.08,
      noiseStdDev: 0.015,
      importance: 'Soil moisture governs partition of net radiation into sensible vs latent heat, dictates crop yields, and controls whether rainfall becomes surface runoff or recharge.',
      applications: ['Flash drought early warning', 'Crop yield predictive modeling', 'Wildfire ignition probability assessment', 'Groundwater recharge estimates']
    },
    {
      id: 'ndvi',
      name: 'Normalized Difference Vegetation Index (NDVI)',
      category: 'land',
      categoryName: 'Land',
      unit: 'Index Value (-1.0 to +1.0)',
      shortUnit: 'Index',
      description: 'Standardized index measuring live green plant canopy vigor using the contrast between red reflectance (chlorophyll absorption) and near-infrared reflectance (mesophyll scattering).',
      associatedDataset: 'MODIS (MOD13A2 / MYD13A2)',
      datasetId: 'MODIS',
      temporalResolution: '16-day & Monthly composites (250m - 1km)',
      baselineMean: 0.48,
      baselineTrendSlope: -0.0018,
      annualCycleAmplitude: 0.16,
      noiseStdDev: 0.02,
      importance: 'NDVI provides multi-decadal records of terrestrial biosphere productivity, forest canopy loss, savanna desertification, and Arctic greening.',
      applications: ['Rainforest deforestation tracking', 'Agricultural crop phenology', 'Post-wildfire ecological recovery', 'Global vegetation greening/browning studies']
    },
    {
      id: 'evapotranspiration',
      name: 'Evapotranspiration (ET)',
      category: 'land',
      categoryName: 'Land',
      unit: 'mm / month (Water Depth Equivalent)',
      shortUnit: 'mm/mo',
      description: 'Combined water transfer from soil evaporation and plant stomatal transpiration back into the atmosphere.',
      associatedDataset: 'GLDAS / MODIS MOD16',
      datasetId: 'GLDAS',
      temporalResolution: 'Monthly totals (0.25°)',
      baselineMean: 62.0,
      baselineTrendSlope: 0.18,
      annualCycleAmplitude: 24.0,
      noiseStdDev: 3.5,
      importance: 'ET represents the critical nexus between the water cycle, carbon cycle, and land surface energy balance.',
      applications: ['Irrigation demand optimization', 'Basin water budgets', 'Drought severity monitoring', 'Hydrological modeling']
    },

    // Water
    {
      id: 'precipitation',
      name: 'Total Monthly Precipitation',
      category: 'water',
      categoryName: 'Water Cycle',
      unit: 'mm / month',
      shortUnit: 'mm/mo',
      description: 'Estimated total depth of liquid and frozen water that reaches Earth’s surface over a monthly period from all cloud systems.',
      associatedDataset: 'GPM IMERG (V06)',
      datasetId: 'GPM',
      temporalResolution: 'Monthly multi-satellite synthesis (0.1°)',
      baselineMean: 88.0,
      baselineTrendSlope: -0.12,
      annualCycleAmplitude: 45.0,
      noiseStdDev: 12.0,
      importance: 'Precipitation is the primary driver of fresh water supply, groundwater replenishment, river discharges, and flood/drought hazards.',
      applications: ['Flood inundation risk management', 'Reservoir replenishment planning', 'Monsoon trend analytics', 'Climate anomaly tracking']
    },
    {
      id: 'rainfall_rate',
      name: 'Extreme Rainfall Intensity Rate',
      category: 'water',
      categoryName: 'Water Cycle',
      unit: 'mm / hour',
      shortUnit: 'mm/hr',
      description: '95th percentile precipitation intensity during convective storm events, measuring high-impact torrential precipitation events.',
      associatedDataset: 'GPM Core Observatory',
      datasetId: 'GPM',
      temporalResolution: 'Daily 3-hour slices',
      baselineMean: 14.2,
      baselineTrendSlope: 0.082, // Higher extremes in warming atmosphere
      annualCycleAmplitude: 4.8,
      noiseStdDev: 1.8,
      importance: 'While mean annual precipitation changes gradually, short-duration storm intensity is observed to increase under thermodynamic warming.',
      applications: ['Urban drainage sizing', 'Landslide triggering thresholds', 'Flash flood forecasting', 'Severe thunderstorm severity']
    },
    {
      id: 'runoff',
      name: 'Surface Water Runoff',
      category: 'water',
      categoryName: 'Water Cycle',
      unit: 'mm / month',
      shortUnit: 'mm/mo',
      description: 'Volume of precipitation water that flows overland directly into river basins after soil infiltration capacity is exceeded.',
      associatedDataset: 'GLDAS Noah Model',
      datasetId: 'GLDAS',
      temporalResolution: 'Monthly aggregated fluxes',
      baselineMean: 26.5,
      baselineTrendSlope: -0.065,
      annualCycleAmplitude: 15.0,
      noiseStdDev: 4.0,
      importance: 'Indicates watershed water yields, siltation loads, soil erosion, and reservoir inflows.',
      applications: ['Hydroelectric dam management', 'Watershed sedimentation assessment', 'Downstream flood crest prediction', 'Wetland replenishment']
    },
    {
      id: 'streamflow',
      name: 'River Basin Streamflow Index',
      category: 'water',
      categoryName: 'Water Cycle',
      unit: 'm³ / second (Flow Rate Index)',
      shortUnit: 'm³/s',
      description: 'Volumetric rate of discharge through principal river gauging catchments assimilated from satellite altimetry and hydrological models.',
      associatedDataset: 'MERRA-2 Land / GLDAS',
      datasetId: 'MERRA-2',
      temporalResolution: 'Monthly averages',
      baselineMean: 340.0,
      baselineTrendSlope: -0.85,
      annualCycleAmplitude: 120.0,
      noiseStdDev: 35.0,
      importance: 'Direct measure of surface freshwater delivery to human municipal infrastructure, industrial consumption, and coastal estuaries.',
      applications: ['Transboundary water treaty monitoring', 'River navigation feasibility', 'Freshwater scarcity alerts', 'Ecological minimum flow verification']
    },

    // Ocean
    {
      id: 'sst',
      name: 'Sea Surface Temperature (SST)',
      category: 'ocean',
      categoryName: 'Ocean',
      unit: '°C (Celsius)',
      shortUnit: '°C',
      description: 'Thermal state of the top millimeter of ocean water (skin temperature) and top meter (subskin temperature) measured by infrared and microwave radiometers.',
      associatedDataset: 'MODIS Aqua / MERRA-2',
      datasetId: 'MODIS',
      temporalResolution: 'Daily & Monthly composites (4km)',
      baselineMean: 21.2,
      baselineTrendSlope: 0.024,
      annualCycleAmplitude: 3.2,
      noiseStdDev: 0.35,
      importance: 'Oceans absorb over 90% of excess heat trapped by greenhouse gases. SST influences tropical cyclone cyclogenesis and marine heatwaves.',
      applications: ['El Niño-Southern Oscillation (ENSO) tracking', 'Coral reef bleaching alerts', 'Tropical cyclone intensification forecasting', 'Marine ecosystem thermal habitat shifts']
    },
    {
      id: 'chlorophyll',
      name: 'Ocean Chlorophyll-a Concentration',
      category: 'ocean',
      categoryName: 'Ocean',
      unit: 'mg / m³',
      shortUnit: 'mg/m³',
      description: 'Concentration of photosynthetic pigment in phytoplankton in the euphotic ocean zone, derived from satellite ocean color reflectance bands.',
      associatedDataset: 'MODIS Ocean Color (Terra/Aqua)',
      datasetId: 'MODIS',
      temporalResolution: 'Monthly composite grids (4km)',
      baselineMean: 0.32,
      baselineTrendSlope: -0.0021,
      annualCycleAmplitude: 0.12,
      noiseStdDev: 0.03,
      importance: 'Phytoplankton forms the base of marine trophic webs and sequesters gigatons of carbon annually via the oceanic biological pump.',
      applications: ['Commercial fisheries stock assessment', 'Harmful algal bloom (HAB) detection', 'Oceanic carbon sequestration tracking', 'Marine protected area evaluation']
    },
    {
      id: 'sea_level',
      name: 'Regional Sea Level Anomaly',
      category: 'ocean',
      categoryName: 'Ocean',
      unit: 'mm (Deviation from 1993–2008 Mean)',
      shortUnit: 'mm',
      description: 'Deviation of ocean surface height from historical geoid reference, capturing thermal expansion of seawater plus land-ice melting runoff.',
      associatedDataset: 'Satellite Altimetry Synthesis (Jason / Sentinel / MERRA-2)',
      datasetId: 'MERRA-2',
      temporalResolution: 'Monthly grids (0.25°)',
      baselineMean: 48.0,
      baselineTrendSlope: 3.42, // ~ +3.4 mm/year
      annualCycleAmplitude: 8.0,
      noiseStdDev: 3.2,
      importance: 'Sea level rise threatens coastal megacities, low-lying island states, and induces saltwater intrusion into freshwater aquifers.',
      applications: ['Coastal erosion vulnerability', 'Tidal nuisance flooding hazard maps', 'Seawall and barrier engineering', 'Estuary salinity intrusion']
    }
  ];

  // 3. Preset Geographical Regions
  const regions = [
    {
      id: 'amazon',
      name: 'Amazon Rainforest Basin',
      country: 'Brazil / Peru / Colombia',
      lat: -3.4653,
      lon: -62.2159,
      zoom: 5,
      bounds: [[-12.0, -74.0], [5.0, -50.0]],
      description: 'Earth’s largest tropical rainforest and critical continental carbon sink, experiencing intensified drought stress and land clearing pressure.',
      climateType: 'Tropical Rainforest (Af)',
      defaultVariable: 'ndvi'
    },
    {
      id: 'sahara',
      name: 'Sahara Desert (Central Zone)',
      country: 'Algeria / Libya / Niger',
      lat: 23.4162,
      lon: 25.6628,
      zoom: 5,
      bounds: [[16.0, 10.0], [30.0, 35.0]],
      description: 'The world’s largest hot desert and primary source of global atmospheric mineral dust plumes that traverse the Atlantic.',
      climateType: 'Hot Desert (BWh)',
      defaultVariable: 'lst'
    },
    {
      id: 'india',
      name: 'Indian Subcontinent',
      country: 'India',
      lat: 20.5937,
      lon: 78.9629,
      zoom: 5,
      bounds: [[8.0, 68.0], [35.0, 92.0]],
      description: 'Densely populated agricultural region dominated by the South Asian summer monsoon, displaying significant changes in heavy precipitation distribution.',
      climateType: 'Tropical Wet & Dry / Monsoon (Am/Aw)',
      defaultVariable: 'precipitation'
    },
    {
      id: 'arctic',
      name: 'Arctic Ocean & Svalbard Region',
      country: 'Norway / Arctic Circle',
      lat: 78.2232,
      lon: 15.6267,
      zoom: 4,
      bounds: [[70.0, -10.0], [84.0, 40.0]],
      description: 'Region undergoing Arctic Amplification, warming at more than three times the global average rate with declining multi-year sea ice pack.',
      climateType: 'Polar Tundra / Ice Cap (ET/EF)',
      defaultVariable: 'air_temp'
    },
    {
      id: 'pacific_enso',
      name: 'Equatorial Pacific (Niño 3.4 Zone)',
      country: 'International Pacific Waters',
      lat: 0.0000,
      lon: -160.0000,
      zoom: 4,
      bounds: [[-5.0, -170.0], [5.0, -120.0]],
      description: 'Epicenter of the El Niño-Southern Oscillation (ENSO), driving worldwide teleconnections in rainfall, storm tracks, and heat distribution.',
      climateType: 'Equatorial Marine',
      defaultVariable: 'sst'
    },
    {
      id: 'sahel',
      name: 'Sahel Transition Zone',
      country: 'Senegal / Mali / Chad / Sudan',
      lat: 14.4974,
      lon: -14.4524,
      zoom: 5,
      bounds: [[10.0, -18.0], [18.0, 30.0]],
      description: 'Ecological ecotone between the arid Sahara and humid Sudano-Guinean zone, sensitive to desertification and precipitation variability.',
      climateType: 'Semi-Arid Steppe (BSh)',
      defaultVariable: 'soil_moisture'
    },
    {
      id: 'great_plains',
      name: 'North American Great Plains',
      country: 'United States / Canada',
      lat: 41.2033,
      lon: -98.7423,
      zoom: 5,
      bounds: [[32.0, -106.0], [50.0, -92.0]],
      description: 'Major agricultural breadbasket relying heavily on the Ogallala aquifer, showing shifting soil moisture dynamics and convective storm intensity.',
      climateType: 'Humid Continental / Semi-Arid (Dfa/BSk)',
      defaultVariable: 'soil_moisture'
    },
    {
      id: 'mediterranean',
      name: 'Mediterranean Basin',
      country: 'Spain / Italy / Greece',
      lat: 38.9637,
      lon: 15.2551,
      zoom: 5,
      bounds: [[30.0, -10.0], [45.0, 36.0]],
      description: 'Recognized climate change hotspot characterized by expanding summer drought seasons, compound heat extremes, and wildfire vulnerabilities.',
      climateType: 'Mediterranean (Csa/Csb)',
      defaultVariable: 'lst'
    },
    {
      id: 'australia',
      name: 'Australian Murray-Darling Basin',
      country: 'Australia',
      lat: -33.8688,
      lon: 145.2093,
      zoom: 5,
      bounds: [[-38.0, 138.0], [-26.0, 152.0]],
      description: 'Australia’s key agricultural basin subject to extreme hydroclimatic swings, prolonged millennium droughts, and flash flood events.',
      climateType: 'Semi-Arid to Temperate (BSk/Cfa)',
      defaultVariable: 'evapotranspiration'
    },
    {
      id: 'east_asia',
      name: 'East Asian Yangtze River Basin',
      country: 'China',
      lat: 30.5728,
      lon: 104.0668,
      zoom: 5,
      bounds: [[26.0, 98.0], [34.0, 122.0]],
      description: 'Highly populated economic and agricultural powerhouse experiencing intensified Mei-yu rainbands and record-breaking summer heat domes.',
      climateType: 'Humid Subtropical (Cfa)',
      defaultVariable: 'precipitation'
    }
  ];

  // 4. Global Trend Markers for Map Visualization (25+ geographical sites)
  const globalTrendPoints = [
    {
      id: 'gp-1',
      region: 'Svalbard & High Arctic',
      coords: [78.2232, 15.6267],
      variable: 'air_temp',
      variableName: 'Surface Air Temperature',
      dataset: 'AIRS / Aqua',
      trendDirection: 'increasing',
      rateOfChange: '+0.74 °C / decade',
      pValue: 0.0004,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444', // Red for warming
      detail: 'Rapid Arctic amplification; positive temperature anomaly over 2002-2023.'
    },
    {
      id: 'gp-2',
      region: 'Amazon Southern Flank (Rondônia)',
      coords: [-10.83, -62.88],
      variable: 'ndvi',
      variableName: 'Vegetation Index (NDVI)',
      dataset: 'MODIS Terra',
      trendDirection: 'decreasing',
      rateOfChange: '-0.024 Index / decade',
      pValue: 0.0018,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#38BDF8', // Blue for decreasing
      detail: 'Canopy greenness reduction associated with agricultural expansion and extended dry seasons.'
    },
    {
      id: 'gp-3',
      region: 'Sahara Dust Outflow Corridor',
      coords: [18.25, -22.50],
      variable: 'aod',
      variableName: 'Aerosol Optical Depth',
      dataset: 'MODIS Aqua',
      trendDirection: 'no_trend',
      rateOfChange: '+0.001 AOD / decade',
      pValue: 0.42,
      significance: 'not_significant',
      statusLabel: 'Not Statistically Significant',
      color: '#22C55E', // Green for stable/no significant trend
      detail: 'High inter-annual variability driven by Harmattan wind speeds without clear multi-decadal shift.'
    },
    {
      id: 'gp-4',
      region: 'Western US (Colorado Basin)',
      coords: [37.5, -109.5],
      variable: 'soil_moisture',
      variableName: 'Root Zone Soil Moisture',
      dataset: 'GLDAS Noah',
      trendDirection: 'decreasing',
      rateOfChange: '-0.018 m³/m³ / decade',
      pValue: 0.008,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#38BDF8',
      detail: 'Persistent megadrought conditions leading to cumulative soil water deficit across the Southwest.'
    },
    {
      id: 'gp-5',
      region: 'Indian Gangetic Plain',
      coords: [26.8, 80.9],
      variable: 'rainfall_rate',
      variableName: 'Extreme Rainfall Intensity',
      dataset: 'GPM IMERG',
      trendDirection: 'increasing',
      rateOfChange: '+0.95 mm/hr / decade',
      pValue: 0.012,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Increasing frequency of short-duration convective cloudburst events despite stable mean monsoon totals.'
    },
    {
      id: 'gp-6',
      region: 'Antarctic Ozone Depletion Edge',
      coords: [-65.0, -64.0],
      variable: 'ozone',
      variableName: 'Atmospheric Ozone Column',
      dataset: 'OMI / Aura',
      trendDirection: 'increasing',
      rateOfChange: '+4.8 DU / decade',
      pValue: 0.031,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Gradual stratospheric ozone recovery following chlorofluorocarbon phase-outs under the Montreal Protocol.'
    },
    {
      id: 'gp-7',
      region: 'Central Equatorial Pacific',
      coords: [0.0, -150.0],
      variable: 'sst',
      variableName: 'Sea Surface Temperature',
      dataset: 'MODIS Aqua',
      trendDirection: 'increasing',
      rateOfChange: '+0.19 °C / decade',
      pValue: 0.045,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Decadal ocean surface warming with pronounced El Niño/La Niña oscillatory peaks.'
    },
    {
      id: 'gp-8',
      region: 'Western Mediterranean (Iberia)',
      coords: [39.5, -3.2],
      variable: 'lst',
      variableName: 'Land Surface Temperature',
      dataset: 'MODIS Terra',
      trendDirection: 'increasing',
      rateOfChange: '+0.48 °C / decade',
      pValue: 0.002,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Lengthening summer heatwaves and soil moisture depletion creating strong sensible heating.'
    },
    {
      id: 'gp-9',
      region: 'Congo Rainforest Basin',
      coords: [0.5, 23.5],
      variable: 'ndvi',
      variableName: 'Vegetation Index (NDVI)',
      dataset: 'MODIS Terra',
      trendDirection: 'decreasing',
      rateOfChange: '-0.012 Index / decade',
      pValue: 0.082,
      significance: 'inconclusive',
      statusLabel: 'Inconclusive / Marginal',
      color: '#94A3B8', // Grey for insufficient or inconclusive
      detail: 'Cloud contamination and moderate dry-season browning yield marginal statistical significance (p=0.082).'
    },
    {
      id: 'gp-10',
      region: 'Tibetan Plateau (Third Pole)',
      coords: [32.0, 88.0],
      variable: 'air_temp',
      variableName: 'Surface Air Temperature',
      dataset: 'AIRS / Aqua',
      trendDirection: 'increasing',
      rateOfChange: '+0.52 °C / decade',
      pValue: 0.001,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'High-elevation amplification causing glacial thinning and permafrost degradation.'
    },
    {
      id: 'gp-11',
      region: 'Sahel Greenness Recovery Strip',
      coords: [14.5, 5.0],
      variable: 'ndvi',
      variableName: 'Vegetation Index (NDVI)',
      dataset: 'MODIS Terra',
      trendDirection: 'increasing',
      rateOfChange: '+0.019 Index / decade',
      pValue: 0.024,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Localized re-greening linked to slight monsoon recovery and conservation initiatives.'
    },
    {
      id: 'gp-12',
      region: 'Great Barrier Reef Shelf',
      coords: [-18.28, 147.69],
      variable: 'sst',
      variableName: 'Sea Surface Temperature',
      dataset: 'MODIS Aqua',
      trendDirection: 'increasing',
      rateOfChange: '+0.23 °C / decade',
      pValue: 0.005,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Successive thermal anomalies triggering repeated mass coral bleaching events.'
    },
    {
      id: 'gp-13',
      region: 'Greenland Ice Sheet Margin',
      coords: [67.1, -49.5],
      variable: 'lst',
      variableName: 'Land Surface Temperature',
      dataset: 'MODIS Terra',
      trendDirection: 'increasing',
      rateOfChange: '+0.61 °C / decade',
      pValue: 0.0007,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Albedo reduction as exposed dark ice and supraglacial melt ponds absorb more solar energy.'
    },
    {
      id: 'gp-14',
      region: 'Siberian Taiga (Yakutia)',
      coords: [62.0, 129.7],
      variable: 'air_temp',
      variableName: 'Surface Air Temperature',
      dataset: 'AIRS / Aqua',
      trendDirection: 'increasing',
      rateOfChange: '+0.68 °C / decade',
      pValue: 0.0003,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Severe winter-to-summer thermal extremes triggering active wildfire seasons and permafrost slumping.'
    },
    {
      id: 'gp-15',
      region: 'North Atlantic Subpolar Gyre',
      coords: [55.0, -35.0],
      variable: 'sst',
      variableName: 'Sea Surface Temperature',
      dataset: 'MERRA-2',
      trendDirection: 'decreasing',
      rateOfChange: '-0.14 °C / decade',
      pValue: 0.038,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant (Cooling Anomaly)',
      color: '#38BDF8',
      detail: 'Known as the "warming hole", linked to freshwater discharge and possible slowdown of Atlantic overturning.'
    },
    {
      id: 'gp-16',
      region: 'South China Sea Coast',
      coords: [21.5, 114.0],
      variable: 'sea_level',
      variableName: 'Sea Level Anomaly',
      dataset: 'MERRA-2 / Altimetry',
      trendDirection: 'increasing',
      rateOfChange: '+3.8 mm / year',
      pValue: 0.0001,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'High rate of relative sea level rise combined with local land subsidence.'
    },
    {
      id: 'gp-17',
      region: 'Horn of Africa (Somalia/Kenya)',
      coords: [4.0, 43.0],
      variable: 'soil_moisture',
      variableName: 'Root Zone Soil Moisture',
      dataset: 'GLDAS Noah',
      trendDirection: 'decreasing',
      rateOfChange: '-0.022 m³/m³ / decade',
      pValue: 0.004,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#38BDF8',
      detail: 'Multiple consecutive failed rainy seasons causing critical drought in pastoral lands.'
    },
    {
      id: 'gp-18',
      region: 'Central European Forests',
      coords: [50.0, 11.5],
      variable: 'evapotranspiration',
      variableName: 'Evapotranspiration',
      dataset: 'GLDAS / MODIS',
      trendDirection: 'decreasing',
      rateOfChange: '-3.8 mm/mo / decade',
      pValue: 0.028,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#38BDF8',
      detail: 'Canopy dieback and bark beetle infestation reducing active transpiration surfaces.'
    },
    {
      id: 'gp-19',
      region: 'Eastern Equatorial Pacific Upwelling',
      coords: [-5.0, -90.0],
      variable: 'chlorophyll',
      variableName: 'Ocean Chlorophyll-a',
      dataset: 'MODIS Ocean Color',
      trendDirection: 'no_trend',
      rateOfChange: '+0.003 mg/m³ / decade',
      pValue: 0.58,
      significance: 'not_significant',
      statusLabel: 'Not Statistically Significant',
      color: '#22C55E',
      detail: 'Phytoplankton blooms heavily governed by ENSO periodicity rather than monotonic linear trend.'
    },
    {
      id: 'gp-20',
      region: 'Lake Chad Basin',
      coords: [13.0, 14.5],
      variable: 'runoff',
      variableName: 'Surface Water Runoff',
      dataset: 'GLDAS Noah',
      trendDirection: 'no_trend',
      rateOfChange: '+0.15 mm/mo / decade',
      pValue: 0.49,
      significance: 'not_significant',
      statusLabel: 'Not Statistically Significant',
      color: '#22C55E',
      detail: 'High decadal oscillations between severe drought and sudden seasonal flooding without uniform slope.'
    },
    {
      id: 'gp-21',
      region: 'California Central Valley',
      coords: [36.5, -119.8],
      variable: 'soil_moisture',
      variableName: 'Root Zone Soil Moisture',
      dataset: 'GLDAS Noah',
      trendDirection: 'decreasing',
      rateOfChange: '-0.016 m³/m³ / decade',
      pValue: 0.019,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#38BDF8',
      detail: 'Depleted surface moisture reserves accompanied by intensive agricultural groundwater pumping.'
    },
    {
      id: 'gp-22',
      region: 'Southern Oceans (Drake Passage)',
      coords: [-58.0, -65.0],
      variable: 'ozone',
      variableName: 'Atmospheric Ozone Column',
      dataset: 'OMI / Aura',
      trendDirection: 'increasing',
      rateOfChange: '+3.9 DU / decade',
      pValue: 0.041,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Positive recovery trend observed in circumpolar vortex atmospheric chemistry.'
    },
    {
      id: 'gp-23',
      region: 'Southern Africa (Kalahari Ecotone)',
      coords: [-23.0, 21.0],
      variable: 'lst',
      variableName: 'Land Surface Temperature',
      dataset: 'MODIS Terra',
      trendDirection: 'increasing',
      rateOfChange: '+0.38 °C / decade',
      pValue: 0.014,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Significant warming of semi-arid soil surfaces impacting rangeland livestock suitability.'
    },
    {
      id: 'gp-24',
      region: 'South American Pampas',
      coords: [-34.5, -60.5],
      variable: 'precipitation',
      variableName: 'Total Monthly Precipitation',
      dataset: 'GPM IMERG',
      trendDirection: 'increasing',
      rateOfChange: '+4.2 mm/mo / decade',
      pValue: 0.035,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Modest upward shift in convective summer precipitation supporting rain-fed agriculture.'
    },
    {
      id: 'gp-25',
      region: 'Northwest Passage (Canadian Archipelago)',
      coords: [74.5, -95.0],
      variable: 'air_temp',
      variableName: 'Surface Air Temperature',
      dataset: 'AIRS / Aqua',
      trendDirection: 'increasing',
      rateOfChange: '+0.81 °C / decade',
      pValue: 0.0002,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant',
      color: '#EF4444',
      detail: 'Record warm summer seasons leading to longer open-water shipping window navigation.'
    }
  ];

  // 5. Featured Demonstration Investigations
  const demonstrations = [
    {
      id: 'demo-global-temp',
      title: 'Global Surface Temperature Anomaly Trends',
      subtitle: 'Multi-decadal tropospheric warming signature',
      variableId: 'air_temp',
      variableName: 'Surface Air Temperature',
      unit: '°C',
      regionId: 'arctic',
      regionName: 'Arctic & Global High Latitudes',
      timePeriod: '2000 - 2023',
      startYear: 2000,
      endYear: 2023,
      datasetId: 'AIRS',
      datasetName: 'AIRS / Aqua Sounder',
      trendDirection: 'increasing',
      rateOfChange: '+0.29 °C / decade',
      pValue: '< 0.0001',
      rSquared: 0.88,
      mannKendallTau: 0.74,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant (p < 0.001)',
      summary: 'Analysis of continuous atmospheric soundings confirms widespread tropospheric warming, with polar latitudes exhibiting three-fold accelerated warming compared to equatorial zones.',
      keyFindings: [
        'Decadal rate of change is +0.29 °C globally and exceeds +0.70 °C in polar sectors.',
        'Mann-Kendall rank correlation shows monotonic upward trajectory with high confidence.',
        'Consistent across both satellite soundings (AIRS) and atmospheric reanalysis (MERRA-2).'
      ],
      previewPoints: [
        { year: 2000, val: 14.32 }, { year: 2003, val: 14.45 }, { year: 2006, val: 14.48 },
        { year: 2009, val: 14.54 }, { year: 2012, val: 14.61 }, { year: 2015, val: 14.78 },
        { year: 2018, val: 14.85 }, { year: 2021, val: 14.92 }, { year: 2023, val: 15.04 }
      ]
    },
    {
      id: 'demo-monsoon-rain',
      title: 'Monsoon Rainfall Volatility in the Indian Subcontinent',
      subtitle: 'Shifting from steady drizzle to extreme convective cloudbursts',
      variableId: 'rainfall_rate',
      variableName: 'Extreme Rainfall Intensity Rate',
      unit: 'mm / hour',
      regionId: 'india',
      regionName: 'Indian Subcontinent',
      timePeriod: '2004 - 2023',
      startYear: 2004,
      endYear: 2023,
      datasetId: 'GPM',
      datasetName: 'GPM Core Observatory & IMERG',
      trendDirection: 'increasing',
      rateOfChange: '+0.88 mm/hr / decade',
      pValue: 0.0084,
      rSquared: 0.62,
      mannKendallTau: 0.58,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant (p = 0.008)',
      summary: 'Satellite microwave radar measurements reveal that while seasonal aggregate monsoon rainfall displays mild fluctuation, peak hourly precipitation intensities have risen markedly.',
      keyFindings: [
        'Hourly rain intensities during deep convective systems have increased by ~8.5% over 20 years.',
        'Urban flood risk has escalated significantly in Mumbai, Delhi, and Bengaluru.',
        'Trend satisfies standard significance thresholds (p < 0.01) under linear regression and Mann-Kendall.'
      ],
      previewPoints: [
        { year: 2004, val: 12.8 }, { year: 2007, val: 13.1 }, { year: 2010, val: 13.7 },
        { year: 2013, val: 13.4 }, { year: 2016, val: 14.2 }, { year: 2019, val: 14.6 },
        { year: 2021, val: 14.9 }, { year: 2023, val: 15.3 }
      ]
    },
    {
      id: 'demo-sahel-soil',
      title: 'Root Zone Soil Moisture Changes in the Sahel',
      subtitle: 'Hydroclimatic stress across the desert-savanna ecotone',
      variableId: 'soil_moisture',
      variableName: 'Root Zone Soil Moisture',
      unit: 'm³/m³',
      regionId: 'sahel',
      regionName: 'Sahel Transition Zone',
      timePeriod: '2000 - 2022',
      startYear: 2000,
      endYear: 2022,
      datasetId: 'GLDAS',
      datasetName: 'GLDAS Noah Land Surface Model',
      trendDirection: 'decreasing',
      rateOfChange: '-0.014 m³/m³ / decade',
      pValue: 0.016,
      rSquared: 0.54,
      mannKendallTau: -0.49,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant (p = 0.016)',
      summary: 'GLDAS assimilation data highlights persistent negative moisture trends in shallow root horizons, heightening vulnerability for pastoralist communities.',
      keyFindings: [
        'Soil water retention has declined steadily, punctuated by rapid post-monsoon dry-down.',
        'Negative trend slope aligns with elevated evapotranspiration demands from higher ambient temperatures.',
        'Reinforces the need for sustainable land management and rainwater harvesting.'
      ],
      previewPoints: [
        { year: 2000, val: 0.26 }, { year: 2003, val: 0.255 }, { year: 2006, val: 0.251 },
        { year: 2009, val: 0.244 }, { year: 2012, val: 0.248 }, { year: 2015, val: 0.239 },
        { year: 2018, val: 0.235 }, { year: 2021, val: 0.231 }, { year: 2022, val: 0.228 }
      ]
    },
    {
      id: 'demo-amazon-ndvi',
      title: 'Vegetation Canopy Dynamics in the Amazon Basin',
      subtitle: 'Monitoring rainforest resilience and canopy loss',
      variableId: 'ndvi',
      variableName: 'Vegetation Index (NDVI)',
      unit: 'Index Value',
      regionId: 'amazon',
      regionName: 'Amazon Rainforest Basin',
      timePeriod: '2001 - 2023',
      startYear: 2001,
      endYear: 2023,
      datasetId: 'MODIS',
      datasetName: 'MODIS Terra (MOD13A2)',
      trendDirection: 'decreasing',
      rateOfChange: '-0.019 Index / decade',
      pValue: 0.0035,
      rSquared: 0.67,
      mannKendallTau: -0.56,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant (p = 0.004)',
      summary: 'Multi-year MODIS vegetation indices indicate localized canopy degradation and increased dry-season browning along the southern and eastern "Arc of Deforestation".',
      keyFindings: [
        'Pristine core regions show moderate resilience, but fringe frontiers exhibit marked NDVI drops.',
        'Drought events in 2005, 2010, and 2015 caused prolonged recovery delays.',
        'Overall downward slope is statistically significant across 22 years of continuous observations.'
      ],
      previewPoints: [
        { year: 2001, val: 0.742 }, { year: 2004, val: 0.738 }, { year: 2007, val: 0.729 },
        { year: 2010, val: 0.718 }, { year: 2013, val: 0.724 }, { year: 2016, val: 0.711 },
        { year: 2019, val: 0.706 }, { year: 2021, val: 0.698 }, { year: 2023, val: 0.694 }
      ]
    },
    {
      id: 'demo-arctic-warming',
      title: 'Arctic Polar Amplification & Sea Ice Border Shifts',
      subtitle: 'Rapid warming in the High Northern Latitudes',
      variableId: 'air_temp',
      variableName: 'Surface Air Temperature',
      unit: '°C',
      regionId: 'arctic',
      regionName: 'Arctic Ocean & Svalbard Region',
      timePeriod: '2002 - 2023',
      startYear: 2002,
      endYear: 2023,
      datasetId: 'AIRS',
      datasetName: 'AIRS / Aqua & MODIS',
      trendDirection: 'increasing',
      rateOfChange: '+0.76 °C / decade',
      pValue: 0.0001,
      rSquared: 0.89,
      mannKendallTau: 0.78,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant (p < 0.001)',
      summary: 'Infrared sounder profiles show that high Arctic latitudes are warming at nearly 4x the planetary average, triggered by positive ice-albedo feedbacks.',
      keyFindings: [
        'Winter temperature anomalies are even larger than summer anomalies.',
        'Minimum Arctic sea ice extent has shrunk alongside thermal upward trends.',
        'Statistically robust across all parametric and non-parametric tests.'
      ],
      previewPoints: [
        { year: 2002, val: -5.1 }, { year: 2005, val: -4.8 }, { year: 2008, val: -4.4 },
        { year: 2011, val: -4.1 }, { year: 2014, val: -3.8 }, { year: 2017, val: -3.4 },
        { year: 2020, val: -3.2 }, { year: 2023, val: -2.8 }
      ]
    },
    {
      id: 'demo-pacific-sst',
      title: 'Sea Surface Temperature Anomalies in the Pacific ENSO Region',
      subtitle: 'Decadal ocean surface warming in Niño 3.4',
      variableId: 'sst',
      variableName: 'Sea Surface Temperature',
      unit: '°C',
      regionId: 'pacific_enso',
      regionName: 'Equatorial Pacific (Niño 3.4 Zone)',
      timePeriod: '2000 - 2023',
      startYear: 2000,
      endYear: 2023,
      datasetId: 'MODIS',
      datasetName: 'MODIS Aqua & MERRA-2',
      trendDirection: 'increasing',
      rateOfChange: '+0.18 °C / decade',
      pValue: 0.038,
      rSquared: 0.44,
      mannKendallTau: 0.42,
      significance: 'statistically_significant',
      statusLabel: 'Statistically Significant (p = 0.038)',
      summary: 'Equatorial Pacific ocean temperature data exhibits powerful 3-to-7 year oscillations superimposed upon a modest positive baseline thermal trend.',
      keyFindings: [
        'Major El Niño events (2015–2016) stand out as prominent spikes in the time series.',
        'Baseline background warming is identified despite high cyclic ocean variability.',
        'Statistically significant at alpha = 0.05 level.'
      ],
      previewPoints: [
        { year: 2000, val: 26.8 }, { year: 2003, val: 27.2 }, { year: 2006, val: 27.4 },
        { year: 2009, val: 27.5 }, { year: 2012, val: 27.3 }, { year: 2015, val: 28.3 },
        { year: 2018, val: 27.7 }, { year: 2021, val: 27.5 }, { year: 2023, val: 28.1 }
      ]
    }
  ];

  // 6. Time Series Generator Algorithm
  // Produces realistic synthetic observations with realistic trend, seasonal cycle, and natural variability
  function generateTimeSeries(options) {
    const {
      variableId = 'air_temp',
      startYear = 2005,
      endYear = 2023,
      resolution = 'monthly', // 'monthly' or 'daily' (subsampled for speed)
      region = null,
      noiseSeed = 42
    } = options;

    const variable = variables.find(v => v.id === variableId) || variables[0];
    const nYears = Math.max(2, endYear - startYear + 1);

    // Pseudorandom generator with seed for repeatable curves
    let seed = typeof noiseSeed === 'number' ? noiseSeed : 42;
    function pseudoRandom() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    function gaussianRandom(mean = 0, stdev = 1) {
      const u1 = Math.max(1e-7, pseudoRandom());
      const u2 = pseudoRandom();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return z * stdev + mean;
    }

    const observations = [];
    const timestamps = [];
    const rawValues = [];
    const xIndices = [];

    let baseMean = variable.baselineMean;
    let trendPerYear = variable.baselineTrendSlope;

    // Adjust parameters slightly if region is provided
    if (region && region.id) {
      if (region.id === 'arctic' && variableId === 'air_temp') {
        baseMean = -12.5;
        trendPerYear = 0.075; // Enhanced Arctic warming
      } else if (region.id === 'sahara' && (variableId === 'lst' || variableId === 'air_temp')) {
        baseMean = 36.5;
        trendPerYear = 0.045;
      } else if (region.id === 'amazon' && variableId === 'ndvi') {
        baseMean = 0.72;
        trendPerYear = -0.0022; // Forest degradation
      } else if (region.id === 'india' && variableId === 'precipitation') {
        baseMean = 95.0;
        trendPerYear = -0.15;
      }
    }

    const monthsPerYear = 12;
    let idx = 0;

    for (let yr = startYear; yr <= endYear; yr++) {
      const yearFraction = yr - startYear;

      if (resolution === 'monthly') {
        for (let m = 0; m < monthsPerYear; m++) {
          const t = yearFraction + m / 12.0;
          // Seasonal cycle
          const seasonalAngle = (m / 12.0) * 2 * Math.PI;
          const seasonalOffset = Math.sin(seasonalAngle) * variable.annualCycleAmplitude;

          // Multi-year cyclical noise (like ENSO)
          const ensoCycle = Math.sin(t * 0.8) * (variable.annualCycleAmplitude * 0.2);

          // Random weather noise
          const noise = gaussianRandom(0, variable.noiseStdDev);

          const value = baseMean + (trendPerYear * t) + seasonalOffset + ensoCycle + noise;
          const roundedVal = parseFloat(value.toFixed(3));

          const monthName = new Date(yr, m, 1).toLocaleString('en-US', { month: 'short' });
          const label = `${monthName} ${yr}`;

          timestamps.push(label);
          observations.push(roundedVal);
          rawValues.push(roundedVal);
          xIndices.push(t);
          idx++;
        }
      } else {
        // Daily resolution: sample 4 representative days per month to keep points fast and responsive
        for (let m = 0; m < monthsPerYear; m++) {
          for (let day of [1, 8, 15, 22]) {
            const t = yearFraction + (m * 30 + day) / 365.25;
            const seasonalAngle = ((m * 30 + day) / 365.25) * 2 * Math.PI;
            const seasonalOffset = Math.sin(seasonalAngle) * variable.annualCycleAmplitude;
            const noise = gaussianRandom(0, variable.noiseStdDev * 1.3);

            const value = baseMean + (trendPerYear * t) + seasonalOffset + noise;
            const roundedVal = parseFloat(value.toFixed(3));

            const label = `${yr}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            timestamps.push(label);
            observations.push(roundedVal);
            rawValues.push(roundedVal);
            xIndices.push(t);
            idx++;
          }
        }
      }
    }

    return {
      variable,
      startYear,
      endYear,
      resolution,
      region,
      timestamps,
      observations,
      xIndices,
      count: observations.length
    };
  }

  // Public API
  return {
    datasets,
    variables,
    regions,
    globalTrendPoints,
    demonstrations,
    generateTimeSeries
  };
})();

// Export globally for browser scripts
if (typeof window !== 'undefined') {
  window.TerraMockData = TerraMockData;
}
