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
document.querySelectorAll('a, button, .sport-card, .academy-card, .service-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(2)';
    ring.style.opacity = '.3';
    cur.classList.add('clickable');
  });
  el.addEventListener('mouseleave', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.opacity = '.6';
    cur.classList.remove('clickable');
  });
});

/* ─── SERVICE CARDS FLIP ─── */
document.querySelectorAll('.service-card').forEach(card => {
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
      counter(document.getElementById('s2'), "+" + 200, '');
      counter(document.getElementById('s3'), "+" + 10000, '');
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

/* ─── 3D BELT THREE.JS ─── */
(function() {
  const container = document.getElementById('belt-canvas');
  if(!container) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  scene.add(directionalLight);

  // Additional point light for better belt visibility
  const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
  pointLight.position.set(-3, 3, 3);
  pointLight.castShadow = true;
  scene.add(pointLight);

  // Spotlight for realistic illumination
  const spotLight = new THREE.SpotLight(0xffffff, 1.0);
  spotLight.position.set(0, 5, 0);
  spotLight.target.position.set(0, 0, 0);
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 0.1;
  spotLight.decay = 2;
  spotLight.distance = 20;
  spotLight.castShadow = true;
  scene.add(spotLight);
  scene.add(spotLight.target);

  // Ground plane for shadows
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -2;
  plane.receiveShadow = true;
  scene.add(plane);

  // Mouse interaction
  let isHovering = false;
  let mouseX = 0, mouseY = 0;

  container.addEventListener('mouseenter', () => { isHovering = true; });
  container.addEventListener('mouseleave', () => { isHovering = false; });
  container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  });

  // GLTF Loader
  const loader = new THREE.GLTFLoader();
  let beltModel;

  loader.load(
    'faixa branca.glb',
    function (gltf) {
      beltModel = gltf.scene;
      beltModel.scale.set(2, 2, 2);
      beltModel.position.set(0, 0, 0);
      beltModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(beltModel);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error('An error happened', error);
    }
  );

  // Camera position
  camera.position.z = 5;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    if (beltModel) {
      // Floating animation
      beltModel.position.y = Math.sin(Date.now() * 0.001) * 0.1;

      // Mouse rotation when hovering
      if (isHovering) {
        beltModel.rotation.y = mouseX * Math.PI * 0.5;
        beltModel.rotation.x = mouseY * Math.PI * 0.2;
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  // Handle resize
  window.addEventListener('resize', function() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
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

  function renderSlides(media) {
    if (!Array.isArray(media) || media.length === 0) return;

    carousel.innerHTML = media
      .filter(item => item.resourceType === 'image')
      .map((item, index) => `
        <div class="carousel-slide${index === 0 ? ' active' : ''}">
          <img src="${item.url}" alt="${item.alt || item.title || 'Mateus Pozzebon'}" class="hero-photo" />
        </div>
      `)
      .join('');

    currentSlide = 0;
  }

  async function loadSlidesFromApi() {
    try {
      const response = await fetch('/api/media?placement=hero-carousel&resourceType=image');
      if (!response.ok) return;
      const media = await response.json();
      renderSlides(media);
    } catch (_error) {
      // Mantém o carrossel estático quando a API não estiver disponível.
    }
  }

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

  loadSlidesFromApi().finally(() => {
    buildDots();
    resetTimer();
  });
})();
