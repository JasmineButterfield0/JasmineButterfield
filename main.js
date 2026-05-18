'use strict';

/* ================================
   PARTICLE NETWORK (HERO CANVAS)
   ================================ */
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }

  reset(random = false) {
    this.x = random ? Math.random() * this.canvas.width : Math.random() > .5 ? 0 : this.canvas.width;
    this.y = random ? Math.random() * this.canvas.height : Math.random() * this.canvas.height;
    this.vx = (Math.random() - .5) * .6;
    this.vy = (Math.random() - .5) * .6;
    this.size = Math.random() * 2.5 + 1;
    this.base_vx = this.vx;
    this.base_vy = this.vy;
    this.hue = Math.random() > .5 ? '108,99,255' : '0,149,204';
    this.opacity = Math.random() * .5 + .3;
  }

  update(mouse) {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 110) {
      const force = (110 - dist) / 110;
      this.vx += (dx / dist) * force * .6;
      this.vy += (dy / dist) * force * .6;
    }

    this.vx = this.vx * .97 + this.base_vx * .03;
    this.vy = this.vy * .97 + this.base_vy * .03;

    this.vx = Math.max(-2, Math.min(2, this.vx));
    this.vy = Math.max(-2, Math.min(2, this.vy));

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -20) this.x = this.canvas.width + 20;
    if (this.x > this.canvas.width + 20) this.x = -20;
    if (this.y < -20) this.y = this.canvas.height + 20;
    if (this.y > this.canvas.height + 20) this.y = -20;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.hue},${this.opacity})`;
    ctx.fill();
  }
}

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.raf = null;
    this.resize();
    this.build();
    this.bindEvents();
    this.tick();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  build() {
    const n = Math.max(40, Math.floor((this.canvas.width * this.canvas.height) / 14000));
    this.particles = Array.from({ length: n }, () => new Particle(this.canvas));
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.build(); });
    window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { this.mouse.x = -9999; this.mouse.y = -9999; });
  }

  drawEdges() {
    const ctx = this.ctx;
    const pts = this.particles;
    const maxD = 140;

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < maxD) {
          const alpha = (1 - d / maxD) * .45;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
          ctx.lineWidth = .8;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
  }

  tick() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => { p.update(this.mouse); p.draw(this.ctx); });
    this.drawEdges();
    this.raf = requestAnimationFrame(() => this.tick());
  }
}

/* ================================
   CUSTOM CURSOR
   ================================ */
class Cursor {
  constructor() {
    this.el = document.getElementById('cursor');
    this.trail = document.getElementById('cursorTrail');
    this.tx = 0; this.ty = 0;
    this.cx = 0; this.cy = 0;
    this.moving = false;
    this.bind();
    this.animate();
  }

  bind() {
    document.addEventListener('mousemove', e => {
      this.cx = e.clientX; this.cy = e.clientY;
      this.el.style.left = e.clientX + 'px';
      this.el.style.top  = e.clientY + 'px';
    });
    document.addEventListener('mousedown', () => this.el.classList.add('grow'));
    document.addEventListener('mouseup',   () => this.el.classList.remove('grow'));

    document.querySelectorAll('a,button,.project-card,.stat-card,.tech-tag').forEach(el => {
      el.addEventListener('mouseenter', () => this.el.classList.add('grow'));
      el.addEventListener('mouseleave', () => this.el.classList.remove('grow'));
    });
  }

  animate() {
    this.tx += (this.cx - this.tx) * .11;
    this.ty += (this.cy - this.ty) * .11;
    this.trail.style.left = this.tx + 'px';
    this.trail.style.top  = this.ty + 'px';
    requestAnimationFrame(() => this.animate());
  }
}

/* ================================
   TYPEWRITER
   ================================ */
class Typewriter {
  constructor(el, words, { typeSpeed = 80, deleteSpeed = 45, pauseMs = 2200 } = {}) {
    this.el = el;
    this.words = words;
    this.ts = typeSpeed;
    this.ds = deleteSpeed;
    this.pause = pauseMs;
    this.wi = 0; this.ci = 0; this.deleting = false;
    this.run();
  }

  run() {
    const word = this.words[this.wi];

    if (!this.deleting) {
      this.el.textContent = word.slice(0, ++this.ci);
      if (this.ci === word.length) {
        this.deleting = true;
        return setTimeout(() => this.run(), this.pause);
      }
    } else {
      this.el.textContent = word.slice(0, --this.ci);
      if (this.ci === 0) {
        this.deleting = false;
        this.wi = (this.wi + 1) % this.words.length;
        return setTimeout(() => this.run(), 420);
      }
    }

    setTimeout(() => this.run(), this.deleting ? this.ds : this.ts);
  }
}

/* ================================
   ANIMATED CODE SNIPPET
   ================================ */
const CODE_HTML = `<span class="kw">const</span> developer <span class="pn">=</span> {
  <span class="prop">name</span><span class="pn">:</span>    <span class="str">"Jasmine Butterfield"</span>,
  <span class="prop">school</span><span class="pn">:</span>  <span class="str">"University of Central Florida - Class of 2026"</span>,
  <span class="prop">B.A. Degree </span><span class="pn">:</span>  <span class="str">"Digital Media - Web &amp; Social Platforms, CS Minor"</span>,

  <span class="prop">web</span><span class="pn">:</span>     [<span class="str">"HTML"</span>, <span class="str">"CSS"</span>, <span class="str">"JavaScript"</span>, <span class="str">"PHP"</span>],
  <span class="prop">code</span><span class="pn">:</span>    [<span class="str">"Java"</span>, <span class="str">"Python"</span>, <span class="str">"C"</span>, <span class="str">"C++"</span>],
  <span class="prop">design</span><span class="pn">:</span>  [<span class="str">"Photoshop"</span>, <span class="str">"Maya"</span>, <span class="str">"Unity"</span>],

  UCF Scholars Award (Academic Excellence)

  <span class="prop">projects</span><span class="pn">:</span> <span class="fn">21</span>,
  <span class="prop">honors</span><span class="pn">:</span>   <span class="str">"Dean's List - 10x Recipient"</span>,
  <span class="prop">awards</span><span class="pn">:</span>   <span class="str">" UCF Scholars Award for Academic Excellence - 2x Recipient "</span>,
  <span class="prop">openTo</span><span class="pn">:</span>   [<span class="str">"internships"</span>, <span class="str">"full-time"</span>],
  <span class="prop">passion</span><span class="pn">:</span>  <span class="str">"crafting experiences ✦"</span>,
}<span class="pn">;</span>`;

function typeCode(el, html) {
  const stripped = html.replace(/<[^>]*>/g, '');
  let charIdx = 0;

  function htmlUpToChar(count) {
    let visible = 0, i = 0;
    while (i < html.length && visible < count) {
      if (html[i] === '<') {
        while (i < html.length && html[i] !== '>') i++;
        i++;
      } else {
        visible++; i++;
      }
    }
    return html.slice(0, i);
  }

  function step() {
    el.innerHTML = htmlUpToChar(charIdx);
    if (charIdx <= stripped.length) {
      charIdx++;
      setTimeout(step, 22);
    }
  }

  setTimeout(step, 800);
}

/* ================================
   COUNTER ANIMATION
   ================================ */
function animateCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = target.toLocaleString();
  }

  requestAnimationFrame(frame);
}

/* ================================
   INTERSECTION OBSERVER SETUP
   ================================ */
function setupObservers() {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: .15 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Counters
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const num = e.target.querySelector('.stat-number');
        if (num) animateCounter(num);
      }
    });
  }, { threshold: .4 });

  document.querySelectorAll('.stat-card').forEach(el => counterObs.observe(el));

  // Skill bars
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(fill => {
          fill.style.width = fill.dataset.width + '%';
        });
      }
    });
  }, { threshold: .3 });

  document.querySelectorAll('.skills-category').forEach(el => skillObs.observe(el));
}

/* ================================
   3-D CARD TILT
   ================================ */
function setupTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ================================
   NAVIGATION
   ================================ */
function setupNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ================================
   TECH TAGS
   ================================ */
const TECH_LIST = [
  'HTML5','CSS3','JavaScript','PHP','SQL',
  'XML','Java','Python','C','C++',
  'Adobe Photoshop','Adobe InDesign','Autodesk Maya','Unity','Visual Studio Code',
  'localStorage API','Netlify','Git','3D Modelling','Daminion DAM',
  'Metadata Systems','UI Design','Photo Restoration','Client-Side Scripting','Web Design',
];

function renderTechTags() {
  const el = document.getElementById('techTags');
  el.innerHTML = TECH_LIST.map(t =>
    `<div class="tech-tag"><div class="tech-dot"></div>${t}</div>`
  ).join('');
}

/* ================================
   CONTACT FORM
   ================================ */
function setupForm() {
  const form = document.getElementById('contactForm');
  const btn  = document.getElementById('submitBtn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1600));

    btn.querySelector('span').textContent = 'Message Sent!';
    btn.style.background = 'linear-gradient(135deg,#28c840,#00d4ff)';

    setTimeout(() => {
      btn.querySelector('span').textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3200);
  });
}

/* ================================
   INIT
   ================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Canvas
  new ParticleSystem(document.getElementById('heroCanvas'));

  // Cursor (pointer device only)
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.body.style.cursor = 'none';
    new Cursor();
  } else {
    document.getElementById('cursor').style.display = 'none';
    document.getElementById('cursorTrail').style.display = 'none';
  }

  // Typewriter
  new Typewriter(document.getElementById('typewriter'), [
    'web experiences',
    'interactive apps',
    'immersive 3D worlds',
    'digital designs',
    'things people love',
  ]);

  // Code animation
  typeCode(document.getElementById('codeSnippet'), CODE_HTML);

  // Everything else
  renderTechTags();
  setupNav();
  setupTilt();
  setupForm();
  setupObservers();
});
