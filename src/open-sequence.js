import { showVideo, showOpenState } from './chest.js';
import { burstParticles } from './particles.js';
import { showModal } from './modal.js';

export function runOpenSequence(tier, prize, { onDone } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showOpenState();
    showModal(tier, prize);
    onDone?.();
    return;
  }

  const chestWrap = document.getElementById('chest-wrap');
  const chestVideo = document.getElementById('chest-video');

  function finish() {
    showOpenState();
    burstParticles(tier.color);
    setTimeout(() => {
      showModal(tier, prize);
      onDone?.();
    }, 100);
  }

  // Step 1: shake — with timeout fallback (animationend unreliable on iOS)
  chestWrap.classList.add('shaking');
  let shakeFired = false;
  const shakeFallback = setTimeout(() => {
    if (!shakeFired) { shakeFired = true; afterShake(); }
  }, 450);

  chestWrap.addEventListener('animationend', function onShakeEnd() {
    if (shakeFired) return;
    shakeFired = true;
    clearTimeout(shakeFallback);
    afterShake();
  }, { once: true });

  function afterShake() {
    chestWrap.classList.remove('shaking');

    // Check MP4 support (should be universal, but guard anyway)
    const mp4Supported = chestVideo.canPlayType('video/mp4') !== '';

    if (!mp4Supported) {
      finish();
      return;
    }

    let videoDone = false;

    function cleanup() {
      chestVideo.removeEventListener('ended', onEnded);
      chestVideo.removeEventListener('error', onErr);
      clearTimeout(hardFallback);
    }
    function onEnded() { if (videoDone) return; videoDone = true; cleanup(); finish(); }
    function onErr()   { if (videoDone) return; videoDone = true; cleanup(); finish(); }

    const hardFallback = setTimeout(() => {
      if (!videoDone) { videoDone = true; cleanup(); finish(); }
    }, 5000);

    showVideo();
    chestVideo.currentTime = 0;
    chestVideo.addEventListener('ended', onEnded);
    chestVideo.addEventListener('error', onErr);

    const p = chestVideo.play();
    if (p !== undefined) {
      p.catch(() => {
        if (!videoDone) { videoDone = true; cleanup(); finish(); }
      });
    }
  }
}
