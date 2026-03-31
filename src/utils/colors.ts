// src/utils/colors.ts
import { CanvasRenderingContext2D } from "canvas";
import { GlowSpot } from "../core/types";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 255, g: 215, b: 0 };
}

export function lighten(hex: string, amt: number): string {
  const c = hexToRgb(hex);
  return `rgb(${Math.min(255, c.r + amt)},${Math.min(255, c.g + amt)},${Math.min(255, c.b + amt)})`;
}

export function darken(hex: string, amt: number): string {
  const c = hexToRgb(hex);
  return `rgb(${Math.max(0, c.r - amt)},${Math.max(0, c.g - amt)},${Math.max(0, c.b - amt)})`;
}

export function rgba(hex: string, a: number): string {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

export function drawMeshGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  spots: GlowSpot[],
  blendMode:
    | "screen"
    | "overlay"
    | "multiply"
    | "lighten"
    | "darken"
    | "source-over" = "screen",
): void {
  ctx.save();
  ctx.globalCompositeOperation = blendMode;
  for (const s of spots) {
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
    g.addColorStop(0, rgba(s.color, s.alpha));
    g.addColorStop(0.55, rgba(s.color, s.alpha * 0.38));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

export function drawMetalShimmer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  numBands = 5,
  alpha = 0.14,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  const d = Math.hypot(w, h);
  const cx = w / 2, cy = h / 2;
  for (let i = 0; i < numBands; i++) {
    const angle = (i / numBands) * Math.PI;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const g = ctx.createLinearGradient(
      cx - cos * d * 0.5, cy - sin * d * 0.5,
      cx + cos * d * 0.5, cy + sin * d * 0.5,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.46, rgba(color, alpha * 0.4));
    g.addColorStop(0.5, rgba(lighten(color, 80), alpha));
    g.addColorStop(0.54, rgba(color, alpha * 0.4));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}
