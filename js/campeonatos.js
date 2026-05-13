/* ─── LOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.body.style.cursor = 'none';
    startAnimations();
  }, 1600);
});

/* ─── CURSOR ─── */
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animCursor() {
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();
document.querySelectorAll('a, button, .sport-card, .academy-card, .champ-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.transform = 'translate(-50%,-50%) scale(2)'; ring.style.opacity = '.3'; });
  el.addEventListener('mouseleave', () => { ring.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '.6'; });
});

document.querySelectorAll('.champ-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

/* ─── NAV SCROLL ─── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── MOBILE MENU ─── */
function openMobile() { document.getElementById('mobileMenu').classList.add('open'); }
function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }

/* ─── REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .1 });
revealEls.forEach(el => io.observe(el));

/* ─── COUNTER ─── */
function counter(el, target, suffix = '') {
  let start = 0; const step = target / 60;
  const t = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target + suffix; clearInterval(t); return; }
    el.textContent = Math.floor(start) + suffix;
  }, 16);
}
const statsIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      counter(document.getElementById('s1'), 3, '');
      counter(document.getElementById('s2'), 240, '');
      counter(document.getElementById('s3'), 10200, '');
      counter(document.getElementById('s4'), 5, '');
      statsIO.disconnect();
    }
  });
}, { threshold: .3 });
statsIO.observe(document.querySelector('.stats-bar'));

/* ─── 3D BACKGROUND CANVAS (floating particles + grid) ─── */
function startAnimations() {
  const canvas = document.getElementById('canvas3d');
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });

  const PARTICLES = 80;
  const particles = Array.from({length: PARTICLES}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.5 + .5,
    opacity: Math.random() * .5 + .1,
    red: Math.random() > .85
  }));

  let mouseX = W/2, mouseY = H/2;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function drawGrid(t) {
    // perspective grid
    const vanishX = mouseX, vanishY = H * .55;
    const lines = 20;
    ctx.save();
    for(let i = 0; i <= lines; i++) {
      const x = (W / lines) * i;
      const alpha = .02 + .015 * Math.sin(t*.0005 + i*.3);
      ctx.strokeStyle = `rgba(200,16,46,${alpha})`;
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(vanishX + (x - W/2) * .1, vanishY);
      ctx.stroke();
    }
    const hlines = 10;
    for(let j = 0; j <= hlines; j++) {
      const progress = j / hlines;
      const y = vanishY + (H - vanishY) * progress;
      const spread = (y - vanishY) / (H - vanishY);
      const alpha = .015 + .01 * Math.sin(t*.0008 + j*.5);
      ctx.strokeStyle = `rgba(200,16,46,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(vanishX - W * .6 * spread, y);
      ctx.lineTo(vanishX + W * .6 * spread, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles(t) {
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
      if(p.y < 0) p.y = H; if(p.y > H) p.y = 0;
      const dx = mouseX - p.x, dy = mouseY - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 150) { p.x -= dx * .002; p.y -= dy * .002; }
      const glow = p.red ? `rgba(200,16,46,${p.opacity})` : `rgba(240,237,232,${p.opacity * .4})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = glow;
      if(p.red) { ctx.shadowBlur = 8; ctx.shadowColor = '#c8102e'; }
      ctx.fill();
      ctx.shadowBlur = 0;
      // lines between nearby particles
      for(let j = i+1; j < particles.length; j++) {
        const q = particles[j];
        const dx2 = p.x - q.x, dy2 = p.y - q.y;
        const d2 = Math.sqrt(dx2*dx2 + dy2*dy2);
        if(d2 < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(200,16,46,${.06 * (1 - d2/100)})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    });
  }

  function loop(t) {
    ctx.clearRect(0, 0, W, H);
    drawGrid(t);
    drawParticles(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ─── 3D BELT CANVAS ─── */
/* ─── 3D BELT CANVAS ─── */
(function() {
  const canvas = document.getElementById('belt-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  function drawBelt(time) {
    ctx.clearRect(0, 0, W, H);
    const wave = Math.sin(time * .025) * 12;
    const wave2 = Math.sin(time * .018 + 1) * 8;
    const cx = W/2, cy = H/2;
    const bH = 80, segW = W * .85;

    // Belt shadow
    ctx.save();
    ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(200,16,46,0.4)';
    ctx.shadowOffsetY = 15;

    // Belt main body with wave
    ctx.beginPath();
    ctx.moveTo(cx - segW/2, cy - bH/2 + wave);
    // top edge with curve
    ctx.bezierCurveTo(
      cx - segW/4, cy - bH/2 + wave2,
      cx + segW/4, cy - bH/2 - wave2,
      cx + segW/2, cy - bH/2 + wave
    );
    // right edge
    ctx.lineTo(cx + segW/2, cy + bH/2 + wave);
    // bottom edge
    ctx.bezierCurveTo(
      cx + segW/4, cy + bH/2 - wave2,
      cx - segW/4, cy + bH/2 + wave2,
      cx - segW/2, cy + bH/2 + wave
    );
    ctx.closePath();

    // Belt gradient
    const bGrad = ctx.createLinearGradient(cx, cy - bH/2, cx, cy + bH/2);
    bGrad.addColorStop(0, '#e8e4df');
    bGrad.addColorStop(.2, '#ffffff');
    bGrad.addColorStop(.5, '#f0ece6');
    bGrad.addColorStop(.8, '#d8d4cf');
    bGrad.addColorStop(1, '#c0bcb6');
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.restore();

    // Belt stitching lines
    ctx.save();
    ctx.strokeStyle = 'rgba(180,176,170,0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    // top stitch
    ctx.beginPath();
    ctx.moveTo(cx - segW/2 + 20, cy - bH/2 + 10 + wave);
    ctx.bezierCurveTo(
      cx - segW/4 + 20, cy - bH/2 + 10 + wave2,
      cx + segW/4 - 20, cy - bH/2 + 10 - wave2,
      cx + segW/2 - 20, cy - bH/2 + 10 + wave
    );
    ctx.stroke();
    // bottom stitch
    ctx.beginPath();
    ctx.moveTo(cx - segW/2 + 20, cy + bH/2 - 10 + wave);
    ctx.bezierCurveTo(
      cx - segW/4 + 20, cy + bH/2 - 10 + wave2,
      cx + segW/4 - 20, cy + bH/2 - 10 - wave2,
      cx + segW/2 - 20, cy + bH/2 - 10 + wave
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Center knot area
    const kW = 90, kH = bH + 20;
    ctx.save();
    ctx.translate(cx, cy + wave * .5);
    const kGrad = ctx.createLinearGradient(-kW/2, -kH/2, kW/2, kH/2);
    kGrad.addColorStop(0, '#ddd9d4');
    kGrad.addColorStop(.5, '#f5f1ec');
    kGrad.addColorStop(1, '#ccc8c2');
    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.roundRect(-kW/2, -kH/2, kW, kH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,146,140,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // knot lines
    ctx.strokeStyle = 'rgba(150,146,140,0.4)';
    ctx.lineWidth = 1;
    for(let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-kW/2+10, i*12);
      ctx.lineTo(kW/2-10, i*12);
      ctx.stroke();
    }
    ctx.restore();

    // BLACK TIP (right end) with 2 graus
    ctx.save();
    const tipX = cx + segW/2 - 70, tipW = 70;
    const tipYTop = cy - bH/2 + wave;
    const tipYBot = cy + bH/2 + wave;
    ctx.beginPath();
    ctx.moveTo(tipX, tipYTop);
    ctx.lineTo(tipX + tipW, tipYTop);
    ctx.lineTo(tipX + tipW, tipYBot);
    ctx.lineTo(tipX, tipYBot);
    ctx.closePath();
    const tipGrad = ctx.createLinearGradient(tipX, 0, tipX + tipW, 0);
    tipGrad.addColorStop(0, '#111111');
    tipGrad.addColorStop(.5, '#1e1e1e');
    tipGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = tipGrad;
    ctx.fill();
    // Tip shine
    const tipShine = ctx.createLinearGradient(tipX, tipYTop, tipX, cy);
    tipShine.addColorStop(0, 'rgba(255,255,255,0.08)');
    tipShine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = tipShine;
    ctx.fill();

    ctx.restore();

    // Belt glow effect
    ctx.save();
    ctx.shadowBlur = 30; ctx.shadowColor = 'rgba(255,255,255,0.15)';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - segW/2, cy - bH/2 + wave);
    ctx.bezierCurveTo(cx - segW/4, cy - bH/2 + wave2, cx + segW/4, cy - bH/2 - wave2, cx + segW/2, cy - bH/2 + wave);
    ctx.stroke();
    ctx.restore();

    // Vertical bars on belt (texture)
    ctx.save();
    ctx.globalAlpha = 0.04;
    for(let x = cx - segW/2 + 40; x < cx + segW/2 - 40; x += 18) {
      if(Math.abs(x - cx) < 60) continue;
      ctx.beginPath();
      ctx.moveTo(x, cy - bH/2 + wave * .3);
      ctx.lineTo(x, cy + bH/2 + wave * .3);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 8;
      ctx.stroke();
    }
    ctx.restore();

    // Label text on belt - REMOVED
  }

  function loop() {
    t++;
    drawBelt(t);
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ─── HERO CAROUSEL ─── */
(function() {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;

  const dotsContainer = document.getElementById('carouselDots');
  let currentSlide = 0;
  let autoplayTimer;
  const INTERVAL = 4000;

  function getSlides() { return carousel.querySelectorAll('.carousel-slide'); }

  function goTo(index) {
    const slides = getSlides();
    if (slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    dotsContainer.querySelectorAll('.dot')[currentSlide]?.classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dotsContainer.querySelectorAll('.dot')[currentSlide]?.classList.add('active');
  }

  function buildDots() {
    const slides = getSlides();
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.dataset.index = i;
      d.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsContainer.appendChild(d);
    });
  }

  function resetTimer() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goTo(currentSlide + 1), INTERVAL);
  }

  buildDots();
  resetTimer();
})();
