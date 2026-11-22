(() => {
  "use strict";
  const canvas = document.getElementById("silver-field");
  const ctx = canvas && canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!canvas || !ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)");
  const state = { width: 0, height: 0, dpr: 1, particles: [], raf: 0, last: 0, pointerX: 0, pointerY: 0, targetX: 0, targetY: 0, visible: true, running: false };
  const rand = (a, b) => a + Math.random() * (b - a);
  const countFor = () => {
    const area = innerWidth * innerHeight;
    const base = coarse.matches ? 34 : 78;
    return Math.max(18, Math.min(coarse.matches ? 48 : 112, Math.round(base * Math.min(1.2, area / (1280 * 800)))));
  };
  const makeParticle = (initial = false) => {
    const depth = Math.pow(Math.random(), 1.55);
    const radius = rand(.35, 1.15) + depth * 1.7;
    return {
      x: rand(0, state.width), y: initial ? rand(0, state.height) : rand(-25, -5),
      vx: rand(-.12, .12) * (.25 + depth), vy: rand(.055, .24) * (.4 + depth),
      radius, depth, alpha: rand(.13, .36) + depth * .47,
      phase: rand(0, Math.PI * 2), spin: rand(-.012, .012),
      shape: Math.random() > .73 ? "flake" : "grain", length: rand(2, 7) * (.4 + depth),
      glow: depth > .7
    };
  };
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, coarse.matches ? 1.35 : 1.8);
    state.width = innerWidth; state.height = innerHeight; state.dpr = dpr;
    canvas.width = Math.round(state.width * dpr); canvas.height = Math.round(state.height * dpr);
    canvas.style.width = state.width + "px"; canvas.style.height = state.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = countFor();
    while (state.particles.length < count) state.particles.push(makeParticle(true));
    if (state.particles.length > count) state.particles.length = count;
  }
  function drawParticle(p, time, driftX, driftY) {
    const shimmer = .78 + Math.sin(time * .0007 + p.phase) * .22;
    const alpha = p.alpha * shimmer;
    const x = p.x + driftX * p.depth * 10;
    const y = p.y + driftY * p.depth * 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time * .00025 + p.phase) * .3);
    if (p.glow) {
      ctx.shadowBlur = 8 * p.depth;
      ctx.shadowColor = "rgba(235,235,230,.55)";
    }
    if (p.shape === "flake") {
      const g = ctx.createLinearGradient(-p.length, -p.length, p.length, p.length);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(.45, "rgba(244,244,239," + alpha + ")");
      g.addColorStop(1, "rgba(125,125,120,0)");
      ctx.strokeStyle = g; ctx.lineWidth = .45 + p.depth * .45;
      ctx.beginPath(); ctx.moveTo(-p.length, -p.length * .2); ctx.lineTo(p.length, p.length * .2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -p.length * .45); ctx.lineTo(0, p.length * .45); ctx.stroke();
    } else {
      const grad = ctx.createRadialGradient(-p.radius * .35, -p.radius * .4, 0, 0, 0, p.radius * 1.7);
      grad.addColorStop(0, "rgba(255,255,255," + Math.min(1, alpha + .25) + ")");
      grad.addColorStop(.38, "rgba(200,200,195," + alpha + ")");
      grad.addColorStop(1, "rgba(100,100,96,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(0, 0, p.radius * 1.7, 0, Math.PI * 2); ctx.fill();
      if (p.depth > .72) {
        ctx.strokeStyle = "rgba(255,255,255," + (alpha * .3) + ")";
        ctx.lineWidth = .35; ctx.beginPath(); ctx.moveTo(-p.radius * 2.8, 0); ctx.lineTo(p.radius * 2.8, 0); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function frame(time) {
    if (!state.running) return;
    const dt = Math.min(32, time - (state.last || time)); state.last = time;
    ctx.clearRect(0, 0, state.width, state.height);
    state.pointerX += (state.targetX - state.pointerX) * .025;
    state.pointerY += (state.targetY - state.pointerY) * .025;
    const driftX = reduceMotion.matches ? 0 : state.pointerX;
    const driftY = reduceMotion.matches ? 0 : state.pointerY;
    for (const p of state.particles) {
      if (!reduceMotion.matches) {
        p.x += p.vx * dt * .06;
        p.y += p.vy * dt * .06;
        p.phase += p.spin * dt;
        if (p.y > state.height + 12 || p.x < -15 || p.x > state.width + 15) {
          Object.assign(p, makeParticle(false));
          p.x = rand(0, state.width);
        }
      }
      drawParticle(p, time, driftX, driftY);
    }
    state.raf = requestAnimationFrame(frame);
  }
  function start() { if (state.running || document.hidden || !state.visible) return; state.running = true; state.last = 0; state.raf = requestAnimationFrame(frame); }
  function stop() { state.running = false; cancelAnimationFrame(state.raf); }
  resize();
  if (!reduceMotion.matches) start(); else { state.running = true; frame(0); stop(); }
  addEventListener("resize", resize, { passive: true });
  addEventListener("pointermove", e => { if (!coarse.matches && !reduceMotion.matches) { state.targetX = (e.clientX / innerWidth - .5) * 2; state.targetY = (e.clientY / innerHeight - .5) * 2; } }, { passive: true });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => { state.visible = entries[0].isIntersecting; state.visible ? start() : stop(); });
    observer.observe(canvas);
  }
  const motionChange = () => { if (reduceMotion.matches) { stop(); ctx.clearRect(0, 0, state.width, state.height); state.particles.forEach(p => drawParticle(p, 0, 0, 0)); } else start(); };
  reduceMotion.addEventListener?.("change", motionChange);
})();
