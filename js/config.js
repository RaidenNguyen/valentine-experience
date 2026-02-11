/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   LEGENDARY VALENTINE EXPERIENCE — CONFIG           ║
 * ║   Central configuration for all modules             ║
 * ╚══════════════════════════════════════════════════════╝
 */

export const CONFIG = {
  // ── Scene 1 — Particle Heart ──
  scene1: {
    title: "Happy Valentine",
    quote: '"Em làm thế giới trong anh đẹp hơn ! ❤️💕"',
    duration: 10000, // ms before transition begins
  },

  // ── Scene 2 — Valentine Greeting ──
  scene2: {
    title: "Happy Valentine's Day 💘",
    greeting:
      "Chúc em có 1 ngày valentine vui vẻ , cảm ơn em đã đến bên anh , anh mong cho hai ta có thể đồng hành cùng nhau đến sau này <3",
    wordDelay: 250, // ms between each word appearing
  },

  // ── QR Code ──
  qr: {
    url: "https://github.com/RaidenNguyen/Happy-valantine",
    cellSize: 5,
  },

  // ── Audio ──
  audio: {
    volume: 0.25,
    fadeInDuration: 2000,
    heartbeatVolume: 0.3,
  },

  // ── Performance ──
  performance: {
    mobileBreakpoint: 768,
  },
};
