const el = id => document.getElementById(id);

function imgOk(img) {
  return img.complete && img.naturalWidth > 0;
}

export function showIdle() {
  const idle   = el('chest-idle');
  const idlePh = el('chest-idle-ph');
  const ok     = imgOk(idle);
  idle.style.display   = ok ? 'block' : 'none';
  idlePh.style.display = ok ? 'none'  : 'flex';
  el('chest-video').style.display  = 'none';
  el('chest-open').style.display   = 'none';
  el('chest-open-ph').style.display = 'none';
}

export function showVideo() {
  el('chest-idle').style.display    = 'none';
  el('chest-idle-ph').style.display = 'none';
  el('chest-video').style.display   = 'block';
  el('chest-open').style.display    = 'none';
  el('chest-open-ph').style.display = 'none';
}

export function showOpenState() {
  const open   = el('chest-open');
  const openPh = el('chest-open-ph');
  const ok     = imgOk(open);
  el('chest-idle').style.display    = 'none';
  el('chest-idle-ph').style.display = 'none';
  el('chest-video').style.display   = 'none';
  open.style.display   = ok ? 'block' : 'none';
  openPh.style.display = ok ? 'none'  : 'flex';
}

export function initChestFallbacks() {
  const idle = el('chest-idle');
  if (idle.complete) {
    showIdle();
  } else {
    idle.addEventListener('load',  () => showIdle(), { once: true });
    idle.addEventListener('error', () => showIdle(), { once: true });
  }
}
