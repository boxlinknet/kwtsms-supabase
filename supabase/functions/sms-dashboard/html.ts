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
      --bg: #f8f9fa;
      --text: #434345;
      --card-bg: #ffffff;
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
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
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
    .badge-pending { background: #f0f0f0; color: #888; }

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
    tbody tr:nth-child(even) td {
      background: rgba(0,0,0,0.02);
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
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      padding: 14px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      margin-top: 16px;
    }
    .info-bar .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text);
    }
    .info-bar .info-label {
      color: #888;
      font-size: 12px;
    }
    .info-bar .info-separator {
      width: 1px;
      height: 20px;
      background: var(--border);
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

    #login-screen {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }
    #login-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 40px;
      width: 100%;
      max-width: 360px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    #login-box img { margin: 0 auto 24px auto; display: block; max-width: 280px; height: auto; }
    #login-box .form-group { text-align: left; }
    #login-box .btn-primary { width: 100%; padding: 10px; font-size: 15px; margin-top: 8px; }
    #login-error { color: var(--danger); font-size: 13px; margin-top: 12px; }
    #app { display: none; }

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
  <div id="login-screen">
    <div id="login-box">
      <img src="https://www.kwtsms.com/images/kwtsms_logo_60.png" alt="kwtSMS">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="login-email" placeholder="admin@example.com">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="login-password" placeholder="Password">
      </div>
      <button class="btn-primary" onclick="doLogin()">Sign In</button>
      <div id="login-error"></div>
    </div>
  </div>
  <div id="app">
  <header>
    <img src="https://www.kwtsms.com/images/kwtsms_logo_60.png" alt="kwtSMS" height="36">
    <span id="user-email" style="margin-left:auto;font-size:13px;color:#888;"></span>
    <button class="btn-secondary btn-sm" onclick="doLogout()" style="margin-left:8px;">Logout</button>
  </header>
  <nav id="tabs">
    <button class="tab active" data-page="dashboard">Dashboard</button>
    <button class="tab" data-page="settings">Settings</button>
    <button class="tab" data-page="templates">Templates</button>
    <button class="tab" data-page="logs">Logs</button>
  </nav>
  <main>
    <div id="page-dashboard" class="page active">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value" id="stat-balance">--</div>
          <div class="stat-label">Balance</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-purchased">--</div>
          <div class="stat-label">Purchased</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-value" id="stat-sent">--</div>
          <div class="stat-label">Sent</div>
        </div>
        <div class="stat-card stat-danger">
          <div class="stat-value" id="stat-failed">--</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-value" id="stat-skipped">--</div>
          <div class="stat-label">Skipped</div>
        </div>
      </div>
      <div class="info-bar">
        <div class="info-item" id="gw-status"></div>
        <div class="info-separator"></div>
        <div class="info-item" id="test-mode-status"></div>
        <div class="info-separator"></div>
        <div class="info-item"><span class="info-label">Sender:</span> <span id="sender-id-display"></span></div>
        <div class="info-separator"></div>
        <div class="info-item"><span class="info-label">Synced:</span> <span id="sync-time"></span></div>
        <button class="btn-primary btn-sm" onclick="syncBalance()">Sync Now</button>
      </div>
      <div id="dashboard-warnings"></div>
    </div>
    <div id="page-settings" class="page">
      <section class="card">
        <h3>Gateway Configuration</h3>
        <div class="form-group">
          <label>Gateway Enabled</label>
          <label class="toggle"><input type="checkbox" id="set-gateway-enabled"><span class="slider"></span></label>
        </div>
        <div class="form-group">
          <label>Test Mode</label>
          <label class="toggle"><input type="checkbox" id="set-test-mode"><span class="slider"></span></label>
        </div>
        <div class="form-group">
          <label>Sender ID</label>
          <select id="set-sender-id"></select>
        </div>
        <div class="form-group">
          <label>Default Country Code</label>
          <select id="set-country-code"></select>
        </div>
        <div class="form-group">
          <label>Debug Logging</label>
          <label class="toggle"><input type="checkbox" id="set-debug-logging"><span class="slider"></span></label>
        </div>
        <button class="btn-primary" onclick="saveSettings()">Save Settings</button>
      </section>
      <section class="card">
        <h3>Admin Recipients</h3>
        <table>
          <thead><tr><th>Phone</th><th>Label</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody id="admin-tbody"></tbody>
        </table>
        <div class="form-row">
          <input type="text" id="admin-phone" placeholder="Phone number">
          <input type="text" id="admin-label" placeholder="Label">
          <button class="btn-primary" onclick="addAdmin()">Add</button>
        </div>
      </section>
      <section class="card">
        <h3>Send Test SMS</h3>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="text" id="test-phone" placeholder="96598765432">
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea id="test-message" rows="3"></textarea>
        </div>
        <button class="btn-primary" onclick="sendTestSms()">Send Test</button>
        <div id="test-result"></div>
      </section>
    </div>
    <div id="page-templates" class="page">
      <div class="page-header">
        <h3>SMS Templates</h3>
        <button class="btn-secondary" onclick="resetAllTemplates()">Reset All to Defaults</button>
      </div>
      <div id="templates-list"></div>
      <div id="template-editor" class="card" style="display:none">
        <h3>Edit Template: <span id="edit-slug"></span></h3>
        <p id="edit-description" class="text-muted"></p>
        <div class="form-group">
          <label>Body (English)</label>
          <textarea id="edit-body-en" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Body (Arabic)</label>
          <textarea id="edit-body-ar" rows="3" dir="rtl"></textarea>
        </div>
        <div class="btn-group">
          <button class="btn-primary" onclick="saveTemplate()">Save</button>
          <button class="btn-secondary" onclick="resetTemplate()">Reset to Default</button>
          <button class="btn-secondary" onclick="closeEditor()">Cancel</button>
        </div>
      </div>
    </div>
    <div id="page-logs" class="page">
      <div class="page-header">
        <h3>SMS Logs</h3>
        <div class="btn-group">
          <button class="btn-secondary" onclick="exportCsv()">Export CSV</button>
          <button class="btn-danger" onclick="clearLogs()">Clear Logs</button>
        </div>
      </div>
      <div class="filters-bar">
        <select id="log-status" onchange="loadLogs(1)">
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
        <input type="text" id="log-phone" placeholder="Search phone..." onchange="loadLogs(1)">
        <select id="log-template" onchange="loadLogs(1)">
          <option value="">All templates</option>
        </select>
        <input type="date" id="log-from" onchange="loadLogs(1)">
        <input type="date" id="log-to" onchange="loadLogs(1)">
      </div>
      <table>
        <thead><tr>
          <th>Date</th><th>Phone</th><th>Status</th><th>Message</th>
          <th class="hide-mobile">Template</th><th class="hide-mobile">Msg ID</th>
        </tr></thead>
        <tbody id="logs-tbody"></tbody>
      </table>
      <div class="pagination">
        <button class="btn-secondary" id="logs-prev" onclick="loadLogs(currentLogPage-1)">Prev</button>
        <span id="logs-page-info"></span>
        <button class="btn-secondary" id="logs-next" onclick="loadLogs(currentLogPage+1)">Next</button>
      </div>
    </div>
  </main>
  </div>
  <div id="toast-container"></div>

  <script>
    // Auth state
    var authToken = sessionStorage.getItem('auth_token') || '';
    var authEmail = sessionStorage.getItem('auth_email') || '';

    // API base URL: auto-detect
    var API_BASE = '';
    (function() {
      if (window.location.pathname.indexOf('/functions/v1/sms-dashboard') === 0) {
        API_BASE = '/functions/v1/sms-dashboard/api/';
      } else {
        var meta = document.querySelector('meta[name="supabase-url"]');
        if (meta && meta.content) {
          API_BASE = meta.content + '/functions/v1/sms-dashboard/api/';
        } else {
          var saved = sessionStorage.getItem('supabase_url');
          if (saved) API_BASE = saved + '/functions/v1/sms-dashboard/api/';
        }
      }
    })();

    function ensureApiBase() {
      if (API_BASE) return true;
      var url = prompt('Enter your Supabase project URL:');
      if (!url) return false;
      url = url.replace(/\/+$/, '');
      sessionStorage.setItem('supabase_url', url);
      API_BASE = url + '/functions/v1/sms-dashboard/api/';
      return true;
    }

    async function doLogin() {
      if (!ensureApiBase()) return;
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      if (!email || !password) return;
      document.getElementById('login-error').textContent = '';
      try {
        var resp = await fetch(API_BASE + 'auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password })
        });
        var data = await resp.json();
        if (!resp.ok || !data.access_token) {
          document.getElementById('login-error').textContent = data.error || 'Login failed';
          return;
        }
        authToken = data.access_token;
        authEmail = data.user ? data.user.email : email;
        sessionStorage.setItem('auth_token', authToken);
        sessionStorage.setItem('auth_email', authEmail);
        showApp();
      } catch (err) {
        document.getElementById('login-error').textContent = 'Connection error';
      }
    }

    function doLogout() {
      authToken = '';
      authEmail = '';
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_email');
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('app').style.display = 'none';
    }

    function showApp() {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      document.getElementById('user-email').textContent = authEmail;
      loadDashboard();
    }

    // Enter key submits login
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') {
        doLogin();
      }
    });

    function switchPage(name) {
      document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      document.getElementById('page-' + name).classList.add('active');
      document.querySelector('[data-page="' + name + '"]').classList.add('active');
      var loaders = { dashboard: loadDashboard, settings: loadSettings, templates: loadTemplates, logs: function() { loadLogs(1); } };
      if (loaders[name]) loaders[name]();
    }

    async function api(method, path, body, silent) {
      if (!ensureApiBase()) return null;
      if (!authToken) { doLogout(); return null; }
      try {
        var opts = {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
          }
        };
        if (body) opts.body = JSON.stringify(body);
        var resp = await fetch(API_BASE + path, opts);
        if (resp.status === 401) { doLogout(); showToast('Session expired', 'error'); return null; }
        var data = await resp.json();
        if (!resp.ok) {
          if (!silent) showToast(data.error || 'Request failed', 'error');
          data._failed = true;
          return data;
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
    async function loadDashboard() {
      var settings = await api('GET', 'settings');
      if (!settings) return;

      document.getElementById('stat-balance').textContent =
        settings.cached_balance !== null ? settings.cached_balance.toLocaleString() : '--';
      document.getElementById('stat-purchased').textContent =
        settings.cached_purchased !== null ? settings.cached_purchased.toLocaleString() : '--';

      var gwEl = document.getElementById('gw-status');
      gwEl.textContent = '';
      var gwBadge = document.createElement('span');
      gwBadge.className = settings.gateway_enabled ? 'badge badge-success' : 'badge badge-danger';
      gwBadge.textContent = settings.gateway_enabled ? 'Gateway Enabled' : 'Gateway Disabled';
      gwEl.appendChild(gwBadge);

      var tmEl = document.getElementById('test-mode-status');
      tmEl.textContent = '';
      var tmBadge = document.createElement('span');
      tmBadge.className = settings.test_mode ? 'badge badge-warning' : 'badge badge-success';
      tmBadge.textContent = settings.test_mode ? 'Test Mode ON' : 'Live Mode';
      tmEl.appendChild(tmBadge);

      document.getElementById('sender-id-display').textContent = settings.sender_id || 'Not set';
      document.getElementById('sync-time').textContent =
        settings.balance_synced_at
          ? new Date(settings.balance_synced_at).toLocaleString()
          : 'Never';

      var warnings = document.getElementById('dashboard-warnings');
      warnings.textContent = '';
      if (!settings.gateway_enabled) {
        var div = document.createElement('div');
        div.className = 'alert alert-danger';
        div.textContent = 'Gateway is disabled. Enable it in Settings.';
        warnings.appendChild(div);
      }
      if (settings.cached_balance !== null && settings.cached_balance <= 0) {
        var div2 = document.createElement('div');
        div2.className = 'alert alert-danger';
        div2.textContent = 'Zero balance. Recharge at kwtsms.com.';
        warnings.appendChild(div2);
      }

      // Fetch log counts by status
      var statuses = ['sent', 'failed', 'skipped'];
      for (var i = 0; i < statuses.length; i++) {
        var s = statuses[i];
        var data = await api('GET', 'logs?limit=1&status=' + s);
        if (data) {
          document.getElementById('stat-' + s).textContent =
            (data.total || 0).toLocaleString();
        }
      }
    }

    async function syncBalance() {
      var btn = document.querySelector('#page-dashboard .btn-primary');
      btn.disabled = true;
      btn.textContent = 'Syncing...';
      var result = await api('POST', 'balance/sync');
      if (result && result.result === 'OK') {
        showToast('Balance synced: ' + result.available, 'success');
        loadDashboard();
      }
      btn.disabled = false;
      btn.textContent = 'Sync Now';
    }
    async function loadSettings() {
      var settings = await api('GET', 'settings');
      if (!settings) return;
      document.getElementById('set-gateway-enabled').checked = settings.gateway_enabled;
      document.getElementById('set-test-mode').checked = settings.test_mode;
      document.getElementById('set-debug-logging').checked = settings.debug_logging;

      // Populate sender ID dropdown
      var senderSelect = document.getElementById('set-sender-id');
      senderSelect.textContent = '';
      var senderIds = Array.isArray(settings.sender_ids) ? settings.sender_ids : [];
      if (senderIds.length === 0 && settings.sender_id) senderIds = [settings.sender_id];
      for (var i = 0; i < senderIds.length; i++) {
        var opt = document.createElement('option');
        opt.value = senderIds[i];
        opt.textContent = senderIds[i];
        if (senderIds[i] === settings.sender_id) opt.selected = true;
        senderSelect.appendChild(opt);
      }

      // Populate country code dropdown from coverage
      var ccSelect = document.getElementById('set-country-code');
      ccSelect.textContent = '';
      var codes = [];
      if (Array.isArray(settings.coverage)) {
        codes = settings.coverage.map(function(c) { return String(c); });
      }
      if (codes.length === 0) codes = ['965'];
      if (codes.indexOf(settings.default_country_code) === -1 && settings.default_country_code) {
        codes.unshift(settings.default_country_code);
      }
      for (var j = 0; j < codes.length; j++) {
        var opt2 = document.createElement('option');
        opt2.value = codes[j];
        opt2.textContent = '+' + codes[j];
        if (codes[j] === settings.default_country_code) opt2.selected = true;
        ccSelect.appendChild(opt2);
      }

      loadAdminRecipients();

      // Prefill test message with timestamp
      var testMsg = document.getElementById('test-message');
      if (!testMsg.value) {
        testMsg.value = 'kwtSMS test ' + new Date().toLocaleString();
      }
    }

    async function saveSettings() {
      var result = await api('PUT', 'settings', {
        gateway_enabled: document.getElementById('set-gateway-enabled').checked,
        test_mode: document.getElementById('set-test-mode').checked,
        sender_id: document.getElementById('set-sender-id').value,
        default_country_code: document.getElementById('set-country-code').value,
        debug_logging: document.getElementById('set-debug-logging').checked
      });
      if (result && result.result === 'OK') showToast('Settings saved', 'success');
    }

    async function loadAdminRecipients() {
      var admins = await api('GET', 'admin-recipients');
      var tbody = document.getElementById('admin-tbody');
      tbody.textContent = '';
      if (!Array.isArray(admins) || admins.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 4;
        td.className = 'empty';
        td.textContent = 'No admin recipients configured';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      for (var i = 0; i < admins.length; i++) {
        var a = admins[i];
        var tr = document.createElement('tr');

        var tdPhone = document.createElement('td');
        tdPhone.textContent = a.phone_normalized || a.phone;
        tr.appendChild(tdPhone);

        var tdLabel = document.createElement('td');
        tdLabel.textContent = a.label || '';
        tr.appendChild(tdLabel);

        var tdActive = document.createElement('td');
        var toggleLabel = document.createElement('label');
        toggleLabel.className = 'toggle';
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = a.is_active;
        checkbox.setAttribute('data-id', a.id);
        checkbox.addEventListener('change', function() {
          toggleAdmin(this.getAttribute('data-id'), this.checked);
        });
        var slider = document.createElement('span');
        slider.className = 'slider';
        toggleLabel.appendChild(checkbox);
        toggleLabel.appendChild(slider);
        tdActive.appendChild(toggleLabel);
        tr.appendChild(tdActive);

        var tdActions = document.createElement('td');
        var removeBtn = document.createElement('button');
        removeBtn.className = 'btn-danger btn-sm';
        removeBtn.textContent = 'Remove';
        removeBtn.setAttribute('data-id', a.id);
        removeBtn.addEventListener('click', function() {
          removeAdmin(this.getAttribute('data-id'));
        });
        tdActions.appendChild(removeBtn);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
      }
    }

    async function addAdmin() {
      var phone = document.getElementById('admin-phone').value.trim();
      var label = document.getElementById('admin-label').value.trim();
      if (!phone) { showToast('Phone number required', 'error'); return; }
      var result = await api('POST', 'admin-recipients', { phone: phone, label: label, is_active: true });
      if (result) {
        document.getElementById('admin-phone').value = '';
        document.getElementById('admin-label').value = '';
        showToast('Recipient added', 'success');
        loadAdminRecipients();
      }
    }

    async function toggleAdmin(id, active) {
      await api('PATCH', 'admin-recipients/' + id, { is_active: active });
    }

    async function removeAdmin(id) {
      if (!confirm('Remove this admin recipient?')) return;
      await api('DELETE', 'admin-recipients/' + id);
      showToast('Recipient removed', 'success');
      loadAdminRecipients();
    }

    async function sendTestSms() {
      var phone = document.getElementById('test-phone').value.trim();
      var message = document.getElementById('test-message').value.trim();
      if (!phone) { showToast('Phone number required', 'error'); return; }
      var result = await api('POST', 'test-gateway', { phone: phone, message: message }, true);
      var el = document.getElementById('test-result');
      el.textContent = '';
      var div = document.createElement('div');
      if (result && result.result === 'OK') {
        div.className = 'alert alert-success';
        div.textContent = 'Sent! msg-id: ' + result['msg-id'];
      } else if (result) {
        div.className = 'alert alert-danger';
        div.textContent = result.error || result.code + ': ' + result.description || 'Send failed';
      } else {
        div.className = 'alert alert-danger';
        div.textContent = 'Network error';
      }
      el.appendChild(div);
    }
    var currentTemplateSlug = null;

    async function loadTemplates() {
      var templates = await api('GET', 'templates');
      var list = document.getElementById('templates-list');
      list.textContent = '';
      if (!Array.isArray(templates) || templates.length === 0) {
        var p = document.createElement('p');
        p.className = 'empty';
        p.textContent = 'No templates found';
        list.appendChild(p);
        return;
      }

      var table = document.createElement('table');
      table.className = 'full-width';
      var thead = document.createElement('thead');
      var headerRow = document.createElement('tr');
      var headers = ['Slug', 'Description', 'English', 'Arabic', 'Actions'];
      for (var h = 0; h < headers.length; h++) {
        var th = document.createElement('th');
        th.textContent = headers[h];
        if (headers[h] === 'Arabic') th.className = 'hide-mobile';
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);

      var tbody = document.createElement('tbody');
      for (var i = 0; i < templates.length; i++) {
        var t = templates[i];
        var tr = document.createElement('tr');

        var tdSlug = document.createElement('td');
        var code = document.createElement('code');
        code.textContent = t.slug;
        tdSlug.appendChild(code);
        tr.appendChild(tdSlug);

        var tdDesc = document.createElement('td');
        tdDesc.textContent = t.description || '';
        tr.appendChild(tdDesc);

        var tdEn = document.createElement('td');
        tdEn.className = 'truncate';
        tdEn.textContent = t.body_en || '';
        tr.appendChild(tdEn);

        var tdAr = document.createElement('td');
        tdAr.className = 'truncate hide-mobile';
        tdAr.setAttribute('dir', 'rtl');
        tdAr.textContent = t.body_ar || '';
        tr.appendChild(tdAr);

        var tdActions = document.createElement('td');
        var editBtn = document.createElement('button');
        editBtn.className = 'btn-primary btn-sm';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('data-index', String(i));
        editBtn.addEventListener('click', (function(tmpl) {
          return function() { editTemplate(tmpl); };
        })(t));
        tdActions.appendChild(editBtn);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      list.appendChild(table);
    }

    function editTemplate(t) {
      currentTemplateSlug = t.slug;
      document.getElementById('edit-slug').textContent = t.slug;
      document.getElementById('edit-description').textContent = t.description || '';
      document.getElementById('edit-body-en').value = t.body_en || '';
      document.getElementById('edit-body-ar').value = t.body_ar || '';
      document.getElementById('template-editor').style.display = 'block';
    }

    function closeEditor() {
      document.getElementById('template-editor').style.display = 'none';
      currentTemplateSlug = null;
    }

    async function saveTemplate() {
      if (!currentTemplateSlug) return;
      var result = await api('PUT', 'templates/' + currentTemplateSlug, {
        body_en: document.getElementById('edit-body-en').value,
        body_ar: document.getElementById('edit-body-ar').value
      });
      if (result && result.result === 'OK') {
        showToast('Template saved', 'success');
        closeEditor();
        loadTemplates();
      }
    }

    async function resetTemplate() {
      if (!currentTemplateSlug) return;
      if (!confirm('Reset "' + currentTemplateSlug + '" to default?')) return;
      var result = await api('POST', 'templates/' + currentTemplateSlug + '/reset');
      if (result && result.result === 'OK') {
        showToast('Template reset', 'success');
        closeEditor();
        loadTemplates();
      }
    }

    async function resetAllTemplates() {
      if (!confirm('Reset ALL templates to defaults?')) return;
      var result = await api('POST', 'templates/reset');
      if (result) {
        showToast('All templates reset (' + result.resetCount + ')', 'success');
        loadTemplates();
      }
    }
    var currentLogPage = 1;
    var LOG_PAGE_SIZE = 50;
    var templateFilterPopulated = false;

    async function loadLogs(page) {
      if (page < 1) return;
      currentLogPage = page;

      var query = 'logs?page=' + page + '&limit=' + LOG_PAGE_SIZE;
      var status = document.getElementById('log-status').value;
      if (status) query += '&status=' + status;

      var data = await api('GET', query);
      if (!data) return;

      var tbody = document.getElementById('logs-tbody');
      tbody.textContent = '';

      if (!data.logs || data.logs.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'empty';
        td.textContent = 'No SMS logs yet';
        tr.appendChild(td);
        tbody.appendChild(tr);
        document.getElementById('logs-page-info').textContent = '0 results';
        document.getElementById('logs-prev').disabled = true;
        document.getElementById('logs-next').disabled = true;
        return;
      }

      for (var i = 0; i < data.logs.length; i++) {
        var l = data.logs[i];
        var tr = document.createElement('tr');

        var tdDate = document.createElement('td');
        tdDate.textContent = new Date(l.created_at).toLocaleString();
        tr.appendChild(tdDate);

        var tdPhone = document.createElement('td');
        var phone = l.phone_normalized || l.phone || '';
        tdPhone.textContent = phone.length > 6 ? phone.slice(0, 3) + '****' + phone.slice(-3) : phone;
        tr.appendChild(tdPhone);

        var tdStatus = document.createElement('td');
        var badge = document.createElement('span');
        var badgeClass = l.status === 'sent' ? 'badge-success' :
          l.status === 'failed' ? 'badge-danger' :
          l.status === 'skipped' ? 'badge-warning' : 'badge-pending';
        badge.className = 'badge ' + badgeClass;
        badge.textContent = l.status;
        tdStatus.appendChild(badge);
        tr.appendChild(tdStatus);

        var tdMsg = document.createElement('td');
        var msg = l.message || '';
        tdMsg.textContent = msg.length > 60 ? msg.slice(0, 60) + '...' : msg;
        tr.appendChild(tdMsg);

        var tdTemplate = document.createElement('td');
        tdTemplate.className = 'hide-mobile';
        tdTemplate.textContent = l.template_slug || '-';
        tr.appendChild(tdTemplate);

        var tdMsgId = document.createElement('td');
        tdMsgId.className = 'hide-mobile';
        var codeEl = document.createElement('code');
        codeEl.textContent = l.msg_id ? l.msg_id.slice(0, 12) : '-';
        tdMsgId.appendChild(codeEl);
        tr.appendChild(tdMsgId);

        tbody.appendChild(tr);
      }

      var totalPages = Math.ceil((data.total || 0) / LOG_PAGE_SIZE);
      document.getElementById('logs-page-info').textContent =
        'Page ' + page + ' of ' + totalPages + ' (' + data.total + ' total)';
      document.getElementById('logs-prev').disabled = page <= 1;
      document.getElementById('logs-next').disabled = page >= totalPages;

      if (!templateFilterPopulated) {
        populateTemplateFilter();
        templateFilterPopulated = true;
      }
    }

    async function populateTemplateFilter() {
      var templates = await api('GET', 'templates');
      if (!Array.isArray(templates)) return;
      var select = document.getElementById('log-template');
      for (var i = 0; i < templates.length; i++) {
        var opt = document.createElement('option');
        opt.value = templates[i].slug;
        opt.textContent = templates[i].slug;
        select.appendChild(opt);
      }
    }

    async function exportCsv() {
      showToast('Exporting...', 'info');
      var allLogs = [];
      var page = 1;
      while (true) {
        var query = 'logs?page=' + page + '&limit=100';
        var status = document.getElementById('log-status').value;
        if (status) query += '&status=' + status;
        var data = await api('GET', query);
        if (!data || !data.logs || data.logs.length === 0) break;
        allLogs = allLogs.concat(data.logs);
        if (allLogs.length >= (data.total || 0)) break;
        page++;
      }

      var headers = ['date', 'phone', 'phone_normalized', 'status', 'message',
        'template_slug', 'sender_id', 'msg_id', 'error_code', 'error_message',
        'points_charged', 'balance_after'];
      var csvRows = [headers.join(',')];
      for (var i = 0; i < allLogs.length; i++) {
        var l = allLogs[i];
        var row = [];
        for (var h = 0; h < headers.length; h++) {
          var key = headers[h] === 'date' ? 'created_at' : headers[h];
          var val = l[key];
          if (val === null || val === undefined) val = '';
          val = String(val).replace(/"/g, '""');
          row.push('"' + val + '"');
        }
        csvRows.push(row.join(','));
      }

      var blob = new Blob([csvRows.join(String.fromCharCode(10))], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sms-logs-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Exported ' + allLogs.length + ' rows', 'success');
    }

    async function clearLogs() {
      if (!confirm('Delete ALL logs? This cannot be undone.')) return;
      var result = await api('DELETE', 'logs');
      if (result && result.result === 'OK') {
        showToast('Logs cleared', 'success');
        loadLogs(1);
      }
    }

    // Tab click handlers
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() { switchPage(tab.dataset.page); });
    });

    // Init
    // Init: check existing session or show login
    document.addEventListener('DOMContentLoaded', function() {
      if (authToken) { showApp(); }
    });
  </script>
</body>
</html>`;
