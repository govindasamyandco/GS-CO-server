const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const isBuildProd = process.env.RENDER || process.env.NODE_ENV === 'production';
const initialUserUrl = process.env.CLIENT_USER_URL || (isBuildProd ? 'https://gs-co-user.onrender.com' : 'http://localhost:5173');
const initialOwnerUrl = process.env.CLIENT_OWNER_URL || (isBuildProd ? 'https://gs-co-owner.onrender.com' : 'http://localhost:3000');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Govindasamy & Co — Cloud Server & Telemetry Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    :root {
      --bg-base: #030d22;
      --bg-card: rgba(10, 25, 54, 0.85);
      --bg-card-hover: rgba(14, 34, 72, 0.95);
      --border-subtle: rgba(56, 189, 248, 0.15);
      --border-highlight: rgba(56, 189, 248, 0.35);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-cyan: #38bdf8;
      --accent-green: #22c55e;
      --accent-amber: #f59e0b;
      --accent-gold: #d97706;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg-base);
      background-image: 
        radial-gradient(at 0% 0%, rgba(3, 105, 161, 0.2) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(217, 119, 6, 0.12) 0px, transparent 50%);
      color: var(--text-main);
      min-height: 100vh;
      padding: 2rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dashboard-container {
      max-width: 1050px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* ── Header ── */
    .header-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 1.5rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #ffffff;
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
    }

    .brand-titles h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.45rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.3px;
    }

    .brand-titles p {
      color: var(--text-muted);
      font-size: 0.82rem;
      margin-top: 0.15rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #4ade80;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .pulse {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 10px #22c55e;
      animation: pulseAnim 2s infinite;
    }

    @keyframes pulseAnim {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }

    .btn-refresh {
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid var(--border-highlight);
      color: var(--accent-cyan);
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }

    .btn-refresh:hover {
      background: rgba(56, 189, 248, 0.25);
      color: #ffffff;
    }

    /* ── Metrics Grid ── */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 1.25rem;
      backdrop-filter: blur(10px);
      transition: border-color 0.2s ease;
    }

    .metric-card:hover {
      border-color: var(--border-highlight);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.6rem;
    }

    .metric-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-icon {
      font-size: 1rem;
      color: var(--accent-cyan);
    }

    .metric-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: #ffffff;
    }

    .metric-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    /* ── Section Cards ── */
    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0.6rem;
    }

    /* ── Services Grid ── */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.85rem;
    }

    .service-row {
      background: rgba(3, 13, 34, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .service-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .service-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(56, 189, 248, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-cyan);
      font-size: 0.9rem;
    }

    .service-name {
      font-weight: 600;
      font-size: 0.88rem;
    }

    .service-tech {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .badge-active {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.4);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    /* ── Interactive Packing Simulator Widget ── */
    .simulator-box {
      background: rgba(3, 13, 34, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .sim-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .sim-input-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #020817;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 0.35rem 0.75rem;
      font-size: 0.82rem;
    }

    .sim-input-group input {
      background: transparent;
      border: none;
      color: #ffffff;
      width: 55px;
      font-weight: 700;
      font-size: 0.9rem;
      outline: none;
      text-align: center;
    }

    .btn-sim-run {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.2rem;
      font-weight: 700;
      font-size: 0.84rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: opacity 0.2s ease;
    }

    .btn-sim-run:hover { opacity: 0.9; }

    .sim-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .sim-bale-card {
      background: #0b1a36;
      border: 1px solid #1e3a68;
      border-radius: 10px;
      padding: 0.85rem;
    }

    .sim-progress-track {
      height: 8px;
      background: #020817;
      border-radius: 999px;
      overflow: hidden;
      margin: 0.5rem 0;
    }

    .sim-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #22c55e);
      border-radius: 999px;
      transition: width 0.5s ease;
    }

    /* ── Quick Links ── */
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .portal-link-btn {
      background: rgba(3, 13, 34, 0.7);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      color: #ffffff;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }

    .portal-link-btn:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: var(--border-highlight);
      color: var(--accent-cyan);
    }

    /* ── Footer ── */
    .footer-text {
      text-align: center;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="dashboard-container">

    <!-- 1. Header -->
    <header class="header-card">
      <div class="brand-group">
        <div class="brand-icon">
          <i class="fa-solid fa-server"></i>
        </div>
        <div class="brand-titles">
          <h1>Govindasamy & Co — Cloud API & Server Telemetry</h1>
          <p>Real-Time Firebase Serverless Backend & Master Bale Algorithm Engine</p>
        </div>
      </div>

      <div class="header-actions">
        <div class="status-pill">
          <div class="pulse"></div> Live & Operational
        </div>
        <button class="btn-refresh" onclick="fetchTelemetry()">
          <i class="fa-solid fa-arrows-rotate" id="refresh-icon"></i> Refresh Telemetry
        </button>
      </div>
    </header>

    <!-- 2. Live Telemetry Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Server Uptime</span>
          <i class="fa-solid fa-clock metric-icon"></i>
        </div>
        <div class="metric-value" id="val-uptime">0s</div>
        <div class="metric-sub">Process active & listening</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Memory (Heap Used)</span>
          <i class="fa-solid fa-microchip metric-icon"></i>
        </div>
        <div class="metric-value" id="val-heap">-- MB</div>
        <div class="metric-sub" id="val-rss">RSS: -- MB</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Packing Engine</span>
          <i class="fa-solid fa-boxes-stacked metric-icon" style="color: #4ade80;"></i>
        </div>
        <div class="metric-value" style="color: #4ade80;">120 Units</div>
        <div class="metric-sub">Best-Fit Decreasing (Exact integer)</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Cloud Functions</span>
          <i class="fa-solid fa-bolt metric-icon" style="color: #f59e0b;"></i>
        </div>
        <div class="metric-value" style="color: #f59e0b;">5 Active</div>
        <div class="metric-sub">Firebase Functions v2</div>
      </div>
    </div>

    <!-- 3. Core Cloud Services Status -->
    <section class="section-card">
      <h2 class="section-title">
        <i class="fa-solid fa-shield-halved" style="color: var(--accent-cyan);"></i>
        Backend Infrastructure & Security Services
      </h2>
      <div class="services-grid">
        <div class="service-row">
          <div class="service-info">
            <div class="service-icon"><i class="fa-solid fa-database"></i></div>
            <div>
              <div class="service-name">Cloud Firestore</div>
              <div class="service-tech">Real-time DB • Security rules enforced</div>
            </div>
          </div>
          <span class="badge-active">ACTIVE</span>
        </div>

        <div class="service-row">
          <div class="service-info">
            <div class="service-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <div>
              <div class="service-name">Firebase Storage</div>
              <div class="service-tech">Product photos • 5MB MIME-checked</div>
            </div>
          </div>
          <span class="badge-active">ACTIVE</span>
        </div>

        <div class="service-row">
          <div class="service-info">
            <div class="service-icon"><i class="fa-solid fa-cube"></i></div>
            <div>
              <div class="service-name">Master Bale Bin-Packing</div>
              <div class="service-tech">Best-Fit Decreasing • 0 float drift</div>
            </div>
          </div>
          <span class="badge-active">VERIFIED</span>
        </div>

        <div class="service-row">
          <div class="service-info">
            <div class="service-icon"><i class="fa-solid fa-fingerprint"></i></div>
            <div>
              <div class="service-name">Admin MFA & Custom Claims</div>
              <div class="service-tech">TOTP Authenticator & Google Auth</div>
            </div>
          </div>
          <span class="badge-active">ENFORCED</span>
        </div>
      </div>
    </section>

    <!-- 4. Interactive Master Bale Packing Simulator -->
    <section class="section-card">
      <h2 class="section-title">
        <i class="fa-solid fa-boxes-packing" style="color: #4ade80;"></i>
        Live Master Bale Packing Simulator (Test Algorithm)
      </h2>
      <div class="simulator-box">
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem;">
          Simulate how the Best-Fit Decreasing algorithm packs mixed mat bundles into physical Master Bales in real-time:
        </p>
        <div class="sim-controls">
          <div class="sim-input-group">
            <span>Robo Mat (3/bale):</span>
            <input type="number" id="sim-robo" value="1" min="0" max="50">
            <span>Bundles</span>
          </div>

          <div class="sim-input-group">
            <span>13×19 Mat (8/bale):</span>
            <input type="number" id="sim-mat" value="6" min="0" max="50">
            <span>Bundles</span>
          </div>

          <button class="btn-sim-run" onclick="runPackingSim()">
            <i class="fa-solid fa-play"></i> Simulate Packing
          </button>
        </div>

        <div id="sim-results" class="sim-results-grid"></div>
      </div>
    </section>

    <!-- 5. Quick Portals Navigation -->
    <section class="section-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
        <h2 class="section-title" style="margin-bottom: 0;">
          <i class="fa-solid fa-compass" style="color: var(--accent-gold);"></i>
          Quick App Portals & Endpoints
        </h2>
        <span id="portal-env-badge" style="font-size: 0.75rem; background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600;">
          Resolving Endpoints...
        </span>
      </div>

      <div class="links-grid">
        <a id="link-customer-portal" href="${initialUserUrl}" target="_blank" class="portal-link-btn">
          <span>
            <i class="fa-solid fa-store" style="margin-right: 0.4rem; color: #38bdf8;"></i>
            <strong id="label-customer-portal">Customer Portal</strong>
            <span id="sub-customer-portal" style="display: block; font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">${initialUserUrl}</span>
          </span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
        <a id="link-owner-portal" href="${initialOwnerUrl}" target="_blank" class="portal-link-btn">
          <span>
            <i class="fa-solid fa-user-shield" style="margin-right: 0.4rem; color: #f59e0b;"></i>
            <strong id="label-owner-portal">Owner Admin Portal</strong>
            <span id="sub-owner-portal" style="display: block; font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">${initialOwnerUrl}</span>
          </span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
        <a id="link-telemetry-api" href="/api/telemetry" target="_blank" class="portal-link-btn">
          <span>
            <i class="fa-solid fa-code" style="margin-right: 0.4rem; color: #4ade80;"></i>
            <strong>JSON Telemetry API</strong>
            <span style="display: block; font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">/api/telemetry</span>
          </span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
        <a id="link-health-api" href="/health?format=json" target="_blank" class="portal-link-btn">
          <span>
            <i class="fa-solid fa-heart-pulse" style="margin-right: 0.4rem; color: #ef4444;"></i>
            <strong>Health JSON Endpoint</strong>
            <span style="display: block; font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">/health?format=json</span>
          </span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </section>

    <footer class="footer-text">
      Govindasamy & Co • Centralized Enterprise Backend Architecture • Render Web Service
    </footer>
  </div>

  <script>
    async function fetchTelemetry() {
      const icon = document.getElementById('refresh-icon');
      if (icon) icon.classList.add('fa-spin');

      try {
        const res = await fetch('/api/telemetry');
        const data = await res.json();

        if (data.memory) {
          document.getElementById('val-heap').textContent = data.memory.heapUsedMb + ' MB';
          document.getElementById('val-rss').textContent = 'RSS: ' + data.memory.rssMb + ' MB / Total: ' + data.memory.heapTotalMb + ' MB';
        }
        if (data.uptimeSeconds !== undefined) {
          const s = data.uptimeSeconds;
          const hrs = Math.floor(s / 3600);
          const mins = Math.floor((s % 3600) / 60);
          const secs = s % 60;
          document.getElementById('val-uptime').textContent = (hrs > 0 ? hrs + 'h ' : '') + mins + 'm ' + secs + 's';
        }

        // Dynamic Portals & Hosted Endpoints Resolution
        const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const envBadge = document.getElementById('portal-env-badge');
        if (envBadge) {
          envBadge.textContent = isProd ? 'LIVE HOSTED ENVIRONMENT' : 'LOCAL ENVIRONMENT';
          envBadge.style.background = isProd ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)';
          envBadge.style.color = isProd ? '#4ade80' : 'var(--accent-cyan)';
          envBadge.style.borderColor = isProd ? 'rgba(34, 197, 94, 0.3)' : 'rgba(56, 189, 248, 0.3)';
        }

        if (data.portals) {
          let custUrl = data.portals.customerPortalUrl || (isProd ? 'https://govindasamyandco.web.app' : 'http://localhost:5173');
          let ownerUrl = data.portals.ownerPortalUrl || (isProd ? 'https://govindasamy-admin.web.app' : 'http://localhost:3000');

          if (isProd) {
            if (custUrl.includes('localhost') || custUrl.includes('127.0.0.1')) {
              custUrl = 'https://govindasamyandco.web.app';
            }
            if (ownerUrl.includes('localhost') || ownerUrl.includes('127.0.0.1')) {
              ownerUrl = 'https://govindasamy-admin.web.app';
            }
          }

          const linkCust = document.getElementById('link-customer-portal');
          const subCust = document.getElementById('sub-customer-portal');
          if (linkCust) linkCust.href = custUrl;
          if (subCust) subCust.textContent = custUrl;

          const linkOwner = document.getElementById('link-owner-portal');
          const subOwner = document.getElementById('sub-owner-portal');
          if (linkOwner) linkOwner.href = ownerUrl;
          if (subOwner) subOwner.textContent = ownerUrl;
        }
      } catch (err) {
        console.warn('Telemetry fetch error:', err);
      } finally {
        if (icon) setTimeout(() => icon.classList.remove('fa-spin'), 600);
      }
    }

    // Client-side instant Best-Fit Decreasing Simulator
    function runPackingSim() {
      const roboQty = parseInt(document.getElementById('sim-robo').value) || 0;
      const matQty  = parseInt(document.getElementById('sim-mat').value) || 0;

      const items = [
        { title: 'Robo Mat', capUnits: 40, piecesPerBundle: 50, qty: roboQty },
        { title: '13x19 Door Mat', capUnits: 15, piecesPerBundle: 50, qty: matQty }
      ].filter(it => it.qty > 0);

      const bales = [];
      let baleCount = 1;

      items.sort((a, b) => b.capUnits - a.capUnits);

      for (const item of items) {
        let remaining = item.qty;
        while (remaining > 0) {
          let bestBale = null;
          let bestRemAfter = Infinity;

          for (const bale of bales) {
            const rem = 120 - bale.units;
            const canFit = Math.floor(rem / item.capUnits);
            if (canFit <= 0) continue;
            const toAdd = Math.min(remaining, canFit);
            const remAfter = rem - toAdd * item.capUnits;
            if (remAfter < bestRemAfter) {
              bestRemAfter = remAfter;
              bestBale = bale;
            }
          }

          if (!bestBale) {
            bestBale = { id: 'MB' + String(baleCount).padStart(3, '0'), units: 0, items: [] };
            baleCount++;
            bales.push(bestBale);
          }

          const rem = 120 - bestBale.units;
          const canFit = Math.floor(rem / item.capUnits);
          const toAdd = Math.min(remaining, canFit);
          if (toAdd <= 0) break;

          bestBale.units += toAdd * item.capUnits;
          bestBale.items.push({ title: item.title, qty: toAdd });
          remaining -= toAdd;
        }
      }

      const resultsDiv = document.getElementById('sim-results');
      if (bales.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #94a3b8; font-size: 0.8rem;">Enter at least 1 bundle to simulate packing.</p>';
        return;
      }

      resultsDiv.innerHTML = bales.map(b => {
        const pct = ((b.units / 120) * 100).toFixed(1);
        const barColor = pct >= 90 ? '#22c55e' : pct >= 50 ? '#38bdf8' : '#f59e0b';
        return \`
          <div class="sim-bale-card">
            <div style="display: flex; justify-content: space-between; font-size: 0.84rem; font-weight: 700;">
              <span><i class="fa-solid fa-cube" style="color: #38bdf8;"></i> \${b.id}</span>
              <span style="color: \${barColor};">\${pct}% Full</span>
            </div>
            <div class="sim-progress-track">
              <div class="sim-progress-fill" style="width: \${pct}%; background: \${barColor};"></div>
            </div>
            <div style="font-size: 0.75rem; color: #94a3b8;">
              \${b.items.map(it => \`\${it.title}: <strong>\${it.qty} Bundle(s)</strong>\`).join(' · ')}
            </div>
          </div>
        \`;
      }).join('');
    }

    // Initial load
    fetchTelemetry();
    runPackingSim();
    setInterval(fetchTelemetry, 5000);
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), html);
console.log('Successfully built Govindasamy & Co Live Telemetry Dashboard in /public/index.html');
