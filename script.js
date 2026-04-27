// ── PARTICLE SYSTEM (Plexus-style) ──────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = { x: -999, y: -999 };
  const PARTICLE_COUNT = 60, CONNECT_DIST = 150, MOUSE_DIST = 200;

  function resize() {
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1, alpha: Math.random() * 0.5 + 0.2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const md = Math.sqrt(dx * dx + dy * dy);
      if (md < MOUSE_DIST) {
        p.x += dx / md * 1.5;
        p.y += dy / md * 1.5;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(62,207,180,${p.alpha})`;
      ctx.fill();
    });

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(62,207,180,${0.15 * (1 - d / CONNECT_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── DATA ─────────────────────────────────────────────────────────────────
const KITS = {
  photography: [
    { name: 'Beginner Camera Kit', price: 250 },
    { name: 'Main Camera Kit',     price: 300 },
  ],
  music: [
    { name: 'Guitar Kit',     price: 150 },
    { name: 'Keyboard Kit',   price: 200 },
    { name: 'Production Kit', price: 250 },
  ],
  fishing: [
    { name: 'Beginner Fishing Kit', price: 150 },
    { name: 'Weekend Fishing Kit',  price: 200 },
    { name: 'Pro Fishing Kit',      price: 300 },
  ],
};

// ── STATE ─────────────────────────────────────────────────────────────────
const state = { hobby: null, kit: null, price: 0, days: 0, step: 1 };

// ── NAVBAR ────────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  lastScroll = y;
}, { passive: true });

// ── HAMBURGER ─────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ── SCROLL REVEAL (staggered, like reference) ─────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // Stagger children
      const parent = e.target.parentElement;
      const siblings = parent ? Array.from(parent.querySelectorAll('[data-reveal]')) : [];
      const idx = siblings.indexOf(e.target);
      const delay = idx >= 0 ? idx * 120 : 0;
      setTimeout(() => {
        e.target.classList.add('revealed');
      }, delay);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// ── ANIMATED COUNTERS ─────────────────────────────────────────────────────
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.count);
      if (!target) return;
      let current = 0;
      const step = Math.ceil(target / 60);
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current.toLocaleString() + '+';
      }, 25);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ── PARALLAX HERO (subtle) ────────────────────────────────────────────────
const heroContent = document.querySelector('[data-parallax]');
window.addEventListener('scroll', () => {
  if (!heroContent) return;
  const y = window.scrollY;
  const speed = parseFloat(heroContent.dataset.parallax || 0.12);
  heroContent.style.transform = `translateY(${y * speed}px)`;
}, { passive: true });

// ── SMOOTH SCROLL for nav links ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── MAGNETIC HOVER on buttons ─────────────────────────────────────────────
document.querySelectorAll('.btn-primary, .cat-card, .kit-card, .why-card, .how-step, .review-card').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y / 20}deg) rotateY(${x / 20}deg)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
    el.style.transition = 'all .4s cubic-bezier(.4,0,.2,1)';
  });
  el.addEventListener('mouseenter', () => {
    el.style.transition = 'all .1s ease';
  });
});

// ── BUTTON RIPPLE EFFECT ──────────────────────────────────────────────────
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const r = this.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,.3);width:${size}px;height:${size}px;left:${e.clientX - r.left - size/2}px;top:${e.clientY - r.top - size/2}px;transform:scale(0);animation:ripple .6s ease-out forwards;pointer-events:none`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple keyframe
const rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes ripple{to{transform:scale(2.5);opacity:0}}';
document.head.appendChild(rippleStyle);

// ── TILT GLOW on glass cards ──────────────────────────────────────────────
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(62,207,180,.15), rgba(255,255,255,.04))`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

// ── BOOKING WIZARD ────────────────────────────────────────────────────────
function showPanel(id) {
  document.querySelectorAll('.b-panel').forEach(p => {
    p.classList.remove('active');
    p.style.opacity = '0';
    p.style.transform = 'translateY(20px)';
  });
  const panel = document.getElementById(`bp-${id}`);
  if (panel) {
    panel.classList.add('active');
    requestAnimationFrame(() => {
      panel.style.transition = 'all .4s cubic-bezier(.4,0,.2,1)';
      panel.style.opacity = '1';
      panel.style.transform = 'none';
    });
  }
}

function updateProgress(step) {
  state.step = step;
  const fill = { 1: '25%', 2: '50%', 3: '75%', 4: '100%', success: '100%' };
  document.getElementById('progress-fill').style.width = fill[step] || '25%';

  ['1','2','3','4'].forEach(s => {
    const el = document.getElementById(`ps-${s}`);
    el.classList.remove('ps-active', 'ps-done');
    const n = parseInt(s);
    const cur = parseInt(step) || 5;
    if (n < cur) el.classList.add('ps-done');
    else if (n === cur) el.classList.add('ps-active');
  });
}

// Step 1 — Hobby
document.querySelectorAll('.b-hobby-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.b-hobby-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.hobby = btn.dataset.hobby;
    document.getElementById('bn-1').disabled = false;
  });
});

document.getElementById('bn-1').addEventListener('click', () => {
  if (!state.hobby) return;
  buildKitOptions();
  updateProgress(2);
  showPanel(2);
});

// Step 2 — Kit
function buildKitOptions() {
  const list = document.getElementById('b-kit-list');
  list.innerHTML = '';
  state.kit = null; state.price = 0;
  document.getElementById('bn-2').disabled = true;

  KITS[state.hobby].forEach((kit, i) => {
    const btn = document.createElement('button');
    btn.className = 'b-kit-opt';
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(12px)';
    btn.innerHTML = `<span>${kit.name}</span><span class="b-kit-opt-price">${kit.price} EGP/day</span>`;
    btn.addEventListener('click', () => {
      list.querySelectorAll('.b-kit-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.kit = kit.name;
      state.price = kit.price;
      document.getElementById('bn-2').disabled = false;
    });
    list.appendChild(btn);
    setTimeout(() => {
      btn.style.transition = 'all .35s cubic-bezier(.4,0,.2,1)';
      btn.style.opacity = '1';
      btn.style.transform = 'none';
    }, i * 80);
  });
}

document.getElementById('bb-2').addEventListener('click', () => { updateProgress(1); showPanel(1); });

document.getElementById('bn-2').addEventListener('click', () => {
  if (!state.kit) return;
  state.days = 0;
  document.querySelectorAll('.b-dur-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('b-total').textContent = '';
  document.getElementById('bn-3').disabled = true;
  updateProgress(3);
  showPanel(3);
});

// Step 3 — Duration
document.querySelectorAll('.b-dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.b-dur-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.days = parseInt(btn.dataset.days);
    const total = state.price * state.days;
    const el = document.getElementById('b-total');
    el.style.transform = 'scale(0.95)';
    el.textContent = `Total: ${total} EGP  (${state.days} day${state.days > 1 ? 's' : ''} × ${state.price} EGP/day)`;
    requestAnimationFrame(() => {
      el.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1)';
      el.style.transform = 'scale(1)';
    });
    document.getElementById('bn-3').disabled = false;
  });
});

document.getElementById('bb-3').addEventListener('click', () => { updateProgress(2); showPanel(2); });

document.getElementById('bn-3').addEventListener('click', () => {
  if (!state.days) return;
  renderSummary();
  updateProgress(4);
  showPanel(4);
});

// Step 4 — Confirm
function renderSummary() {
  const total = state.price * state.days;
  document.getElementById('b-summary').innerHTML = `
    <div>🎯 <strong>Hobby:</strong> ${capitalize(state.hobby)}</div>
    <div>📦 <strong>Kit:</strong> ${state.kit}</div>
    <div>📅 <strong>Duration:</strong> ${state.days} day${state.days > 1 ? 's' : ''}</div>
    <div>💰 <strong>Total:</strong> ${total} EGP (cash on delivery)</div>
    <div>🚚 <strong>Delivery:</strong> Within 24h · Cairo</div>
  `;
}

document.getElementById('bb-4').addEventListener('click', () => { updateProgress(3); showPanel(3); });

document.getElementById('confirm-btn').addEventListener('click', async () => {
  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const address = document.getElementById('f-address').value.trim();

  let phoneErr = document.getElementById('phone-error');
  if (phoneErr) phoneErr.remove();

  if (!name || !phone || !address) {
    ['f-name','f-phone','f-address'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) { el.style.borderColor = '#ef4444'; shakeEl(el); }
    });
    return;
  }

  if (!/^01\d{9}$/.test(phone)) {
    const el = document.getElementById('f-phone');
    el.style.borderColor = '#ef4444';
    shakeEl(el);
    const err = document.createElement('div');
    err.id = 'phone-error';
    err.style.color = '#ef4444';
    err.style.fontSize = '0.8rem';
    err.style.marginTop = '-8px';
    err.style.marginBottom = '12px';
    err.textContent = 'Please enter a valid Egyptian mobile number (01123015146)';
    el.parentNode.insertBefore(err, el.nextSibling);
    return;
  }

  const total = state.price * state.days;
  const message = `🎉 New Booking - HobbyGo\n\n🎯 Hobby: ${capitalize(state.hobby)}\n📦 Kit: ${state.kit}\n📅 Duration: ${state.days} days\n💰 Total: ${total} EGP\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Address: ${address}\n\n🚚 Delivery: Within 24h · Cairo\n💵 Payment: Cash on Delivery`;
  
  window.open('https://wa.me/201123015146?text=' + encodeURIComponent(message), '_blank');

  await sendToSheet({
    hobby: capitalize(state.hobby),
    kit: state.kit,
    price: state.price,
    days: state.days,
    total: total,
    name: name,
    phone: phone,
    address: address,
    timestamp: new Date().toISOString()
  });

  updateProgress('success');
  showPanel('success');
});

async function sendToSheet(data) {
  try {
    await fetch('https://hooks.zapier.com/hooks/catch/27391060/uvhb1j2/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Webhook failed:', error);
  }
}

// Book Again
document.getElementById('book-again-btn').addEventListener('click', () => {
  document.querySelectorAll('.b-hobby-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('bn-1').disabled = true;
  document.getElementById('f-name').value = '';
  document.getElementById('f-phone').value = '';
  document.getElementById('f-address').value = '';
  ['f-name','f-phone','f-address'].forEach(id => document.getElementById(id).style.borderColor = '');
  Object.assign(state, { hobby: null, kit: null, price: 0, days: 0 });
  updateProgress(1);
  showPanel(1);
});

// ── "Book This Kit" buttons on kit cards ─────────────────────────────────
document.querySelectorAll('.kit-book-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    const kitName = btn.dataset.kit;

    state.hobby = section;
    document.querySelectorAll('.b-hobby-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.hobby === section);
    });
    document.getElementById('bn-1').disabled = false;

    buildKitOptions();
    setTimeout(() => {
      document.querySelectorAll('.b-kit-opt').forEach(opt => {
        if (opt.querySelector('span')?.textContent === kitName) opt.click();
      });
    }, 50);

    updateProgress(2);
    showPanel(2);
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });
});

// ── INPUT: clear red border on focus ─────────────────────────────────────
['f-name','f-phone','f-address'].forEach(id => {
  document.getElementById(id).addEventListener('focus', function() {
    this.style.borderColor = '';
  });
});

// ── UTILS ─────────────────────────────────────────────────────────────────
function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function shakeEl(el) {
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(0)' },
  ], { duration: 400, easing: 'ease' });
}

// ── CURSOR GLOW (desktop only) ────────────────────────────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(62,207,180,.06),transparent 70%);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:left .15s,top .15s;mix-blend-mode:screen';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ── Init ──────────────────────────────────────────────────────────────────
updateProgress(1);

// ── MOCK UI ANIMATION ─────────────────────────────────────────────────────
(function initMockUI() {
  const mockStates = [
    {
      name: 'Photography Kit', icon: '📸', time: '48',
      s1I: '🔋', s1L: 'Battery', s1V: '100%',
      s2I: '💾', s2L: 'Storage', s2V: '64GB',
      line: 'M0,25 C20,25 30,10 50,15 C70,20 80,5 100,10',
      fill: 'M0,30 L0,25 C20,25 30,10 50,15 C70,20 80,5 100,10 L100,30 Z'
    },
    {
      name: 'Music Kit', icon: '🎸', time: '24',
      s1I: '📻', s1L: 'Amp Status', s1V: 'Ready',
      s2I: '🎧', s2L: 'Cables', s2V: 'Included',
      line: 'M0,20 C20,5 30,25 50,10 C70,15 80,25 100,5',
      fill: 'M0,30 L0,20 C20,5 30,25 50,10 C70,15 80,25 100,5 L100,30 Z'
    },
    {
      name: 'Fishing Kit', icon: '🎣', time: '72',
      s1I: '🐟', s1L: 'Bait Pack', s1V: 'Full',
      s2I: '🌤️', s2L: 'Weather', s2V: 'Clear',
      line: 'M0,15 C20,15 30,5 50,20 C70,25 80,10 100,15',
      fill: 'M0,30 L0,15 C20,15 30,5 50,20 C70,25 80,10 100,15 L100,30 Z'
    }
  ];

  let currentIdx = 0;
  const els = {
    name: document.getElementById('mock-kit-name'),
    icon: document.getElementById('mock-kit-icon'),
    time: document.getElementById('mock-time-val'),
    s1I: document.getElementById('mock-stat1-icon'),
    s1L: document.getElementById('mock-stat1-label'),
    s1V: document.getElementById('mock-stat1-val'),
    s2I: document.getElementById('mock-stat2-icon'),
    s2L: document.getElementById('mock-stat2-label'),
    s2V: document.getElementById('mock-stat2-val'),
    line: document.getElementById('mock-chart-line'),
    fill: document.getElementById('mock-chart-fill')
  };

  const animGroups = [
    document.getElementById('mock-anim-greeting'),
    document.getElementById('mock-anim-time'),
    document.getElementById('mock-anim-stats')
  ];

  // Make sure elements exist before running
  if (!els.name) return;

  setInterval(() => {
    // Fade out
    animGroups.forEach(el => el && el.classList.add('mock-fade-out'));
    
    setTimeout(() => {
      currentIdx = (currentIdx + 1) % mockStates.length;
      const s = mockStates[currentIdx];
      
      els.name.textContent = s.name;
      els.icon.textContent = s.icon;
      els.time.textContent = s.time;
      els.s1I.textContent = s.s1I;
      els.s1L.textContent = s.s1L;
      els.s1V.textContent = s.s1V;
      els.s2I.textContent = s.s2I;
      els.s2L.textContent = s.s2L;
      els.s2V.textContent = s.s2V;
      els.line.setAttribute('d', s.line);
      els.fill.setAttribute('d', s.fill);

      // Fade in
      animGroups.forEach(el => el && el.classList.remove('mock-fade-out'));
    }, 400); // Wait for fade out
  }, 3500); // Change every 3.5s
})();

// Top bar close functionality
document.addEventListener('DOMContentLoaded', () => {
  const topBar = document.getElementById('top-bar');
  const closeTopBar = document.getElementById('close-top-bar');
  
  if (closeTopBar && topBar) {
    closeTopBar.addEventListener('click', () => {
      topBar.classList.add('hidden');
    });
  }
  
  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    waFloat.href = 'https://wa.me/201123015146?text=' + encodeURIComponent('مرحبا HobbyGo ، عايز أحجز كيت');
  }
  
  // FAQ Accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      // Toggle current
      item.classList.toggle('active');
    });
  });
});

// ── TYPED TEXT EFFECT ─────────────────────────────────────────────────────
(function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const words = ["before you waste 15,000 EGP", "risk-free", "before you buy it"];
  let i = 0;

  function typeWord(word) {
    let charIdx = 0;
    el.textContent = '';
    return new Promise(resolve => {
      const typeInt = setInterval(() => {
        el.textContent += word.charAt(charIdx);
        charIdx++;
        if (charIdx >= word.length) {
          clearInterval(typeInt);
          setTimeout(resolve, 2000);
        }
      }, 60);
    });
  }

  function deleteWord() {
    return new Promise(resolve => {
      const delInt = setInterval(() => {
        el.textContent = el.textContent.slice(0, -1);
        if (el.textContent.length === 0) {
          clearInterval(delInt);
          setTimeout(resolve, 400);
        }
      }, 30);
    });
  }

  async function loop() {
    while (true) {
      await typeWord(words[i]);
      await deleteWord();
      i = (i + 1) % words.length;
    }
  }
  
  el.textContent = '';
  loop();
})();
