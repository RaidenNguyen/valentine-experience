/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   BLOOMING ROSE ANIMATION                           ║
 * ║   A rose that gradually unfurls its petals           ║
 * ║   Smooth canvas-2D animation with glow effects      ║
 * ╚══════════════════════════════════════════════════════╝
 */

export class BloomingFlower {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.disposed = false;
    this.progress = 0; // 0 → 1, controls bloom
    this.bloomSpeed = 0.003; // How fast the flower opens
    this.breathPhase = 0;
    this.sparkles = [];

    this._resize();
    this._initSparkles();

    this._onResize = this._resize.bind(this);
    window.addEventListener("resize", this._onResize);
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cx = this.w / 2;
    this.cy = this.h / 2;
    this.baseSize = Math.min(this.w, this.h) * 0.28;
  }

  _initSparkles() {
    this.sparkles = [];
    for (let i = 0; i < 30; i++) {
      this.sparkles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 0.6 + Math.random() * 1.2,
        size: 1 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.04,
      });
    }
  }

  /**
   * Draw a single petal using Bézier curves.
   * @param {number} angle - rotation angle
   * @param {number} size - petal length
   * @param {number} width - petal width factor
   * @param {number} openness - 0 (closed) to 1 (full open)
   * @param {string} color - fill color
   * @param {number} alpha - opacity
   */
  _drawPetal(angle, size, width, openness, color, alpha) {
    if (openness <= 0) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.rotate(angle);

    const len = size * openness;
    const w = size * width * openness * 0.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Left curve
    ctx.bezierCurveTo(-w * 0.6, -len * 0.3, -w, -len * 0.7, 0, -len);
    // Right curve
    ctx.bezierCurveTo(w, -len * 0.7, w * 0.6, -len * 0.3, 0, 0);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();

    // Subtle vein line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, -len * 0.5, 0, -len * 0.85);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  update() {
    if (this.disposed) return;

    this.ctx.clearRect(0, 0, this.w, this.h);

    // Progress the bloom
    if (this.progress < 1) {
      this.progress += this.bloomSpeed;
      if (this.progress > 1) this.progress = 1;
    }

    this.breathPhase += 0.015;
    const breath = 1 + Math.sin(this.breathPhase) * 0.03;
    const p = this.progress;

    // ── Outer glow ──
    const glowR = this.baseSize * 1.8 * p;
    const glow = this.ctx.createRadialGradient(
      this.cx,
      this.cy,
      0,
      this.cx,
      this.cy,
      glowR,
    );
    glow.addColorStop(0, `rgba(255, 80, 120, ${0.15 * p})`);
    glow.addColorStop(0.5, `rgba(255, 50, 100, ${0.06 * p})`);
    glow.addColorStop(1, "rgba(255, 50, 100, 0)");
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, this.w, this.h);

    // ── PETAL LAYERS (back to front) ──

    // Layer 5: Outer large petals (bloom last)
    const layer5Progress = Math.max(0, (p - 0.6) / 0.4);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.2;
      this._drawPetal(
        angle,
        this.baseSize * 1.1 * breath,
        0.45,
        layer5Progress,
        `hsl(${340 + i * 3}, 65%, ${40 + i * 2}%)`,
        0.5 * layer5Progress,
      );
    }

    // Layer 4: Medium-outer petals
    const layer4Progress = Math.max(0, (p - 0.45) / 0.4);
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + 0.5;
      this._drawPetal(
        angle,
        this.baseSize * 0.9 * breath,
        0.5,
        layer4Progress,
        `hsl(${345 + i * 3}, 70%, ${45 + i * 2}%)`,
        0.6 * layer4Progress,
      );
    }

    // Layer 3: Medium petals
    const layer3Progress = Math.max(0, (p - 0.3) / 0.4);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.8;
      this._drawPetal(
        angle,
        this.baseSize * 0.72 * breath,
        0.55,
        layer3Progress,
        `hsl(${348 + i * 4}, 75%, ${50 + i * 2}%)`,
        0.7 * layer3Progress,
      );
    }

    // Layer 2: Inner petals
    const layer2Progress = Math.max(0, (p - 0.15) / 0.4);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 1.2;
      this._drawPetal(
        angle,
        this.baseSize * 0.55 * breath,
        0.6,
        layer2Progress,
        `hsl(${350 + i * 4}, 80%, ${55 + i * 2}%)`,
        0.8 * layer2Progress,
      );
    }

    // Layer 1: Core petals (bloom first)
    const layer1Progress = Math.max(0, p / 0.4);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 1.6;
      this._drawPetal(
        angle,
        this.baseSize * 0.38 * breath,
        0.65,
        Math.min(layer1Progress, 1),
        `hsl(${352 + i * 5}, 85%, ${60 + i * 3}%)`,
        0.9 * Math.min(layer1Progress, 1),
      );
    }

    // ── Center bud ──
    const centerSize = this.baseSize * 0.12 * Math.min(p * 3, 1) * breath;
    const centerGrad = this.ctx.createRadialGradient(
      this.cx,
      this.cy,
      0,
      this.cx,
      this.cy,
      centerSize,
    );
    centerGrad.addColorStop(0, "rgba(255, 200, 180, 0.9)");
    centerGrad.addColorStop(0.5, "rgba(255, 120, 140, 0.7)");
    centerGrad.addColorStop(1, "rgba(220, 50, 80, 0.3)");

    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, centerSize, 0, Math.PI * 2);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = centerGrad;
    this.ctx.fill();

    // ── Sparkles around flower ──
    if (p > 0.3) {
      const sparkleAlpha = (p - 0.3) / 0.7;
      for (const sp of this.sparkles) {
        sp.phase += sp.speed;
        const twinkle = (Math.sin(sp.phase) * 0.5 + 0.5) * sparkleAlpha;
        const dist = sp.dist * this.baseSize * p;
        const sx = this.cx + Math.cos(sp.angle + this.breathPhase * 0.1) * dist;
        const sy = this.cy + Math.sin(sp.angle + this.breathPhase * 0.1) * dist;

        this.ctx.beginPath();
        this.ctx.arc(sx, sy, sp.size * twinkle, 0, Math.PI * 2);
        this.ctx.globalAlpha = twinkle * 0.7;
        this.ctx.fillStyle = "#ffe0e8";
        this.ctx.fill();
      }
    }

    this.ctx.globalAlpha = 1;
  }

  isFullyBloomed() {
    return this.progress >= 1;
  }

  dispose() {
    this.disposed = true;
    window.removeEventListener("resize", this._onResize);
  }
}
