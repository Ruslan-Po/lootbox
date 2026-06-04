import { balance, setBalance } from './state.js';

const display = () => document.getElementById('balance-display');
let rafId = null;

export function renderBalance(value) {
  display().textContent = `🪙 ${value}`;
}

export function animateBalance(to) {
  const from  = balance;
  let   start = null;
  if (rafId) cancelAnimationFrame(rafId);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setBalance(to);
    renderBalance(to);
    return;
  }

  (function tick(ts) {
    if (!start) start = ts;
    const t = Math.min((ts - start) / 400, 1);
    const e = 1 - Math.pow(1 - t, 3);
    renderBalance(Math.round(from + (to - from) * e));
    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      setBalance(to);
      renderBalance(to);
    }
  })(performance.now());
}
