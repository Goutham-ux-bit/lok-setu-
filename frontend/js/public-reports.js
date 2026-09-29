document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('report-list');
  const filterRow = document.getElementById('filter-row');
  let currentStatus = '';

  function getFullImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = window.API_BASE.startsWith('http') ? window.API_BASE.replace(/\/api\/?$/, '') : '';
    return `${base}${url}`;
  }

  async function load() {
    listEl.innerHTML = `<div class="empty-state"><p>Loading reports…</p></div>`;
    try {
      const filters = currentStatus ? { status: currentStatus } : {};
      const { stats, reports } = await Api.publicReports(filters);

      if (reports.length === 0) {
        const count = String(currentStatus ? reports.length : (stats ? stats.total : 0)).padStart(2, '0');
        listEl.innerHTML = `
          <div class="empty-state">
            <div class="big">${count}</div>
            <p>No public reports found yet</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = reports.map(r => {
        const img = getFullImageUrl(r.imageUrl);
        return `
        <div class="report-row">
          <span class="ic">${CATEGORY_ICONS[r.category] || '❓'}</span>
          <span class="body">
            <span class="title">${escapeHtml(r.title)}</span>
            <span class="meta">
              <span>${CATEGORY_LABELS[r.category]}</span>
              <span>${escapeHtml(r.reportedBy)}</span>
              <span>${timeAgo(r.createdAt)}</span>
              ${r.location ? `<span>📍 ${escapeHtml(r.location)}</span>` : ''}
            </span>
            ${r.description ? `<p style="font-size:13.5px; color:var(--ink-soft); margin:6px 0 0;">${escapeHtml(r.description)}</p>` : ''}
            ${img ? `<div style="margin-top:8px;"><img src="${img}" style="max-height:160px; border-radius:8px; object-fit:cover;" alt="Report photo"></div>` : ''}
          </span>
          <span class="badge ${r.status}">${STATUS_LABELS[r.status]}</span>
        </div>
      `;
      }).join('');
    } catch (err) {
      listEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  }

  filterRow.querySelectorAll('.chip-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      filterRow.querySelectorAll('.chip-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status;
      load();
    });
  });

  load();
});
