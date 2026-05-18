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
  grid: document.getElementById('game-grid'),
  searchInput: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  resultCount: document.getElementById('result-count'),
  modal: document.getElementById('game-modal'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  modalClose: document.getElementById('modal-close'),
  modalImg: document.getElementById('modal-screenshot'),
  modalTitle: document.getElementById('modal-title'),
  modalDesc: document.getElementById('modal-desc'),
  modalPlaytime: document.getElementById('modal-playtime'),
  modalDifficulty: document.getElementById('modal-difficulty'),
  modalTags: document.getElementById('modal-tags'),
  playBtn: document.getElementById('play-btn'),
  loader: document.getElementById('loader'),
  emptyState: document.getElementById('empty-state'),
  particleCanvas: document.getElementById('particle-canvas'),
};

// ─── Difficulty config ────────────────────────────────────────────────────────
const difficultyConfig = {
  'Fácil':  { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: '#34d399' },
  'Media':  { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',   dot: '#fbbf24' },
  'Alta':   { color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/30',     dot: '#fb7185' },
};

// ─── Particle Background ──────────────────────────────────────────────────────
function initParticles() {
  const canvas = dom.particleCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.5 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 90 }, createParticle);
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
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
}

// ─── Inline fallback data (used if games.json cannot be fetched) ───────────────
const FALLBACK_GAMES = [
  {
    "id": 1,
    "title": "Desafío de Ciberseguridad",
    "description": "Un juego interactivo donde aprenderás a identificar amenazas digitales, crear contraseñas robustas y detectar intentos de phishing en situaciones de la vida real.",
    "tags": ["Ciberseguridad", "Contraseñas", "Phishing"],
    "playtime": "15 min",
    "difficulty": "Media",
    "thumbnail": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example1"
  },
  {
    "id": 2,
    "title": "Guardianes de la Privacidad",
    "description": "Explora el mundo de la privacidad en línea y aprende qué datos personales debes proteger. Toma decisiones en tiempo real sobre permisos de aplicaciones y configuraciones de redes sociales.",
    "tags": ["Privacidad", "Datos Personales", "Redes Sociales"],
    "playtime": "20 min",
    "difficulty": "Fácil",
    "thumbnail": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example2"
  },
  {
    "id": 3,
    "title": "El Arte de la Netiqueta",
    "description": "Navega situaciones sociales en el mundo digital y aprende las reglas no escritas de la comunicación en línea. Desde foros y correos hasta redes sociales.",
    "tags": ["Netiqueta", "Comunicación", "Respeto Digital"],
    "playtime": "12 min",
    "difficulty": "Fácil",
    "thumbnail": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example3"
  },
  {
    "id": 4,
    "title": "Derechos en la Red",
    "description": "Un recorrido interactivo por los derechos y responsabilidades que tienes como usuario de internet. Aprende sobre propiedad intelectual y libertad de expresión responsable.",
    "tags": ["Derechos Digitales", "Propiedad Intelectual", "Ética"],
    "playtime": "25 min",
    "difficulty": "Alta",
    "thumbnail": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example4"
  },
  {
    "id": 5,
    "title": "Detector de Fake News",
    "description": "Conviértete en un detective de la información y aprende a distinguir noticias verdaderas de falsas. Analiza fuentes y desarrolla el pensamiento crítico necesario.",
    "tags": ["Desinformación", "Pensamiento Crítico", "Fuentes"],
    "playtime": "18 min",
    "difficulty": "Media",
    "thumbnail": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example5"
  },
  {
    "id": 6,
    "title": "Huella Digital: Tu Legado Online",
    "description": "Descubre cómo cada acción en línea deja una marca permanente. Aprende a gestionar tu identidad digital y proteger tu reputación a largo plazo.",
    "tags": ["Huella Digital", "Identidad Online", "Reputación"],
    "playtime": "22 min",
    "difficulty": "Media",
    "thumbnail": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example6"
  },
  {
    "id": 7,
    "title": "Seguridad en Redes WiFi",
    "description": "Aprende a conectarte de forma segura en redes públicas y privadas. Explora los riesgos de las redes abiertas y las mejores prácticas para proteger tus dispositivos.",
    "tags": ["Ciberseguridad", "WiFi", "VPN"],
    "playtime": "14 min",
    "difficulty": "Media",
    "thumbnail": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example7"
  },
  {
    "id": 8,
    "title": "Convivencia Digital",
    "description": "Un simulador de situaciones de ciberacoso y conflictos en línea. Aprende a identificar, prevenir y actuar ante el bullying digital y desarrolla empatía.",
    "tags": ["Ciberacoso", "Empatía", "Convivencia"],
    "playtime": "30 min",
    "difficulty": "Alta",
    "thumbnail": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&q=80",
    "screenshot": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=90",
    "geniallyUrl": "https://view.genially.com/example8"
  }
];

// ─── Google Sheets TSV source ─────────────────────────────────────────────────
const SHEETS_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vROrr3WszHFXRmGgon-X1ihbVD7WjERxs3vKZ04foAKlqPqRDhW6a5nvqJn7Hj2A0UtCUIzsGoYzCU0/pub?gid=420182280&single=true&output=tsv';

// Maps exact column names from the Sheet → internal JS keys
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
  // English aliases (just in case)
  'author':          'author',
  'title':           'title',
  'description':     'description',
  'playtime':        'playtime',
  'difficulty':      'difficulty',
  'geniallyurl':     'geniallyUrl',
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80';

function parseTSV(text) {
  // Normalize line endings and strip BOM (Google Sheets adds \ufeff at start)
  const cleaned = text.replace(/^\ufeff/, '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleaned.split('\n');
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split('\t').map(h => h.trim().toLowerCase());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map((line, i) => {
      const rowNumber = i + 1; // 1-based, matches /img/1.png
      const cols = line.split('\t');
      const obj = { id: rowNumber };

      headers.forEach((key, idx) => {
        obj[key] = (cols[idx] || '').trim();
      });

      // Merge tag1/tag2/tag3 into a tags array
      obj.tags = [obj.tag1, obj.tag2, obj.tag3].filter(Boolean);
      delete obj.tag1; delete obj.tag2; delete obj.tag3;

      // Images: always /img/{rowNumber}.png
      // Falls back to placeholder if the file doesn't exist (handled by onerror in HTML)
      obj.thumbnail  = `./img/${rowNumber}.png`;
      obj.screenshot = `./img/${rowNumber}.png`;

      return obj;
    })
    .filter(g => g.title); // skip completely empty rows
}

// ─── Fetch Games ──────────────────────────────────────────────────────────────
async function loadGames() {
  showLoader(true);
  try {
    let loaded = false;

    // ── 1. Google Sheets TSV (primary source) ──────────────────
    try {
      const res = await fetch(SHEETS_TSV_URL);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseTSV(text);
        if (parsed.length > 0) {
          state.games = parsed;
          loaded = true;
          console.info(`✓ ${parsed.length} juegos cargados desde Google Sheets.`);
        }
      }
    } catch (e) {
      console.warn('Google Sheets no disponible:', e.message);
    }

    // ── 2. Local games.json (secondary fallback) ───────────────
    if (!loaded) {
      for (const path of ['./games.json', 'games.json']) {
        try {
          const res = await fetch(path);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              state.games = data;
              loaded = true;
              console.info('✓ Juegos cargados desde games.json (fallback local).');
              break;
            }
          }
        } catch (_) { /* try next */ }
      }
    }

    // ── 3. Inline data (last resort) ──────────────────────────
    if (!loaded) {
      console.info('Usando datos integrados (fallback final).');
      state.games = FALLBACK_GAMES;
    }

    state.filtered = [...state.games];
    renderGrid(state.filtered);

  } catch (err) {
    console.error('Error inesperado en loadGames:', err);
    state.games = FALLBACK_GAMES;
    state.filtered = [...state.games];
    renderGrid(state.filtered);
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
  games.forEach((game, i) => {
    const card = createCard(game, i);
    fragment.appendChild(card);
  });
  dom.grid.appendChild(fragment);
}

function createCard(game, index) {
  const card = document.createElement('article');
  card.className = 'game-card group cursor-pointer';
  card.style.animationDelay = `${index * 60}ms`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Abrir detalles de ${game.title}`);

  const diff = difficultyConfig[game.difficulty] || difficultyConfig['Media'];
  const tagsHtml = game.tags.slice(0, 3).map(t =>
    `<span class="tag-chip">${t}</span>`
  ).join('');

  card.innerHTML = `
    <div class="card-thumb-wrap">
      <img
        src="${game.thumbnail}"
        alt="${game.title}"
        class="card-thumb"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'"
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

  dom.modalImg.src = game.screenshot;
  dom.modalImg.alt = game.title;
  dom.modalTitle.textContent = game.title;
  dom.modalDesc.textContent = game.description;

  // Author
  let authorEl = document.getElementById('modal-author');
  if (authorEl) authorEl.textContent = game.author || 'Anónimo';
  dom.modalPlaytime.textContent = game.playtime;

  dom.modalDifficulty.textContent = game.difficulty;
  dom.modalDifficulty.className = `meta-badge border ${diff.bg} ${diff.color}`;

  dom.modalTags.innerHTML = game.tags.map(t =>
    `<span class="modal-tag">${t}</span>`
  ).join('');

  dom.modal.classList.remove('modal-hidden');
  dom.modal.classList.add('modal-visible');
  document.body.style.overflow = 'hidden';

  // reset play button
  dom.playBtn.classList.remove('btn-launching');
  dom.playBtn.textContent = '¡Jugar!';
  dom.playBtn.disabled = false;
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
  btn.innerHTML = `
    <span class="btn-spinner"></span>
    Iniciando…
  `;
  btn.classList.add('btn-launching');

  // glitch/scale effect on screenshot
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
      btn.disabled = false;
    }, 2000);
  }, 380);
}

// ─── Search ───────────────────────────────────────────────────────────────────
function handleSearch(e) {
  const q = e.target.value.toLowerCase().trim();
  state.searchQuery = q;
  dom.searchClear.classList.toggle('hidden', q === '');

  if (q === '') {
    state.filtered = [...state.games];
  } else {
    state.filtered = state.games.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  renderGrid(state.filtered);
}

function clearSearch() {
  dom.searchInput.value = '';
  dom.searchClear.classList.add('hidden');
  state.searchQuery = '';
  state.filtered = [...state.games];
  renderGrid(state.filtered);
  dom.searchInput.focus();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showLoader(show) {
  dom.loader.classList.toggle('hidden', !show);
  dom.grid.classList.toggle('hidden', show);
}

function showErrorState() {
  dom.grid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4">
      <div class="text-5xl">⚠️</div>
      <p class="text-slate-400 text-lg">No se pudo cargar el portal.</p>
      <p class="text-slate-500 text-sm">Asegúrate de que <code class="text-cyan-400">games.json</code> esté en el mismo directorio.</p>
      <button onclick="loadGames()" class="mt-2 px-5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm">
        Reintentar
      </button>
    </div>
  `;
}

function updateCount(n) {
  dom.resultCount.textContent = n === state.games.length
    ? `${n} juegos disponibles`
    : `${n} resultado${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`;
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
dom.searchInput.addEventListener('input', handleSearch);
dom.searchClear.addEventListener('click', clearSearch);
dom.modalClose.addEventListener('click', closeModal);
dom.modalBackdrop.addEventListener('click', closeModal);
dom.playBtn.addEventListener('click', handlePlay);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !dom.modal.classList.contains('modal-hidden')) {
    closeModal();
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  loadGames();
});