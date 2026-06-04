import { showOpenState } from './chest.js';
import { burstParticles } from './particles.js';
import { showModal } from './modal.js';

// Генерирует кейфреймы: одновременно трясёт и увеличивает на 30%
function buildShakeGrowFrames(cycles = 10, amp = 9) {
  const frames = [];
  const steps  = cycles * 4;

  for (let i = 0; i <= steps; i++) {
    const t     = i / steps;
    const scale = 1 + 0.3 * t;
    // синусоида для тряски, амплитуда чуть уменьшается к концу
    const tx    = Math.sin((i / 4) * 2 * Math.PI) * amp * (1 - t * 0.4);
    frames.push({
      transform: `scale(${scale.toFixed(3)}) translateX(${tx.toFixed(1)}px)`,
      offset:    t,
    });
  }
  return frames;
}

export function runOpenSequence(tier, prize, { onDone } = {}) {
  const chestWrap = document.getElementById('chest-wrap');

  function finish() {
    chestWrap.style.transform = '';
    showOpenState();
    burstParticles(tier.color);
    setTimeout(() => {
      showModal(tier, prize);
      onDone?.();
    }, 900);
  }

  // Reduced motion → пропускаем анимацию
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showOpenState();
    showModal(tier, prize);
    onDone?.();
    return;
  }

  // Шаг 1: тряска + рост 100% → 130% за 3 секунды
  const growAnim = chestWrap.animate(
    buildShakeGrowFrames(),
    { duration: 2000, fill: 'forwards', easing: 'linear' }
  );

  growAnim.onfinish = () => {
    // Шаг 2: уменьшение 130% → 100% за 0.5 секунды
    const shrinkAnim = chestWrap.animate(
      [
        { transform: 'scale(1.3) translateX(0)' },
        { transform: 'scale(1.0) translateX(0)' },
      ],
      { duration: 250, fill: 'forwards', easing: 'ease-in' }
    );

    shrinkAnim.onfinish = () => {
      // Шаг 3: показываем открытый сундук
      finish();
    };
  };
}
