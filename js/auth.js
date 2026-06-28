// ── Auth system ──
function hashPassword(password) {
  // Simple hash for localStorage (not cryptographically secure)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem('tw_users') || '{}'); } catch(e) { return {}; }
}

function saveUsers(users) {
  localStorage.setItem('tw_users', JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem('tw_current_user') || null;
}

function register(username, password) {
  if (!username || !password) return { ok: false, msg: 'Fill all fields' };
  if (username.length < 3) return { ok: false, msg: 'Username min 3 characters' };
  if (password.length < 4) return { ok: false, msg: 'Password min 4 characters' };
  const users = getUsers();
  if (users[username]) return { ok: false, msg: 'Username already taken' };
  users[username] = hashPassword(password);
  saveUsers(users);
  return { ok: true };
}

function login(username, password) {
  if (!username || !password) return { ok: false, msg: 'Fill all fields' };
  const users = getUsers();
  if (!users[username]) return { ok: false, msg: 'User not found' };
  if (users[username] !== hashPassword(password)) return { ok: false, msg: 'Wrong password' };
  localStorage.setItem('tw_current_user', username);
  return { ok: true };
}

function logout() {
  localStorage.removeItem('tw_current_user');
  showAuthScreen();
}

// ── Auth UI ──
function showAuthScreen() {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('appScreen').style.display = 'none';
}

function showAppScreen() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'flex';
  const user = getCurrentUser();
  document.getElementById('currentUserLabel').textContent = '👤 ' + user;
}

function switchToLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'flex';
  document.getElementById('authError').textContent = '';
}

function switchToRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'flex';
  document.getElementById('authError').textContent = '';
}

function doLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const result = login(username, password);
  if (result.ok) {
    showAppScreen();
  } else {
    document.getElementById('authError').textContent = result.msg;
  }
}

function doRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  if (password !== confirm) {
    document.getElementById('authError').textContent = 'Passwords do not match';
    return;
  }
  const result = register(username, password);
  if (result.ok) {
    login(username, password);
    showAppScreen();
  } else {
    document.getElementById('authError').textContent = result.msg;
  }
}

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('authScreen').style.display !== 'none') {
    if (document.getElementById('loginForm').style.display !== 'none') doLogin();
    else doRegister();
  }
});

// ── Override storage to be user-specific ──
const _origSaveState = window._saveState;
const _origLoadState = window._loadState;

window.userSaveState = function(key, val) {
  const user = getCurrentUser();
  if (!user) return;
  try { localStorage.setItem('tw_' + user + '_' + key, JSON.stringify(val)); } catch(e) {}
}

window.userLoadState = function(key) {
  const user = getCurrentUser();
  if (!user) return null;
  try {
    const d = localStorage.getItem('tw_' + user + '_' + key);
    return d ? JSON.parse(d) : null;
  } catch(e) { return null; }
}

window.userGetAllKeys = function() {
  const user = getCurrentUser();
  if (!user) return [];
  const prefix = 'tw_' + user + '_track_';
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) keys.push(k);
  }
  return keys;
}

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
  if (getCurrentUser()) {
    showAppScreen();
  } else {
    showAuthScreen();
  }
});
