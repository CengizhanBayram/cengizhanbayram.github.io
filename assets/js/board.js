/* =========================================================
   Cengizhan Bayram — "the genius's blackboard" theme
   formulas in chalk, hand-drawn circles, underlines and slashes
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const TAU = Math.PI * 2;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lang = () => root.getAttribute('data-lang') || 'tr';
  const fmt = (n, d = 2) => {
    const s = n.toFixed(d);
    return lang() === 'tr' ? s.replace('.', ',') : s;
  };
  const f1 = (n) => +n.toFixed(1);
  const langHooks = [];

  // seeded PRNG, so the chalk marks come out the same on every visit
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

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
      Array.from(g.children).forEach((c, i) => c.style.setProperty('--d', (i % 4) * 0.08 + 's')));
    $$('.hero .reveal').forEach((el, i) => el.style.setProperty('--d', 0.5 + i * 0.1 + 's'));
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  /* ---------- the name, written letter by letter; the role decoded ---------- */
  function initHeroText() {
    let gi = 0;
    $$('.hero-name .split').forEach((line) => {
      const text = line.textContent.trim();
      line.textContent = '';
      for (const ch of text) {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', gi++);
        line.appendChild(s);
      }
    });

    const glyphs = 'αβγδθλμπσφψω∂∇∑∫√∞≈≠±0123456789';
    function scramble(el, delay) {
      const final = el.dataset.text || (el.dataset.text = el.textContent.trim());
      if (reduceMotion) { el.textContent = final; return; }
      const per = 22, offsets = Array.from(final, () => Math.random() * 260);
      const total = final.length * per + 300;
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
    run(800);
    langHooks.push(() => run(0));
  }

  /* ---------- hand-drawn chalk marks ---------- */
  // smooth path through points (Catmull-Rom → cubic Bézier), open
  function smooth(pts) {
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return d;
  }
  // a line that wobbles like a hand at speed
  function wobble(x0, y0, x1, y1, r, amp = 1.6, seg = 7) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    const pts = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, j = i === 0 || i === seg ? 0 : (r() - 0.5) * 2 * amp;
      pts.push([x0 + dx * t + nx * j, y0 + dy * t + ny * j]);
    }
    return smooth(pts);
  }
  // a circle drawn in one go: it overshoots, and never quite closes
  function loop(cx, cy, rx, ry, r) {
    const pts = [], a0 = -0.6 - r() * 0.5, turns = 1.1 + r() * 0.08, N = 30;
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = a0 + t * turns * TAU, k = 1 + (r() - 0.5) * 0.05 + t * 0.06;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return smooth(pts);
  }
  const svgFor = (w, h, cls, paths) =>
    `<svg class="scrib ${cls}" width="${f1(w)}" height="${f1(h)}" viewBox="0 0 ${f1(w)} ${f1(h)}" aria-hidden="true">` +
    paths.map((d, k) => `<path pathLength="1" style="--k:${k}" d="${d}"/>`).join('') + '</svg>';

  const MARKS = {
    underline(el, r) {
      const w = el.offsetWidth * 1.04, h = 22;
      return { html: svgFor(w, h, 'yellow', [wobble(3, 9, w - 3, 6, r, 2.2), wobble(w * 0.18, 17, w * 0.84, 14, r, 1.6, 5)]), left: -el.offsetWidth * 0.02, top: el.offsetHeight - 2 };
    },
    circle(el, r, tone = 'pink') {
      const pad = 14, w = el.offsetWidth + pad * 2.4, h = el.offsetHeight + pad * 1.6;
      return { html: svgFor(w, h, tone, [loop(w / 2, h / 2, w / 2 - 4, h / 2 - 4, r)]), left: -pad * 1.2, top: -pad * 0.8 };
    },
    circleYellow(el, r) { return MARKS.circle(el, r, 'yellow'); },
  };

  // [selector, mark, seed]; marks are drawn around/under the first visible match of each element
  const ANCHORED = [
    ['.sec-title', 'underline'],
    ['.sec-no', 'circle'],
    ['.hero-lead em', 'circleYellow'],
    ['.stats .stat:first-child .stat-num', 'circleYellow'],
    ['.m-docti .m-la', 'underline'],
    ['.m-feri .m-la', 'circle'],
  ];

  function drawAnchored() {
    $$('.scrib.anchored').forEach((s) => s.remove());
    let seed = 7;
    ANCHORED.forEach(([sel, mark]) => {
      $$(sel).forEach((el) => {
        if (!el.offsetWidth) return; // hidden language
        const r = rng(seed++);
        const m = MARKS[mark](el, r);
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        el.insertAdjacentHTML('beforeend', m.html);
        const svg = el.lastElementChild;
        svg.classList.add('anchored');
        Object.assign(svg.style, { left: m.left + 'px', top: m.top + 'px' });
        watch(svg);
      });
    });
  }

  // three pink slashes across the surname
  function drawSlashes() {
    const svg = $('.slashes');
    if (!svg) return;
    const r = rng(1903), w = 160, h = 120;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.classList.add('scrib', 'pink');
    let out = '';
    for (let k = 0; k < 3; k++) {
      out += `<path pathLength="1" style="--k:${k}" d="${wobble(118 + k * 18, 6 + k * 4, 22 + k * 20, 112 - k * 4, r, 2.4, 6)}"/>`;
    }
    svg.innerHTML = out;
    watch(svg);
  }

  let io;
  function watch(svg) {
    if (reduceMotion || !('IntersectionObserver' in window)) { svg.classList.add('drawn'); return; }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    io.observe(svg);
  }

  /* ---------- half-erased lectures: the research as formulas on the board ---------- */
  const ATTN = '\\mathrm{Attn}(Q,K,V)=\\mathrm{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V';
  const ROPE = 'R_{\\Theta,m}=\\begin{pmatrix}\\cos m\\theta_i & -\\sin m\\theta_i\\\\ \\sin m\\theta_i & \\cos m\\theta_i\\end{pmatrix}';
  const QUANT = '\\hat{w}=s\\cdot\\mathrm{clip}\\!\\left(\\left\\lfloor \\frac{w}{s}\\right\\rceil,-8,\\,7\\right)';
  const SPEC = '\\alpha=\\min\\!\\left(1,\\ \\frac{p(x)}{q(x)}\\right)';
  const RAG = 'p(y\\mid x)=\\sum_{z\\,\\in\\,\\text{top-}k} p(z\\mid x)\\,p(y\\mid x,z)';
  const ADAM = '\\theta_{t+1}=\\theta_t-\\eta\\,\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\epsilon}';
  const SNR = '\\mathrm{SNR}=\\frac{\\lVert \\mathbb{E}[g]\\rVert}{\\sqrt{\\mathrm{Var}[g]}}';
  const BOARD = {
    top: [
      { tex: ATTN, x: 3, y: 8, r: -2, s: '2.5rem' },
      { tex: '\\nabla_{\\theta}\\,\\mathcal{L}', x: 82, y: 12, r: 6, s: '2.2rem', hide: true },
      { tex: '\\theta_i = 10000^{-2i/d}', x: 64, y: 88, r: -5, s: '1.7rem', tone: 'fresh', hide: true },
      { tex: QUANT, x: 26, y: 88, r: 2, s: '1.5rem', hide: true },
    ],
    research: [
      { tex: '\\mathcal{L}=-\\sum_i y_i \\log \\hat{y}_i', x: 66, y: 4, r: 4, s: '2.2rem' },
      { tex: '\\text{memory}\\ \\propto\\ \\text{bits}\\times N_{\\text{params}}', x: 2, y: 93, r: -3, s: '1.7rem', hide: true },
    ],
    interests: [{ tex: SPEC, x: 62, y: 6, r: -4, s: '2rem' }],
    publications: [
      { tex: '\\text{recall}\\colon\\ 1.00 \\xrightarrow{\\;87\\ \\text{heads}\\;} 0.00', x: 54, y: 2.5, r: -3, s: '1.9rem', tone: 'pink', hide: true },
      { tex: ROPE, x: 0, y: 56, r: 5, s: '2.4rem', hide: true },
    ],
    projects: [{ tex: RAG, x: 50, y: 5, r: 3, s: '1.9rem' }],
    education: [{ tex: '\\frac{\\partial \\mathcal{L}}{\\partial \\theta}', x: 78, y: 8, r: -6, s: '3rem' }],
    experience: [
      { tex: ADAM, x: 58, y: 4, r: 3, s: '1.9rem' },
      { tex: QUANT, x: 4, y: 90, r: -2, s: '1.7rem', hide: true },
    ],
    skills: [{ tex: SNR, x: 64, y: 6, r: -3, s: '2rem' }],
    contact: [{ tex: '\\exists\\, x:\\ \\text{collab}(x,\\ \\text{you})', x: 52, y: 9, r: 4, s: '2.1rem', tone: 'fresh', hide: true }],
  };

  function drawBoard() {
    const katex = window.katex;
    if (!katex) return; // the formulas are decoration; without KaTeX the board stays clean
    Object.entries(BOARD).forEach(([id, items]) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const layer = document.createElement('div');
      layer.className = 'board-layer';
      layer.setAttribute('aria-hidden', 'true');
      items.forEach((it) => {
        const el = document.createElement('div');
        el.className = 'ghost' + (it.tone ? ' ' + it.tone : '') + (it.hide ? ' hide-sm' : '');
        Object.assign(el.style, { left: it.x + '%', top: it.y + '%' });
        el.style.setProperty('--r', it.r + 'deg');
        el.style.setProperty('--s', it.s);
        try { katex.render(it.tex, el, { throwOnError: false, displayMode: false }); } catch (e) { return; }
        layer.appendChild(el);
      });
      sec.prepend(layer);
    });
  }

  /* ---------- the mad genius corrects the board: a common belief, struck out, and what the research found ---------- */
  const FIXES = {
    research: {
      wrong: '\\mathrm{INT4}\\ \\Rightarrow\\ \\mathrm{acc}\\to 0',
      right: '\\mathrm{INT4}\\colon\\ \\mathrm{mem}\\times\\tfrac{1}{4},\\ \\ \\mathrm{acc}\\approx\\checkmark',
      tr: 'YANLIŞ!', en: 'WRONG!',
    },
    interests: {
      wrong: 'T_{\\text{decode}}\\downarrow\\ \\Rightarrow\\ \\text{quality}\\downarrow',
      right: '\\text{speculative}\\colon\\ x\\sim p,\\ \\ T\\downarrow',
      tr: 'HAYIR.', en: 'NO.',
    },
    publications: {
      wrong: '\\theta_{\\mathrm{RoPE}}\\uparrow\\ \\Rightarrow\\ \\#\\,\\text{retrieval heads}\\downarrow',
      right: '\\theta\\uparrow\\ \\not\\Rightarrow\\ \\#\\,\\text{heads}\\downarrow',
      tr: 'ÇÜRÜTÜLDÜ!', en: 'REFUTED!',
    },
    projects: {
      wrong: '\\text{plateau}\\ \\Rightarrow\\ \\text{wait}',
      right: '\\text{plateau}\\ \\Rightarrow\\ \\text{diagnose, jump}\\ \\ (-25\\%\\ \\text{epochs})',
      tr: 'BEKLEME!', en: "DON'T WAIT!",
    },
  };

  // a hard, angry scribble across a formula: a zigzag and one long slash
  function strikeOut(w, h, r) {
    const zig = [];
    const n = 5;
    for (let i = 0; i <= n * 2; i++) {
      const t = i / (n * 2);
      zig.push([4 + t * (w - 8) + (r() - 0.5) * 6, (i % 2 ? h * 0.78 : h * 0.24) + (r() - 0.5) * 6]);
    }
    return [smooth(zig), wobble(2, h * 0.86, w - 2, h * 0.12, r, 2.4)];
  }

  function initFixes() {
    const katex = window.katex;
    if (!katex) return;
    Object.entries(FIXES).forEach(([id, f], idx) => {
      const head = $(`#${id} .sec-head`);
      if (!head) return;
      const box = document.createElement('div');
      box.className = 'genius-fix';
      box.setAttribute('aria-hidden', 'true');
      box.innerHTML =
        '<div class="fix-wrong"><span class="fix-tex"></span></div>' +
        `<span class="fix-no hand"><span lang="tr">${f.tr}</span><span lang="en">${f.en}</span></span>` +
        '<div class="fix-right"><span class="fix-arrow">↳</span><span class="fix-tex"></span></div>';
      try {
        katex.render(f.wrong, box.querySelector('.fix-wrong .fix-tex'), { throwOnError: false });
        katex.render(f.right, box.querySelector('.fix-right .fix-tex'), { throwOnError: false });
      } catch (e) { return; }
      head.appendChild(box);

      const go = () => {
        const wrong = box.querySelector('.fix-wrong');
        if (!wrong.querySelector('.strike')) {
          const w = wrong.offsetWidth, h = wrong.offsetHeight;
          wrong.insertAdjacentHTML('beforeend', svgFor(w, h, 'pink strike', strikeOut(w, h, rng(77 + idx))));
        }
        requestAnimationFrame(() => box.classList.add('go'));
      };
      if (reduceMotion || !('IntersectionObserver' in window)) { go(); return; }
      const fio = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { fio.disconnect(); setTimeout(go, 350); }
      }, { threshold: 0.7 });
      fio.observe(box);
    });
  }

  // the Transformer block of "Attention Is All You Need", drawn in chalk for the last board
  function drawBlock() {
    const svg = $('#t-block');
    if (!svg) return;
    svg.setAttribute('viewBox', '0 0 450 470');
    const r = rng(2017);
    const box = (x0, y0, x1, y1) =>
      wobble(x0, y0, x1, y0, r, 1.2, 5) + wobble(x1, y0, x1, y1, r, 1.2, 3).replace('M', 'L') +
      wobble(x1, y1, x0, y1, r, 1.2, 5).replace('M', 'L') + wobble(x0, y1, x0, y0 - 2, r, 1.2, 3).replace('M', 'L');
    const up = (x, y0, y1) => wobble(x, y0, x, y1, r, 0.8, 3) + `M${x - 6} ${y1 + 9}L${x} ${y1}L${x + 6} ${y1 + 9}`;
    const right = (x, y) => `M${x - 9} ${y - 6}L${x} ${y}L${x - 9} ${y + 6}`;
    const X0 = 90, X1 = 290, C = 190;
    const paths = [
      wobble(C, 436, C, 406, r, 0.8, 3),                                     // x enters, then splits into Q, K, V
      wobble(C, 406, 130, 374, r, 1, 3), wobble(C, 406, C, 374, r, 1, 3), wobble(C, 406, 250, 374, r, 1, 3),
      box(X0, 312, X1, 372),                                                 // multi-head attention
      up(C, 312, 290), box(X0, 258, X1, 290),                                // add & norm
      wobble(C, 418, 56, 418, r, 1, 4) + wobble(56, 418, 56, 274, r, 1.4, 5).replace('M', 'L') + wobble(56, 274, X0, 274, r, 0.6, 2).replace('M', 'L') + right(X0, 274),
      up(C, 258, 232), box(X0, 172, X1, 232),                                // feed forward
      up(C, 172, 150), box(X0, 118, X1, 150),                                // add & norm
      wobble(C, 245, 56, 245, r, 1, 4) + wobble(56, 245, 56, 134, r, 1.4, 4).replace('M', 'L') + wobble(56, 134, X0, 134, r, 0.6, 2).replace('M', 'L') + right(X0, 134),
      up(C, 118, 74),                                                        // out
      wobble(300, 106, 314, 106, r, 0.6, 2) + wobble(314, 106, 314, 384, r, 1.6, 6).replace('M', 'L') + wobble(314, 384, 300, 384, r, 0.6, 2).replace('M', 'L'),
    ];
    const notes = [
      wobble(352, 330, 296, 342, r, 1.4, 3) + `M305 335L296 342L306 347`,    // → attention
      wobble(352, 212, 296, 204, r, 1.4, 3) + `M306 198L296 204L305 210`,    // → feed-forward weights
    ];
    let k = 0;
    const p = (d, cls = '') => `<path pathLength="1" class="${cls}" style="--k:${k++}" d="${d}"/>`;
    svg.innerHTML =
      paths.map((d) => p(d)).join('') + notes.map((d) => p(d, 'pink')).join('') +
      '<text x="190" y="349" text-anchor="middle">Multi-Head Attention</text>' +
      '<text x="190" y="281" text-anchor="middle">Add &amp; Norm</text>' +
      '<text x="190" y="209" text-anchor="middle">Feed Forward</text>' +
      '<text x="190" y="141" text-anchor="middle">Add &amp; Norm</text>' +
      '<text class="sm" x="112" y="400">Q</text><text class="sm" x="200" y="398">K</text><text class="sm" x="258" y="400">V</text>' +
      '<text class="sm" x="190" y="455" text-anchor="middle">x</text>' +
      '<text class="sm" x="190" y="62" text-anchor="middle">softmax(·)</text>' +
      '<text class="big" x="326" y="258">N×</text>' +
      '<text class="pink" x="356" y="336" lang="tr">87 head!</text><text class="pink" x="356" y="336" lang="en">87 heads!</text>' +
      '<text class="pink" x="356" y="218">W → INT4</text>';
    svg.classList.add('scrib', 'white');
    watch(svg);
  }

  function initChalk() {
    drawBoard();
    initFixes();
    drawSlashes();
    drawBlock();
    const draw = () => drawAnchored();
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(draw);
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 200); });
    langHooks.push(() => requestAnimationFrame(draw));
  }

  /* ---------- portrait: a matrix of square pixels that assembles, then resolves into the photo ---------- */
  function initPortrait() {
    const host = $('#polaroid'), stage = $('#portrait-stage'), cv = $('#portrait-tiles'), img = $('#portrait-img');
    if (!host || !stage || !cv || !img) return;
    const ctx = cv.getContext('2d');
    let tiles = [], w = 0, h = 0, cell = 7, dpr = 1, raf = 0, t0 = 0, phase = 'intro', hovering = false;
    const mouse = { x: -1e4, y: -1e4, on: false };

    // the matrix brackets either side of the photo, in chalk
    function brackets() {
      $$('.scrib.brackets', stage).forEach((s) => s.remove());
      const W = stage.offsetWidth + 52, H = stage.offsetHeight * 0.92, r = rng(4096);
      const html = svgFor(W, H, 'white brackets', [
        wobble(20, 4, 4, 5, r, 1) + wobble(4, 5, 5, H - 5, r, 2.4, 9).replace('M', 'L') + wobble(5, H - 5, 21, H - 4, r, 1).replace('M', 'L'),
        wobble(W - 20, 4, W - 4, 5, r, 1) + wobble(W - 4, 5, W - 5, H - 5, r, 2.4, 9).replace('M', 'L') + wobble(W - 5, H - 5, W - 21, H - 4, r, 1).replace('M', 'L'),
      ]);
      stage.insertAdjacentHTML('beforeend', html);
      const svg = stage.lastElementChild;
      Object.assign(svg.style, { left: '-26px', top: '0px' });
      watch(svg);
    }

    function build() {
      w = cv.offsetWidth; h = cv.offsetHeight;
      if (!w || !h) return false;
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cell = w < 260 ? 6 : 7.5;
      const cols = Math.floor(w / cell), rows = Math.floor(h / cell);
      const oc = document.createElement('canvas');
      oc.width = cols; oc.height = rows;
      const o = oc.getContext('2d', { willReadFrequently: true });
      o.drawImage(img, 0, 0, cols, rows);
      let d;
      try { d = o.getImageData(0, 0, cols, rows).data; } catch (e) { return false; }
      const r = rng(959);
      tiles = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4, a = d[i + 3];
          if (a < 110) continue;
          const ang = r() * TAU, rr = w * (0.6 + r() * 0.7);
          tiles.push({
            tx: x * cell, ty: y * cell, x: x * cell, y: y * cell, vx: 0, vy: 0,
            sx: w / 2 + Math.cos(ang) * rr, sy: h * 0.4 + Math.sin(ang) * rr,
            c: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`, a: a / 255,
            dl: (y / rows) * 0.6 + r() * 0.35,
          });
        }
      }
      return tiles.length > 0;
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const s = cell - 1; // the 1px gap is what makes it read as a grid of squares
      for (const t of tiles) {
        ctx.globalAlpha = t.a;
        ctx.fillStyle = t.c;
        ctx.fillRect(t.x, t.y, s, s);
      }
      ctx.globalAlpha = 1;
    }

    function tick(now) {
      if (phase === 'intro') {
        if (!t0) t0 = now;
        const t = (now - t0) / 1000;
        let done = true;
        for (const p of tiles) {
          let k = (t - p.dl) / 1.2;
          if (k < 1) done = false;
          k = Math.max(0, Math.min(1, k));
          const e = 1 - Math.pow(1 - k, 4);
          p.x = p.sx + (p.tx - p.sx) * e;
          p.y = p.sy + (p.ty - p.sy) * e;
        }
        draw();
        if (done) {
          phase = 'live';
          setTimeout(() => { if (!hovering) showPhoto(true); }, 600);
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      const R = 46, R2 = R * R;
      let moving = false;
      for (const p of tiles) {
        let fx = (p.tx - p.x) * 0.075, fy = (p.ty - p.y) * 0.075;
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / R) * 3.6;
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

    function start() {
      brackets();
      if (!build()) { host.classList.add('no-tiles'); return; }
      if (reduceMotion) { phase = 'live'; draw(); showPhoto(true); }
      else wake();

      stage.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || phase !== 'live') return;
        hovering = true;
        showPhoto(false);
      });
      stage.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * w;
        mouse.y = ((e.clientY - r.top) / r.height) * h;
        mouse.on = true;
        if (phase === 'live') wake();
      });
      stage.addEventListener('pointerleave', (e) => {
        mouse.on = false;
        if (e.pointerType === 'mouse') { hovering = false; if (phase === 'live') showPhoto(true); }
      });
      stage.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse' || phase !== 'live') return;
        showPhoto(!host.classList.contains('show-photo'));
      });

      let rt;
      addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          brackets();
          if (phase === 'live' && build()) draw();
        }, 180);
      });
    }

    if (img.complete && img.naturalWidth) start();
    else {
      img.addEventListener('load', start, { once: true });
      img.addEventListener('error', () => host.classList.add('no-tiles'), { once: true });
    }
  }

  /* ---------- fig. II: retrieval-head masking ---------- */
  function initRopeFigure() {
    const fig = $('#fig-rope');
    if (!fig) return;
    const grid = $('#head-grid'), strip = $('#dims-strip'), num = $('#recall-num'), bar = $('#recall-bar');
    const rnd = rng(2606212);

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
        c.style.setProperty('--a', (0.05 + rnd() * 0.18).toFixed(3));
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
      c.style.setProperty('--a', (0.75 - (i / 127) * 0.5).toFixed(3));
      if (i >= 96) { c.className = 'low'; c.style.setProperty('--dl', ((127 - i) * 0.012).toFixed(3) + 's'); }
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
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target, to = +el.dataset.to;
        let t0 = 0;
        const step = (t) => {
          if (!t0) t0 = t;
          const k = Math.min(1, (t - t0) / 1600);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    $$('.count').forEach((el) => { el.textContent = '0'; cio.observe(el); });
  }

  /* ---------- formula strip ---------- */
  function initMarquee() {
    const track = $('.marquee-track'), list = $('.marquee-list');
    if (track && list) track.appendChild(list.cloneNode(true));
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

  /* ---------- easter egg: type "bjk" or "1903" (or long-press the polaroid) ---------- */
  function initEgg() {
    const egg = $('#egg'), photo = $('#polaroid');
    if (!egg) return;
    const open = () => {
      egg.hidden = false;
      egg.classList.remove('on');
      requestAnimationFrame(() => requestAnimationFrame(() => egg.classList.add('on')));
    };
    const close = () => { egg.hidden = true; egg.classList.remove('on'); };

    let typed = '';
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed.endsWith('bjk') || typed === '1903') { typed = ''; open(); }
    });
    egg.addEventListener('click', close);

    if (photo) {
      let hold = 0;
      photo.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        clearTimeout(hold);
        hold = setTimeout(open, 650);
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => photo.addEventListener(t, () => clearTimeout(hold)));
      photo.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  /* ---------- mad genius mode: 3 a.m., and the whole board fills with obsession ---------- */
  const MAD_TEX = [
    ATTN, ROPE, QUANT, SPEC, RAG, ADAM, SNR,
    'e^{i\\pi}+1=0', '\\nabla_{\\theta}\\mathcal{L}', '\\mathrm{KL}(p\\,\\Vert\\,q)', 'P \\overset{?}{=} NP',
    '\\int_0^{\\infty} e^{-x^2}\\,dx=\\tfrac{\\sqrt{\\pi}}{2}', '\\det(A-\\lambda I)=0', '\\mathbb{E}[\\hat g]=g',
    '\\frac{1}{\\sqrt{d_k}}', '2^{4}=16', '\\lim_{n\\to\\infty}', '87\\,?', '\\theta_i=10000^{-2i/d}',
  ];
  const MAD_NOTES = [
    ['NEDEN?!', 'WHY?!'], ['hayır hayır hayır', 'no no no'], ['tekrar dene', 'try again'], ['!!!', '!!!'], ['?!', '?!'],
    ['kanıtla', 'prove it'], ['bu çalışmaz', "this can't work"], ['≈ ama neden?', '≈ but why?'], ['head 87 ?', 'head 87 ?'],
    ['INT4 yeter mi?', 'is INT4 enough?'], ['sıfıra bölme!', "don't divide by zero!"], ['uyu artık', 'go to sleep'],
  ];

  function madMark(r) {
    const el = document.createElement('div');
    el.className = 'mad-item';
    Object.assign(el.style, { left: (r() * 88).toFixed(1) + '%', top: (r() * 94).toFixed(1) + '%' });
    el.style.setProperty('--r', ((r() - 0.5) * 24).toFixed(1) + 'deg');
    const tone = ['white', 'white', 'yellow', 'pink'][(r() * 4) | 0];
    const kind = r();
    if (kind < 0.42 && window.katex) {
      el.classList.add('mad-tex', tone);
      el.style.setProperty('--s', (1.1 + r() * 1.4).toFixed(2) + 'rem');
      try { window.katex.render(MAD_TEX[(r() * MAD_TEX.length) | 0], el, { throwOnError: false }); } catch (e) { /* skip */ }
    } else if (kind < 0.64) {
      const [tr, en] = MAD_NOTES[(r() * MAD_NOTES.length) | 0];
      el.classList.add('mad-note', 'hand', r() < 0.6 ? 'pink' : 'yellow');
      el.style.setProperty('--s', (1.4 + r() * 1.3).toFixed(2) + 'rem');
      el.innerHTML = `<span lang="tr">${tr}</span><span lang="en">${en}</span>`;
    } else {
      const w = 60 + r() * 170, h = 40 + r() * 120, t = r();
      let paths;
      if (t < 0.3) paths = [loop(w / 2, h / 2, w / 2 - 4, h / 2 - 4, r)];
      else if (t < 0.55) paths = [wobble(4, h - 6, w - 10, 8, r, 3), wobble(w - 10, 8, w - 28, 12, r, 1, 2), wobble(w - 10, 8, w - 16, 26, r, 1, 2)];
      else if (t < 0.75) {
        const pts = [];
        for (let i = 0; i <= 8; i++) pts.push([4 + (i / 8) * (w - 8), (i % 2 ? h * 0.8 : h * 0.2)]);
        paths = [smooth(pts)];
      } else {
        paths = [0, 1, 2, 3].map((k) => wobble(8 + k * 14, 6, 10 + k * 14, h - 6, r, 1.2, 3));
        paths.push(wobble(2, h * 0.75, 12 + 3 * 14 + 8, h * 0.25, r, 1.2, 3));
      }
      el.classList.add('mad-svg');
      el.innerHTML = svgFor(w, h, tone, paths);
    }
    return el;
  }

  function initMadMode() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mad-toggle';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Deli dâhi modu / Mad genius mode');
    btn.innerHTML = '<span class="mad-ico chalk" aria-hidden="true">∞</span>' +
      '<span class="mad-label hand" aria-hidden="true"><span lang="tr">deli dâhi modu</span><span lang="en">mad genius mode</span></span>';
    const clock = document.createElement('div');
    clock.className = 'mad-clock hand chalk';
    clock.setAttribute('aria-hidden', 'true');
    clock.textContent = '03:00';
    document.body.append(btn, clock);

    let on = false, layers = [], timers = [];
    // the motto unfolds with the mode; when it sits above the reader it opens at once, and the page holds still
    function setMad(v) {
      const m = $('.motto');
      if (!m || m.getBoundingClientRect().top >= 0) { root.classList.toggle('mad', v); return; }
      const h0 = m.offsetHeight, still = [root.style, document.body.style];
      m.style.transition = 'none';
      still.forEach((s) => { s.overflowAnchor = 'none'; s.scrollBehavior = 'auto'; });
      root.classList.toggle('mad', v);
      scrollBy(0, m.offsetHeight - h0);
      requestAnimationFrame(() => {
        m.style.transition = '';
        still.forEach((s) => { s.overflowAnchor = s.scrollBehavior = ''; });
      });
    }
    function start() {
      on = true;
      setMad(true);
      $$('.motto .scrib.anchored').forEach(watch);
      btn.setAttribute('aria-pressed', 'true');
      if (!reduceMotion && $('main').animate) {
        $('main').animate(
          [{ transform: 'none' }, { transform: 'translate(-7px, 3px) rotate(-0.4deg)' }, { transform: 'translate(6px, -4px) rotate(0.3deg)' }, { transform: 'translate(-3px, 2px)' }, { transform: 'none' }],
          { duration: 420, easing: 'ease-out' });
      }
      const r = rng((Date.now() & 0xffff) + 1);
      const vh = innerHeight;
      $$('main .chapter:not(.motto)').forEach((sec) => {
        const layer = document.createElement('div');
        layer.className = 'mad-layer';
        layer.setAttribute('aria-hidden', 'true');
        sec.prepend(layer);
        layers.push(layer);
        const box = sec.getBoundingClientRect(), near = box.bottom > -200 && box.top < vh + 200;
        const dense = innerWidth < 640 ? 0.5 : 1; // a phone screen fills up twice as fast
        const n = Math.round((sec.classList.contains('hero') ? 20 : 10 + sec.offsetHeight / 220) * dense);
        for (let i = 0; i < n; i++) {
          const delay = (near ? 0 : 500) + i * (near ? 85 : 30) + r() * 60;
          timers.push(setTimeout(() => {
            const el = madMark(r);
            layer.appendChild(el);
            requestAnimationFrame(() => requestAnimationFrame(() => {
              el.classList.add('on');
              el.querySelectorAll('.scrib').forEach((s) => s.classList.add('drawn'));
            }));
          }, reduceMotion ? 0 : delay));
        }
      });
    }
    function stop() {
      on = false;
      setMad(false);
      $$('.motto .scrib.anchored').forEach((s) => s.classList.remove('drawn'));
      btn.setAttribute('aria-pressed', 'false');
      timers.forEach(clearTimeout);
      timers = [];
      layers.forEach((l) => { l.classList.add('erase'); setTimeout(() => l.remove(), 1000); });
      layers = [];
    }
    btn.addEventListener('click', () => (on ? stop() : start()));
  }

  /* ---------- boot ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  initLang();
  initNav();
  initHeroText();
  initReveal();
  initChalk();
  initPortrait();
  initRopeFigure();
  initCounters();
  initMarquee();
  initCopy();
  initEgg();
  initMadMode();
})();
