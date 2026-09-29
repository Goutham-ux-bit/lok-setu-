document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('landing-cats');
  if (!grid) return;
  try {
    const { categories } = await Api.categories();
    grid.innerHTML = categories.map(c => `
      <a href="report.html?category=${c.id}" class="cat-chip">
        <span class="ic">${c.icon}</span>
        <span>${c.label}</span>
      </a>
    `).join('');
  } catch (err) {
    grid.style.display = 'none';
  }
});
