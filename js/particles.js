/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   SPARKLE & LIGHT PARTICLE SYSTEM — Scene 2 (Dark)  ║
 * ║   Floating sparkles, gentle light orbs, star dust    ║
 * ║   For dark background aesthetic                      ║
 * ╚══════════════════════════════════════════════════════╝
 */

import { CONFIG } from "./config.js";

export class ConfettiSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sparkles = [];
    this.orbs = [];
    this.disposed = false;
    this.time = 0;

    const isMobile = window.innerWidth < CONFIG.performance.mobileBreakpoint;
    this.sparkleCount = isMobile ? 50 : 100;
    this.orbCount = isMobile ? 8 : 15;

    this._resize();
    this._init();

    this._onResize = this._resize.bind(this);
    window.addEventListener("resize", this._onResize);
  }

  _resize() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
  }

  _init() {
    // Tiny twinkling sparkles (like star dust)
    for (let i = 0; i < this.sparkleCount; i++) {
      this.sparkles.push(this._makeSparkle());
    }
    // Larger soft orbs / light particles
    for (let i = 0; i < this.orbCount; i++) {
      this.orbs.push(this._makeOrb());
    }
  }

  _makeSparkle() {
    return {
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      size: 0.5 + Math.random() * 2.5,
      baseOpacity: 0.2 + Math.random() * 0.6,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.015 + Math.random() * 0.04,
      vy: 0.08 + Math.random() * 0.25,
      vx: (Math.random() - 0.5) * 0.15,
      // Color: white, pink, or light gold
      hue: [0, 330, 340, 350, 45][Math.floor(Math.random() * 5)],
      saturation: 20 + Math.random() * 60,
    };
  }

  _makeOrb() {
    return {
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      radius: 8 + Math.random() * 25,
      baseOpacity: 0.03 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.005 + Math.random() * 0.015,
      vy: 0.05 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      swayAmp: 0.5 + Math.random() * 1.5,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.008 + Math.random() * 0.015,
      // Soft pink or warm tones
      hue: 330 + Math.random() * 30,
    };
  }

  update() {
    if (this.disposed) return;
    this.time++;

    this.ctx.clearRect(0, 0, this.w, this.h);

    // ── Twinkling sparkles ──
    for (const sp of this.sparkles) {
      sp.twinklePhase += sp.twinkleSpeed;
      sp.y += sp.vy;
      sp.x += sp.vx;

      // Wrap around
      if (sp.y > this.h + 5) {
        sp.y = -5;
        sp.x = Math.random() * this.w;
      }
      if (sp.x < -5) sp.x = this.w + 5;
      if (sp.x > this.w + 5) sp.x = -5;

      const alpha = sp.baseOpacity * (Math.sin(sp.twinklePhase) * 0.5 + 0.5);
      if (alpha < 0.05) continue;

      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${sp.hue}, ${sp.saturation}%, 85%, ${alpha})`;
      this.ctx.fill();

      // Tiny glow on brighter sparkles
      if (sp.size > 1.5 && alpha > 0.3) {
        this.ctx.beginPath();
        this.ctx.arc(sp.x, sp.y, sp.size * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${sp.hue}, ${sp.saturation}%, 80%, ${alpha * 0.15})`;
        this.ctx.fill();
      }
    }

    // ── Soft light orbs ──
    for (const orb of this.orbs) {
      orb.phase += orb.phaseSpeed;
      orb.swayPhase += orb.swaySpeed;
      orb.y += orb.vy;
      orb.x += orb.vx + Math.sin(orb.swayPhase) * orb.swayAmp * 0.05;

      if (orb.y > this.h + orb.radius * 2) {
        orb.y = -orb.radius * 2;
        orb.x = Math.random() * this.w;
      }
      if (orb.x < -orb.radius * 2) orb.x = this.w + orb.radius;
      if (orb.x > this.w + orb.radius * 2) orb.x = -orb.radius;

      const pulse = orb.baseOpacity * (Math.sin(orb.phase) * 0.3 + 0.7);

      const grad = this.ctx.createRadialGradient(
        orb.x,
        orb.y,
        0,
        orb.x,
        orb.y,
        orb.radius,
      );
      grad.addColorStop(0, `hsla(${orb.hue}, 70%, 70%, ${pulse})`);
      grad.addColorStop(0.5, `hsla(${orb.hue}, 60%, 60%, ${pulse * 0.4})`);
      grad.addColorStop(1, `hsla(${orb.hue}, 50%, 50%, 0)`);

      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = grad;
      this.ctx.fill();
    }
  }

  dispose() {
    this.disposed = true;
    window.removeEventListener("resize", this._onResize);
  }
}
