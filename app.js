/* ============================================================
   PORTAL DE CIUDADANÍA DIGITAL — app.js
   State management · Fetching · Search · DOM · Animations
   ============================================================ */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  games: [],
  filtered: [],
  activeGame: null,
  searchQuery: '',
};

// ─── DOM References ───────────────────────────────────────────────────────────
const dom = {
  grid:            document.getElementById('game-grid'),
  searchInput:     document.getElementById('search-input'),
  searchClear:     document.getElementById('search-clear'),
  resultCount:     document.getElementById('result-count'),
  modal:           document.getElementById('game-modal'),
  modalBackdrop:   document.getElementById('modal-backdrop'),
  modalClose:      document.getElementById('modal-close'),
  modalImg:        document.getElementById('modal-screenshot'),
  modalTitle:      document.getElementById('modal-title'),
  modalDesc:       document.getElementById('modal-desc'),
  modalPlaytime:   document.getElementById('modal-playtime'),
  modalDifficulty: document.getElementById('modal-difficulty'),
  modalTags:       document.getElementById('modal-tags'),
  playBtn:         document.getElementById('play-btn'),
  loader:          document.getElementById('loader'),
  emptyState:      document.getElementById('empty-state'),
  particleCanvas:  document.getElementById('particle-canvas'),
};

// ─── Difficulty config ────────────────────────────────────────────────────────
const difficultyConfig = {
  'Fácil': { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: '#34d399' },
  'Media': { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',     dot: '#fbbf24' },
  'Alta':  { color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/30',       dot: '#fb7185' },
};

// ─── Particle Background ──────────────────────────────────────────────────────
function initParticles() {
  const canvas = dom.particleCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.5 + 0.3,
      dx:      (Math.random() - 0.5) * 0.25,
      dy:      (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.5 + 0.1,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,179,237,${p.opacity})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  particles = Array.from({ length: 90 }, createParticle);
  draw();
}

// ─── Google Sheets TSV ───────────────────────────────────────────────────────
const SHEETS_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vROrr3WszHFXRmGgon-X1ihbVD7WjERxs3vKZ04foAKlqPqRDhW6a5nvqJn7Hj2A0UtCUIzsGoYzCU0/pub?gid=420182280&single=true&output=tsv';

const HEADER_MAP = {
  'autor':           'author',
  'título':          'title',
  'descripción':     'description',
  'etiqueta 1':      'tag1',
  'etiqueta 2':      'tag2',
  'etiqueta 3':      'tag3',
  'tiempo de juego': 'playtime',
  'dificultad':      'difficulty',
  'url de genially': 'geniallyUrl',
  // English aliases
  'author':      'author',
  'title':       'title',
  'description': 'description',
  'playtime':    'playtime',
  'difficulty':  'difficulty',
  'geniallyurl': 'geniallyUrl',
};

function parseTSV(text) {
  // Strip BOM (\ufeff) that Google Sheets adds, normalize line endings
  const cleaned = text.replace(/^\ufeff/, '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleaned.split('\n');
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split('\t').map(h => h.trim().toLowerCase());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  console.log('Headers detectados:', headers);

  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map((line, i) => {
      const cols = line.split('\t');
      const obj  = { id: i + 1 };

      headers.forEach((key, idx) => {
        obj[key] = (cols[idx] || '').trim();
      });

      // Merge tag1/tag2/tag3 → tags array
      obj.tags = [obj.tag1, obj.tag2, obj.tag3].filter(Boolean);
      delete obj.tag1; delete obj.tag2; delete obj.tag3;

      // Images: /img/{id}.png — onerror in HTML handles missing files
      obj.thumbnail  = `./img/${obj.id}.png`;
      obj.screenshot = `./img/${obj.id}.png`;

      console.log(`Juego ${obj.id} parseado:`, obj);
      return obj;
    })
    .filter(g => g.title);
}

// ─── localStorage Cache ───────────────────────────────────────────────────────
const CACHE_KEY = 'ciudadania_digital_games';

function saveToCache(games) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), games }));
    console.info('✓ Juegos guardados en caché local.');
  } catch (e) {
    console.warn('No se pudo guardar en caché:', e.message);
  }
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { games, timestamp } = JSON.parse(raw);
    const age = Math.round((Date.now() - timestamp) / 60000);
    console.info(`✓ Caché encontrado (hace ${age} min). Usando datos guardados.`);
    return games;
  } catch (e) {
    return null;
  }
}

// ─── Fetch Games ──────────────────────────────────────────────────────────────
async function loadGames() {
  showLoader(true);
  try {
    // 1. Google Sheets TSV (fuente principal)
    try {
      const res = await fetch(SHEETS_TSV_URL);
      if (res.ok) {
        const text   = await res.text();
        const parsed = parseTSV(text);
        if (parsed.length > 0) {
          state.games = parsed;
          saveToCache(parsed);
          console.info(`✓ ${parsed.length} juegos cargados desde Google Sheets.`);
        }
      }
    } catch (e) {
      console.warn('Google Sheets no disponible:', e.message);
    }

    // 2. Caché local (si el Sheet falló o devolvió vacío)
    if (state.games.length === 0) {
      const cached = loadFromCache();
      if (cached && cached.length > 0) {
        state.games = cached;
        console.info('Usando última versión guardada del portal.');
      }
    }

    // 3. Sin datos en absoluto → mostrar error de conexión
    if (state.games.length === 0) {
      showConnectionError();
    }

    state.filtered = [...state.games];
    renderGrid(state.filtered);

  } catch (err) {
    console.error('Error inesperado en loadGames:', err);
    const cached = loadFromCache();
    if (cached && cached.length > 0) {
      state.games    = cached;
      state.filtered = [...cached];
      renderGrid(state.filtered);
    } else {
      showConnectionError();
    }
  } finally {
    showLoader(false);
  }
}

// ─── Render Grid ──────────────────────────────────────────────────────────────
function renderGrid(games) {
  dom.grid.innerHTML = '';

  if (games.length === 0) {
    dom.emptyState.classList.remove('hidden');
    dom.grid.classList.add('hidden');
    updateCount(0);
    return;
  }

  dom.emptyState.classList.add('hidden');
  dom.grid.classList.remove('hidden');
  updateCount(games.length);

  const fragment = document.createDocumentFragment();
  games.forEach((game, i) => fragment.appendChild(createCard(game, i)));
  dom.grid.appendChild(fragment);
}

function createCard(game, index) {
  const card = document.createElement('article');
  card.className = 'game-card group cursor-pointer';
  card.style.animationDelay = `${index * 60}ms`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Abrir detalles de ${game.title}`);

  const diff     = difficultyConfig[game.difficulty] || difficultyConfig['Media'];
  const tagsHtml = game.tags.slice(0, 3).map(t => `<span class="tag-chip">${t}</span>`).join('');

  card.innerHTML = `
    <div class="card-thumb-wrap">
      <img
        src="${game.thumbnail}"
        alt="${game.title}"
        class="card-thumb"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'"
      />
      <div class="card-hover-overlay">
        <span class="overlay-label">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/>
          </svg>
          Ver detalles
        </span>
      </div>
      <div class="card-diff-badge ${diff.bg} ${diff.color}">
        <span class="diff-dot" style="background:${diff.dot}"></span>
        ${game.difficulty}
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">${game.title}</h3>
      <p class="card-author">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        ${game.author || 'Anónimo'}
      </p>
      <p class="card-desc">${game.description}</p>
      <div class="card-footer">
        <div class="card-tags">${tagsHtml}</div>
        <span class="card-playtime">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
          </svg>
          ${game.playtime}
        </span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => openModal(game));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(game); });
  return card;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(game) {
  state.activeGame = game;
  const diff = difficultyConfig[game.difficulty] || difficultyConfig['Media'];

  dom.modalImg.src     = game.screenshot;
  dom.modalImg.alt     = game.title;
  dom.modalTitle.textContent = game.title;
  dom.modalDesc.textContent  = game.description;

  const authorEl = document.getElementById('modal-author');
  if (authorEl) authorEl.textContent = game.author || 'Anónimo';

  dom.modalPlaytime.textContent    = game.playtime;
  dom.modalDifficulty.textContent  = game.difficulty;
  dom.modalDifficulty.className    = `meta-badge border ${diff.bg} ${diff.color}`;

  dom.modalTags.innerHTML = game.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');

  dom.modal.classList.remove('modal-hidden');
  dom.modal.classList.add('modal-visible');
  document.body.style.overflow = 'hidden';

  dom.playBtn.classList.remove('btn-launching', 'btn-launched');
  dom.playBtn.textContent = '¡Jugar!';
  dom.playBtn.disabled    = false;
}

function closeModal() {
  dom.modal.classList.remove('modal-visible');
  dom.modal.classList.add('modal-hiding');
  setTimeout(() => {
    dom.modal.classList.remove('modal-hiding');
    dom.modal.classList.add('modal-hidden');
    document.body.style.overflow = '';
    state.activeGame = null;
  }, 280);
}

// ─── Play Button & Transition ─────────────────────────────────────────────────
function handlePlay() {
  if (!state.activeGame) return;

  const btn = dom.playBtn;
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Iniciando…`;
  btn.classList.add('btn-launching');
  dom.modalImg.classList.add('img-launch-fx');

  setTimeout(() => {
    window.open(state.activeGame.geniallyUrl, '_blank', 'noopener,noreferrer');
    dom.modalImg.classList.remove('img-launch-fx');
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      ¡Lanzado!
    `;
    btn.classList.remove('btn-launching');
    btn.classList.add('btn-launched');
    setTimeout(() => {
      btn.classList.remove('btn-launched');
      btn.textContent = '¡Jugar!';
      btn.disabled    = false;
    }, 2000);
  }, 380);
}

// ─── Search ───────────────────────────────────────────────────────────────────
function handleSearch(e) {
  const q = e.target.value.toLowerCase().trim();
  state.searchQuery = q;
  dom.searchClear.classList.toggle('hidden', q === '');

  state.filtered = q === ''
    ? [...state.games]
    : state.games.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q)) ||
        (g.author || '').toLowerCase().includes(q)
      );

  renderGrid(state.filtered);
}

function clearSearch() {
  dom.searchInput.value = '';
  dom.searchClear.classList.add('hidden');
  state.searchQuery = '';
  state.filtered    = [...state.games];
  renderGrid(state.filtered);
  dom.searchInput.focus();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showLoader(show) {
  dom.loader.classList.toggle('hidden', !show);
  dom.grid.classList.toggle('hidden', show);
}

function updateCount(n) {
  dom.resultCount.textContent = n === state.games.length
    ? `${n} juego${n !== 1 ? 's' : ''} disponible${n !== 1 ? 's' : ''}`
    : `${n} resultado${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`;
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
dom.searchInput.addEventListener('input', handleSearch);
dom.searchClear.addEventListener('click', clearSearch);
dom.modalClose.addEventListener('click', closeModal);
dom.modalBackdrop.addEventListener('click', closeModal);
dom.playBtn.addEventListener('click', handlePlay);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !dom.modal.classList.contains('modal-hidden')) closeModal();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  loadGames();
});