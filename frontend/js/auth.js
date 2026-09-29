document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, no reason to see this page.
  if (Auth.isLoggedIn()) {
    window.location.href = 'user.html';
    return;
  }

  let mode = 'login'; // or 'register'

  const els = {
    title: document.getElementById('form-title'),
    sub: document.getElementById('form-sub'),
    nameGroup: document.getElementById('name-group'),
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    submitBtn: document.getElementById('submit-btn'),
    switchLine: document.getElementById('switch-line'),
    switchLink: document.getElementById('switch-link'),
    alertBox: document.getElementById('alert-box')
  };

  function render() {
    els.alertBox.innerHTML = '';
    if (mode === 'login') {
      els.title.textContent = 'Welcome back';
      els.sub.textContent = "Log in to track the issues you've reported";
      els.nameGroup.style.display = 'none';
      els.submitBtn.textContent = 'Log in';
      els.switchLine.innerHTML = 'New to LOK SETU? <a href="#" id="switch-link">Create an account</a>';
    } else {
      els.title.textContent = 'Create your account';
      els.sub.textContent = 'Track every report you make, in one place';
      els.nameGroup.style.display = 'block';
      els.submitBtn.textContent = 'Create account';
      els.switchLine.innerHTML = 'Already have an account? <a href="#" id="switch-link">Log in</a>';
    }
    document.getElementById('switch-link').addEventListener('click', (e) => {
      e.preventDefault();
      mode = mode === 'login' ? 'register' : 'login';
      render();
    });
  }
  render();

  function showError(message) {
    els.alertBox.innerHTML = `<div class="alert alert-error">${message}</div>`;
  }

  els.submitBtn.addEventListener('click', async () => {
    const email = els.email.value.trim();
    const password = els.password.value;
    const name = els.name.value.trim();

    if (!email || !password || (mode === 'register' && !name)) {
      showError('Please fill in all fields.');
      return;
    }

    els.submitBtn.disabled = true;
    els.submitBtn.textContent = 'Please wait...';

    try {
      const data = mode === 'login'
        ? await Api.login(email, password)
        : await Api.register(name, email, password);
      Auth.setSession(data.token, data.user);
      window.location.href = 'user.html';
    } catch (err) {
      showError(err.message);
      els.submitBtn.disabled = false;
      els.submitBtn.textContent = mode === 'login' ? 'Log in' : 'Create account';
    }
  });
});
