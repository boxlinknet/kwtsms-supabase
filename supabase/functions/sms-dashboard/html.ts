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
        <span id="gw-status"></span>
        <span id="test-mode-status"></span>
        <span id="sender-id-display"></span>
        <span id="sync-time"></span>
        <button class="btn-primary" onclick="syncBalance()">Sync Now</button>
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
          <input type="text" id="set-sender-id" maxlength="50">
        </div>
        <div class="form-group">
          <label>Default Country Code</label>
          <input type="text" id="set-country-code" maxlength="4">
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
          <textarea id="test-message" rows="3">kwtSMS gateway test message</textarea>
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

      document.getElementById('sender-id-display').textContent =
        'Sender: ' + (settings.sender_id || 'Not set');
      document.getElementById('sync-time').textContent =
        settings.balance_synced_at
          ? 'Last sync: ' + new Date(settings.balance_synced_at).toLocaleString()
          : 'Never synced';

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
      document.getElementById('set-sender-id').value = settings.sender_id || '';
      document.getElementById('set-country-code').value = settings.default_country_code || '';
      document.getElementById('set-debug-logging').checked = settings.debug_logging;
      loadAdminRecipients();
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
      var result = await api('POST', 'test-gateway', { phone: phone, message: message });
      var el = document.getElementById('test-result');
      el.textContent = '';
      var div = document.createElement('div');
      if (result && result.result === 'OK') {
        div.className = 'alert alert-success';
        div.textContent = 'Sent! msg-id: ' + result['msg-id'];
      } else {
        div.className = 'alert alert-danger';
        div.textContent = 'Failed: ' + (result ? (result.error || result.description || 'Unknown error') : 'No response');
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
