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
    // Фиксируем текущий transform в inline-стиле, отменяем анимацию
    growAnim.commitStyles();
    growAnim.cancel();

    // Шаг 2: закрытый сундук резко сжимается
    const shrinkAnim = chestWrap.animate(
      [
        { transform: 'scale(1.3)' },
        { transform: 'scale(1.0)' },
      ],
      { duration: 250, fill: 'forwards', easing: 'ease-in' }
    );

    shrinkAnim.onfinish = () => {
      shrinkAnim.commitStyles();
      shrinkAnim.cancel();
      // Шаг 3: удар — мгновенно меняем на открытый сундук
      showOpenState();
      // Шаг 4: пауза → показываем приз
      finish();
    };
  };
}
