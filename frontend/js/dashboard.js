document.addEventListener('DOMContentLoaded', async () => {
  const avatarMain = document.querySelector('[data-avatar-main]');
  if (avatarMain) avatarMain.textContent = Auth.displayName().charAt(0).toUpperCase();

  // Quick category chips in the sidebar
  try {
    const { categories } = await Api.categories();
    const quickCatsEl = document.getElementById('quick-cats');
    if (quickCatsEl) {
      quickCatsEl.innerHTML = categories.slice(0, 4).map(c => `
        <a href="report.html?category=${c.id}" class="cat-chip">
          <span class="ic">${c.icon}</span><span>${c.label}</span>
        </a>
      `).join('');
    }
  } catch (err) { /* categories are optional decoration - fail quietly */ }

  // Sidebar overall municipal reports count
  try {
    const publicData = await Api.publicReports();
    const sidebarStats = document.getElementById('sidebar-stats');
    if (sidebarStats && publicData && publicData.stats) {
      sidebarStats.innerHTML = `
        <div class="stat"><b>${publicData.stats.total}</b><span>Total Reports</span></div>
        <div class="stat pending"><b>${publicData.stats.pending}</b><span>Pending</span></div>
        <div class="stat resolved"><b>${publicData.stats.resolved}</b><span>Resolved</span></div>
      `;
    }
  } catch (err) {
    console.warn('Could not load public stats for sidebar:', err);
  }

  // Personal user stats + recent issues
  try {
    const { stats, reports } = await Api.myReports();

    const impactStats = document.getElementById('impact-stats');
    if (impactStats && stats) {
      impactStats.innerHTML = `
        <div class="stat"><b>${stats.total}</b><span>Reported</span></div>
        <div class="stat resolved"><b>${stats.resolved}</b><span>Resolved</span></div>
        <div class="stat pending"><b>${stats.pending}</b><span>Pending</span></div>
      `;
    }

    const recentBox = document.getElementById('recent-issues');
    if (recentBox) {
      if (!reports || reports.length === 0) {
        recentBox.innerHTML = `<div class="empty-state"><p>You haven't uploaded any issues yet.</p></div>`;
      } else {
        recentBox.innerHTML = reports.slice(0, 5).map(r => `
          <div class="report-row">
            <span class="ic">${CATEGORY_ICONS[r.category] || '❓'}</span>
            <span class="body">
              <span class="title">${escapeHtml(r.title)}</span>
              <span class="meta"><span>${CATEGORY_LABELS[r.category] || r.category}</span><span>${timeAgo(r.createdAt)}</span></span>
            </span>
            <span class="badge ${r.status}">${STATUS_LABELS[r.status] || r.status}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading user reports:', err);
  }
});
