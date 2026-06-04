const GLYPHS = ['🪙', '✨'];
const COUNT  = 40;

export function burstParticles(color) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  const wrap   = document.getElementById('chest-wrap');
  const r      = wrap.getBoundingClientRect();

  canvas.width  = r.width;
  canvas.height = r.height;

  const cx = r.width  / 2;
  const cy = r.height / 2;

  const pts = Array.from({ length: COUNT }, () => {
    const ang   = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 5;
    return {
      x: cx, y: cy,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 1.5,
      alpha: 1,
      size:  14 + Math.random() * 10,
      glyph: GLYPHS[Math.random() > 0.5 ? 0 : 1],
    };
  });

  let raf;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let any = false;
    for (const p of pts) {
      if (p.alpha <= 0) continue;
      any = true;
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.2;
      p.alpha = Math.max(0, p.alpha - 0.02);
      ctx.save();
      ctx.globalAlpha  = p.alpha;
      ctx.font         = `${p.size}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.glyph, p.x, p.y);
      ctx.restore();
    }
    if (any) raf = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}
