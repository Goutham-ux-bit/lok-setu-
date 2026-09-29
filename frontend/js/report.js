document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('cat-select-list');
  const alertBox = document.getElementById('alert-box');
  const form = document.getElementById('report-form');
  const submitBtn = document.getElementById('submit-btn');
  const imageInput = document.getElementById('image');
  const imageDrop = document.getElementById('image-drop');
  const imageDropText = document.getElementById('image-drop-text');

  const params = new URLSearchParams(window.location.search);
  let selectedCategory = params.get('category') || null;

  let categories = [];
  try {
    const data = await Api.categories();
    categories = data.categories;
  } catch (err) {
    categories = [
      { id: 'street_light', label: 'Street Light', icon: '💡' },
      { id: 'road_damage', label: 'Road Damage', icon: '🚧' },
      { id: 'water_supply', label: 'Water Supply', icon: '💧' },
      { id: 'sewage', label: 'Sewage', icon: '🚰' },
      { id: 'electricity', label: 'Electricity', icon: '⚡' },
      { id: 'other', label: 'Other', icon: '❓' }
    ];
  }

  function renderCategories() {
    listEl.innerHTML = categories.map(c => `
      <label class="cat-select-row ${selectedCategory === c.id ? 'selected' : ''}" data-cat="${c.id}">
        <input type="radio" name="category" value="${c.id}" ${selectedCategory === c.id ? 'checked' : ''}>
        <span>${c.icon}</span><span>${c.label}</span>
      </label>
    `).join('');

    listEl.querySelectorAll('.cat-select-row').forEach(row => {
      row.addEventListener('click', () => {
        selectedCategory = row.dataset.cat;
        listEl.querySelectorAll('.cat-select-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        row.querySelector('input').checked = true;
      });
    });
  }
  renderCategories();

  imageDrop.addEventListener('click', (e) => { /* label already opens the file picker */ });
  imageInput.addEventListener('change', () => {
    if (imageInput.files[0]) {
      imageDropText.textContent = `📷 ${imageInput.files[0].name}`;
      imageDrop.classList.add('has-file');
    }
  });

  function showAlert(type, message) {
    alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';

    if (!selectedCategory) {
      showAlert('error', 'Please select a category for your complaint.');
      return;
    }
    const title = document.getElementById('title').value.trim();
    if (!title) {
      showAlert('error', 'Please add a short title describing the issue.');
      return;
    }

    const fd = new FormData();
    fd.append('category', selectedCategory);
    fd.append('title', title);
    fd.append('description', document.getElementById('description').value.trim());
    fd.append('location', document.getElementById('location').value.trim());
    fd.append('isPublic', document.getElementById('is-public').checked);
    if (imageInput.files[0]) fd.append('image', imageInput.files[0]);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      await Api.createReport(fd);
      showAlert('success', 'Your complaint has been submitted. Thank you for helping your community.');
      form.reset();
      selectedCategory = null;
      renderCategories();
      imageDropText.textContent = 'Tap to attach a photo of the issue';
      imageDrop.classList.remove('has-file');
      setTimeout(() => { window.location.href = 'user.html'; }, 1200);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Complaint';
    }
  });
});
