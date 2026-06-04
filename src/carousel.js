import { TIERS, CLONES } from './config.js';
import { balance, setSelectedIdx } from './state.js';

let allCards   = [];
let silentJump = false;
let scrollRaf  = null;
let scrollTimer = null;
let onTierChangeCb = null;

const keyScroll = () => document.getElementById('key-scroll');

// ── Card factory ─────────────────────────────────────────────────
function makeCard(tier, tierIdx) {
  const item = document.createElement('div');
  item.className = 'key-item';
  item.dataset.tierIdx = tierIdx;
  item.style.background = tier.bg;

  const img = document.createElement('img');
  img.alt    = `${tier.label} key`;
  img.width  = 220;
  img.height = 220;
  img.onerror = () => {
    const ph = document.createElement('div');
    ph.className = 'key-ph';
    ph.style.background = `${tier.color}22`;
    ph.style.border     = `2px solid ${tier.color}44`;
    ph.textContent = '🗝️';
    img.replaceWith(ph);
  };
  img.src = tier.img;

  const label = document.createElement('div');
  label.className   = 'key-label';
  label.textContent = tier.label;

  const cost = document.createElement('div');
  cost.className = 'key-cost';
  const coinImg = document.createElement('img');
  coinImg.src = 'assets/coin/coin.png';
  coinImg.className = 'coin-icon';
  coinImg.alt = 'coin';
  cost.append(coinImg, ` ${tier.cost}`);

  const locked = balance < tier.cost;
  if (locked) item.classList.add('locked');

  item.append(img, label, cost);
  item.addEventListener('click', () => {
    const i = allCards.indexOf(item);
    scrollToCard(i, true);
  });
  return item;
}

// ── Scroll helpers ────────────────────────────────────────────────
function scrollToCard(idx, animated) {
  const scroll = keyScroll();
  const card   = allCards[idx];
  const left   = Math.max(0, card.offsetLeft - (scroll.clientWidth - card.offsetWidth) / 2);
  if (animated) {
    scroll.scrollTo({ left, behavior: 'smooth' });
  } else {
    scroll.scrollLeft = left;
  }
}

function centeredCardIdx() {
  const scroll = keyScroll();
  const mid    = scroll.scrollLeft + scroll.clientWidth / 2;
  let best = 0, minDist = Infinity;
  allCards.forEach((card, i) => {
    const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
    if (d < minDist) { minDist = d; best = i; }
  });
  return best;
}

// ── Real-time scale/opacity from scroll position ──────────────────
function updateVisualsRealtime() {
  const scroll = keyScroll();
  const mid    = scroll.scrollLeft + scroll.clientWidth / 2;
  const cardW  = allCards[0]?.offsetWidth || 240;

  allCards.forEach(card => {
    const cardMid = card.offsetLeft + card.offsetWidth / 2;
    const t = Math.min(Math.abs(cardMid - mid) / cardW, 2);
    const scale   = t <= 1 ? 1    + (0.82 - 1)    * t : 0.82 + (0.68 - 0.82) * (t - 1);
    const opacity = t <= 1 ? 1    + (0.65 - 1)    * t : 0.65 + (0.4  - 0.65) * (t - 1);
    card.style.transform = `scale(${scale.toFixed(3)})`;
    card.style.opacity   = opacity.toFixed(3);
  });
}

// ── updateVisuals by index (after jump) ──────────────────────────
export function updateVisuals(centeredIdx) {
  allCards.forEach((card, i) => {
    const dist = Math.abs(i - centeredIdx);
    if (dist === 0)      { card.style.transform = 'scale(1)';    card.style.opacity = '1'; }
    else if (dist === 1) { card.style.transform = 'scale(0.82)'; card.style.opacity = '0.65'; }
    else                 { card.style.transform = 'scale(0.68)'; card.style.opacity = '0.4'; }
    card.classList.toggle('active', i === centeredIdx);
  });
  const tierIdx = parseInt(allCards[centeredIdx].dataset.tierIdx);
  setSelectedIdx(tierIdx);
  onTierChangeCb?.();
}

// ── Infinite loop handler ─────────────────────────────────────────
function handleScrollEnd() {
  if (silentJump) return;
  const ci = centeredCardIdx();
  const n  = TIERS.length;

  allCards.forEach((c, i) => c.classList.toggle('active', i === ci));
  setSelectedIdx(parseInt(allCards[ci].dataset.tierIdx));
  onTierChangeCb?.();

  if (ci < CLONES) {
    const realIdx = ci + n;
    silentJump = true;
    scrollToCard(realIdx, false);
    updateVisualsRealtime();
    requestAnimationFrame(() => { silentJump = false; });
  } else if (ci >= CLONES + n) {
    const realIdx = ci - n;
    silentJump = true;
    scrollToCard(realIdx, false);
    updateVisualsRealtime();
    requestAnimationFrame(() => { silentJump = false; });
  }
}

// ── Init ──────────────────────────────────────────────────────────
export function initCarousel({ onTierChange } = {}) {
  onTierChangeCb = onTierChange ?? null;
  const scroll = keyScroll();
  const n = TIERS.length;

  // Prepend clones of last CLONES tiers
  for (let i = n - CLONES; i < n; i++) {
    const c = makeCard(TIERS[i], i);
    scroll.appendChild(c);
    allCards.push(c);
  }
  // Real items
  TIERS.forEach((tier, idx) => {
    const c = makeCard(tier, idx);
    scroll.appendChild(c);
    allCards.push(c);
  });
  // Append clones of first CLONES tiers
  for (let i = 0; i < CLONES; i++) {
    const c = makeCard(TIERS[i], i);
    scroll.appendChild(c);
    allCards.push(c);
  }

  // Start on highest affordable tier
  const startTierIdx = TIERS.reduce((best, tier, i) => tier.cost <= balance ? i : best, 0);
  const startCardIdx = CLONES + startTierIdx;
  requestAnimationFrame(() => {
    scrollToCard(startCardIdx, false);
    updateVisuals(startCardIdx);
  });

  // Real-time scale during scroll
  scroll.addEventListener('scroll', () => {
    if (silentJump) return;
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(updateVisualsRealtime);
  }, { passive: true });

  // Infinite loop: use scrollend if available, else debounce
  if ('onscrollend' in window) {
    scroll.addEventListener('scrollend', handleScrollEnd, { passive: true });
  } else {
    scroll.addEventListener('scroll', () => {
      if (silentJump) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScrollEnd, 80);
    }, { passive: true });
  }
}
