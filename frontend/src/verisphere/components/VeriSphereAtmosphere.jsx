/**
 * VeriSphereAtmosphere.jsx
 * 
 * Full-page immersive atmospheric renderer.
 * Uses highly realistic static images with slow ken-burns panning
 * overlaid with a canvas that runs physics-based particles for
 * snowfall, blowing leaves, fireflies, etc.
 */

import React, { useEffect, useRef } from 'react';
import { useThemeContext } from '../../hooks/useThemeContext';
import './VeriSphereAtmosphere.css';

// ── Utility ──────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.random() * (max - min) + min;

// ── Particle factories ───────────────────────────────────────────────────────
function makeFirefly(w, h) {
  return {
    x: rand(0, w), y: rand(h * 0.2, h),
    vx: rand(-0.4, 0.4), vy: rand(-0.3, 0.3),
    size: rand(1.5, 3.5),
    opacity: 0,
    maxOpacity: rand(0.4, 0.9),
    phase: rand(0, Math.PI * 2),
    phaseSpeed: rand(0.015, 0.04),
    color: `hsl(${rand(60, 120)}, 100%, 70%)`,
  };
}

function makeSnowflake(w, h) {
  return {
    x: rand(-20, w + 20), y: rand(-20, -1),
    size: rand(2, 6),
    speedY: rand(1.2, 3.5),
    speedX: rand(-1.5, 1.5),
    opacity: rand(0.4, 0.9),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.01, 0.04),
    wobbleAmp: rand(0.3, 1.5),
  };
}

function makeEmber(w, h) {
  return {
    x: rand(w * 0.1, w * 0.9), y: h + rand(0, 20),
    size: rand(1.5, 4),
    vx: rand(-0.6, 0.6), vy: rand(-1.2, -2.8),
    opacity: rand(0.6, 1),
    hue: rand(15, 45),
    life: rand(0.6, 1),
  };
}

function makeDustMote(w, h) {
  return {
    x: rand(0, w), y: rand(0, h),
    size: rand(0.8, 2),
    vx: rand(-0.15, 0.15), vy: rand(-0.08, 0.1),
    opacity: rand(0.1, 0.35),
    phase: rand(0, Math.PI * 2),
  };
}

// ── Main component ───────────────────────────────────────────────────────────

export default function VeriSphereAtmosphere() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ particles: [], initialized: false });
  const { theme, intensity } = useThemeContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    stateRef.current.initialized = false;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stateRef.current.initialized = false;
    }
    resize();
    window.addEventListener('resize', resize);

    function initParticles(w, h) {
      const particles = [];
      switch (theme) {
        case 'summer':
          for (let i = 0; i < 25; i++) particles.push({ type: 'dust', ...makeDustMote(w, h) });
          break;
        case 'halloween':
          // Just fog/ambient dust for halloween now
          for (let i = 0; i < 25; i++) particles.push({ type: 'dust', ...makeDustMote(w, h) });
          break;
        case 'night':
          for (let i = 0; i < 40; i++) particles.push({ type: 'firefly', ...makeFirefly(w, h) });
          for (let i = 0; i < 20; i++) particles.push({ type: 'dust', ...makeDustMote(w, h) });
          break;
        case 'christmas':
        case 'winter':
          for (let i = 0; i < 60; i++) particles.push({ type: 'snow', ...makeSnowflake(w, h) });
          if (theme === 'christmas') {
            for (let i = 0; i < 20; i++) particles.push({ type: 'ember', ...makeEmber(w, h) });
          }
          break;
        default:
          for (let i = 0; i < 40; i++) particles.push({ type: 'dust', ...makeDustMote(w, h) });
          break;
      }
      return particles;
    }

    let time = 0;

    function tick() {
      animRef.current = requestAnimationFrame(tick);
      time += 16;

      const w = canvas.width;
      const h = canvas.height;

      if (!stateRef.current.initialized) {
        stateRef.current.particles = initParticles(w, h);
        stateRef.current.initialized = true;
      }

      ctx.clearRect(0, 0, w, h);

      // ── Particles ──
      const pts = stateRef.current.particles;

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];

        if (p.type === 'firefly') {
          p.phase += p.phaseSpeed;
          p.x += p.vx + Math.sin(p.phase * 1.3) * 0.4;
          p.y += p.vy + Math.cos(p.phase) * 0.3;
          p.opacity = p.maxOpacity * (0.5 + 0.5 * Math.sin(p.phase));
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

          ctx.save();
          ctx.globalAlpha = p.opacity;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grd.addColorStop(0, p.color);
          grd.addColorStop(1, 'rgba(100,255,100,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (p.type === 'snow') {
          p.wobble += p.wobbleSpeed;
          p.x += p.speedX + Math.sin(p.wobble) * p.wobbleAmp;
          p.y += p.speedY;
          if (p.y > h + 10) { pts[i] = { type: 'snow', ...makeSnowflake(w, h) }; continue; }

          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = '#e8f4ff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = p.opacity * 0.5;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (p.type === 'ember') {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.008;
          p.opacity = p.life;
          if (p.life <= 0) { pts[i] = { type: 'ember', ...makeEmber(w, h) }; continue; }

          ctx.save();
          ctx.globalAlpha = p.opacity * 0.9;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grd.addColorStop(0, `hsla(${p.hue}, 100%, 70%, 1)`);
          grd.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (p.type === 'dust') {
          p.phase += 0.008;
          p.x += p.vx + Math.sin(p.phase) * 0.08;
          p.y += p.vy;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;

          ctx.save();
          ctx.globalAlpha = p.opacity * (0.7 + 0.3 * Math.sin(p.phase));
          ctx.fillStyle = 'rgba(200,220,255,0.8)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [theme, intensity]);

  const themes = ['night', 'winter', 'halloween', 'christmas', 'diwali', 'default'];

  return (
    <div className="vs-atmosphere-container" aria-hidden="true">
      {/* Pre-render all theme layers, toggle active class for crossfading */}
      {themes.map(t => (
        <div 
          key={t}
          className={`vs-bg-layer vs-bg-${t} ${(theme === t || (theme === 'default' && t === 'night')) ? 'active' : ''}`}
        />
      ))}
      <canvas ref={canvasRef} className="vs-atmosphere-canvas" />
    </div>
  );
}

