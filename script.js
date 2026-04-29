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

// ── PRICING DATA (Single Source of Truth) ────────────────────────────────
const pricingData = {
  'Camera Basic': {
    category: 'photography', day: 299, weekend: 749, week: 1499, month: 3999, insurance: 3000,
    emoji: '📷', desc: 'Used by 200+ beginners in Cairo'
  },
  'Camera Better': {
    category: 'photography', day: 399, weekend: 999, week: 1999, month: 5299, insurance: 4000,
    emoji: '📸', desc: 'Pro-level gear, delivered fast'
  },
  'Guitar Kit': {
    category: 'music', day: 149, weekend: 349, week: 699, month: 1699, insurance: 1000,
    emoji: '🎸', desc: 'Most popular for first-timers'
  },
  'Keyboard Kit': {
    category: 'music', day: 199, weekend: 499, week: 899, month: 2199, insurance: 1500,
    emoji: '🎹', desc: 'Most popular for first-timers'
  },
  'Basic Fishing Kit': {
    category: 'fishing', day: 149, weekend: 399, week: 749, month: 1799, insurance: 1000,
    emoji: '🎣', desc: 'Perfect for Nile & sea fishing'
  },
  'Advanced Fishing Kit': {
    category: 'fishing', day: 229, weekend: 549, week: 999, month: 2499, insurance: 1500,
    emoji: '🌊', desc: 'Perfect for Nile & sea fishing'
  }
};

const DELIVERY_OPTIONS = [
  { id: 'same-day', label: 'Same Day Delivery', price: 199 },
  { id: 'cairo-giza', label: 'Cairo & Giza (Next Day)', price: 129 }
];

const DURATION_OPTIONS = [
  { key: 'day', label: 'Day' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'week', label: 'Week', best: true },
  { key: 'month', label: 'Month' }
];

// Legacy KITS mapping for booking wizard compatibility
const KITS = {
  photography: Object.entries(pricingData).filter(([,v]) => v.category === 'photography').map(([name, v]) => ({ name, price: v.day })),
  music: Object.entries(pricingData).filter(([,v]) => v.category === 'music').map(([name, v]) => ({ name, price: v.day })),
  fishing: Object.entries(pricingData).filter(([,v]) => v.category === 'fishing').map(([name, v]) => ({ name, price: v.day })),
};

// ── STATE ─────────────────────────────────────────────────────────────────
const state = {
  hobby: null, kit: null, price: 0, days: 0, step: 1,
  duration: 'day', delivery: 'cairo-giza', isFirstOrder: !localStorage.getItem('hg_ordered'),
  extraItems: [], paymentMethod: 'cash'
};

// ── PRICING ENGINE ───────────────────────────────────────────────────────
function calculateTotal(kitName, durationKey, deliveryId, applyDiscounts = true) {
  const kit = pricingData[kitName];
  if (!kit) return null;
  const basePrice = kit[durationKey] || kit.day;
  const insurance = kit.insurance;
  const delivery = DELIVERY_OPTIONS.find(d => d.id === deliveryId);
  const deliveryPrice = delivery ? delivery.price : 129;

  let discount = 0;
  let discountLabel = '';

  if (applyDiscounts) {
    if (state.isFirstOrder) {
      discount = 0.20;
      discountLabel = '🎉 First Order: 20% OFF';
    }
    if (state.extraItems.length > 0) {
      discount = Math.max(discount, 0.15);
      discountLabel = discount === 0.20 ? discountLabel : '🎁 Bundle: 15% OFF';
    }
  }

  const discountAmount = Math.round(basePrice * discount);
  const rentalAfterDiscount = basePrice - discountAmount;
  const totalNow = rentalAfterDiscount + deliveryPrice;

  return {
    kitName, durationKey, basePrice, insurance, deliveryPrice,
    discount, discountAmount, discountLabel, rentalAfterDiscount, totalNow
  };
}

function getSavingsVsDaily(kitName, durationKey) {
  const kit = pricingData[kitName];
  if (!kit || durationKey === 'day') return 0;
  const daysMap = { weekend: 2, week: 7, month: 30 };
  const dailyCost = kit.day * daysMap[durationKey];
  const actualCost = kit[durationKey];
  return Math.round(((dailyCost - actualCost) / dailyCost) * 100);
}

// ── GOOGLE SHEETS BACKEND CONFIG ──────────────────────────────────────────
// Published Google Sheet as JSON (Apps Script Web App URL)
// Replace this with your actual Google Apps Script deployed URL
const SHEETS_API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// Zapier webhooks
const ZAPIER_BOOKING_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/27391060/uvhb1j2/';
const ZAPIER_STATUS_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/27391060/uvhb1j2/';

// ── FETCH BOOKINGS FROM GOOGLE SHEETS ─────────────────────────────────────
async function fetchBookings() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(SHEETS_API_URL + '?action=getBookings', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Sheets API error');
    const data = await res.json();
    // Normalize: ensure we return an array of booking objects
    const bookings = Array.isArray(data) ? data : (data.bookings || data.data || []);
    // Cache to localStorage for offline fallback
    if (bookings.length > 0) {
      const cached = {};
      bookings.forEach(b => { if (b.bookingId) cached[b.bookingId] = b; });
      localStorage.setItem('hg_bookings', JSON.stringify(cached));
      localStorage.setItem('hg_bookings_lastSync', new Date().toISOString());
    }
    return bookings;
  } catch (err) {
    console.warn('[HobbyGo] Cloud fetch failed, using localStorage fallback:', err.message);
    // Fallback: return localStorage data
    const cached = JSON.parse(localStorage.getItem('hg_bookings') || '{}');
    return Object.values(cached);
  }
}

// ── FETCH SINGLE BOOKING STATUS ───────────────────────────────────────────
async function fetchBookingStatus(bookingId) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(SHEETS_API_URL + '?action=getStatus&bookingId=' + encodeURIComponent(bookingId), {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Status API error');
    const data = await res.json();
    if (data && data.bookingId) {
      // Update localStorage cache
      const cached = JSON.parse(localStorage.getItem('hg_bookings') || '{}');
      cached[data.bookingId] = { ...cached[data.bookingId], ...data };
      localStorage.setItem('hg_bookings', JSON.stringify(cached));
      return data;
    }
    return null;
  } catch (err) {
    console.warn('[HobbyGo] Cloud status check failed, using localStorage:', err.message);
    const cached = JSON.parse(localStorage.getItem('hg_bookings') || '{}');
    return cached[bookingId] || null;
  }
}

// ── SUBMISSION GUARDS (Upgrade 1 + 9) ────────────────────────────────────
let isSubmitting = false;
let lastSubmitTime = 0;
const COOLDOWN_MS = 10000; // 10-second anti-spam cooldown

// ── CLOUDINARY CONFIG ─────────────────────────────────────────────────────
const CLOUDINARY_CLOUD = 'drra77eqw';
const CLOUDINARY_PRESET = 'hobbygo_upload';

// ── IMAGE COMPRESSION (Upgrade 4) ─────────────────────────────────────────
function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    // Skip non-image or already-small files
    if (!file.type.startsWith('image/')) { resolve(file); return; }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxWidth) { resolve(file); return; }

      // Scale down proportionally
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
        resolve(compressed);
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ── CLOUDINARY UPLOAD with Retry + Timeout (Upgrade 3 + 5) ───────────────
async function uploadToCloudinary(file) {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 500;
  const TIMEOUT_MS = 10000;

  // Compress first
  const compressed = await compressImage(file);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const fd = new FormData();
      fd.append('file', compressed);
      fd.append('upload_preset', CLOUDINARY_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: 'POST',
        body: fd,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      console.log('[Analytics] ID Upload Success');
      return data.secure_url;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('[Analytics] ID Upload Timeout — attempt', attempt + 1);
        showUploadError('Upload taking too long, please try again');
      } else {
        console.error('Cloudinary upload error (attempt ' + (attempt + 1) + '):', err);
      }
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }
    }
  }
  console.log('[Analytics] ID Upload Failed');
  return null;
}

// ── SHOW / HIDE UPLOAD ERROR (Upgrade 6) ──────────────────────────────────
function showUploadError(msg) {
  const errEl = document.getElementById('id-upload-error');
  if (!errEl) return;
  errEl.textContent = '⚠️ ' + msg;
  errEl.style.display = 'block';
  errEl.style.opacity = '0';
  errEl.style.transform = 'translateY(-8px)';
  requestAnimationFrame(() => {
    errEl.style.transition = 'opacity .4s ease, transform .4s ease';
    errEl.style.opacity = '1';
    errEl.style.transform = 'translateY(0)';
  });
  errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideUploadError() {
  const errEl = document.getElementById('id-upload-error');
  if (errEl) { errEl.style.display = 'none'; errEl.style.opacity = '0'; }
}

// ── FORM INPUT LOCK helpers (Upgrade 2) ───────────────────────────────────
function setFormLocked(locked) {
  ['f-name', 'f-phone', 'f-address', 'f-national-id', 'id-front', 'id-back'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = locked;
  });
}

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
  const fill = { 1: '20%', 2: '40%', 3: '60%', 4: '80%', 5: '100%', success: '100%' };
  document.getElementById('progress-fill').style.width = fill[step] || '20%';

  ['1','2','3','4','5'].forEach(s => {
    const el = document.getElementById(`ps-${s}`);
    if (!el) return;
    el.classList.remove('ps-active', 'ps-done');
    const n = parseInt(s);
    const cur = parseInt(step) || 6;
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
  state.duration = null;
  state.days = 0;
  document.getElementById('b-total').innerHTML = '';
  document.getElementById('bn-3').disabled = true;
  initDurationStep();
  updateProgress(3);
  showPanel(3);
});

// Step 3 — Duration + Delivery
function initDurationStep() {
  const durGrid = document.querySelector('.b-duration-grid');
  if (!durGrid) return;
  durGrid.innerHTML = '';
  DURATION_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'b-dur-btn';
    btn.dataset.duration = opt.key;
    const kitData = pricingData[state.kit];
    const price = kitData ? kitData[opt.key] : 0;
    const savings = getSavingsVsDaily(state.kit, opt.key);
    btn.innerHTML = `
      <span class="dur-label">${opt.label}</span>
      <span class="dur-price">${price.toLocaleString()} EGP</span>
      ${opt.best ? '<span class="dur-best-badge">Best Value ⭐</span>' : ''}
      ${savings > 0 ? `<span class="dur-save-badge">Save ${savings}%</span>` : ''}
    `;
    btn.addEventListener('click', () => {
      durGrid.querySelectorAll('.b-dur-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.duration = opt.key;
      state.price = price;
      state.days = { day: 1, weekend: 2, week: 7, month: 30 }[opt.key];
      updateDurationTotal();
      document.getElementById('bn-3').disabled = false;
    });
    durGrid.appendChild(btn);
  });

  // Delivery selector
  let deliveryWrap = document.getElementById('b-delivery-select');
  if (!deliveryWrap) {
    deliveryWrap = document.createElement('div');
    deliveryWrap.id = 'b-delivery-select';
    deliveryWrap.className = 'b-delivery-grid';
    deliveryWrap.innerHTML = `<div class="b-delivery-title">🚚 Delivery Option</div><div class="b-delivery-options"></div>`;
    const totalEl = document.getElementById('b-total');
    totalEl.parentNode.insertBefore(deliveryWrap, totalEl);
  }
  const optionsWrap = deliveryWrap.querySelector('.b-delivery-options');
  optionsWrap.innerHTML = '';
  DELIVERY_OPTIONS.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'b-deliv-btn' + (d.id === state.delivery ? ' selected' : '');
    btn.dataset.delivery = d.id;
    btn.innerHTML = `<span>${d.label}</span><span class="deliv-price">${d.price} EGP</span>`;
    btn.addEventListener('click', () => {
      optionsWrap.querySelectorAll('.b-deliv-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.delivery = d.id;
      updateDurationTotal();
    });
    optionsWrap.appendChild(btn);
  });
}

function updateDurationTotal() {
  if (!state.kit || !state.duration) return;
  const calc = calculateTotal(state.kit, state.duration, state.delivery);
  if (!calc) return;
  const el = document.getElementById('b-total');
  el.style.transform = 'scale(0.95)';
  let html = `<div class="b-total-breakdown">`;
  html += `<div class="bt-row"><span>Rental (${state.duration})</span><span>${calc.basePrice.toLocaleString()} EGP</span></div>`;
  if (calc.discountAmount > 0) {
    html += `<div class="bt-row bt-discount"><span>${calc.discountLabel}</span><span>-${calc.discountAmount.toLocaleString()} EGP</span></div>`;
  }
  html += `<div class="bt-row"><span>Delivery</span><span>${calc.deliveryPrice} EGP</span></div>`;
  html += `<div class="bt-row bt-deposit"><span>Insurance (on delivery)</span><span>${calc.insurance.toLocaleString()} EGP</span></div>`;
  html += `<div class="bt-row bt-total-line"><span>TOTAL NOW</span><span>${calc.totalNow.toLocaleString()} EGP</span></div>`;
  html += `</div>`;
  el.innerHTML = html;
  requestAnimationFrame(() => {
    el.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1)';
    el.style.transform = 'scale(1)';
  });
}

document.getElementById('bb-3').addEventListener('click', () => { updateProgress(2); showPanel(2); });

document.getElementById('bn-3').addEventListener('click', () => {
  if (!state.duration) return;
  renderSummary();
  updateProgress(4);
  showPanel(4);
});

// Step 4 → Step 5 (Details → Payment)
document.getElementById('bn-4').addEventListener('click', () => {
  // Validate personal details before going to payment
  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const address = document.getElementById('f-address').value.trim();
  const nationalId = document.getElementById('f-national-id').value.trim();
  let phoneErr = document.getElementById('phone-error'); if (phoneErr) phoneErr.remove();
  let nidErr = document.getElementById('nid-error'); if (nidErr) nidErr.remove();
  hideUploadError();
  if (!name || !phone || !address || !nationalId) {
    ['f-name','f-phone','f-address','f-national-id'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) { el.style.borderColor = '#ef4444'; shakeEl(el); }
    });
    return;
  }
  if (!/^01\d{9}$/.test(phone)) {
    const el = document.getElementById('f-phone'); el.style.borderColor = '#ef4444'; shakeEl(el);
    const err = document.createElement('div'); err.id = 'phone-error';
    err.style.cssText = 'color:#ef4444;font-size:0.8rem;margin-top:-8px;margin-bottom:12px';
    err.textContent = 'Please enter a valid Egyptian mobile number'; el.parentNode.insertBefore(err, el.nextSibling); return;
  }
  if (!/^\d{14}$/.test(nationalId)) {
    const el = document.getElementById('f-national-id'); el.style.borderColor = '#ef4444'; shakeEl(el);
    const err = document.createElement('div'); err.id = 'nid-error';
    err.style.cssText = 'color:#ef4444;font-size:0.8rem;margin-top:-8px;margin-bottom:12px';
    err.textContent = 'Please enter a valid Egyptian National ID (14 digits)'; el.parentNode.insertBefore(err, el.nextSibling); return;
  }
  const frontFile = document.getElementById('id-front').files[0];
  const backFile = document.getElementById('id-back').files[0];
  const MAX_SIZE = 5 * 1024 * 1024;
  const isValidImage = (f) => f && f.type.startsWith('image/') && f.size <= MAX_SIZE;
  if (!isValidImage(frontFile) || !isValidImage(backFile)) {
    showUploadError('Please upload valid ID images (front & back)');
    shakeEl(document.querySelector('.id-upload-section')); return;
  }
  hideUploadError();
  renderOrderSummary();
  updateProgress(5);
  showPanel(5);
});

document.getElementById('bb-5').addEventListener('click', () => { updateProgress(4); showPanel(4); });

function renderOrderSummary() {
  const calc = calculateTotal(state.kit, state.duration, state.delivery);
  if (!calc) return;
  const durationLabel = DURATION_OPTIONS.find(d => d.key === state.duration)?.label || state.duration;
  const deliveryLabel = DELIVERY_OPTIONS.find(d => d.id === state.delivery)?.label || state.delivery;
  const el = document.getElementById('b-order-summary');
  if (!el) return;
  let html = `<div class="b-summary">`;
  html += `<div>🎯 <strong>Hobby:</strong> ${capitalize(state.hobby)}</div>`;
  html += `<div>📦 <strong>Kit:</strong> ${state.kit}</div>`;
  html += `<div>📅 <strong>Duration:</strong> ${durationLabel}</div>`;
  html += `<div class="b-summary-divider"></div>`;
  html += `<div>💰 <strong>Rental:</strong> ${calc.basePrice.toLocaleString()} EGP</div>`;
  html += `<div>🚚 <strong>Delivery:</strong> ${deliveryLabel} — ${calc.deliveryPrice} EGP</div>`;
  html += `<div>🛡 <strong>Insurance:</strong> ${calc.insurance.toLocaleString()} EGP</div>`;
  html += `<div class="b-summary-divider"></div>`;
  html += `<div class="b-summary-total">💵 <strong>TOTAL:</strong> <span class="summary-total-val">${calc.totalNow.toLocaleString()} EGP</span></div>`;
  html += `</div>`;
  el.innerHTML = html;
}

// Step 4 — Confirm
function renderSummary() {
  const calc = calculateTotal(state.kit, state.duration, state.delivery);
  if (!calc) return;
  const durationLabel = DURATION_OPTIONS.find(d => d.key === state.duration)?.label || state.duration;
  const deliveryLabel = DELIVERY_OPTIONS.find(d => d.id === state.delivery)?.label || state.delivery;
  let html = `
    <div>🎯 <strong>Hobby:</strong> ${capitalize(state.hobby)}</div>
    <div>📦 <strong>Kit:</strong> ${state.kit}</div>
    <div>📅 <strong>Duration:</strong> ${durationLabel}</div>
    <div class="b-summary-divider"></div>
    <div>💰 <strong>Rental:</strong> ${calc.basePrice.toLocaleString()} EGP</div>`;
  if (calc.discountAmount > 0) {
    html += `<div style="color:var(--green)">🎉 <strong>Discount:</strong> -${calc.discountAmount.toLocaleString()} EGP (${Math.round(calc.discount*100)}% off)</div>`;
  }
  html += `
    <div>🚚 <strong>Delivery:</strong> ${deliveryLabel} — ${calc.deliveryPrice} EGP</div>
    <div>🔒 <strong>Insurance:</strong> ${calc.insurance.toLocaleString()} EGP (paid on delivery)</div>
    <div class="b-summary-divider"></div>
    <div class="b-summary-total">💵 <strong>TOTAL NOW:</strong> <span class="summary-total-val">${calc.totalNow.toLocaleString()} EGP</span></div>
    <div style="font-size:0.78rem;color:var(--text3);margin-top:4px">Insurance of ${calc.insurance.toLocaleString()} EGP collected on delivery</div>
    <div>🪪 <strong>Verification:</strong> Valid National ID required</div>
  `;
  document.getElementById('b-summary').innerHTML = html;
}

document.getElementById('bb-4').addEventListener('click', () => { updateProgress(3); showPanel(3); });

document.getElementById('confirm-btn').addEventListener('click', async () => {
  const confirmBtn = document.getElementById('confirm-btn');
  const consentCheckbox = document.getElementById('consent-checkbox');

  // Check consent first — show modal if not checked
  if (consentCheckbox && !consentCheckbox.checked) {
    const modal = document.getElementById('agreement-modal');
    if (modal) modal.style.display = 'flex';
    return;
  }

  if (isSubmitting) return;
  const now = Date.now();
  if (now - lastSubmitTime < COOLDOWN_MS) {
    showUploadError('Please wait a few seconds before submitting again');
    return;
  }

  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const address = document.getElementById('f-address').value.trim();
  const nationalId = document.getElementById('f-national-id').value.trim();
  const frontFile = document.getElementById('id-front').files[0];
  const backFile = document.getElementById('id-back').files[0];
  const screenshotInput = document.getElementById('payment-screenshot');

  // Validate Payment Screenshot
  if ((state.paymentMethod === 'instapay' || state.paymentMethod === 'vodafone') && (!screenshotInput || !screenshotInput.files[0])) {
    const errEl = document.getElementById('payment-upload-error');
    if (errEl) {
      errEl.textContent = '⚠️ Please upload your payment screenshot';
      errEl.style.display = 'block';
    }
    const screenshotSection = document.getElementById('payment-screenshot-section');
    if (screenshotSection) {
      screenshotSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const label = document.getElementById('payment-screenshot-label');
      if (label) {
        label.style.borderColor = '#ef4444';
        label.style.background = 'rgba(239,68,68,0.05)';
        setTimeout(() => {
          label.style.borderColor = 'var(--glass-border)';
          label.style.background = 'var(--surface)';
        }, 3000);
      }
    }
    return;
  }
  
  // Hide error if it was previously shown and now passed
  const errEl = document.getElementById('payment-upload-error');
  if (errEl) errEl.style.display = 'none';

  console.log('[Analytics] Booking Started');

  // Lock UI
  isSubmitting = true;
  lastSubmitTime = Date.now();
  confirmBtn.disabled = true;
  confirmBtn.innerHTML = '<span class="btn-spinner"></span> Processing...';
  setFormLocked(true);

  // Upload ID images
  const statusEl = document.getElementById('id-upload-status');
  statusEl.textContent = '⏳ Uploading ID...';
  statusEl.style.color = 'var(--orange)';

  const [idFrontUrl, idBackUrl] = await Promise.all([
    uploadToCloudinary(frontFile),
    uploadToCloudinary(backFile)
  ]);

  const uploadFailed = !idFrontUrl || !idBackUrl;
  if (uploadFailed) {
    statusEl.textContent = '⚠️ ID upload failed — send images on WhatsApp';
    statusEl.style.color = '#ef4444';
    console.log('[Analytics] Upload Failed');
  } else {
    statusEl.textContent = '✅ ID uploaded successfully';
    statusEl.style.color = 'var(--green)';
    console.log('[Analytics] Upload Success');
  }

  // Payment screenshot upload
  let paymentScreenshotUrl = null;
  if (screenshotInput && screenshotInput.files[0] && (state.paymentMethod === 'instapay' || state.paymentMethod === 'vodafone')) {
    paymentScreenshotUrl = await uploadToCloudinary(screenshotInput.files[0]);
  }

  // Generate booking ID
  const bookingId = 'HG-' + Math.random().toString(36).substr(2, 5).toUpperCase();

  // Build FULL WhatsApp message
  const calc = calculateTotal(state.kit, state.duration, state.delivery);
  const durationLabel = DURATION_OPTIONS.find(d => d.key === state.duration)?.label || state.duration;
  const deliveryLabel = DELIVERY_OPTIONS.find(d => d.id === state.delivery)?.label || state.delivery;
  const paymentMethodLabels = { cash: 'Cash on Delivery', instapay: 'Instapay', vodafone: 'Vodafone Cash' };
  const paymentLabel = paymentMethodLabels[state.paymentMethod] || 'Cash on Delivery';
  const frontLink = idFrontUrl || 'Not uploaded';
  const backLink = idBackUrl || 'Not uploaded';

  const msg = [
    `🔥 New Booking - HobbyGo`,
    ``,
    `🆔 Booking ID: ${bookingId}`,
    ``,
    `👤 Name: ${name}`,
    `📞 Phone: ${phone}`,
    ``,
    `🎯 Hobby: ${capitalize(state.hobby)}`,
    `📦 Kit: ${state.kit}`,
    `📅 Duration: ${durationLabel}`,
    ``,
    `💰 Rental: ${calc.basePrice.toLocaleString()} EGP`,
    `🚚 Delivery: ${calc.deliveryPrice} EGP`,
    `🛡 Insurance: ${calc.insurance.toLocaleString()} EGP`,
    ``,
    `💳 Payment: ${paymentLabel}`,
  ];
  if (paymentScreenshotUrl) msg.push(``, `📸 Payment Screenshot: ${paymentScreenshotUrl}`);
  msg.push(
    ``,
    `🪪 ID:`,
    `Front: ${frontLink}`,
    `Back: ${backLink}`,
    ``,
    `⏳ Status: Pending Approval`,
    ``,
    `⚠ Confirm availability before delivery`
  );

  const message = msg.join('\n');
  window.open('https://wa.me/201123015146?text=' + encodeURIComponent(message), '_blank');
  console.log('[Analytics] WhatsApp Opened');

  localStorage.setItem('hg_ordered', '1');
  state.isFirstOrder = false;

  // Zapier / Google Sheets
  await sendToSheet({
    bookingId, hobby: capitalize(state.hobby), kit: state.kit,
    duration: durationLabel, price: calc.basePrice, delivery: calc.deliveryPrice,
    insurance: calc.insurance, discount: calc.discountAmount, total: calc.totalNow,
    days: state.days, name, phone, address, national_id: nationalId,
    id_front: idFrontUrl || '', id_back: idBackUrl || '',
    paymentMethod: paymentLabel, paymentScreenshot: paymentScreenshotUrl || '',
    timestamp: new Date().toISOString()
  });

  // Save to localStorage
  const bookingData = {
    bookingId, status: 'pending', hobby: capitalize(state.hobby), kit: state.kit,
    duration: durationLabel, total: calc.totalNow, paymentMethod: paymentLabel,
    name, phone, timestamp: new Date().toISOString()
  };
  const bookings = JSON.parse(localStorage.getItem('hg_bookings') || '{}');
  bookings[bookingId] = bookingData;
  localStorage.setItem('hg_bookings', JSON.stringify(bookings));

  // Update success panel
  document.getElementById('booking-id-value').textContent = bookingId;
  document.getElementById('success-status-badge').className = 'booking-status-badge status-pending';
  document.getElementById('success-status-badge').textContent = '⏳ Under Review';
  document.getElementById('success-title').textContent = '✅ Booking Sent Successfully';
  document.getElementById('success-message').innerHTML = '📱 Check WhatsApp to complete booking<br/>🆔 Booking ID: ' + bookingId;

  console.log('[Analytics] Booking Completed');

  // Unlock UI
  isSubmitting = false;
  confirmBtn.disabled = false;
  confirmBtn.innerHTML = 'Confirm Booking 🎉';
  setFormLocked(false);

  updateProgress('success');
  showPanel('success');
});

async function sendToSheet(data) {
  try {
    await fetch(ZAPIER_BOOKING_WEBHOOK, {
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
  document.getElementById('f-national-id').value = '';
  ['f-name','f-phone','f-address','f-national-id'].forEach(id => document.getElementById(id).style.borderColor = '');
  let phoneErr = document.getElementById('phone-error');
  if (phoneErr) phoneErr.remove();
  let nidErr = document.getElementById('nid-error');
  if (nidErr) nidErr.remove();
  // Reset ID upload state
  document.getElementById('id-front').value = '';
  document.getElementById('id-back').value = '';
  document.getElementById('id-front-preview').style.display = 'none';
  document.getElementById('id-back-preview').style.display = 'none';
  document.getElementById('id-front-name').textContent = '';
  document.getElementById('id-back-name').textContent = '';
  hideUploadError();
  document.getElementById('id-upload-status').textContent = '';
  document.getElementById('id-front-label').classList.remove('id-uploaded');
  document.getElementById('id-back-label').classList.remove('id-uploaded');
  document.getElementById('confirm-btn').disabled = false;
  document.getElementById('confirm-btn').innerHTML = 'Confirm Booking 🎉';
  // Reset submission guards
  isSubmitting = false;
  setFormLocked(false);
  Object.assign(state, { hobby: null, kit: null, price: 0, days: 0, duration: 'day', delivery: 'cairo-giza', extraItems: [], paymentMethod: 'cash' });
  // Reset consent checkbox
  const consentCb = document.getElementById('consent-checkbox');
  if (consentCb) { consentCb.checked = false; }
  document.getElementById('confirm-btn').disabled = true;
  // Reset payment method UI
  document.querySelectorAll('.payment-option').forEach(o => { o.classList.remove('selected'); });
  const cashOpt = document.querySelector('.payment-option[data-method="cash"]');
  if (cashOpt) { cashOpt.classList.add('selected'); cashOpt.querySelector('input').checked = true; }
  const screenshotSect = document.getElementById('payment-screenshot-section');
  if (screenshotSect) screenshotSect.style.display = 'none';
  const psInput = document.getElementById('payment-screenshot');
  if (psInput) psInput.value = '';
  const psPreview = document.getElementById('payment-screenshot-preview');
  if (psPreview) psPreview.style.display = 'none';
  const psName = document.getElementById('payment-screenshot-name');
  if (psName) psName.textContent = '';
  const deliveryEl = document.getElementById('b-delivery-select');
  if (deliveryEl) deliveryEl.remove();
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
['f-name','f-phone','f-address','f-national-id'].forEach(id => {
  document.getElementById(id).addEventListener('focus', function() {
    this.style.borderColor = '';
  });
});

// ── ID FILE PREVIEW HANDLERS (Upgrade 8: file re-selection) ───────────────
function setupIdPreview(inputId, previewId, nameId, labelId) {
  document.getElementById(inputId).addEventListener('change', function() {
    const file = this.files[0];
    const preview = document.getElementById(previewId);
    const nameEl  = document.getElementById(nameId);
    const label   = document.getElementById(labelId);

    // Upgrade 8: Reset previous state on re-selection
    hideUploadError();
    document.getElementById('id-upload-status').textContent = '';

    if (!file) return;

    // Validate type & size
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      showUploadError('Image must be under 5MB. Please select a valid image.');
      this.value = '';
      preview.style.display = 'none';
      nameEl.textContent = '';
      label.classList.remove('id-uploaded');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    nameEl.textContent = file.name;
    label.classList.add('id-uploaded');
  });
}

setupIdPreview('id-front', 'id-front-preview', 'id-front-name', 'id-front-label');
setupIdPreview('id-back',  'id-back-preview',  'id-back-name',  'id-back-label');

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

// ── KIT CARD PRICING TOGGLES ─────────────────────────────────────────────
function initKitCardPricingToggles() {
  document.querySelectorAll('.kit-card').forEach(card => {
    const kitName = card.querySelector('.kit-name')?.textContent?.trim();
    const kitData = pricingData[kitName];
    if (!kitData) return;

    // Remove old price tag content and update with day price
    const priceTag = card.querySelector('.kit-price-tag');
    if (priceTag) {
      priceTag.innerHTML = `<span>${kitData.day}</span> EGP/day`;
    }

    // Create duration toggle
    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'kit-duration-toggle';

    DURATION_OPTIONS.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'kdt-btn' + (opt.key === 'day' ? ' active' : '');
      btn.dataset.duration = opt.key;
      const savings = getSavingsVsDaily(kitName, opt.key);
      btn.innerHTML = `${opt.label}${opt.best ? ' ⭐' : ''}`;
      if (savings > 0) {
        const badge = document.createElement('span');
        badge.className = 'kdt-save';
        badge.textContent = `-${savings}%`;
        btn.appendChild(badge);
      }
      btn.addEventListener('click', () => {
        toggleWrap.querySelectorAll('.kdt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const price = kitData[opt.key];
        if (priceTag) {
          priceTag.innerHTML = `<span>${price.toLocaleString()}</span> EGP/${opt.label.toLowerCase()}`;
        }
        // Update the deposit display
        const depositEl = card.querySelector('.kit-deposit');
        if (depositEl) {
          depositEl.textContent = `Insurance: ${kitData.insurance.toLocaleString()} EGP`;
        }
      });
      toggleWrap.appendChild(btn);
    });

    // Insert toggle before the book button
    const bookBtn = card.querySelector('.kit-book-btn');
    if (bookBtn) {
      bookBtn.parentNode.insertBefore(toggleWrap, bookBtn);
    }

    // Add insurance info
    const depositEl = document.createElement('div');
    depositEl.className = 'kit-deposit';
    depositEl.textContent = `Insurance: ${kitData.insurance.toLocaleString()} EGP`;
    if (bookBtn) {
      bookBtn.parentNode.insertBefore(depositEl, bookBtn);
    }

    // Update data-kit attribute to match pricingData keys
    if (bookBtn) {
      bookBtn.dataset.kit = kitName;
    }
  });
}

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', initKitCardPricingToggles);

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

// ── PAYMENT METHOD TOGGLE ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const paymentGrid = document.getElementById('payment-method-grid');
  const screenshotSection = document.getElementById('payment-screenshot-section');
  if (!paymentGrid) return;

  paymentGrid.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      paymentGrid.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const method = opt.dataset.method;
      state.paymentMethod = method;
      opt.querySelector('input').checked = true;

      // Show/hide screenshot upload
      if (screenshotSection) {
        screenshotSection.style.display = (method === 'instapay' || method === 'vodafone') ? 'block' : 'none';
      }
    });
  });

  // Payment screenshot preview
  const psInput = document.getElementById('payment-screenshot');
  if (psInput) {
    psInput.addEventListener('change', function() {
      const file = this.files[0];
      const preview = document.getElementById('payment-screenshot-preview');
      const nameEl = document.getElementById('payment-screenshot-name');
      const label = document.getElementById('payment-screenshot-label');

      if (!file) return;
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
        showUploadError('Screenshot must be a valid image under 5MB');
        this.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
      };
      reader.readAsDataURL(file);
      if (nameEl) nameEl.textContent = file.name;
      if (label) label.classList.add('id-uploaded');
    });
  }
});

// ── BOOKING STATUS CHECK (Google Sheets → localStorage fallback) ─────────
document.addEventListener('DOMContentLoaded', () => {
  const checkBtn = document.getElementById('check-status-btn');
  const statusInput = document.getElementById('status-booking-id');
  const statusResult = document.getElementById('status-result');
  const statusInner = document.getElementById('status-result-inner');

  if (!checkBtn || !statusInput) return;

  checkBtn.addEventListener('click', async () => {
    const id = statusInput.value.trim().toUpperCase();
    if (!id) {
      statusInput.style.borderColor = '#ef4444';
      shakeEl(statusInput);
      return;
    }

    // Show loading state
    if (statusResult) statusResult.style.display = 'block';
    statusInner.innerHTML = `
      <div class="status-loading">
        <div class="status-spinner"></div>
        <div style="color:var(--text2);font-size:0.9rem;margin-top:12px">Checking booking status...</div>
      </div>
    `;

    // Try Google Sheets first, then localStorage
    const booking = await fetchBookingStatus(id);

    if (!booking) {
      statusInner.innerHTML = `
        <div class="status-not-found">
          <div class="status-icon">❌</div>
          <div class="status-text">No booking found with ID <strong>${id}</strong></div>
          <div class="status-hint">Please check the ID and try again</div>
        </div>
      `;
      return;
    }

    const statusConfig = {
      pending: { icon: '⏳', label: 'Under Review', class: 'status-pending' },
      accepted: { icon: '✅', label: 'Booking Confirmed', class: 'status-accepted' },
      rejected: { icon: '❌', label: 'Payment Rejected', class: 'status-rejected' }
    };

    const sc = statusConfig[booking.status] || statusConfig.pending;
    const lastUpdated = booking.lastUpdated || booking.timestamp || '';
    const lastUpdatedStr = lastUpdated ? new Date(lastUpdated).toLocaleString('en-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '';

    statusInner.innerHTML = `
      <div class="status-found">
        <div class="status-badge-large ${sc.class}">
          <span class="status-icon-large">${sc.icon}</span>
          <span>${sc.label}</span>
        </div>
        <div class="status-details">
          <div class="sd-row"><span>🆔 Booking ID</span><strong>${booking.bookingId}</strong></div>
          <div class="sd-row"><span>📦 Kit</span><strong>${booking.kit || '-'}</strong></div>
          <div class="sd-row"><span>🎯 Hobby</span><strong>${booking.hobby || '-'}</strong></div>
          <div class="sd-row"><span>📅 Duration</span><strong>${booking.duration || '-'}</strong></div>
          <div class="sd-row"><span>💰 Total</span><strong>${booking.total ? Number(booking.total).toLocaleString() + ' EGP' : '-'}</strong></div>
          <div class="sd-row"><span>💳 Payment</span><strong>${booking.paymentMethod || '-'}</strong></div>
          ${lastUpdatedStr ? `<div class="sd-row sd-row-updated"><span>🕐 Last Updated</span><strong>${lastUpdatedStr}</strong></div>` : ''}
        </div>
        <div class="status-source-note">🔄 Data synced from cloud</div>
      </div>
    `;
  });

  statusInput.addEventListener('focus', function() {
    this.style.borderColor = '';
  });
});

// ── STATUS UPDATE FUNCTION (for admin console use) ───────────────────────
async function updateBookingStatus(id, newStatus) {
  const bookings = JSON.parse(localStorage.getItem('hg_bookings') || '{}');
  if (!bookings[id]) {
    console.error(`Booking ${id} not found`);
    return false;
  }
  bookings[id].status = newStatus;
  bookings[id].lastUpdated = new Date().toISOString();
  localStorage.setItem('hg_bookings', JSON.stringify(bookings));

  // Sync to Google Sheets via Zapier
  try {
    await fetch(ZAPIER_STATUS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, status: newStatus, lastUpdated: bookings[id].lastUpdated })
    });
  } catch (e) { console.error('Status webhook failed:', e); }

  console.log(`✅ Booking ${id} status updated to: ${newStatus}`);
  return true;
}

// Expose globally for console access
window.updateBookingStatus = updateBookingStatus;
window.fetchBookings = fetchBookings;
window.fetchBookingStatus = fetchBookingStatus;

// ── CONSENT CHECKBOX → ENABLE / DISABLE CONFIRM BUTTON ─────────────────
document.addEventListener('DOMContentLoaded', () => {
  const consentCheckbox = document.getElementById('consent-checkbox');
  const confirmBtn = document.getElementById('confirm-btn');
  if (consentCheckbox && confirmBtn) {
    consentCheckbox.addEventListener('change', () => {
      confirmBtn.disabled = !consentCheckbox.checked;
    });
  }

  // Agreement modal close
  const modalClose = document.getElementById('agreement-modal-close');
  const modal = document.getElementById('agreement-modal');
  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
      // Scroll to and highlight the consent checkbox
      const section = document.getElementById('consent-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        section.style.borderColor = 'var(--coral)';
        section.style.boxShadow = '0 0 20px rgba(232,117,138,.2)';
        setTimeout(() => {
          section.style.borderColor = '';
          section.style.boxShadow = '';
        }, 2500);
      }
    });
    // Close modal on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});
