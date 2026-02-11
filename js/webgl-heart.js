/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   PARTICLE FIREWORK HEART                           ║
 * ║   Lines radiating outward forming a heart shape     ║
 * ║   + Shooting stars + Floating snowflakes/sparkles   ║
 * ╚══════════════════════════════════════════════════════╝
 */

import { CONFIG } from "./config.js";

export class ParticleHeart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.lines = [];
    this.stars = [];
    this.sparkles = [];
    this.disposed = false;
    this.phase = 0;
    this.builtUp = false; // Track if heart is fully built
    this.buildProgress = 0;

    const isMobile = window.innerWidth < CONFIG.performance.mobileBreakpoint;
    this.lineCount = isMobile ? 300 : 600;
    this.starCount = isMobile ? 3 : 6;
    this.sparkleCount = isMobile ? 40 : 80;

    this._resize();
    this._initHeartLines();
    this._initShootingStars();
    this._initSparkles();

    this._onResize = this._resize.bind(this);
    window.addEventListener("resize", this._onResize);
  }

  _resize() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.cx = this.w / 2;
    this.cy = this.h / 2 + this.h * 0.05; // Slightly below center
    this.heartSize = Math.min(this.w, this.h) * 0.32;
  }

  /**
   * Generate heart outline points using the parametric heart equation.
   * t from 0 to 2π, heart shape via:
   *   x = 16 sin³(t)
   *   y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
   */
  _heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    const scale = this.heartSize / 18;
    return {
      x: this.cx + x * scale,
      y: this.cy + y * scale - this.heartSize * 0.15,
    };
  }

  _initHeartLines() {
    this.lines = [];
    for (let i = 0; i < this.lineCount; i++) {
      const t = (i / this.lineCount) * Math.PI * 2;
      const target = this._heartPoint(t);

      // Lines radiate from center outward to heart surface
      const angle = Math.atan2(target.y - this.cy, target.x - this.cx);
      const dist = Math.sqrt(
        (target.x - this.cx) ** 2 + (target.y - this.cy) ** 2,
      );

      // Random length variation for organic feel
      const lengthVariation = 0.7 + Math.random() * 0.6;
      const lineLength = dist * lengthVariation;

      this.lines.push({
        angle: angle,
        targetDist: lineLength,
        currentDist: 0,
        speed: 1.5 + Math.random() * 2.5,
        width: 0.5 + Math.random() * 1.8,
        hue: 340 + Math.random() * 30, // Pink to red range
        saturation: 70 + Math.random() * 30,
        lightness: 50 + Math.random() * 20,
        opacity: 0.4 + Math.random() * 0.6,
        delay: Math.random() * 60, // Staggered appearance
        born: false,
      });
    }
  }

  _initShootingStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      this._addStar(true);
    }
  }

  _addStar(initial = false) {
    this.stars.push({
      x: Math.random() * this.w,
      y: initial ? Math.random() * this.h * 0.5 : -10,
      length: 60 + Math.random() * 120,
      speed: 3 + Math.random() * 5,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3, // Diagonal
      opacity: 0.3 + Math.random() * 0.5,
      width: 1 + Math.random() * 1.5,
      active: !initial || Math.random() > 0.5,
      delay: initial ? Math.random() * 200 : 0,
    });
  }

  _initSparkles() {
    this.sparkles = [];
    for (let i = 0; i < this.sparkleCount; i++) {
      this.sparkles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: 1 + Math.random() * 3,
        opacity: Math.random(),
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  update(frame) {
    if (this.disposed) return;

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.phase++;

    // ── Draw sparkles (snowflake-like dots) ──
    for (const sp of this.sparkles) {
      sp.phase += sp.twinkleSpeed;
      sp.y += 0.15;
      sp.x += sp.drift;
      const alpha = (Math.sin(sp.phase) * 0.5 + 0.5) * 0.6;

      if (sp.y > this.h + 5) {
        sp.y = -5;
        sp.x = Math.random() * this.w;
      }
      if (sp.x < -5) sp.x = this.w + 5;
      if (sp.x > this.w + 5) sp.x = -5;

      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fill();
    }

    // ── Draw shooting stars ──
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      if (s.delay > 0) {
        s.delay--;
        continue;
      }
      if (!s.active) {
        s.active = true;
      }

      const endX = s.x + Math.cos(s.angle) * s.length;
      const endY = s.y + Math.sin(s.angle) * s.length;

      const grad = this.ctx.createLinearGradient(s.x, s.y, endX, endY);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = s.width;
      this.ctx.stroke();

      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;

      // Off screen → re-spawn
      if (s.x > this.w + 50 || s.y > this.h + 50) {
        this.stars.splice(i, 1);
        this._addStar(false);
      }
    }

    // ── Draw particle heart lines (radiating outward) ──
    this.buildProgress = Math.min(this.buildProgress + 0.8, this.lineCount);

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];

      if (i > this.buildProgress) continue;
      if (line.delay > 0) {
        line.delay--;
        continue;
      }

      // Grow the line outward
      if (line.currentDist < line.targetDist) {
        line.currentDist += line.speed;
        if (line.currentDist > line.targetDist)
          line.currentDist = line.targetDist;
      }

      // Subtle breathing/pulse
      const pulse = 1 + Math.sin(this.phase * 0.02 + i * 0.01) * 0.04;
      const dist = line.currentDist * pulse;

      const startX = this.cx + Math.cos(line.angle) * 2;
      const startY = this.cy + Math.sin(line.angle) * 2;
      const endX = this.cx + Math.cos(line.angle) * dist;
      const endY = this.cy + Math.sin(line.angle) * dist;

      // Gradient from center (bright) to edge (fade)
      const grad = this.ctx.createLinearGradient(startX, startY, endX, endY);
      const color = `hsla(${line.hue}, ${line.saturation}%, ${line.lightness}%`;
      grad.addColorStop(0, `${color}, 0.1)`);
      grad.addColorStop(0.3, `${color}, ${line.opacity})`);
      grad.addColorStop(1, `${color}, ${line.opacity * 0.3})`);

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = line.width;
      this.ctx.lineCap = "round";
      this.ctx.stroke();
    }

    // ── Glow at the center ──
    const glowRadius = this.heartSize * 0.15;
    const glow = this.ctx.createRadialGradient(
      this.cx,
      this.cy,
      0,
      this.cx,
      this.cy,
      glowRadius,
    );
    glow.addColorStop(0, "rgba(255, 100, 150, 0.4)");
    glow.addColorStop(0.5, "rgba(255, 80, 130, 0.15)");
    glow.addColorStop(1, "rgba(255, 80, 130, 0)");
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(
      this.cx - glowRadius,
      this.cy - glowRadius,
      glowRadius * 2,
      glowRadius * 2,
    );

    // ── Ambient glow around heart ──
    const outerGlow = this.ctx.createRadialGradient(
      this.cx,
      this.cy,
      this.heartSize * 0.3,
      this.cx,
      this.cy,
      this.heartSize * 1.2,
    );
    outerGlow.addColorStop(0, "rgba(255, 60, 100, 0.06)");
    outerGlow.addColorStop(1, "rgba(255, 60, 100, 0)");
    this.ctx.fillStyle = outerGlow;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  // Intensify effect for transition
  intensify() {
    for (const line of this.lines) {
      line.lightness = Math.min(line.lightness + 0.3, 90);
      line.opacity = Math.min(line.opacity + 0.01, 1);
    }
  }

  dispose() {
    this.disposed = true;
    window.removeEventListener("resize", this._onResize);
  }
}
