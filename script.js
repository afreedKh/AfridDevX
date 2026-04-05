
// ── Cursor ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; cursor.style.left = mouseX+'px'; cursor.style.top = mouseY+'px'; });
function animateRing() { ringX += (mouseX - ringX) * 0.12; ringY += (mouseY - ringY) * 0.12; ring.style.left = ringX+'px'; ring.style.top = ringY+'px'; requestAnimationFrame(animateRing); }
animateRing();

// ── Navbar scroll ──
window.addEventListener('scroll', () => { document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20); });

// ── Three.js hero background ──
(function() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const w = canvas.parentElement.offsetWidth, h = canvas.parentElement.offsetHeight;
  renderer.setSize(w, h);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 100);
  camera.position.z = 5;

  // Particles
  const count = 800;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0x2A446B, size: 0.04, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Floating geometric shapes
  const shapes = [];
  const shapeGeos = [
    new THREE.OctahedronGeometry(0.4),
    new THREE.TetrahedronGeometry(0.35),
    new THREE.OctahedronGeometry(0.3),
    new THREE.TetrahedronGeometry(0.25),
    new THREE.OctahedronGeometry(0.2),
  ];
  shapeGeos.forEach((g, i) => {
    const m = new THREE.MeshBasicMaterial({ color: 0x2A446B, wireframe: true, transparent: true, opacity: 0.12 });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set((Math.random()-0.5)*14, (Math.random()-0.5)*8, (Math.random()-0.5)*4 - 2);
    mesh.userData = { vx: (Math.random()-0.5)*0.003, vy: (Math.random()-0.5)*0.003, rx: Math.random()*0.005, ry: Math.random()*0.005 };
    scene.add(mesh); shapes.push(mesh);
  });

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = (e.clientX/window.innerWidth - 0.5)*0.3; my = (e.clientY/window.innerHeight - 0.5)*0.15; });

  function tick() {
    requestAnimationFrame(tick);
    particles.rotation.y += 0.0004;
    particles.rotation.x += 0.0002;
    camera.position.x += (mx - camera.position.x) * 0.05;
    camera.position.y += (-my - camera.position.y) * 0.05;
    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.x += s.userData.vx;
      s.position.y += s.userData.vy;
      if (Math.abs(s.position.x) > 8) s.userData.vx *= -1;
      if (Math.abs(s.position.y) > 5) s.userData.vy *= -1;
    });
    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    const nw = canvas.parentElement.offsetWidth, nh = canvas.parentElement.offsetHeight;
    camera.aspect = nw/nh; camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
})();

// ── 3D Tilt Card ──
const tiltCard = document.getElementById('tiltCard');
if (tiltCard) {
  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', e => {
    const rect = tiltCard.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    const rx = (e.clientY - cy) / 18, ry = -(e.clientX - cx) / 18;
    tiltCard.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
  });
  hero.addEventListener('mouseleave', () => { tiltCard.style.transform = ''; });
}

// ── Scroll Reveal ──
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), 80);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => io.observe(el));

// ── Stagger reveals in same parent ──
document.querySelectorAll('.services-grid, .projects-grid, .testimonials-grid, .process-steps').forEach(grid => {
  Array.from(grid.querySelectorAll('.reveal')).forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
  });
});

// ── Contact form ──
function handleSubmit(btn) {
  const orig = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Message Sent!';
    btn.style.background = '#16a34a';
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }, 3000);
  }, 1200);
}

// ── Dark / Light Mode ──
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Swap logo
  const logo = document.getElementById('nav-logo-img');
  if (logo) logo.src = isDark ? './images/dark.png' : './images/light.png';

  // Swap icons
  document.getElementById('icon-sun').style.display  = isDark ? 'block' : 'none';
  document.getElementById('icon-moon').style.display = isDark ? 'none'  : 'block';
}

// Restore saved theme on load
(function() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.body.classList.add('dark');
    const logo = document.getElementById('nav-logo-img');
    if (logo) logo.src = './images/dark.png';
    const sun  = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun)  sun.style.display  = 'block';
    if (moon) moon.style.display = 'none';
  }
})();

// ── WhatsApp "Get in Touch" form ──
function sendViaWhatsApp() {
  const name    = (document.getElementById('f-name')?.value    || '').trim();
  const contact = (document.getElementById('f-contact')?.value || '').trim();
  const subject = (document.getElementById('f-subject')?.value || '').trim();
  const message = (document.getElementById('f-message')?.value || '').trim();

  if (!name || !message) {
    // Shake the empty fields
    ['f-name','f-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        el.style.borderColor = '#ef4444';
        el.style.animation = 'shake 0.4s';
        setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 1200);
      }
    });
    return;
  }

  const text = [
    `👋 Hi Afrid! I came across your portfolio (AfridDevX).`,
    ``,
    `*Name:* ${name}`,
    contact ? `*Contact:* ${contact}` : '',
    subject ? `*Subject:* ${subject}` : '',
    ``,
    `*Message:*`,
    message,
  ].filter(l => l !== undefined && !(l === '' && !contact && !subject)).join('\n');

  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/919845432516?text=${encoded}`, '_blank');
}

// Shake animation for validation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);
