/* =========================================================
   Cengizhan Bayram — site script
   Roman aureus, laurel and classical line drawings
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const TAU = Math.PI * 2;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lang = () => root.getAttribute('data-lang') || 'tr';
  const fmt = (n, d = 2) => {
    const s = n.toFixed(d);
    return lang() === 'tr' ? s.replace('.', ',') : s;
  };
  const langHooks = [];

  /* ---------- language ---------- */
  function initLang() {
    const btn = $('#lang-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const l = lang() === 'tr' ? 'en' : 'tr';
      root.setAttribute('data-lang', l);
      root.setAttribute('lang', l);
      try { localStorage.setItem('lang', l); } catch (e) { /* storage unavailable */ }
      langHooks.forEach((fn) => fn(l));
    });
  }

  /* ---------- nav ---------- */
  function initNav() {
    const nav = $('#nav'), prog = $('#progress'), burger = $('#burger');
    const onScroll = () => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('scrolled', y > 24);
      prog.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const setOpen = (v) => {
      nav.classList.toggle('open', v);
      burger.setAttribute('aria-expanded', String(v));
      document.body.style.overflow = v ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    $$('#nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    const links = new Map($$('#nav-links a').map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.remove('active'));
        const a = links.get(e.target.id);
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => io.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    $$('.interests, .projects, .stats, .pub-grid, .edu, .focus-grid').forEach((g) =>
      Array.from(g.children).forEach((c, i) => c.style.setProperty('--d', (i % 4) * 0.09 + 's')));
    $$('.hero .reveal').forEach((el, i) => el.style.setProperty('--d', 0.55 + i * 0.12 + 's'));

    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  /* ---------- hero name + role ---------- */
  function initHeroText() {
    let gi = 0;
    $$('.hero-name .split').forEach((line) => {
      const text = line.textContent.trim();
      line.textContent = '';
      let j = 0;
      for (const ch of text) {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', gi++);
        s.style.setProperty('--j', j++);
        line.appendChild(s);
      }
    });

    const glyphs = 'ABCDEFGHIKLMNOPQRSTVXYZ0123456789<>/_#*+';
    function scramble(el, delay) {
      const final = el.dataset.text || (el.dataset.text = el.textContent.trim());
      if (reduceMotion) { el.textContent = final; return; }
      const per = 24, offsets = Array.from(final, () => Math.random() * 280);
      const total = final.length * per + 320;
      let t0 = 0;
      const step = (t) => {
        if (!t0) t0 = t + delay;
        const e = t - t0;
        let out = '';
        for (let i = 0; i < final.length; i++) {
          const ch = final[i];
          out += ch === ' ' || ch === '·' || e > i * per + offsets[i] ? ch : glyphs[(Math.random() * glyphs.length) | 0];
        }
        el.textContent = e < 0 ? '' : out;
        if (e < total) requestAnimationFrame(step); else el.textContent = final;
      };
      requestAnimationFrame(step);
    }
    const run = (delay) => $$('.hero-role .scramble').forEach((el) => {
      if (el.getAttribute('lang') === lang()) scramble(el, delay);
    });
    run(700);
    langHooks.push(() => run(0));
  }

  /* ---------- laurel wreath (around the coin, and behind the contact section) ---------- */
  // Markup for a wreath of radius 252 in a −300…300 viewBox, open at the top.
  function laurelMarkup() {
    const R = 252, N = 12, rad = Math.PI / 180;
    const leaf = (L) => {
      const w = L * 0.24;
      return `M0 0C${(L * 0.3).toFixed(1)} ${(-w).toFixed(1)} ${(L * 0.75).toFixed(1)} ${(-w).toFixed(1)} ${L.toFixed(1)} 0` +
             `C${(L * 0.75).toFixed(1)} ${w.toFixed(1)} ${(L * 0.3).toFixed(1)} ${w.toFixed(1)} 0 0Z`;
    };
    const one = (x, y, a, L) =>
      `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})">` +
      `<path class="leaf" d="${leaf(L)}"/><path class="rib" d="M3 0H${(L * 0.85).toFixed(1)}"/></g>`;

    // Left branch is computed once; the right one is its mirror image (x → −x, angle → 180° − angle).
    const sprigs = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), th = (104 + t * 140) * rad;
      const x = R * Math.cos(th), y = R * Math.sin(th);
      const phi = th / rad + 90, L = 46 - 18 * t;
      const bx = x + Math.cos(th) * 15 + Math.cos(phi * rad) * 6, by = y + Math.sin(th) * 15 + Math.sin(phi * rad) * 6;
      sprigs.push({ x, y, out: phi - 40, inn: phi + 34, L, berry: i % 3 === 1 ? [bx, by] : null, i });
    }
    const end = (250 * rad), tip = { x: R * Math.cos(end), y: R * Math.sin(end), a: 250 + 90 };

    let out = '';
    const stemL = `M${(R * Math.cos(80 * rad)).toFixed(1)} ${(R * Math.sin(80 * rad)).toFixed(1)}A${R} ${R} 0 0 1 ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`;
    const stemR = `M${(-R * Math.cos(80 * rad)).toFixed(1)} ${(R * Math.sin(80 * rad)).toFixed(1)}A${R} ${R} 0 0 0 ${(-tip.x).toFixed(1)} ${tip.y.toFixed(1)}`;
    out += `<path class="stem" d="${stemL}"/><path class="stem" d="${stemR}"/>`;
    for (const m of [1, -1]) {
      for (const s of sprigs) {
        const x = s.x * m, ao = m === 1 ? s.out : 180 - s.out, ai = m === 1 ? s.inn : 180 - s.inn;
        let g = one(x, s.y, ai, s.L * 0.85) + one(x, s.y, ao, s.L);
        if (s.berry) g += `<circle class="berry" cx="${(s.berry[0] * m).toFixed(1)}" cy="${s.berry[1].toFixed(1)}" r="4.6"/>`;
        out += `<g class="sprig" style="--dl:${(0.5 + s.i * 0.07).toFixed(2)}s">${g}</g>`;
      }
      out += `<g class="sprig" style="--dl:${(0.5 + N * 0.07).toFixed(2)}s">${one(tip.x * m, tip.y, m === 1 ? tip.a : 180 - tip.a, 30)}</g>`;
    }
    return out;
  }

  function buildLaurel() {
    const svg = $('#laurel');
    if (!svg) return;
    svg.innerHTML = laurelMarkup();
  }

  /* ---------- section art: Roman line drawings behind each section ---------- */
  const f1 = (n) => +n.toFixed(1);
  const ART = {
    // a 3D armillary sphere made of CSS rings
    armillary: () =>
      '<div class="arm"><div class="arm-spin">' +
      '<i class="ring r-meridian"></i><i class="ring r-colure"></i><i class="ring r-equator"></i>' +
      '<i class="ring r-ecliptic"></i><i class="ring r-tropic"></i><i class="ring r-inner"></i>' +
      '<i class="arm-axis"></i></div><i class="arm-core"></i></div>',

    // Euclid, Elements I.1: an equilateral triangle on a given segment
    euclid: () => {
      const A = [200, 330], B = [400, 330], C = [300, f1(330 - 200 * Math.sin(Math.PI / 3))], D = [300, f1(330 + 200 * Math.sin(Math.PI / 3))];
      return `<svg viewBox="0 0 600 560">` +
        `<circle class="d" pathLength="1" cx="${A[0]}" cy="${A[1]}" r="200"/>` +
        `<circle class="d" pathLength="1" cx="${B[0]}" cy="${B[1]}" r="200"/>` +
        `<path class="d dashed" d="M300 60V545"/>` +
        `<path class="d" pathLength="1" d="M${A}H${B[0]}"/>` +
        `<path class="d acc" pathLength="1" d="M${A}L${C}L${B}Z"/>` +
        `<path class="d acc thin" pathLength="1" d="M${A}L${D}L${B}"/>` +
        `<path class="d" pathLength="1" d="M236 330A36 36 0 0 0 218 298.8"/>` +
        [A, B, C, D].map((p) => `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('') +
        `<text class="lbl" x="172" y="358">A</text><text class="lbl" x="412" y="358">B</text>` +
        `<text class="lbl" x="292" y="138">C</text><text class="lbl" x="292" y="540">D</text>` +
        `<text class="lbl sm" x="246" y="314">60°</text></svg>`;
    },

    // the Pantheon in section: coffered dome, oculus and a sweeping beam of light
    dome: () => {
      const arc = (r, a0, a1) => {
        const p = (a) => `${f1(r * Math.cos(a * Math.PI / 180))} ${f1(r * Math.sin(a * Math.PI / 180))}`;
        return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
      };
      let d = arc(300, 180, 262) + arc(300, 278, 360) + arc(280, 180, 262) + arc(280, 278, 360);
      let coffers = '';
      [248, 216, 186, 158, 132].forEach((r) => (coffers += arc(r, 183, 357)));
      for (let a = 186; a <= 354; a += 12) {
        const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
        coffers += `M${f1(132 * c)} ${f1(132 * s)}L${f1(280 * c)} ${f1(280 * s)}`;
      }
      const drum = 'M-300 0V210M300 0V210M-280 0V210M280 0V210M-330 0H330M-330 210H330M-330 222H330' +
        [-190, -60, 70].map((x) => `M${x} 210V140A30 30 0 0 1 ${x + 60} 140V210`).join('');
      return `<svg viewBox="-340 -330 680 570"><defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#f1d690" stop-opacity=".55"/><stop offset="1" stop-color="#f1d690" stop-opacity="0"/></linearGradient></defs>` +
        `<g class="beam"><path d="M-36 -278H36L170 210H40Z" fill="url(#beam)"/><ellipse cx="105" cy="210" rx="70" ry="9" fill="#f1d690" opacity=".35"/>` +
        `<animateTransform attributeName="transform" type="rotate" values="-12 0 -278;12 0 -278;-12 0 -278" dur="34s" repeatCount="indefinite"/></g>` +
        `<path class="d" pathLength="1" d="${d}"/><path class="d thin" pathLength="1" d="${coffers}"/>` +
        `<path class="d" pathLength="1" d="${drum}"/></svg>`;
    },

    // a two-tier aqueduct; the channel on top carries a flowing (dashed) stream
    aqueduct: () => {
      let low = '', high = '';
      for (let i = 0; i < 6; i++) { const x = i * 200 + 30; low += `M${x} 320V200A85 85 0 0 1 ${x + 170} 200V320`; }
      for (let i = 0; i < 12; i++) { const x = i * 100 + 10; high += `M${x} 100V70A40 40 0 0 1 ${x + 80} 70V100`; }
      return `<svg viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax slice">` +
        `<path class="d" pathLength="1" d="${low}"/><path class="d" pathLength="1" d="M0 110H1200M0 100H1200"/>` +
        `<path class="d" pathLength="1" d="${high}"/><path class="d" pathLength="1" d="M0 22H1200M0 8H1200"/>` +
        `<path class="water" d="M0 15H1200"/></svg>`;
    },

    // a hexastyle temple front
    temple: () => {
      let cols = '';
      for (let i = 0; i < 6; i++) {
        const c = 100 + i * 80;
        cols += `M${c - 20} 398L${c - 17} 170M${c + 20} 398L${c + 17} 170M${c - 9} 396L${c - 7.5} 172M${c} 396V172M${c + 9} 396L${c + 7.5} 172` +
                `M${c - 25} 170H${c + 25}M${c - 22} 162H${c + 22}M${c - 24} 398H${c + 24}`;
      }
      let tri = '';
      for (let x = 66; x < 534; x += 39) tri += `M${x} 100V130M${x + 12} 100V130M${x + 6} 100V130`;
      return `<svg viewBox="0 0 600 440">` +
        `<path class="d" pathLength="1" d="M45 92 300 18 555 92ZM82 86 300 30 518 86Z"/>` +
        `<circle class="d acc" pathLength="1" cx="300" cy="64" r="13"/>` +
        `<path class="d" pathLength="1" d="M40 100H560M60 130H540M60 162H540M60 130V162M540 130V162"/>` +
        `<path class="d thin" pathLength="1" d="${tri}"/><path class="d" pathLength="1" d="${cols}"/>` +
        `<path class="d" pathLength="1" d="M20 430H580M40 414H560M60 398H540M20 430V414H40V398H60M580 430V414H560V398H540"/></svg>`;
    },

    // a plane sundial: twelve Roman hours and a gnomon shadow that sweeps through the day
    sundial: () => {
      const pt = (r, a) => `${f1(r * Math.cos(a * Math.PI / 180))} ${f1(r * Math.sin(a * Math.PI / 180))}`;
      let lines = '';
      for (let k = 0; k <= 12; k++) lines += `M${pt(120, 180 - k * 15)}L${pt(300, 180 - k * 15)}`;
      const nums = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      const labels = nums.map((n, k) => {
        const [x, y] = pt(330, 180 - (k + 0.5) * 15).split(' ');
        return `<text class="lbl sm" x="${x}" y="${+y + 6}" text-anchor="middle">${n}</text>`;
      }).join('');
      return `<svg viewBox="-370 -40 740 410">` +
        `<path class="d" pathLength="1" d="M-340 0H340M-300 0A300 300 0 0 0 300 0M-270 0A270 270 0 0 0 270 0M-120 0A120 120 0 0 0 120 0"/>` +
        `<path class="d thin" pathLength="1" d="${lines}"/>${labels}` +
        `<g class="shadow"><path d="M0 0V262"/><animateTransform attributeName="transform" type="rotate" values="72;-72;72" dur="48s" repeatCount="indefinite"/></g>` +
        `<path class="d acc" pathLength="1" d="M-12 0 0-36 12 0Z"/><circle class="pt" r="5"/></svg>`;
    },

    // an emblema of tesserae in concentric rings, some of them glinting
    mosaic: () => {
      let tiles = '';
      for (let k = 0; k < 10; k++) {
        const r = 64 + k * 24, n = Math.round((TAU * r) / 20);
        const tone = ['g', 'g', 'r', 'g', 'm', 'g', 'v', 'g', 'r', 'g'][k];
        for (let j = 0; j < n; j++) {
          const a = (j + (k % 2) * 0.5) * (TAU / n);
          const cls = (j % 6 === 0 && tone === 'g' ? 'r' : tone) + (Math.random() < 0.07 ? ' tw' : '');
          tiles += `<rect class="${cls}" x="-6.5" y="-6.5" width="13" height="13" transform="translate(${f1(r * Math.cos(a))} ${f1(r * Math.sin(a))}) rotate(${f1(a * 180 / Math.PI)})" style="--tw:${(Math.random() * 6).toFixed(2)}s"/>`;
        }
      }
      let petals = '';
      for (let i = 0; i < 8; i++) petals += `<ellipse class="petal" cx="26" rx="24" ry="9" transform="rotate(${i * 45})"/>`;
      return `<svg viewBox="-300 -300 600 600"><g class="tiles">${tiles}</g>${petals}<circle class="pt" r="7"/></svg>`;
    },

    laurel: () => `<svg viewBox="-300 -300 600 600">${laurelMarkup()}</svg>`,
  };

  function initSectionArt() {
    const arts = [];
    $$('section[data-art]').forEach((sec) => {
      const kind = sec.dataset.art;
      if (!ART[kind]) return;
      const el = document.createElement('div');
      el.className = `sec-art art-${kind}`;
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = ART[kind]();
      sec.prepend(el);
      arts.push({ el, sec });
    });
    if (!arts.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in', 'ready'); io.unobserve(e.target); }
        });
      }, { threshold: 0.05 });
      arts.forEach(({ el }) => io.observe(el));
    } else {
      arts.forEach(({ el }) => el.classList.add('in', 'ready'));
    }

    if (reduceMotion) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = innerHeight;
      arts.forEach(({ el, sec }) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * -0.06).toFixed(1)}px`;
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- portrait: gold halftone that is struck into the coin, then resolves to the photo ---------- */
  function initPortrait() {
    const host = $('#coin'), coin = $('.coin'), cv = $('#portrait-dots'), img = $('#portrait-img');
    if (!host || !cv || !img) return;
    requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add('ready')));

    const ctx = cv.getContext('2d');
    const COLORS = ['#5a3f1d', '#8a6330', '#c4944a', '#e9c77d', '#f8ecd0'];
    let parts = [], buckets = [], w = 0, h = 0, dpr = 1, raf = 0, t0 = 0;
    let phase = 'intro', hovering = false;
    const mouse = { x: -1e4, y: -1e4, on: false };

    function build() {
      const r = cv.getBoundingClientRect();
      w = cv.offsetWidth || r.width; h = cv.offsetHeight || r.height;
      if (!w || !h) return false;
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);

      // same box as .portrait-img: left 7%, width 86%, bottom-aligned
      const iw = w * 0.86, ix = w * 0.07, ih = (iw * img.naturalHeight) / img.naturalWidth, top = h - ih;
      const step = w < 260 ? 4.5 : 5.5;
      const cols = Math.floor(iw / step), rows = Math.floor(ih / step);
      const oc = document.createElement('canvas');
      oc.width = cols; oc.height = rows;
      const o = oc.getContext('2d', { willReadFrequently: true });
      o.drawImage(img, 0, 0, cols, rows);
      let data;
      try { data = o.getImageData(0, 0, cols, rows).data; } catch (e) { return false; }

      parts = []; buckets = COLORS.map(() => []);
      const cx = w / 2, cy = h / 2;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4, a = data[i + 3];
          if (a < 120) continue;
          const L = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
          const tx = ix + (x + 0.5) * step, ty = top + (y + 0.5) * step;
          const ang = Math.random() * TAU, rr = w * (0.55 + Math.random() * 0.6);
          const p = {
            tx, ty, x: tx, y: ty, vx: 0, vy: 0,
            sx: cx + Math.cos(ang) * rr, sy: cy + Math.sin(ang) * rr,
            r: Math.max(0.6, step * 0.5 * (0.22 + 0.8 * Math.pow(L, 0.9)) * (a / 255)),
            d: (ty / h) * 0.6 + Math.random() * 0.4,
          };
          parts.push(p);
          buckets[Math.min(4, (L * 5) | 0)].push(p);
        }
      }
      return parts.length > 0;
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      buckets.forEach((list, b) => {
        if (!list.length) return;
        ctx.fillStyle = COLORS[b];
        ctx.beginPath();
        for (const p of list) { ctx.moveTo(p.x + p.r, p.y); ctx.arc(p.x, p.y, p.r, 0, TAU); }
        ctx.fill();
      });
    }

    function tick(now) {
      if (phase === 'intro') {
        if (!t0) t0 = now;
        const t = (now - t0) / 1000;
        let done = true;
        for (const p of parts) {
          let k = (t - p.d) / 1.3;
          if (k < 1) done = false;
          k = Math.max(0, Math.min(1, k));
          const e = 1 - Math.pow(1 - k, 4);
          p.x = p.sx + (p.tx - p.sx) * e;
          p.y = p.sy + (p.ty - p.sy) * e;
        }
        draw();
        if (done) {
          phase = 'live';
          setTimeout(() => { if (!hovering) showPhoto(true); }, 700);
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      const R = 38, R2 = R * R;
      let moving = false;
      for (const p of parts) {
        let fx = (p.tx - p.x) * 0.075, fy = (p.ty - p.y) * 0.075;
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / R) * 3.4;
            fx += (dx / d) * f; fy += (dy / d) * f;
          }
        }
        p.vx = (p.vx + fx) * 0.78; p.vy = (p.vy + fy) * 0.78;
        p.x += p.vx; p.y += p.vy;
        if (!moving && (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02)) moving = true;
      }
      draw();
      raf = moving || mouse.on ? requestAnimationFrame(tick) : 0;
    }

    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    function showPhoto(v) {
      host.classList.toggle('show-photo', v);
      if (!v) wake();
    }
    function tilt(e) {
      if (reduceMotion || !coin) return;
      if (!e) { coin.style.transform = ''; return; }
      const r = host.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      coin.style.transform = `perspective(900px) rotateY(${(nx * 14).toFixed(2)}deg) rotateX(${(-ny * 14).toFixed(2)}deg)`;
    }

    function start() {
      if (!build()) { host.classList.add('no-dots'); return; }
      if (reduceMotion) {
        phase = 'live';
        draw();
        showPhoto(true);
      } else {
        wake();
      }

      host.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || phase !== 'live') return;
        hovering = true;
        showPhoto(false);
      });
      host.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * w;
        mouse.y = ((e.clientY - r.top) / r.height) * h;
        mouse.on = true;
        if (e.pointerType === 'mouse') tilt(e);
        if (phase === 'live') wake();
      });
      host.addEventListener('pointerleave', (e) => {
        mouse.on = false;
        tilt(null);
        if (e.pointerType === 'mouse') { hovering = false; if (phase === 'live') showPhoto(true); }
      });
      host.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse' || phase !== 'live') return;
        showPhoto(!host.classList.contains('show-photo'));
      });

      let rt;
      addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          if (phase !== 'live') return;
          if (build()) draw();
        }, 150);
      });
    }

    if (img.complete && img.naturalWidth) start();
    else {
      img.addEventListener('load', start, { once: true });
      img.addEventListener('error', () => host.classList.add('no-dots'), { once: true });
    }
  }

  /* ---------- fig. II: retrieval-head masking ---------- */
  function initRopeFigure() {
    const fig = $('#fig-rope');
    if (!fig) return;
    const grid = $('#head-grid'), strip = $('#dims-strip'), num = $('#recall-num'), bar = $('#recall-bar');

    let seed = 2606212;
    const rnd = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // 32 layers × 32 heads (OLMo-2 7B). 87 retrieval heads, placed schematically in mid-to-late layers.
    const LAYERS = 32, HEADS = 32, N_RH = 87;
    const weights = [];
    for (let l = 0; l < LAYERS; l++)
      for (let hd = 0; hd < HEADS; hd++)
        weights.push(Math.exp(-(((l - 19) / 6.5) ** 2)) + 0.04);
    const total = weights.reduce((a, b) => a + b, 0);
    const chosen = new Set();
    while (chosen.size < N_RH) {
      let r = rnd() * total;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) { chosen.add(i); break; }
      }
    }

    const frag = document.createDocumentFragment();
    for (let hd = 0; hd < HEADS; hd++) {
      for (let l = 0; l < LAYERS; l++) {
        const c = document.createElement('i');
        c.style.setProperty('--a', (0.05 + rnd() * 0.2).toFixed(3));
        if (chosen.has(l * HEADS + hd)) {
          c.className = 'rh';
          c.style.setProperty('--dl', (l * 0.018 + rnd() * 0.12).toFixed(3) + 's');
        }
        frag.appendChild(c);
      }
    }
    grid.appendChild(frag);

    const sf = document.createDocumentFragment();
    for (let i = 0; i < 128; i++) {
      const c = document.createElement('i');
      c.style.setProperty('--a', (0.85 - (i / 127) * 0.55).toFixed(3));
      if (i >= 96) {
        c.className = 'low';
        c.style.setProperty('--dl', ((127 - i) * 0.012).toFixed(3) + 's');
      }
      sf.appendChild(c);
    }
    strip.appendChild(sf);

    const targets = { base: 1, mask: 0, rope: 0.18 };
    let cur = 1, anim = 0;
    const render = () => { num.textContent = fmt(cur); bar.style.transform = `scaleX(${cur})`; };
    function set(mode) {
      fig.setAttribute('data-mode', mode);
      $$('.fig-tabs button', fig).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      const from = cur, to = targets[mode];
      cancelAnimationFrame(anim);
      if (reduceMotion) { cur = to; render(); return; }
      let t0 = 0;
      const step = (t) => {
        if (!t0) t0 = t;
        const k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
        cur = from + (to - from) * e;
        render();
        if (k < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }
    $$('.fig-tabs button', fig).forEach((b) => b.addEventListener('click', () => set(b.dataset.mode)));
    render();
    langHooks.push(render);
  }

  /* ---------- counters ---------- */
  function initCounters() {
    const els = $$('.count');
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, to = +el.dataset.to;
        let t0 = 0;
        const step = (t) => {
          if (!t0) t0 = t;
          const k = Math.min(1, (t - t0) / 1700);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => { el.textContent = '0'; io.observe(el); });
  }

  /* ---------- marquee ---------- */
  function initMarquee() {
    const track = $('.marquee-track'), list = $('.marquee-list');
    if (!track || !list) return;
    track.appendChild(list.cloneNode(true));
  }

  /* ---------- copy e-mail ---------- */
  function initCopy() {
    const btn = $('#copy-email');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.email);
        btn.classList.add('done');
        setTimeout(() => btn.classList.remove('done'), 1800);
      } catch (e) {
        location.href = 'mailto:' + btn.dataset.email;
      }
    });
  }

  /* ---------- boot ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  initLang();
  initNav();
  initHeroText();
  initReveal();
  buildLaurel();
  initSectionArt();
  initPortrait();
  initRopeFigure();
  initCounters();
  initMarquee();
  initCopy();
})();
