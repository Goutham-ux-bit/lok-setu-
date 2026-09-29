document.addEventListener('DOMContentLoaded', () => {
  const keyPanel = document.getElementById('key-panel');
  const reportsPanel = document.getElementById('reports-panel');
  const keyInput = document.getElementById('admin-key');
  const keyAlert = document.getElementById('key-alert');
  const listEl = document.getElementById('admin-list');
  const filterRow = document.getElementById('filter-row');

  let adminKey = sessionStorage.getItem('loksetu_admin_key') || '';
  let currentStatus = '';

  async function adminFetch(path, opts = {}) {
    const res = await fetch(`${window.API_BASE}${path}`, {
      ...opts,
      headers: { ...(opts.headers || {}), 'x-admin-key': adminKey }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
    return data;
  }

  async function loadReports() {
    listEl.innerHTML = `<div class="empty-state"><p>Loading…</p></div>`;
    try {
      const params = currentStatus ? `?status=${currentStatus}` : '';
      const { reports } = await adminFetch(`/reports/all${params}`);

      if (reports.length === 0) {
        listEl.innerHTML = `<div class="empty-state"><p>No reports match this filter.</p></div>`;
        return;
      }

      listEl.innerHTML = reports.map(r => `
        <div class="report-row" style="align-items:flex-start;">
          <span class="ic">${CATEGORY_ICONS[r.category] || '❓'}</span>
          <span class="body">
            <span class="title">${escapeHtml(r.title)}</span>
            <span class="meta">
              <span>${CATEGORY_LABELS[r.category]}</span>
              <span>${escapeHtml(r.reportedBy)}</span>
              <span>${timeAgo(r.createdAt)}</span>
              ${r.isPublic ? '' : '<span>Private</span>'}
            </span>
            ${r.description ? `<p style="font-size:13px; color:var(--ink-soft); margin:6px 0 0;">${escapeHtml(r.description)}</p>` : ''}
          </span>
          <select data-id="${r.id}" class="status-select" style="width:auto; padding:8px 10px;">
            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${r.status === 'in_progress' ? 'selected' : ''}>In progress</option>
            <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </div>
      `).join('');

      listEl.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', async () => {
          sel.disabled = true;
          try {
            await adminFetch(`/reports/${sel.dataset.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: sel.value })
            });
          } catch (err) {
            alert(err.message);
          } finally {
            sel.disabled = false;
          }
        });
      });
    } catch (err) {
      listEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  }

  document.getElementById('unlock-btn').addEventListener('click', async () => {
    adminKey = keyInput.value.trim();
    if (!adminKey) return;
    try {
      await adminFetch('/reports/all');
      sessionStorage.setItem('loksetu_admin_key', adminKey);
      keyPanel.style.display = 'none';
      reportsPanel.style.display = 'block';
      loadReports();
    } catch (err) {
      keyAlert.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  });

  document.getElementById('refresh-btn').addEventListener('click', loadReports);

  filterRow.querySelectorAll('.chip-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      filterRow.querySelectorAll('.chip-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status;
      loadReports();
    });
  });

  // If we already have a key from a previous session, skip straight to the list.
  if (adminKey) {
    keyPanel.style.display = 'none';
    reportsPanel.style.display = 'block';
    loadReports();
  }
});
