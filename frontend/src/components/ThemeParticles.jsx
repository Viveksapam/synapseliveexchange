import React, { useEffect, useRef } from 'react';

/* ─── Shared Canvas Particle Base ─── */
function ParticleCanvas({ draw, init, style = {} }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], animId: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stateRef.current.particles = init(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      draw(ctx, canvas.width, canvas.height, stateRef.current.particles);
      stateRef.current.animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(stateRef.current.animId);
    };
  }, [draw, init]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
        ...style,
      }}
    />
  );
}

/* ─── 1. SNOWFALL (Christmas / Winter) ─── */
const snowInit = (w, h) =>
  Array.from({ length: 200 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 3,
    speed: 0.4 + Math.random() * 1.2,
    drift: (Math.random() - 0.5) * 0.4,
    opacity: 0.4 + Math.random() * 0.6,
  }));

const snowDraw = (ctx, w, h, particles) => {
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
    ctx.fill();

    p.y += p.speed;
    p.x += p.drift + Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.3;

    if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
    if (p.x > w + 5) p.x = -5;
    if (p.x < -5) p.x = w + 5;
  });
};

export function SnowfallParticles({ opacity = 1 }) {
  return (
    <ParticleCanvas
      init={snowInit}
      draw={snowDraw}
      style={{ opacity }}
    />
  );
}

/* ─── 2. BONFIRE EMBERS (Christmas night) ─── */
const emberInit = (w, h) =>
  Array.from({ length: 80 }, () => ({
    x: w / 2 + (Math.random() - 0.5) * 120,
    y: h + 10,
    vx: (Math.random() - 0.5) * 1.5,
    vy: -(0.5 + Math.random() * 2.5),
    life: Math.random(),
    maxLife: 0.6 + Math.random() * 0.4,
    size: 1.5 + Math.random() * 3,
    hue: 15 + Math.random() * 30, // fire orange-red
  }));

const emberDraw = (ctx, w, h, particles) => {
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    p.life -= 0.008;
    p.x += p.vx + Math.sin(Date.now() * 0.002 + p.y) * 0.3;
    p.y += p.vy;
    p.vy -= 0.015; // rise

    if (p.life <= 0) {
      p.x = w / 2 + (Math.random() - 0.5) * 120;
      p.y = h + 10;
      p.life = p.maxLife;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = -(0.5 + Math.random() * 2.5);
    }

    const alpha = (p.life / p.maxLife) * 0.85;
    const scale = p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * scale * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${alpha * 0.2})`;
    ctx.fill();
  });
};

export function BonfireEmbers({ opacity = 1 }) {
  return (
    <ParticleCanvas
      init={emberInit}
      draw={emberDraw}
      style={{ opacity }}
    />
  );
}

/* ─── 3. CONFETTI (New Year) ─── */
const confettiInit = (w, h) =>
  Array.from({ length: 150 }, () => ({
    x: Math.random() * w,
    y: -20 - Math.random() * h,
    w: 6 + Math.random() * 8,
    h: 3 + Math.random() * 5,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
    speed: 1 + Math.random() * 3,
    drift: (Math.random() - 0.5) * 1.5,
    color: `hsl(${Math.floor(Math.random() * 360)}, 90%, 60%)`,
  }));

const confettiDraw = (ctx, w, h, particles) => {
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    p.y += p.speed;
    p.x += p.drift;
    p.rot += p.rotSpeed;
    if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });
};

export function ConfettiParticles({ opacity = 1 }) {
  return (
    <ParticleCanvas
      init={confettiInit}
      draw={confettiDraw}
      style={{ opacity }}
    />
  );
}

/* ─── 4. FLOATING BATS (Halloween) ─── */
const batInit = (w, h) =>
  Array.from({ length: 18 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h * 0.7,
    speed: 0.4 + Math.random() * 0.8,
    dir: Math.random() > 0.5 ? 1 : -1,
    flapPhase: Math.random() * Math.PI * 2,
    size: 12 + Math.random() * 16,
    opacity: 0.5 + Math.random() * 0.4,
  }));

const batDraw = (ctx, w, h, bats) => {
  ctx.clearRect(0, 0, w, h);
  const t = Date.now() * 0.003;
  bats.forEach(b => {
    b.x += b.speed * b.dir;
    b.y += Math.sin(t + b.flapPhase) * 0.5;
    if (b.x > w + b.size) { b.x = -b.size; b.y = Math.random() * h * 0.7; }
    if (b.x < -b.size) { b.x = w + b.size; b.y = Math.random() * h * 0.7; }

    const flap = Math.sin(t * 6 + b.flapPhase); // wing flap
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.dir, 1);
    ctx.fillStyle = `rgba(60, 10, 80, ${b.opacity})`;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, b.size * 0.15, b.size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-b.size * 0.6, flap * b.size * 0.4 - b.size * 0.1, -b.size, flap * b.size * 0.3, -b.size * 0.8, b.size * 0.3);
    ctx.bezierCurveTo(-b.size * 0.4, b.size * 0.1, -b.size * 0.2, b.size * 0.1, 0, 0);
    ctx.fillStyle = `rgba(80, 0, 110, ${b.opacity})`;
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(b.size * 0.6, flap * b.size * 0.4 - b.size * 0.1, b.size, flap * b.size * 0.3, b.size * 0.8, b.size * 0.3);
    ctx.bezierCurveTo(b.size * 0.4, b.size * 0.1, b.size * 0.2, b.size * 0.1, 0, 0);
    ctx.fill();

    ctx.restore();
  });
};

export function HalloweenBats({ opacity = 1 }) {
  return (
    <ParticleCanvas
      init={batInit}
      draw={batDraw}
      style={{ opacity }}
    />
  );
}

/* ─── 5. DIWALI FIREFLIES / SPARKS ─── */
const diwaliInit = (w, h) =>
  Array.from({ length: 120 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -(0.3 + Math.random() * 0.8),
    size: 1 + Math.random() * 3,
    hue: 30 + Math.random() * 40, // gold to orange
    life: Math.random(),
    maxLife: 0.7 + Math.random() * 0.3,
    twinkleOffset: Math.random() * Math.PI * 2,
  }));

const diwaliDraw = (ctx, w, h, particles) => {
  ctx.clearRect(0, 0, w, h);
  const t = Date.now() * 0.003;
  particles.forEach(p => {
    p.life -= 0.004;
    p.x += p.vx + Math.sin(t + p.twinkleOffset) * 0.3;
    p.y += p.vy;

    if (p.life <= 0 || p.y < -10) {
      p.x = Math.random() * w;
      p.y = h + 10;
      p.life = p.maxLife;
    }

    const twinkle = 0.5 + 0.5 * Math.sin(t * 5 + p.twinkleOffset);
    const alpha = (p.life / p.maxLife) * twinkle;

    // Glow outer
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    grd.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha})`);
    grd.addColorStop(1, `hsla(${p.hue}, 100%, 60%, 0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${alpha * 0.9})`;
    ctx.fill();
  });
};

export function DiwaliSparks({ opacity = 1 }) {
  return (
    <ParticleCanvas
      init={diwaliInit}
      draw={diwaliDraw}
      style={{ opacity }}
    />
  );
}

