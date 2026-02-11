/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   HEART-SHAPED QR CODE — RED ON WHITE               ║
 * ║   Uses qrcode-generator CDN, masked to heart shape  ║
 * ╚══════════════════════════════════════════════════════╝
 */

import { CONFIG } from "./config.js";

/**
 * Load the qrcode-generator lib from CDN (lazy).
 */
async function loadQRLib() {
  if (window.qrcode) return window.qrcode;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js";
    script.onload = () => resolve(window.qrcode);
    script.onerror = () => reject(new Error("Failed to load QR library"));
    document.head.appendChild(script);
  });
}

/**
 * Returns true if (x, y) [0–1 normalized] is inside a heart silhouette.
 */
function isInsideHeart(x, y) {
  // Map to [-1, 1]
  const hx = (x - 0.5) * 2.4;
  const hy = -(y - 0.4) * 2.8; // flip Y, adjust center
  // Implicit heart equation: (x² + y² - 1)³ - x²y³ ≤ 0
  const a = hx * hx + hy * hy - 1;
  return a * a * a - hx * hx * hy * hy * hy <= 0;
}

/**
 * Render a heart-shaped QR code into the target container.
 * Red modules on white background, masked to heart shape.
 */
export async function renderHeartQR(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const qrcodeLib = await loadQRLib();

  // Generate QR data
  const qr = qrcodeLib(0, "H"); // Type 0 = auto, ECL H
  qr.addData(CONFIG.qr.url);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = CONFIG.qr.cellSize || 5;
  const totalSize = moduleCount * cellSize;

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, totalSize, totalSize);

  // Draw QR modules — only those inside heart shape
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const nx = (col + 0.5) / moduleCount;
      const ny = (row + 0.5) / moduleCount;

      if (isInsideHeart(nx, ny)) {
        if (qr.isDark(row, col)) {
          // Dark module = red
          ctx.fillStyle = "#dc143c"; // Crimson red
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
        // Light module inside heart = white (already background)
      }
      // Outside heart = white (already background)
    }
  }

  // Convert canvas to image for crisp display
  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  img.alt = "Heart-shaped QR Code";
  img.style.cssText = `
    width: clamp(200px, 55vw, 360px);
    height: auto;
    image-rendering: pixelated;
    display: block;
  `;

  container.innerHTML = "";
  container.appendChild(img);
}
