// Lightweight API client shared by every page. No frameworks, no build step.

const Auth = {
  TOKEN_KEY: 'loksetu_token',
  USER_KEY: 'loksetu_user',
  GUEST_KEY: 'loksetu_guest_id',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },
  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  // Anyone browsing without an account gets a stable random id so their
  // reports and stats persist across visits without requiring a login.
  getGuestId() {
    let id = localStorage.getItem(this.GUEST_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      localStorage.setItem(this.GUEST_KEY, id);
    }
    return id;
  },
  displayName() {
    const user = this.getUser();
    return user ? user.name : 'Guest User';
  }
};

const Api = {
  async request(path, { method = 'GET', body, isForm = false } = {}) {
    const headers = {};
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!token) headers['x-guest-id'] = Auth.getGuestId();
    if (!isForm && body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${window.API_BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : (body ? JSON.stringify(body) : undefined)
    });

    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }

    if (!res.ok) {
      const message = (data && data.error) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  },

  register(name, email, password) {
    return this.request('/auth/register', { method: 'POST', body: { name, email, password } });
  },
  login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: { email, password } });
  },
  me() {
    return this.request('/auth/me');
  },
  categories() {
    return this.request('/reports/categories');
  },
  myReports() {
    return this.request('/reports/mine');
  },
  publicReports(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/reports/public${params ? `?${params}` : ''}`);
  },
  createReport(formData) {
    return this.request('/reports', { method: 'POST', body: formData, isForm: true });
  }
};

// Shared header behaviour: show the right name/avatar state and wire up logout,
// on every page that includes this script.
document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = Auth.isLoggedIn();

  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = Auth.displayName();
  });
  document.querySelectorAll('[data-avatar]').forEach(el => {
    el.style.display = loggedIn ? 'flex' : 'none';
    el.textContent = Auth.displayName().charAt(0).toUpperCase();
  });
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.style.display = loggedIn ? 'inline-flex' : 'none';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.clearSession();
      window.location.href = 'index.html';
    });
  });
  document.querySelectorAll('[data-login-link]').forEach(el => {
    el.style.display = loggedIn ? 'none' : '';
  });
});
