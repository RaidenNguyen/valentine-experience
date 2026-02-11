/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   LEGENDARY VALENTINE EXPERIENCE — MAIN ORCHESTRATOR║
 * ║   Particle Heart → Blooming Flower → Heart QR       ║
 * ╚══════════════════════════════════════════════════════╝
 */

import { CONFIG } from "./config.js";
import { ParticleHeart } from "./webgl-heart.js";
import { ConfettiSystem } from "./particles.js";
import { BloomingFlower } from "./flower.js";

// ═══════════ STATE ═══════════
const state = {
  currentScene: "loading",
  particleHeart: null,
  confetti: null,
  flower: null,
  soundEnabled: true,
  startTime: 0,
  raf: null,
};

// ═══════════ DOM REFS ═══════════
const $ = (sel) => document.querySelector(sel);

// ═══════════ AUDIO SYSTEM ═══════════
class AudioManager {
  constructor() {
    this.audio = new Audio(CONFIG.audio.file);
    this.audio.loop = CONFIG.audio.loop;
    this.audio.volume = 0; // Start at 0 for fade in
    this.ctx = null; // For heartbeat SFX only
    this.isPlaying = false;
  }

  async init() {
    // We can try to init web audio context for SFX if needed
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      return true;
    } catch (e) {
      console.warn("Web Audio for SFX unavailable:", e);
      return false;
    }
  }

  startRomanticPad() {
    if (this.isPlaying) return;

    // Play music
    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
        // Fade in volume
        let vol = 0;
        const targetVol = CONFIG.audio.volume;
        const fadeInterval = setInterval(() => {
          vol += 0.05;
          if (vol >= targetVol) {
            vol = targetVol;
            clearInterval(fadeInterval);
          }
          this.audio.volume = vol;
        }, 100);
      })
      .catch((e) => {
        console.warn("Autoplay prevented. Music will start on interaction.", e);
      });
  }

  playHeartbeat() {
    // Use Web Audio for dramatic heartbeat effect
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Create heartbeat sound (thump-thump)
    const createThump = (time) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(55, time);
      osc.frequency.exponentialRampToValueAtTime(25, time + 0.15);
      g.gain.setValueAtTime(0.3, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.4);
    };

    createThump(now);
    createThump(now + 0.55);
    createThump(now + 1.1);
  }

  toggleMute() {
    if (this.audio.muted) {
      this.audio.muted = false;
      this.audio.volume = CONFIG.audio.volume;
      return true; // Not muted
    } else {
      this.audio.muted = true;
      return false; // Muted
    }
  }

  dispose() {
    this.audio.pause();
    this.audio.src = "";
    if (this.ctx) this.ctx.close();
  }
}

const audio = new AudioManager();

// ═══════════ LOADING ═══════════
function initLoading() {
  const fill = $(".loading-fill");
  let progress = 0;
  const iv = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress > 100) progress = 100;
    if (fill) fill.style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(iv);
      setTimeout(showStart, 400);
    }
  }, 180);
}

function showStart() {
  const ls = $("#loading-screen");
  if (ls) ls.style.display = "none";
  const so = $("#start-overlay");
  if (so) so.style.display = "flex";
  const btn = $("#start-btn");
  if (btn) btn.addEventListener("click", startExperience, { once: true });
}

// ═══════════ START ═══════════
async function startExperience() {
  const so = $("#start-overlay");
  if (so) {
    so.style.opacity = "0";
    so.style.transition = "opacity 0.8s ease";
    setTimeout(() => (so.style.display = "none"), 800);
  }

  await audio.init();
  audio.startRomanticPad();

  const st = $("#sound-toggle");
  if (st) st.classList.add("visible");

  startScene1();
}

// ═══════════ SCENE 1 — PARTICLE HEART ═══════════
function startScene1() {
  state.currentScene = "scene1";

  const s1 = $("#scene1");
  if (s1) s1.style.display = "block";

  const canvas = $("#scene1-canvas");
  if (canvas) {
    state.particleHeart = new ParticleHeart(canvas);
  }

  const title = $("#scene1-title");
  if (title) setTimeout(() => (title.style.opacity = "1"), 300);

  state.startTime = performance.now();
  let frame = 0;

  function loop(timestamp) {
    if (
      state.currentScene !== "scene1" &&
      state.currentScene !== "transitioning"
    )
      return;

    if (state.particleHeart) state.particleHeart.update(frame++);

    const elapsed = timestamp - state.startTime;
    if (elapsed > CONFIG.scene1.duration && state.currentScene === "scene1") {
      beginTransition();
    }

    if (state.currentScene === "transitioning" && state.particleHeart) {
      state.particleHeart.intensify();
    }

    state.raf = requestAnimationFrame(loop);
  }

  state.raf = requestAnimationFrame(loop);
}

function beginTransition() {
  state.currentScene = "transitioning";
  audio.playHeartbeat();

  setTimeout(() => {
    const fade = $("#scene1-fade");
    if (fade) fade.classList.add("active");

    setTimeout(() => {
      endScene1();
      startScene2();
    }, 1500);
  }, 2000);
}

function endScene1() {
  if (state.particleHeart) {
    state.particleHeart.dispose();
    state.particleHeart = null;
  }
  if (state.raf) cancelAnimationFrame(state.raf);
  const s1 = $("#scene1");
  if (s1) s1.style.display = "none";
}

// ═══════════ SCENE 2 — DARK GREETING + BLOOMING FLOWER ═══════════
function startScene2() {
  state.currentScene = "scene2";

  const s2 = $("#scene2");
  if (s2) {
    s2.style.display = "block";
    s2.classList.add("scene-enter");
  }

  // Init sparkle/light particles for dark background
  const confettiCanvas = $("#confetti-canvas");
  if (confettiCanvas) {
    state.confetti = new ConfettiSystem(confettiCanvas);
  }

  // Init blooming flower
  const flowerCanvas = $("#flower-canvas");
  if (flowerCanvas) {
    state.flower = new BloomingFlower(flowerCanvas);
  }

  // Start greeting animation
  startGreeting();

  function scene2Loop() {
    if (state.currentScene !== "scene2") return;
    if (state.confetti) state.confetti.update();
    if (state.flower) state.flower.update();
    requestAnimationFrame(scene2Loop);
  }
  requestAnimationFrame(scene2Loop);
}

function startGreeting() {
  const container = $("#greeting-text");
  if (!container) return;

  const words = CONFIG.scene2.greeting.split(/\s+/);
  container.innerHTML = "";

  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word;
    container.appendChild(span);
    setTimeout(
      () => span.classList.add("visible"),
      CONFIG.scene2.wordDelay * (i + 1) + 3000,
    );
  });
}

// ═══════════ SOUND TOGGLE ═══════════
function setupSound() {
  const btn = $("#sound-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const isOn = audio.toggleMute();
    const on = $("#sound-on-icon");
    const off = $("#sound-off-icon");
    if (isOn) {
      if (on) on.style.display = "block";
      if (off) off.style.display = "none";
    } else {
      if (on) on.style.display = "none";
      if (off) off.style.display = "block";
    }
  });
}

// ═══════════ INIT ═══════════
document.addEventListener("DOMContentLoaded", () => {
  setupSound();
  initLoading();
});
