import { TIERS } from './config.js';
import { balance, selectedIdx, isAnimating, setIsAnimating } from './state.js';
import { initTelegram } from './telegram.js';
import { animateBalance, renderBalance } from './balance.js';
import { initCarousel } from './carousel.js';
import { showIdle, initChestFallbacks } from './chest.js';
import { initModal } from './modal.js';
import { runOpenSequence } from './open-sequence.js';

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTelegram();

  renderBalance(balance);
  initChestFallbacks();

  initCarousel({ onTierChange: updateBtn });

  initModal(() => {
    // onCollect
    showIdle();
    setIsAnimating(false);
    updateBtn();
  });

  document.getElementById('open-btn').addEventListener('click', openChest);

  updateBtn();
});

// ── Open button state ─────────────────────────────────────────────
function updateBtn() {
  const btn = document.getElementById('open-btn');
  btn.disabled = isAnimating || balance < TIERS[selectedIdx].cost;
}

// ── Open chest ────────────────────────────────────────────────────
function openChest() {
  if (isAnimating) return;
  const tier = TIERS[selectedIdx];
  if (balance < tier.cost) return;

  setIsAnimating(true);
  updateBtn();

  animateBalance(balance - tier.cost);
  const prize = tier.pool[Math.floor(Math.random() * tier.pool.length)];

  runOpenSequence(tier, prize, {
    onDone: () => {
      // modal is shown — button re-enabled in onCollect above
    },
  });
}
