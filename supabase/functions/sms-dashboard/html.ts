export const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>kwtSMS Dashboard</title>
  <link rel="icon" href="https://www.kwtsms.com/favicon.ico">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Lato:wght@400;700&display=swap');

    :root {
      --bg: #ffffff;
      --text: #434345;
      --card-bg: #f8f9fa;
      --border: #e0e0e0;
      --primary: #FFA200;
      --accent: #79CCF2;
      --success: #4CAF50;
      --danger: #F44336;
      --warning: #FF9800;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #1a1a2e;
        --text: #e0e0e0;
        --card-bg: #16213e;
        --border: #333;
      }
    }

    * { box-sizing: border-box; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: Lato, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }

    header {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 12px 24px;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
    }

    nav#tabs {
      display: flex;
      flex-direction: row;
      background: var(--card-bg);
      border-bottom: 2px solid var(--border);
      padding: 0 24px;
      overflow-x: auto;
    }

    .tab {
      padding: 12px 20px;
      border: none;
      background: none;
      color: var(--text);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      font-family: Lato, Helvetica, Arial, sans-serif;
      font-size: 14px;
      white-space: nowrap;
    }
    .tab:hover {
      color: var(--primary);
    }
    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      font-weight: bold;
    }

    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page { display: none; }
    .page.active { display: block; }

    h3 { font-family: Montserrat, sans-serif; }

    .card {
      background: var(--card-bg);
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid var(--border);
    }

    .stats-row {
      display: flex;
      flex-direction: row;
      gap: 16px;
      flex-wrap: wrap;
    }

    .stat-card {
      flex: 1;
      background: var(--card-bg);
      border-radius: 4px;
      padding: 16px;
      text-align: center;
      border: 1px solid var(--border);
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      font-family: Montserrat, sans-serif;
    }
    .stat-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .stat-card.stat-success .stat-value { color: var(--success); }
    .stat-card.stat-danger .stat-value { color: var(--danger); }
    .stat-card.stat-warning .stat-value { color: var(--warning); }

    .btn-primary {
      background: var(--primary);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn-primary:hover { opacity: 0.9; }

    .btn-secondary {
      background: var(--border);
      color: var(--text);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-danger {
      background: var(--danger);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-sm {
      padding: 4px 10px;
      font-size: 12px;
    }

    .btn-group {
      display: flex;
      flex-direction: row;
      gap: 8px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-success { background: #E8F5E9; color: var(--success); }
    .badge-danger { background: #FFEBEE; color: var(--danger); }
    .badge-warning { background: #FFF8E1; color: var(--warning); }

    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--border);
      border-radius: 24px;
      transition: 0.3s;
    }
    .slider:before {
      content: "";
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: 0.3s;
    }
    .toggle input:checked + .slider {
      background: var(--primary);
    }
    .toggle input:checked + .slider:before {
      transform: translateX(20px);
    }

    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: bold;
      font-size: 13px;
    }

    .form-row {
      display: flex;
      flex-direction: row;
      gap: 8px;
      margin-top: 12px;
    }

    input, textarea, select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-family: Lato, Helvetica, Arial, sans-serif;
      font-size: 14px;
      box-sizing: border-box;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      text-align: left;
      padding: 10px;
      border-bottom: 2px solid var(--border);
      font-size: 12px;
      text-transform: uppercase;
      color: #888;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid var(--border);
    }
    tr:hover td {
      background: var(--card-bg);
    }

    .truncate {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty {
      text-align: center;
      color: #888;
      padding: 40px;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .alert-danger { background: #FFEBEE; color: var(--danger); }
    .alert-success { background: #E8F5E9; color: var(--success); }

    .info-bar {
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      padding: 16px 0;
    }

    .page-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .page-header h3 {
      margin: 0;
      font-family: Montserrat, sans-serif;
    }

    .pagination {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 16px;
      padding: 20px 0;
    }

    .filters-bar {
      display: flex;
      flex-direction: row;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .filters-bar select,
    .filters-bar input {
      width: auto;
      min-width: 120px;
    }

    code {
      background: var(--border);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 13px;
    }

    .text-muted { color: #888; }

    #toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .toast {
      padding: 12px 20px;
      border-radius: 4px;
      margin-top: 8px;
      color: #fff;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    }
    .toast-success { background: var(--success); }
    .toast-error { background: var(--danger); }
    .toast-info { background: var(--accent); }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    @media (max-width: 768px) {
      .stats-row { flex-direction: column; }
      .hide-mobile { display: none; }
      nav#tabs { overflow-x: scroll; white-space: nowrap; }
      .filters-bar { flex-direction: column; }
      .info-bar { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <header>
    <img src="https://www.kwtsms.com/images/kwtsms_logo_60.png" alt="kwtSMS" height="36">
  </header>
  <nav id="tabs">
    <button class="tab active" data-page="dashboard">Dashboard</button>
    <button class="tab" data-page="settings">Settings</button>
    <button class="tab" data-page="templates">Templates</button>
    <button class="tab" data-page="logs">Logs</button>
  </nav>
  <main>
    <div id="page-dashboard" class="page active"><p class="empty">Loading...</p></div>
    <div id="page-settings" class="page"><p class="empty">Loading...</p></div>
    <div id="page-templates" class="page"><p class="empty">Loading...</p></div>
    <div id="page-logs" class="page"><p class="empty">Loading...</p></div>
  </main>
  <div id="toast-container"></div>

  <script>
    function switchPage(name) {
      document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      document.getElementById('page-' + name).classList.add('active');
      document.querySelector('[data-page="' + name + '"]').classList.add('active');
      var loaders = { dashboard: loadDashboard, settings: loadSettings, templates: loadTemplates, logs: function() { loadLogs(1); } };
      if (loaders[name]) loaders[name]();
    }

    async function api(method, path, body) {
      try {
        var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        var resp = await fetch('/sms-dashboard/api/' + path, opts);
        var data = await resp.json();
        if (!resp.ok) {
          showToast(data.error || 'Request failed', 'error');
          return null;
        }
        return data;
      } catch (err) {
        showToast('Network error', 'error');
        return null;
      }
    }

    function showToast(message, type) {
      var container = document.getElementById('toast-container');
      var toast = document.createElement('div');
      toast.className = 'toast toast-' + (type || 'info');
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 5000);
    }

    function escapeHtml(str) {
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    // Stub loaders (replaced in later tasks)
    function loadDashboard() {}
    function loadSettings() {}
    function loadTemplates() {}
    function loadLogs(page) {}

    // Tab click handlers
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() { switchPage(tab.dataset.page); });
    });

    // Init
    document.addEventListener('DOMContentLoaded', function() { loadDashboard(); });
  </script>
</body>
</html>`;
