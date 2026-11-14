/**
 * TerraTrend - Earth Systems Trend Detective
 * earthGlobe.js - Physically-Authentic 3D Earth Globe with Real 23.44° Axial Tilt,
 * West-to-East Rotation, Day/Night Lighting, City Lights, Moving Clouds & Satellite Tracking.
 */

(function () {
  'use strict';

  // Physical Constants
  const EARTH_AXIAL_TILT = 23.44 * (Math.PI / 180); // 23.44° obliquity of the ecliptic
  const ROTATION_SPEED_DEFAULT = 0.0035; // Natural, mesmerizing rotational speed (~30s full turn)

  let canvas, gl;
  let animationFrameId = null;
  let isRunning = true;
  let rotationSpeed = ROTATION_SPEED_DEFAULT;
  let currentRotation = 0; // Longitude angle in radians
  let userPitch = 0.08; // Slight pitch for optimal 3D perspective
  let userYaw = 0;
  let cloudsRotation = 0;
  let activeMode = 0; // 0: Natural (Day/Night + Cities), 1: Thermal LST, 2: Biosphere NDVI

  // Mouse & Touch Drag State
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let velocityX = 0;
  let velocityY = 0;

  // Active Satellites Configuration
  const satellites = [
    {
      name: 'Landsat 9',
      sensor: 'OLI-2 / TIRS-2',
      altitude: '705 km',
      velocity: '26,900 km/h',
      color: '#38BDF8',
      inclination: 98.2 * (Math.PI / 180), // Sun-synchronous near-polar
      orbitSpeed: 0.016,
      orbitRadiusRatio: 1.28,
      angle: 0.8
    },
    {
      name: 'Terra / MODIS',
      sensor: 'MODIS EOS-AM',
      altitude: '705 km',
      velocity: '27,000 km/h',
      color: '#22C55E',
      inclination: 70.0 * (Math.PI / 180),
      orbitSpeed: 0.012,
      orbitRadiusRatio: 1.22,
      angle: 2.4
    },
    {
      name: 'ISS (Telemetry)',
      sensor: 'ECOSTRESS / SAGE III',
      altitude: '420 km',
      velocity: '27,600 km/h',
      color: '#F59E0B',
      inclination: 51.6 * (Math.PI / 180),
      orbitSpeed: 0.022,
      orbitRadiusRatio: 1.15,
      angle: 4.2
    }
  ];

  // DOM Elements
  let satBadgesContainer;
  let telemetryCoordsEl, telemetrySpeedEl, telemetryTiltEl;

  /**
   * Initialize Earth Globe Visualizer
   */
  function init() {
    canvas = document.getElementById('tt-earth-canvas');
    if (!canvas) return;

    satBadgesContainer = document.getElementById('tt-earth-satellites-overlay');
    telemetryCoordsEl = document.getElementById('tt-earth-telemetry-coords');
    telemetrySpeedEl = document.getElementById('tt-earth-telemetry-speed');
    telemetryTiltEl = document.getElementById('tt-earth-telemetry-tilt');

    // Attach Interactive Controls
    setupControls();
    setupInteraction();

    // Setup WebGL Context
    const hasWebGL = initWebGL();
    if (!hasWebGL) {
      init2DFallback();
    }
  }

  /**
   * Set up UI buttons & mode switches
   */
  function setupControls() {
    // Mode switcher buttons
    const modeButtons = document.querySelectorAll('.tt-earth-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeMode = parseInt(btn.getAttribute('data-mode') || '0', 10);
      });
    });

    // Pause / Play button
    const playPauseBtn = document.getElementById('tt-earth-play-pause');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        playPauseBtn.innerHTML = isRunning 
          ? '<i data-lucide="pause"></i><span>Pause</span>'
          : '<i data-lucide="play"></i><span>Resume</span>';
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Speed toggle button
    const speedBtn = document.getElementById('tt-earth-speed-btn');
    if (speedBtn) {
      const speeds = [
        { label: '1x Speed', value: ROTATION_SPEED_DEFAULT },
        { label: '2x Speed', value: ROTATION_SPEED_DEFAULT * 2.2 },
        { label: '0.5x Speed', value: ROTATION_SPEED_DEFAULT * 0.5 }
      ];
      let speedIdx = 0;
      speedBtn.addEventListener('click', () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        rotationSpeed = speeds[speedIdx].value;
        speedBtn.querySelector('span').textContent = speeds[speedIdx].label;
      });
    }

    // Reset View Button
    const resetBtn = document.getElementById('tt-earth-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        userPitch = 0.08;
        userYaw = 0;
        velocityX = 0;
        velocityY = 0;
      });
    }
  }

  /**
   * Setup Drag & Touch Interactions for 3D Orbiting
   */
  function setupInteraction() {
    if (!canvas) return;

    function handleStart(x, y) {
      isDragging = true;
      lastMouseX = x;
      lastMouseY = y;
      velocityX = 0;
      velocityY = 0;
    }

    function handleMove(x, y) {
      if (!isDragging) return;
      const dx = x - lastMouseX;
      const dy = y - lastMouseY;
      lastMouseX = x;
      lastMouseY = y;

      userYaw += dx * 0.006;
      userPitch += dy * 0.006;

      // Clamp vertical pitch to avoid flipping upside down
      userPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, userPitch));

      velocityX = dx * 0.006;
      velocityY = dy * 0.006;
    }

    function handleEnd() {
      isDragging = false;
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
      handleStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', handleEnd);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', handleEnd);
  }

  /**
   * Generate High-Detail Procedural Equirectangular Earth Map Textures
   */
  function generateEarthTextures() {
    const W = 1024;
    const H = 512;

    // 1. Natural Surface Texture (Oceans, Continents, Biomes, Ice)
    const naturalCanvas = document.createElement('canvas');
    naturalCanvas.width = W;
    naturalCanvas.height = H;
    const ctx = naturalCanvas.getContext('2d');

    // Deep Ocean Background
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
    oceanGrad.addColorStop(0, '#091A30');
    oceanGrad.addColorStop(0.3, '#0D274D');
    oceanGrad.addColorStop(0.5, '#0E3366');
    oceanGrad.addColorStop(0.7, '#0D274D');
    oceanGrad.addColorStop(1, '#091A30');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, W, H);

    // Continental Shelves (Cyan Shallow Waters)
    ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
    drawContinents(ctx, W, H, 14);

    // Landmass Base & Vegetation Biomes
    ctx.fillStyle = '#15803D'; // Lush Green Forest
    drawContinents(ctx, W, H, 0);

    // Deserts & Arid Plateaus (Sahara, Arabia, Gobi, Australia Outback)
    ctx.fillStyle = '#D97706'; // Golden Desert Ochre
    drawDeserts(ctx, W, H);

    // Mountain Ridges (Himalayas, Andes, Rockies, Alps)
    ctx.fillStyle = '#78350F';
    drawMountainChains(ctx, W, H);

    // Polar Ice Caps (Arctic and Antarctica)
    ctx.fillStyle = '#F8FAFC';
    // North Pole / Greenland
    ctx.beginPath();
    ctx.ellipse(W * 0.5, 15, W * 0.45, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    // South Pole / Antarctica
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H - 20, W * 0.48, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Night Lights Texture (Black Marble City Lights)
    const nightCanvas = document.createElement('canvas');
    nightCanvas.width = W;
    nightCanvas.height = H;
    const nCtx = nightCanvas.getContext('2d');
    nCtx.fillStyle = '#000000';
    nCtx.fillRect(0, 0, W, H);
    drawCityLights(nCtx, W, H);

    // 3. Clouds Texture
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = W;
    cloudCanvas.height = H;
    const cCtx = cloudCanvas.getContext('2d');
    cCtx.fillStyle = '#000000';
    cCtx.fillRect(0, 0, W, H);
    drawCloudSwirls(cCtx, W, H);

    return {
      natural: naturalCanvas,
      night: nightCanvas,
      clouds: cloudCanvas
    };
  }

  /**
   * Draw recognizable world continents on equirectangular coordinate space
   */
  function drawContinents(ctx, W, H, expand) {
    function mapX(lon) { return ((lon + 180) / 360) * W; }
    function mapY(lat) { return ((90 - lat) / 180) * H; }

    ctx.save();
    if (expand > 0) {
      ctx.lineWidth = expand;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineJoin = 'round';
    }

    // Helper: draw polygon path from [lon, lat] points
    function poly(points) {
      ctx.beginPath();
      points.forEach((p, idx) => {
        const x = mapX(p[0]);
        const y = mapY(p[1]);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      if (expand > 0) ctx.stroke();
    }

    // 1. North America
    poly([
      [-168, 65], [-150, 71], [-130, 70], [-100, 74], [-80, 68], [-60, 58], [-52, 47],
      [-70, 42], [-75, 35], [-80, 25], [-90, 29], [-97, 26], [-105, 20], [-87, 14],
      [-80, 8], [-85, 10], [-95, 16], [-105, 24], [-115, 30], [-124, 38], [-125, 49],
      [-135, 57], [-160, 58], [-168, 65]
    ]);

    // Greenland
    poly([
      [-45, 60], [-20, 70], [-25, 82], [-55, 83], [-55, 75], [-45, 60]
    ]);

    // 2. South America
    poly([
      [-75, 10], [-60, 8], [-45, -2], [-35, -5], [-35, -12], [-40, -22], [-50, -32],
      [-65, -54], [-75, -50], [-72, -35], [-76, -18], [-80, -4], [-77, 5], [-75, 10]
    ]);

    // 3. Eurasia (Europe & Asia)
    poly([
      [-9, 36], [-9, 43], [5, 52], [10, 58], [25, 71], [40, 68], [60, 73], [100, 76],
      [140, 72], [170, 66], [165, 55], [140, 50], [130, 42], [120, 32], [110, 20],
      [100, 10], [92, 16], [80, 10], [70, 22], [60, 25], [50, 28], [35, 32], [28, 40],
      [15, 38], [-5, 36], [-9, 36]
    ]);

    // United Kingdom & Scandinavia
    poly([[-5, 50], [2, 53], [0, 58], [-6, 56], [-5, 50]]);
    poly([[5, 58], [15, 56], [28, 70], [15, 68], [5, 58]]);

    // 4. Africa
    poly([
      [-5, 36], [10, 37], [25, 32], [32, 31], [43, 12], [51, 10], [42, -5],
      [35, -25], [28, -34], [18, -34], [12, -18], [8, 4], [0, 6], [-16, 12],
      [-17, 21], [-10, 30], [-5, 36]
    ]);

    // Madagascar
    poly([[44, -12], [50, -15], [47, -25], [43, -24], [44, -12]]);

    // 5. Australia & New Zealand
    poly([
      [114, -22], [125, -14], [136, -12], [142, -10], [150, -22], [153, -28],
      [150, -37], [138, -36], [130, -32], [115, -34], [114, -22]
    ]);
    poly([[168, -38], [176, -38], [172, -45], [168, -45], [168, -38]]);

    // Japan & Southeast Asian archipelago
    poly([[130, 32], [136, 35], [141, 43], [142, 38], [130, 32]]);
    poly([[100, 3], [108, -5], [115, -7], [112, 5], [100, 3]]);

    ctx.restore();
  }

  /**
   * Draw Desert & Arid Patches (Sahara, Arabia, Gobi, Australian Outback)
   */
  function drawDeserts(ctx, W, H) {
    function mapX(lon) { return ((lon + 180) / 360) * W; }
    function mapY(lat) { return ((90 - lat) / 180) * H; }

    function desert(lon, lat, rx, ry) {
      ctx.beginPath();
      ctx.ellipse(mapX(lon), mapY(lat), (rx / 360) * W, (ry / 180) * H, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sahara Desert
    desert(18, 24, 28, 8);
    // Arabian Peninsula
    desert(45, 23, 12, 7);
    // Gobi & Taklamakan
    desert(95, 42, 18, 6);
    // Australian Outback
    desert(133, -25, 14, 8);
    // US Mojave / Sonoran
    desert(-112, 32, 6, 4);
    // Atacama / Patagonian
    desert(-68, -25, 4, 10);
    // Kalahari
    desert(22, -24, 8, 5);
  }

  /**
   * Draw Mountain Ridges
   */
  function drawMountainChains(ctx, W, H) {
    function mapX(lon) { return ((lon + 180) / 360) * W; }
    function mapY(lat) { return ((90 - lat) / 180) * H; }

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#78350F';
    ctx.lineCap = 'round';

    // Himalayas
    ctx.beginPath();
    ctx.moveTo(mapX(73), mapY(35));
    ctx.quadraticCurveTo(mapX(85), mapY(30), mapX(95), mapY(28));
    ctx.stroke();

    // Andes
    ctx.beginPath();
    ctx.moveTo(mapX(-76), mapY(8));
    ctx.lineTo(mapX(-71), mapY(-15));
    ctx.lineTo(mapX(-69), mapY(-45));
    ctx.stroke();

    // Rockies
    ctx.beginPath();
    ctx.moveTo(mapX(-125), mapY(55));
    ctx.lineTo(mapX(-115), mapY(45));
    ctx.lineTo(mapX(-105), mapY(35));
    ctx.stroke();

    // Alps
    ctx.beginPath();
    ctx.moveTo(mapX(6), mapY(45));
    ctx.lineTo(mapX(14), mapY(47));
    ctx.stroke();
  }

  /**
   * Draw City Lights (Golden Glow in Megacities & Urban Corridors)
   */
  function drawCityLights(ctx, W, H) {
    function mapX(lon) { return ((lon + 180) / 360) * W; }
    function mapY(lat) { return ((90 - lat) / 180) * H; }

    const cities = [
      // North America
      [-74, 40.7, 7, 1.0], // NYC
      [-118, 34, 6, 0.9], // LA
      [-87.6, 41.8, 5, 0.8], // Chicago
      [-95.3, 29.7, 5, 0.8], // Houston
      [-122, 37.7, 5, 0.9], // Bay Area
      [-79.3, 43.6, 4, 0.7], // Toronto
      // Europe
      [0, 51.5, 6, 1.0], // London
      [2.3, 48.8, 6, 0.95], // Paris
      [13.4, 52.5, 5, 0.8], // Berlin
      [12.5, 41.9, 4, 0.75], // Rome
      [37.6, 55.7, 6, 0.85], // Moscow
      // Asia
      [139.7, 35.6, 8, 1.0], // Tokyo
      [121.5, 31.2, 8, 1.0], // Shanghai
      [116.4, 39.9, 7, 0.9], // Beijing
      [77.2, 28.6, 8, 0.95], // New Delhi
      [72.8, 19.0, 7, 0.9], // Mumbai
      [103.8, 1.3, 5, 0.85], // Singapore
      [126.9, 37.5, 6, 0.9], // Seoul
      [100.5, 13.7, 5, 0.8], // Bangkok
      // Middle East
      [55.3, 25.2, 5, 0.85], // Dubai
      [31.2, 30.0, 6, 0.8], // Cairo / Nile corridor
      // South America
      [-46.6, -23.5, 6, 0.9], // São Paulo
      [-43.2, -22.9, 5, 0.8], // Rio
      [-58.4, -34.6, 5, 0.8], // Buenos Aires
      // Africa & Oceania
      [28.0, -26.2, 5, 0.75], // Johannesburg
      [151.2, -33.8, 5, 0.8], // Sydney
      [144.9, -37.8, 4, 0.75]  // Melbourne
    ];

    cities.forEach(c => {
      const cx = mapX(c[0]);
      const cy = mapY(c[1]);
      const r = c[2];
      const intensity = c[3];

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
      grad.addColorStop(0, `rgba(254, 240, 138, ${intensity})`);
      grad.addColorStop(0.3, `rgba(245, 158, 11, ${intensity * 0.7})`);
      grad.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Regional megalopolis light clusters (dense small dots)
    ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
    for (let i = 0; i < 400; i++) {
      // Clustered around US East, Western Europe, India, East Asia
      let lon, lat;
      const region = Math.random();
      if (region < 0.3) {
        lon = -85 + Math.random() * 15;
        lat = 30 + Math.random() * 15;
      } else if (region < 0.6) {
        lon = -5 + Math.random() * 30;
        lat = 42 + Math.random() * 14;
      } else if (region < 0.85) {
        lon = 105 + Math.random() * 30;
        lat = 22 + Math.random() * 20;
      } else {
        lon = 72 + Math.random() * 18;
        lat = 12 + Math.random() * 18;
      }
      ctx.fillRect(mapX(lon), mapY(lat), 1.2, 1.2);
    }
  }

  /**
   * Draw Dynamic Cloud Swirls
   */
  function drawCloudSwirls(ctx, W, H) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    function mapX(lon) { return ((lon + 180) / 360) * W; }
    function mapY(lat) { return ((90 - lat) / 180) * H; }

    // Intertropical Convergence Zone (ITCZ) cloud bands
    for (let x = -180; x < 180; x += 15) {
      const cy = mapY(Math.sin(x * 0.05) * 8 + 4);
      ctx.beginPath();
      ctx.ellipse(mapX(x), cy, 35, 10, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mid-latitude cyclone spiral cloud storms
    const storms = [
      [-140, 48, 55, 22],
      [-40, 52, 60, 24],
      [150, 42, 50, 20],
      [-110, -50, 65, 25],
      [30, -52, 60, 22],
      [110, -48, 55, 20]
    ];

    storms.forEach(s => {
      ctx.beginPath();
      ctx.ellipse(mapX(s[0]), mapY(s[1]), s[2], s[3], -0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * WebGL 3D Orthographic Spherical Shader Pipeline
   */
  function initWebGL() {
    try {
      gl = canvas.getContext('webgl', { antialias: true, alpha: true, powerPreference: 'high-performance' })
        || canvas.getContext('experimental-webgl', { antialias: true, alpha: true });
    } catch (e) {
      return false;
    }

    if (!gl) return false;

    // Vertex Shader: Fullscreen Quad
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: 3D Ray-Sphere Projection with 23.44° Axial Tilt,
    // West-to-East Rotation, Specular Glint, Rayleigh Atmosphere, City Lights & Clouds
    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;

      uniform vec2 u_resolution;
      uniform float u_rotation; // Eastward rotation angle
      uniform float u_pitch;    // Interactive Pitch
      uniform float u_yaw;      // Interactive Yaw
      uniform float u_tilt;     // 23.44° Obliquity of the Ecliptic
      uniform int u_mode;       // 0: Natural, 1: Thermal, 2: Biosphere
      uniform float u_clouds_rot;
      uniform sampler2D u_tex_earth;
      uniform sampler2D u_tex_night;
      uniform sampler2D u_tex_clouds;

      const float PI = 3.14159265359;
      const float TWO_PI = 6.28318530718;

      // 3D Rotation around X axis (Pitch)
      vec3 rotateX(vec3 p, float a) {
        float c = cos(a), s = sin(a);
        return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
      }

      // 3D Rotation around Y axis (Yaw / Earth Rotation)
      vec3 rotateY(vec3 p, float a) {
        float c = cos(a), s = sin(a);
        return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
      }

      // 3D Rotation around Z axis (Axial Tilt)
      vec3 rotateZ(vec3 p, float a) {
        float c = cos(a), s = sin(a);
        return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
      }

      void main() {
        // Normalize screen coordinates with aspect ratio
        vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Sphere radius in screen space
        float radius = 0.42;
        float distSq = dot(st, st);

        // Outside Earth sphere: render deep space & atmospheric outer glow
        if (distSq > radius * radius) {
          float dist = sqrt(distSq);
          float halo = clamp(1.0 - (dist - radius) / 0.09, 0.0, 1.0);
          halo = pow(halo, 3.5);

          // Sunlight direction in celestial space (upper left)
          vec3 sunDir = normalize(vec3(0.9, 0.4, 0.7));
          float sunAlignment = max(dot(normalize(vec3(st, 0.1)), sunDir), 0.0);
          vec3 spaceGlow = vec3(0.22, 0.74, 0.97) * halo * 0.75 * (0.4 + 0.6 * sunAlignment);

          gl_FragColor = vec4(spaceGlow, halo * 0.85);
          return;
        }

        // On the Sphere: Compute 3D Orthographic Normal Vector (Facing observer)
        float nx = st.x / radius;
        float ny = st.y / radius;
        float nz = sqrt(max(1.0 - nx * nx - ny * ny, 0.0));
        vec3 normal = vec3(nx, ny, nz);

        // Apply Real Axial Tilt (23.44°) and User View Pitch/Yaw
        vec3 p = normal;
        p = rotateX(p, -u_pitch);
        p = rotateZ(p, u_tilt); // Tilted rotational axis
        p = rotateY(p, -(u_rotation + u_yaw)); // Prograde West-to-East rotation

        // Convert Sphere Surface to Equirectangular Texture Coordinates (u, v)
        float lon = atan(p.x, p.z); // -PI to PI
        float lat = asin(clamp(p.y, -1.0, 1.0)); // -PI/2 to PI/2
        vec2 texCoord = vec2((lon + PI) / TWO_PI, 0.5 - lat / PI);

        // Clouds coordinate with independent drift
        vec3 pClouds = normal;
        pClouds = rotateX(pClouds, -u_pitch);
        pClouds = rotateZ(pClouds, u_tilt);
        pClouds = rotateY(pClouds, -(u_rotation * 1.08 + u_clouds_rot + u_yaw));
        vec2 cloudCoord = vec2((atan(pClouds.x, pClouds.z) + PI) / TWO_PI, 0.5 - asin(clamp(pClouds.y, -1.0, 1.0)) / PI);

        // Sample Earth Textures
        vec4 dayCol = texture2D(u_tex_earth, texCoord);
        vec4 nightCol = texture2D(u_tex_night, texCoord);
        vec4 cloudCol = texture2D(u_tex_clouds, cloudCoord);

        // Sun Direction & Lighting
        vec3 sunDir = normalize(vec3(0.85, 0.35, 0.8));
        float diffuse = dot(normal, sunDir);
        float sunIntensity = smoothstep(-0.15, 0.35, diffuse);

        // Mode Processing
        vec3 surfaceColor = dayCol.rgb;

        if (u_mode == 1) {
          // Thermal / Surface Temp Heatmap (AIRS / MODIS style)
          float tempVal = 0.5 + 0.45 * sin(lat * 2.2) - 0.25 * (dayCol.r - dayCol.g);
          vec3 cool = vec3(0.06, 0.25, 0.65);
          vec3 mid = vec3(0.13, 0.82, 0.93);
          vec3 warm = vec3(0.96, 0.62, 0.04);
          vec3 hot = vec3(0.93, 0.15, 0.15);
          if (tempVal < 0.33) surfaceColor = mix(cool, mid, tempVal / 0.33);
          else if (tempVal < 0.66) surfaceColor = mix(mid, warm, (tempVal - 0.33) / 0.33);
          else surfaceColor = mix(warm, hot, (tempVal - 0.66) / 0.34);
        } else if (u_mode == 2) {
          // Biosphere / NDVI Vegetation Index
          float ndvi = (dayCol.g - dayCol.r * 0.6) * 1.8;
          ndvi = clamp(ndvi, 0.0, 1.0);
          vec3 dry = vec3(0.72, 0.55, 0.32);
          vec3 veg = vec3(0.08, 0.65, 0.24);
          surfaceColor = mix(dry, veg, ndvi);
          if (dayCol.b > dayCol.g * 1.2) surfaceColor = vec3(0.05, 0.18, 0.38); // Oceans stay navy
        }

        // Ocean Specular Reflection
        float isOcean = step(0.02, dayCol.b - dayCol.g);
        vec3 halfVec = normalize(sunDir + vec3(0.0, 0.0, 1.0));
        float specular = pow(max(dot(normal, halfVec), 0.0), 32.0) * isOcean * 0.6;

        // Day and Night Blending
        vec3 litDay = surfaceColor * max(diffuse, 0.08) + vec3(specular);
        vec3 nightLights = nightCol.rgb * (1.0 - sunIntensity) * 1.6;
        vec3 compositePlanet = mix(nightLights + surfaceColor * 0.04, litDay, sunIntensity);

        // Add Clouds Layer (illuminated by sun)
        float cloudDensity = cloudCol.r * 0.65;
        vec3 litClouds = vec3(0.95, 0.98, 1.0) * (max(diffuse, 0.15) * 0.9 + 0.1);
        compositePlanet = mix(compositePlanet, litClouds, cloudDensity * sunIntensity);

        // Atmospheric Rayleigh Scattering / Limb Fresnel Glow
        float fresnel = pow(1.0 - normal.z, 2.8);
        vec3 atmosphereGlow = vec3(0.22, 0.74, 0.97) * fresnel * (0.35 + 0.65 * max(diffuse, 0.0));
        compositePlanet += atmosphereGlow;

        gl_FragColor = vec4(compositePlanet, 1.0);
      }
    `;

    // Compile Shaders
    function createShader(glCtx, type, source) {
      const shader = glCtx.createShader(type);
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return false;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);

    // Setup Quad Geometry
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Get Uniform Locations
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uRot = gl.getUniformLocation(program, 'u_rotation');
    const uPitch = gl.getUniformLocation(program, 'u_pitch');
    const uYaw = gl.getUniformLocation(program, 'u_yaw');
    const uTilt = gl.getUniformLocation(program, 'u_tilt');
    const uMode = gl.getUniformLocation(program, 'u_mode');
    const uClouds = gl.getUniformLocation(program, 'u_clouds_rot');

    // Create & Upload Textures
    const textures = generateEarthTextures();

    function uploadTexture(texCanvas, unit) {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    }

    uploadTexture(textures.natural, 0);
    uploadTexture(textures.night, 1);
    uploadTexture(textures.clouds, 2);

    gl.uniform1i(gl.getUniformLocation(program, 'u_tex_earth'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_tex_night'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'u_tex_clouds'), 2);
    gl.uniform1f(uTilt, EARTH_AXIAL_TILT);

    // Handle HiDPI Canvas Resize
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = canvas.clientWidth || 420;
      const displayHeight = canvas.clientHeight || 290;
      const targetW = Math.floor(displayWidth * dpr);
      const targetH = Math.floor(displayHeight * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    // Animation Loop
    function renderLoop() {
      resizeCanvas();

      if (isRunning && !isDragging) {
        // Natural Eastward (Prograde) Rotation
        currentRotation += rotationSpeed;
        cloudsRotation += rotationSpeed * 0.25;
      }

      // Apply drag momentum inertia
      if (!isDragging) {
        userYaw += velocityX;
        userPitch += velocityY;
        velocityX *= 0.94;
        velocityY *= 0.94;
        userPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, userPitch));
      }

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uRot, currentRotation);
      gl.uniform1f(uPitch, userPitch);
      gl.uniform1f(uYaw, userYaw);
      gl.uniform1i(uMode, activeMode);
      gl.uniform1f(uClouds, cloudsRotation);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Render 3D Satellites & Update Telemetry HUD
      renderSatellites();
      updateTelemetryHUD();

      animationFrameId = requestAnimationFrame(renderLoop);
    }

    renderLoop();
    return true;
  }

  /**
   * 2D Canvas Fallback in case WebGL is unavailable
   */
  function init2DFallback() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function render2D() {
      const w = canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
      const h = canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
      const r = Math.min(w, h) * 0.42;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      if (isRunning && !isDragging) {
        currentRotation += rotationSpeed;
      }

      // Atmosphere Outer Glow
      const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.15);
      haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Earth Sphere with 23.4° Axial Tilt
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(EARTH_AXIAL_TILT);

      // Ocean Base
      const oceanGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
      oceanGrad.addColorStop(0, '#0EA5E9');
      oceanGrad.addColorStop(0.4, '#0369A1');
      oceanGrad.addColorStop(0.8, '#082F49');
      oceanGrad.addColorStop(1, '#020617');
      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Graticule Lines (Equator & Meridians)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      // Equator
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Continents drift simulation
      ctx.fillStyle = '#15803D';
      const offset = (currentRotation * 50) % (r * 2);
      ctx.beginPath();
      ctx.arc(-r * 0.5 + offset, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      renderSatellites();
      updateTelemetryHUD();
      requestAnimationFrame(render2D);
    }

    render2D();
  }

  /**
   * Render Active Orbiting Satellites in 3D Perspective
   */
  function renderSatellites() {
    if (!satBadgesContainer) return;

    const rect = canvas.getBoundingClientRect();
    const cx = (rect.width || canvas.clientWidth || 420) / 2;
    const cy = (rect.height || canvas.clientHeight || 290) / 2;
    const baseRadius = Math.min(cx, cy) * 0.84;

    satellites.forEach((sat, i) => {
      sat.angle += sat.orbitSpeed;

      // 3D Orbit coordinates with inclination
      const r = baseRadius * sat.orbitRadiusRatio;
      const x0 = Math.cos(sat.angle) * r;
      const y0 = Math.sin(sat.angle) * r * Math.cos(sat.inclination);
      const z0 = Math.sin(sat.angle) * r * Math.sin(sat.inclination);

      // Rotate with Axial Tilt (23.44°)
      const tilt = EARTH_AXIAL_TILT;
      const screenX = cx + (x0 * Math.cos(tilt) - y0 * Math.sin(tilt));
      const screenY = cy + (x0 * Math.sin(tilt) + y0 * Math.cos(tilt));
      const isFacing = z0 >= 0;

      let el = document.getElementById(`tt-sat-marker-${i}`);
      if (!el) {
        el = document.createElement('div');
        el.id = `tt-sat-marker-${i}`;
        el.className = 'tt-satellite-3d-node';
        el.innerHTML = `
          <div class="tt-sat-ping" style="background-color: ${sat.color}; box-shadow: 0 0 12px ${sat.color};"></div>
          <div class="tt-sat-card">
            <span class="tt-sat-name" style="color: ${sat.color};">${sat.name}</span>
            <span class="tt-sat-info">${sat.altitude} &bull; ${sat.velocity}</span>
          </div>
        `;
        satBadgesContainer.appendChild(el);
      }

      el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`;
      el.style.opacity = isFacing ? '1' : '0.28';
      el.style.zIndex = isFacing ? '20' : '1';
    });
  }

  /**
   * Update Real-Time Telemetry HUD Display
   */
  function updateTelemetryHUD() {
    if (!telemetryCoordsEl) return;

    // Subsolar point & rotation longitude
    const lonDeg = (((-currentRotation - userYaw) * 180 / Math.PI) % 360 + 360) % 360;
    const latDeg = (userPitch * 180 / Math.PI).toFixed(1);
    const lonStr = `${lonDeg.toFixed(1)}° ${lonDeg > 180 ? 'W' : 'E'}`;
    const latStr = `${Math.abs(latDeg)}° ${latDeg >= 0 ? 'N' : 'S'}`;

    telemetryCoordsEl.textContent = `${latStr}, ${lonStr}`;
    if (telemetrySpeedEl) {
      telemetrySpeedEl.textContent = isRunning ? '1,674 km/h' : '0 km/h (PAUSED)';
    }
    if (telemetryTiltEl) {
      telemetryTiltEl.textContent = '23.44° Obliquity';
    }
  }

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export to window for external integration
  window.TerraEarthGlobe = {
    setMode: (m) => { activeMode = m; },
    togglePlay: () => { isRunning = !isRunning; },
    reset: () => { userPitch = 0.08; userYaw = 0; }
  };
})();
