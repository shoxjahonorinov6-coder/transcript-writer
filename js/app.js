// ── State ──
let currentTrackId = null;
let autoSaveTimer = null;
const audio = document.getElementById('mainAudio');

// ── Built-in tracks (relative paths for GitHub Pages) ──
const builtInTracks = [
  { id: 'AML06', name: 'AML06.mp3', src: 'audio/AML06.mp3' },
  { id: 'AML07', name: 'AML07.mp3', src: 'audio/AML07.mp3' },
  { id: 'AML08', name: 'AML08.mp3', src: 'audio/AML08.mp3' },
  { id: 'AML09', name: 'AML09.mp3', src: 'audio/AML09.mp3' },
  { id: 'AML10', name: 'AML10.mp3', src: 'audio/AML10.mp3' },
  { id: 'AML11', name: 'AML11.mp3', src: 'audio/AML11.mp3' },
  { id: 'AML12', name: 'AML12.mp3', src: 'audio/AML12.mp3' },
  { id: 'AML14', name: 'AML14.mp3', src: 'audio/AML14.mp3' },
  { id: 'AML15', name: 'AML15.mp3', src: 'audio/AML15.mp3' },
];

// ── Storage ──
function saveState(key, val) {
  try { localStorage.setItem('tw_' + key, JSON.stringify(val)); } catch(e) {}
}
function loadState(key) {
  try { const d = localStorage.getItem('tw_' + key); return d ? JSON.parse(d) : null; } catch(e) { return null; }
}

// ── Theme ──
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  document.getElementById('themeIcon').textContent = isLight ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isLight ? 'Light mode' : 'Dark mode';
  document.getElementById('settingsThemeBtn').textContent = isLight ? '☀️ Light mode' : '🌙 Dark mode';
  saveState('theme', isLight ? 'light' : 'dark');
}
// Restore theme on load
if (loadState('theme') === 'light') toggleTheme();

// ── Views ──
const views = ['dashboard', 'history', 'samples', 'settings', 'about'];
function showView(v) {
  views.forEach(x => {
    document.getElementById('view-' + x).style.display = 'none';
    document.getElementById('nav-' + x).classList.remove('active');
  });
  document.getElementById('view-' + v).style.display = 'flex';
  document.getElementById('nav-' + v).classList.add('active');
  const titles = { dashboard: 'Welcome!', history: 'History', samples: 'Sample Audios', settings: 'Settings', about: 'About' };
  document.getElementById('pageTitle').textContent = titles[v] || '';
  if (v === 'history') renderHistory();
  if (v === 'samples') renderSamples();
}

// ── Samples ──
function renderSamples() {
  const list = document.getElementById('samplesList');
  list.innerHTML = '';
  builtInTracks.forEach(track => {
    const saved = loadState('track_' + track.id);
    const hasText = saved && saved.text && saved.text.trim();
    const words = hasText ? saved.text.trim().split(/\s+/).length : 0;
    const isActive = currentTrackId === track.id;
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.borderColor = isActive ? 'var(--accent)' : '';
    item.innerHTML = `
      <div class="h-icon">🎙️</div>
      <div>
        <div class="h-name">${track.name}</div>
        <div class="h-meta">${hasText ? words + ' words written' : 'No transcript yet'}</div>
      </div>
      ${hasText ? `<span class="h-badge">✓ saved</span>` : ''}
      <button onclick="loadSampleTrack('${track.id}')" style="margin-left:auto;background:var(--grad);color:#fff;border:none;border-radius:6px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">▶ Open</button>
    `;
    list.appendChild(item);
  });
}

function loadSampleTrack(id) {
  saveCurrentState();
  const track = builtInTracks.find(t => t.id === id);
  if (!track) return;
  currentTrackId = id;
  audio.src = track.src;

  const saved = loadState('track_' + id);
  audio.addEventListener('loadedmetadata', () => {
    if (saved && saved.pos) audio.currentTime = saved.pos;
    document.getElementById('durTime').textContent = fmt(audio.duration);
    document.getElementById('fileDuration').textContent = fmt(audio.duration);
  }, { once: true });

  document.getElementById('fileName').textContent = track.name;
  document.getElementById('fileMeta').textContent = 'Built-in sample';
  document.getElementById('fileCard').style.display = 'block';
  document.getElementById('transcriptArea').value = saved ? (saved.text || '') : '';
  updateStats();
  updateStatus('Loaded: ' + track.name, 'Type your transcript in the panel →', 100);
  showView('dashboard');
}

// ── File upload ──
document.getElementById('fileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  saveCurrentState();
  currentTrackId = 'file_' + file.name;
  audio.src = URL.createObjectURL(file);
  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('durTime').textContent = fmt(audio.duration);
    document.getElementById('fileDuration').textContent = fmt(audio.duration);
  }, { once: true });
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileMeta').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  document.getElementById('fileCard').style.display = 'block';
  const saved = loadState('track_' + currentTrackId);
  document.getElementById('transcriptArea').value = saved ? (saved.text || '') : '';
  updateStats();
  updateStatus('Loaded: ' + file.name, 'Type your transcript on the right', 100);
});

// Drag & drop
const uz = document.getElementById('uploadZone');
uz.addEventListener('dragover', e => { e.preventDefault(); uz.classList.add('drag-over'); });
uz.addEventListener('dragleave', () => uz.classList.remove('drag-over'));
uz.addEventListener('drop', e => {
  e.preventDefault();
  uz.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (!f) return;
  const dt = new DataTransfer();
  dt.items.add(f);
  document.getElementById('fileInput').files = dt.files;
  document.getElementById('fileInput').dispatchEvent(new Event('change'));
});
uz.addEventListener('click', e => {
  if (e.target.classList.contains('choose-btn')) return;
  document.getElementById('fileInput').click();
});

// ── Player ──
function togglePlay() {
  if (audio.paused) {
    audio.play();
    document.getElementById('playBtn').textContent = '⏸';
  } else {
    audio.pause();
    document.getElementById('playBtn').textContent = '▶';
  }
}

function skip(s) { audio.currentTime = Math.max(0, audio.currentTime + s); }

function setSpeed(s) {
  audio.playbackRate = s;
  document.querySelectorAll('.speed-chip').forEach(c => {
    c.classList.toggle('active', parseFloat(c.textContent) === s);
  });
}

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

audio.addEventListener('timeupdate', () => {
  document.getElementById('curTime').textContent = fmt(audio.currentTime);
  const pct = audio.duration ? (audio.currentTime / audio.duration * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
});

audio.addEventListener('ended', () => { document.getElementById('playBtn').textContent = '▶'; });

document.getElementById('progressWrap').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * (audio.duration || 0);
});

// ── Transcript ──
function focusTranscript() { document.getElementById('transcriptArea').focus(); }

function updateStats() {
  const t = document.getElementById('transcriptArea').value;
  const w = t.trim() ? t.trim().split(/\s+/).length : 0;
  document.getElementById('wordCount').textContent = w + ' words';
}

document.getElementById('transcriptArea').addEventListener('input', () => {
  updateStats();
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveCurrentState();
    showAutoSaveDot();
  }, 3000);
});

function copyTranscript() {
  const t = document.getElementById('transcriptArea').value;
  if (!t.trim()) return;
  navigator.clipboard.writeText(t).then(() => updateStatus('Copied!', 'Transcript copied to clipboard', 100));
}

function clearTranscript() {
  if (!document.getElementById('transcriptArea').value) return;
  if (confirm('Delete all written text?')) {
    document.getElementById('transcriptArea').value = '';
    updateStats();
    saveCurrentState();
  }
}

function downloadDoc() {
  const t = document.getElementById('transcriptArea').value;
  if (!t.trim()) { updateStatus('Nothing to save', 'Write some text first', 0); return; }
  const fname = currentTrackId ? currentTrackId.replace(/\.[^.]+$/, '') : 'transcript';
  const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office'><head><meta charset='utf-8'><title>${fname}</title></head><body><p>${t.replace(/\n/g, '</p><p>')}</p></body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([wordHtml], { type: 'application/msword' }));
  a.download = fname + '_transcript.doc';
  a.click();
  updateStatus('Saved!', fname + '_transcript.doc downloaded', 100);
}

// ── Save / Load ──
function saveCurrentState() {
  if (!currentTrackId) return;
  saveState('track_' + currentTrackId, {
    text: document.getElementById('transcriptArea').value,
    pos: audio.currentTime || 0,
    saved_at: new Date().toISOString(),
    trackName: document.getElementById('fileName').textContent
  });
}

function showAutoSaveDot() {
  const d = document.getElementById('autoSaveDot');
  d.style.display = 'inline';
  setTimeout(() => d.style.display = 'none', 2000);
}

// ── History ──
function renderHistory() {
  const list = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  list.innerHTML = '';
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('tw_track_')) keys.push(k);
  }
  if (keys.length === 0) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';
  keys.sort().forEach(k => {
    const id = k.replace('tw_track_', '');
    const data = loadState('track_' + id);
    if (!data || !data.text) return;
    const words = data.text.trim().split(/\s+/).length;
    const date = data.saved_at ? new Date(data.saved_at).toLocaleString() : '';
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="h-icon">📄</div>
      <div>
        <div class="h-name">${data.trackName || id}</div>
        <div class="h-meta">${date}</div>
      </div>
      <span class="h-badge">✓</span>
      <span class="h-words">${words} words</span>
    `;
    list.appendChild(item);
  });
}

// ── Status ──
function updateStatus(label, sub, pct) {
  document.getElementById('statusLabel').textContent = label;
  document.getElementById('statusSub').textContent = sub;
  document.getElementById('statusBar').style.width = pct + '%';
  document.getElementById('statusPct').textContent = pct > 0 ? pct + '%' : '';
}

// ── Settings ──
function clearAllData() {
  if (!confirm('Delete ALL saved transcripts?')) return;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('tw_track_')) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  updateStatus('Cleared', 'All transcripts deleted', 0);
}

// ── Keyboard shortcuts ──
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { e.preventDefault(); skip(-3); }
  if (e.key === 'ArrowRight') { e.preventDefault(); skip(3); }
  if (e.key === 'ArrowUp')    { e.preventDefault(); audio.play(); document.getElementById('playBtn').textContent = '⏸'; }
  if (e.key === 'ArrowDown')  { e.preventDefault(); audio.pause(); document.getElementById('playBtn').textContent = '▶'; }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveCurrentState(); showAutoSaveDot(); }
}, true);
