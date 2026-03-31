import {
  createCanvas,
  CanvasRenderingContext2D,
  CanvasGradient,
  registerFont,
} from "canvas";
import { readdirSync, statSync } from "fs";
import { join } from "path";

// ══════════════════════════════════════════════════════════════════
//  ИНТЕРФЕЙСЫ
// ══════════════════════════════════════════════════════════════════

export interface BaseResourceI {
  text: string;
  color?: string | undefined;
}

export interface LogoOptions extends BaseResourceI {
  style?: LogoStyle;
}

export interface IconOptions extends BaseResourceI {
  size?: number;
  style?: IconStyle;
  bgFill?: "solid" | "gradient";
}

export interface Asset {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/png";
}

export type LogoStyle =
  | "gold"
  | "neon"
  | "chrome"
  | "velvet"
  | "diamond"
  | "royal"
  | "gradient"
  | "aurora"
  | "plain";
export type IconStyle =
  | "diamond"
  | "spade"
  | "crown"
  | "flame"
  | "ace"
  | "coin"
  | "chip"
  | "star"
  | "clover"
  | "joker";

// ══════════════════════════════════════════════════════════════════
//  КОНСТАНТЫ
// ══════════════════════════════════════════════════════════════════

export const LOGO_STYLES: LogoStyle[] = [
  "gold",
  "neon",
  "chrome",
  "velvet",
  "diamond",
  "royal",
  "gradient",
  "aurora",
  "plain",
];
export const LOGO_STYLES_FRAMED: LogoStyle[] = [
  "gold", "neon", "chrome", "velvet", "diamond", "royal",
];
export const LOGO_STYLES_FRAMELESS: LogoStyle[] = ["gradient", "aurora", "plain"];
export const ICON_STYLES: IconStyle[] = [
  "diamond",
  "spade",
  "crown",
  "flame",
  "ace",
  "coin",
  "chip",
  "star",
  "clover",
  "joker",
];

// ══════════════════════════════════════════════════════════════════
//  ЗАГРУЗКА ШРИФТОВ
// ══════════════════════════════════════════════════════════════════

interface FontInfo {
  name: string;
  path: string;
}

const loadedFonts: FontInfo[] = [];

function loadFontsFromDirectory(): void {
  const fontsDir = join(__dirname, "../fonts");

  try {
    const fontFamilies = readdirSync(fontsDir);

    for (const family of fontFamilies) {
      const familyPath = join(fontsDir, family);
      if (!statSync(familyPath).isDirectory()) continue;

      // Ищем жирные варианты шрифтов
      const boldVariants = [
        `${family}-Black.ttf`,
        `${family}-Bold.ttf`,
        `${family}-Regular.ttf`,
        `static/${family}-Black.ttf`,
        `static/${family}-Bold.ttf`,
        `static/${family}-Regular.ttf`,
      ];

      for (const variant of boldVariants) {
        const fontPath = join(familyPath, variant);
        try {
          statSync(fontPath);
          registerFont(fontPath, { family: family });
          loadedFonts.push({ name: family, path: fontPath });
          break; // Берем первый найденный вариант
        } catch (e) {
          // Файл не найден, пробуем следующий
        }
      }
    }
  } catch (e) {
    console.warn("Не удалось загрузить шрифты из папки fonts");
  }
}

// Загружаем шрифты при инициализации
loadFontsFromDirectory();

function getRandomFont(): string {
  if (loadedFonts.length === 0) {
    return "bold 70px serif"; // Fallback
  }
  const randomFont =
    loadedFonts[Math.floor(Math.random() * loadedFonts.length)];
  return `bold 70px '${randomFont.name}'`;
}

// ══════════════════════════════════════════════════════════════════
//  ЦВЕТОВЫЕ УТИЛИТЫ
// ══════════════════════════════════════════════════════════════════

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 255, g: 215, b: 0 };
}

function lighten(hex: string, amt: number): string {
  const c = hexToRgb(hex);
  return `rgb(${Math.min(255, c.r + amt)},${Math.min(255, c.g + amt)},${Math.min(255, c.b + amt)})`;
}

function darken(hex: string, amt: number): string {
  const c = hexToRgb(hex);
  return `rgb(${Math.max(0, c.r - amt)},${Math.max(0, c.g - amt)},${Math.max(0, c.b - amt)})`;
}

function rgba(hex: string, a: number): string {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

// ══════════════════════════════════════════════════════════════════
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ РИСОВАНИЯ
// ══════════════════════════════════════════════════════════════════

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ──────────────────────────────────────────────────────────────────
//  MESH GRADIENT — эмуляция через radial-spots + blend mode
// ──────────────────────────────────────────────────────────────────

interface GlowSpot {
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
}

function drawMeshGradient(
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

// ──────────────────────────────────────────────────────────────────
//  METALLIC SHIMMER — эмуляция конического градиента
//  (несколько угловых линейных градиентов через overlay)
// ──────────────────────────────────────────────────────────────────

function drawMetalShimmer(
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
  const cx = w / 2,
    cy = h / 2;
  for (let i = 0; i < numBands; i++) {
    const angle = (i / numBands) * Math.PI;
    const cos = Math.cos(angle),
      sin = Math.sin(angle);
    const g = ctx.createLinearGradient(
      cx - cos * d * 0.5,
      cy - sin * d * 0.5,
      cx + cos * d * 0.5,
      cy + sin * d * 0.5,
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

// ──────────────────────────────────────────────────────────────────
//  FACE GRADIENT — текстовый градиент «лица» 3D-текста
// ──────────────────────────────────────────────────────────────────

function buildFaceGradient(
  ctx: CanvasRenderingContext2D,
  h: number,
  color: string,
  style: LogoStyle,
): CanvasGradient {
  const tg = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.9);
  if (style === "chrome") {
    tg.addColorStop(0, "#ffffff");
    tg.addColorStop(0.15, "#ffffff");
    tg.addColorStop(0.25, lighten(color, 70));
    tg.addColorStop(0.5, color);
    tg.addColorStop(0.75, darken(color, 30));
    tg.addColorStop(1, darken(color, 70));
  } else if (style === "diamond") {
    tg.addColorStop(0, "#ffffff");
    tg.addColorStop(0.2, lighten(color, 80));
    tg.addColorStop(0.45, lighten(color, 40));
    tg.addColorStop(0.6, color);
    tg.addColorStop(0.8, darken(color, 25));
    tg.addColorStop(1, darken(color, 50));
  } else if (style === "velvet") {
    tg.addColorStop(0, lighten(color, 100));
    tg.addColorStop(0.25, lighten(color, 60));
    tg.addColorStop(0.5, lighten(color, 20));
    tg.addColorStop(0.75, color);
    tg.addColorStop(1, darken(color, 30));
  } else if (style === "neon") {
    tg.addColorStop(0, lighten(color, 80));
    tg.addColorStop(0.3, lighten(color, 60));
    tg.addColorStop(0.5, color);
    tg.addColorStop(0.7, darken(color, 20));
    tg.addColorStop(1, darken(color, 35));
  } else if (style === "royal") {
    tg.addColorStop(0, lighten(color, 75));
    tg.addColorStop(0.25, lighten(color, 45));
    tg.addColorStop(0.55, color);
    tg.addColorStop(0.8, darken(color, 35));
    tg.addColorStop(1, darken(color, 55));
  } else if (style === "gradient") {
    tg.addColorStop(0, lighten(color, 90));
    tg.addColorStop(0.2, lighten(color, 60));
    tg.addColorStop(0.5, color);
    tg.addColorStop(0.8, darken(color, 30));
    tg.addColorStop(1, darken(color, 50));
  } else if (style === "aurora") {
    tg.addColorStop(0, "#ffffff");
    tg.addColorStop(0.15, lighten(color, 85));
    tg.addColorStop(0.45, lighten(color, 50));
    tg.addColorStop(0.7, color);
    tg.addColorStop(1, darken(color, 25));
  } else {
    // gold: теплый, классический
    tg.addColorStop(0, lighten(color, 85));
    tg.addColorStop(0.25, lighten(color, 50));
    tg.addColorStop(0.55, color);
    tg.addColorStop(0.8, darken(color, 30));
    tg.addColorStop(1, darken(color, 45));
  }
  return tg;
}

function cornerAccents(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  sz: number,
  lw = 2,
  alpha = 0.55,
): void {
  ctx.save();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = lw;
  ctx.lineCap = "square";
  const corners: [number, number, number, number][] = [
    [14, 14, 1, 1],
    [w - 14, 14, -1, 1],
    [14, h - 14, 1, -1],
    [w - 14, h - 14, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x + dx * sz, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * sz);
    ctx.stroke();
  }
  ctx.restore();
}

function dividerLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  alpha = 0.28,
): void {
  ctx.save();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = 1;
  const pad = w * 0.07;
  for (const yFrac of [0.17, 0.83]) {
    ctx.beginPath();
    ctx.moveTo(pad, h * yFrac);
    ctx.lineTo(w - pad, h * yFrac);
    ctx.stroke();
  }
  ctx.restore();
}

// ══════════════════════════════════════════════════════════════════
//  ЛОГОТИП
// ══════════════════════════════════════════════════════════════════

/**
 * Генерирует логотип казино.
 * Принимает BaseResourceI: text + опциональный color (одно значение).
 * Ширина рассчитывается автоматически по длине текста + отступы.
 */

export function generateLogo({
  text,
  color = "#FFD700",
  style,
}: LogoOptions): Asset {
  // Если стиль не указан — выбираем случайно (иногда с рамкой, иногда без)
  const resolvedStyle: LogoStyle =
    style ?? LOGO_STYLES[Math.floor(Math.random() * LOGO_STYLES.length)];
  // Высота автоматически подстраивается под текст
  const height = 140;
  const fontStr = getRandomFont();

  // Измеряем точную ширину текста
  const probe = createCanvas(1, 1).getContext("2d");
  probe.font = fontStr;
  const textW = Math.ceil(probe.measureText(text).width);

  // Автоматически подстраиваем высоту под длину текста
  const autoHeight = Math.max(100, Math.min(200, 100 + text.length * 3));

  // Горизонтальный отступ — пропорционален высоте, минимум чтобы декорации поместились
  const padX = Math.max(Math.floor(autoHeight * 0.72), 80);
  const width = textW + padX * 2;

  const canvas = createCanvas(width, autoHeight);
  const ctx = canvas.getContext("2d");

  // Глобальный clip — ничего не вылезает за скруглённые углы
  roundedRect(ctx, 0, 0, width, autoHeight, 14);
  ctx.clip();

  _logoBg(ctx, width, autoHeight, color, resolvedStyle);
  _logoBorder(ctx, width, autoHeight, color, resolvedStyle);
  _logoDecorations(ctx, width, autoHeight, color, resolvedStyle);
  _logoText(ctx, width, autoHeight, text, fontStr, color, resolvedStyle);

  return {
    buffer: canvas.toBuffer("image/png"),
    width,
    height: autoHeight,
    mimeType: "image/png",
  };
}

function _logoBg(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  style: LogoStyle,
): void {
  if (style === "plain") return; // прозрачный фон — ничего не рисуем
  ctx.save();
  roundedRect(ctx, 0, 0, w, h, 14);
  ctx.clip();

  // ── 1. Mesh gradient (набор радиальных «пятен» с blending) ────────
  const spots: GlowSpot[] = [];
  if (style === "neon") {
    // Два боковых пятна + центр — screen даёт «свечение на темноте»
    spots.push(
      { x: w * 0.18, y: h * 0.5, r: h * 1.1, color, alpha: 0.11 },
      { x: w * 0.82, y: h * 0.5, r: h * 1.1, color, alpha: 0.11 },
      { x: w * 0.5, y: h * 0.5, r: h * 0.7, color, alpha: 0.08 },
    );
    drawMeshGradient(ctx, w, h, spots, "screen");
  } else if (style === "velvet") {
    spots.push(
      { x: w * 0.25, y: h * 0.25, r: h * 1.0, color, alpha: 0.1 },
      { x: w * 0.75, y: h * 0.75, r: h * 0.9, color, alpha: 0.09 },
      {
        x: w * 0.6,
        y: h * 0.2,
        r: h * 0.6,
        color: lighten(color, 60),
        alpha: 0.07,
      },
    );
    drawMeshGradient(ctx, w, h, spots, "overlay");
  } else if (style === "diamond") {
    spots.push(
      { x: w * 0.2, y: h * 0.3, r: h * 1.0, color, alpha: 0.09 },
      { x: w * 0.8, y: h * 0.7, r: h * 0.9, color, alpha: 0.09 },
      {
        x: w * 0.5,
        y: h * 0.1,
        r: h * 0.7,
        color: lighten(color, 70),
        alpha: 0.07,
      },
      {
        x: w * 0.5,
        y: h * 0.9,
        r: h * 0.7,
        color: lighten(color, 40),
        alpha: 0.05,
      },
    );
    drawMeshGradient(ctx, w, h, spots, "screen");
  } else if (style === "gradient") {
    // Горизонтальный цветовой градиент — сам задаёт форму без рамки
    const bgGH = ctx.createLinearGradient(0, 0, w, 0);
    bgGH.addColorStop(0,    rgba(darken(color, 68), 0.97));
    bgGH.addColorStop(0.22, rgba(darken(color, 42), 0.97));
    bgGH.addColorStop(0.5,  rgba(darken(color, 22), 0.98));
    bgGH.addColorStop(0.78, rgba(darken(color, 42), 0.97));
    bgGH.addColorStop(1,    rgba(darken(color, 68), 0.97));
    ctx.fillStyle = bgGH;
    ctx.fillRect(0, 0, w, h);
    const vGH = ctx.createLinearGradient(0, 0, 0, h);
    vGH.addColorStop(0, rgba(lighten(color, 45), 0.16));
    vGH.addColorStop(0.45, "rgba(0,0,0,0)");
    vGH.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = vGH;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    const cGH = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.35);
    cGH.addColorStop(0, rgba(lighten(color, 60), 0.22));
    cGH.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = cGH;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (style === "aurora") {
    // Диагональный aurora-градиент с цветовым сдвигом оттенка
    const { r: auR, g: auG, b: auB } = hexToRgb(color);
    const aurora2 = `rgba(${Math.min(255,auB)},${Math.min(255,auR)},${Math.min(255,auG)},0.90)`;
    const bgAU = ctx.createLinearGradient(0, 0, w, h);
    bgAU.addColorStop(0,    rgba(darken(color, 58), 0.97));
    bgAU.addColorStop(0.35, rgba(color, 0.95));
    bgAU.addColorStop(0.65, aurora2);
    bgAU.addColorStop(1,    rgba(darken(color, 48), 0.97));
    ctx.fillStyle = bgAU;
    ctx.fillRect(0, 0, w, h);
    spots.push(
      { x: w * 0.28, y: h * 0.5, r: h * 1.1, color, alpha: 0.22 },
      { x: w * 0.72, y: h * 0.5, r: h * 1.0, color: lighten(color, 55), alpha: 0.18 },
    );
    drawMeshGradient(ctx, w, h, spots, "screen");
  } else {
    // gold / chrome / royal — тёплое/нейтральное mesh
    spots.push(
      { x: w * 0.22, y: h * 0.35, r: h * 1.1, color, alpha: 0.09 },
      { x: w * 0.78, y: h * 0.65, r: h * 1.0, color, alpha: 0.08 },
      {
        x: w * 0.5,
        y: h * 0.5,
        r: h * 0.6,
        color: lighten(color, 55),
        alpha: 0.06,
      },
    );
    drawMeshGradient(ctx, w, h, spots, "overlay");
  }

  // ── 2. Metallic shimmer (эмуляция конического) ────────────────────
  if (style !== "neon" && style !== "velvet" && style !== "gradient" && style !== "aurora") {
    const shimmerAlpha =
      style === "chrome" ? 0.22 : style === "diamond" ? 0.12 : 0.16;
    drawMetalShimmer(ctx, w, h, color, 4, shimmerAlpha);
  }

  ctx.restore();
}

function _logoBorder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  style: LogoStyle,
): void {
  if (style === "gradient" || style === "aurora" || style === "plain") return;
  ctx.save();
  if (style === "neon") {
    const layers: [number, string][] = [
      [8, rgba(color, 0.18)],
      [5, rgba(color, 0.32)],
      [2, rgba(color, 0.55)],
      [0, rgba(color, 0.9)],
    ];
    for (const [blur, stroke] of layers) {
      roundedRect(ctx, 4, 4, w - 8, h - 8, 11);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = blur === 0 ? 1.5 : 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = blur * 3;
      ctx.stroke();
    }
  } else {
    // Тень рамки
    roundedRect(ctx, 3, 3, w - 6, h - 6, 12);
    ctx.strokeStyle = rgba(color, 0.18);
    ctx.lineWidth = 1;
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Основная рамка с градиентом
    const gr = ctx.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, lighten(color, 75));
    gr.addColorStop(0.4, color);
    gr.addColorStop(0.7, lighten(color, 40));
    gr.addColorStop(1, darken(color, 35));
    roundedRect(ctx, 5, 5, w - 10, h - 10, 11);
    ctx.strokeStyle = gr;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Внутренняя тонкая рамка
    roundedRect(ctx, 9, 9, w - 18, h - 18, 8);
    ctx.strokeStyle = rgba(color, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function _logoDecorations(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  style: LogoStyle,
): void {
  if (style === "neon" || style === "gradient" || style === "aurora" || style === "plain") return;
  cornerAccents(
    ctx,
    w,
    h,
    color,
    Math.round(h * 0.2),
    Math.max(1.5, h * 0.02),
    0.5,
  );
  dividerLines(ctx, w, h, color, 0.25);
}

function _logoText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  fontStr: string,
  color: string,
  style: LogoStyle,
): void {
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.font = fontStr;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // ── Plain: просто текст на прозрачном фоне ────────────────────
  if (style === "plain") {
    ctx.fillStyle = buildFaceGradient(ctx, h, color, "gold");
    ctx.fillText(text, cx, cy);
    ctx.restore();
    return;
  }

  // ── Neon / Aurora: многопроходное свечение ─────────────────────
  if (style === "neon" || style === "aurora") {
    const passes: [number, number][] = [
      [28, 0.12],
      [16, 0.22],
      [8, 0.38],
      [3, 0.62],
      [0, 1.0],
    ];
    for (const [blur, alpha] of passes) {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.fillStyle = rgba(color, alpha);
      ctx.fillText(text, cx, cy);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillText(text, cx, cy - h * 0.03);
    ctx.restore();
    return;
  }

  // ── 3D Cartoon Extrude ────────────────────────────────────────
  const depth = Math.round(h * 0.065); // глубина выдавливания

  // Усилить тени для gold стиля чтобы текст не сливался
  const shadowMultiplier = style === "gold" ? 1.4 : 1.0;

  // 1. Жёсткая тень под блоком (hard drop-shadow, cartoon-стиль)
  ctx.fillStyle = `rgba(0,0,0,${0.3 * shadowMultiplier})`;
  ctx.fillText(text, cx + depth * 0.9, cy + depth * 1.1);

  // 2. Extrude stack — боковые грани (темные для четкого 3D)
  //    Каждый слой чуть светлее предыдущего → градиент тени
  for (let i = depth; i >= 1; i--) {
    const t = 1 - i / depth; // 0 = дно (темно), 1 = край лица
    // Намного темнее для gold: 100-120 вместо 75-105
    const baseDark = style === "gold" ? 110 - t * 20 : 75 - t * 30;
    ctx.fillStyle = rgba(darken(color, baseDark), 0.92);
    ctx.fillText(text, cx + i * 0.6, cy + i * 0.7);
  }

  // 3. Лицевая грань — buildFaceGradient (richly-colored gradient)
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = buildFaceGradient(ctx, h, color, style);
  ctx.fillText(text, cx, cy);

  // 4. Bevel: яркий stroke по верхнему краю лица
  ctx.strokeStyle = rgba(lighten(color, 90), 0.6);
  ctx.lineWidth = Math.max(1, h * 0.013);
  ctx.lineJoin = "round";
  ctx.strokeText(text, cx - 0.5, cy - 0.5);

  // 5. Gloss — белый блик в верхней трети (overlay-blend)
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  const gloss = ctx.createLinearGradient(0, cy - h * 0.42, 0, cy + h * 0.08);
  gloss.addColorStop(0, "rgba(255,255,255,0.55)");
  gloss.addColorStop(0.45, "rgba(255,255,255,0.20)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.fillText(text, cx, cy);
  ctx.restore();

  ctx.restore();
}

// ══════════════════════════════════════════════════════════════════
//  ИКОНКА
// ══════════════════════════════════════════════════════════════════

/**
 * Генерирует квадратную иконку казино.
 * Принимает BaseResourceI: text + опциональный color (одно значение).
 * Размер строго 1:1, по умолчанию 512×512.
 */
export function generateIcon({
  text,
  color = "#FFD700",
  size = 512,
  style = "diamond",
  bgFill,
}: IconOptions): Asset {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  _iconBg(ctx, size, color, style, bgFill);
  _iconSymbol(ctx, size, color, style);
  _iconLabel(ctx, size, text, color);

  return {
    buffer: canvas.toBuffer("image/png"),
    width: size,
    height: size,
    mimeType: "image/png",
  };
}

function _iconBg(
  ctx: CanvasRenderingContext2D,
  s: number,
  color: string,
  _style: IconStyle,
  bgFill?: "solid" | "gradient",
): void {
  const r = s * 0.18;
  ctx.save();
  roundedRect(ctx, 0, 0, s, s, r);
  ctx.clip();

  if (bgFill === "solid") {
    // Однотонный тёмный фон с цветовым оттенком
    const bgS = ctx.createLinearGradient(0, 0, 0, s);
    bgS.addColorStop(0, rgba(darken(color, 50), 1.0));
    bgS.addColorStop(1, rgba(darken(color, 78), 1.0));
    ctx.fillStyle = bgS;
    ctx.fillRect(0, 0, s, s);
    drawMetalShimmer(ctx, s, s, color, 3, 0.12);
  } else if (bgFill === "gradient") {
    // Радиальный цветовой градиент — выразительный фон
    const bgG = ctx.createRadialGradient(s * 0.42, s * 0.38, 0, s / 2, s / 2, s * 0.7);
    bgG.addColorStop(0, rgba(darken(color, 18), 1.0));
    bgG.addColorStop(0.5, rgba(darken(color, 48), 1.0));
    bgG.addColorStop(1, rgba(darken(color, 78), 1.0));
    ctx.fillStyle = bgG;
    ctx.fillRect(0, 0, s, s);
    const iconSpots: GlowSpot[] = [
      { x: s * 0.42, y: s * 0.38, r: s * 0.52, color, alpha: 0.28 },
      { x: s * 0.65, y: s * 0.62, r: s * 0.38, color: lighten(color, 45), alpha: 0.16 },
    ];
    drawMeshGradient(ctx, s, s, iconSpots, "screen");
  } else {
    // Прозрачный фон с тонким свечением (поведение по умолчанию)
    const glow = ctx.createRadialGradient(
      s / 2,
      s * 0.44,
      s * 0.04,
      s / 2,
      s * 0.44,
      s * 0.55,
    );
    glow.addColorStop(0, rgba(color, 0.1));
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s, s);
  }
  ctx.restore();

  // Двойная рамка
  ctx.save();
  const off = s * 0.038;
  roundedRect(ctx, off, off, s - off * 2, s - off * 2, r - off);
  ctx.strokeStyle = rgba(color, 0.75);
  ctx.lineWidth = Math.max(2, s * 0.007);
  ctx.shadowColor = rgba(color, 0.5);
  ctx.shadowBlur = s * 0.025;
  ctx.stroke();

  roundedRect(
    ctx,
    off + s * 0.016,
    off + s * 0.016,
    s - (off + s * 0.016) * 2,
    s - (off + s * 0.016) * 2,
    r - off - s * 0.016,
  );
  ctx.strokeStyle = rgba(color, 0.25);
  ctx.lineWidth = Math.max(1, s * 0.004);
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.restore();
}

function _iconSymbol(
  ctx: CanvasRenderingContext2D,
  s: number,
  color: string,
  style: IconStyle,
): void {
  const cx = s / 2,
    cy = s * 0.42,
    r = s * 0.285;

  const sg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  sg.addColorStop(0, lighten(color, 75));
  sg.addColorStop(0.45, color);
  sg.addColorStop(1, darken(color, 45));

  ctx.save();
  ctx.fillStyle = sg;
  ctx.shadowColor = rgba(color, 0.65);
  ctx.shadowBlur = s * 0.035;

  switch (style) {
    case "diamond":
      _symDiamond(ctx, cx, cy, r, color);
      break;
    case "spade":
      _symSpade(ctx, cx, cy, r, color);
      break;
    case "crown":
      _symCrown(ctx, cx, cy, r, color);
      break;
    case "flame":
      _symFlame(ctx, cx, cy, r, color);
      break;
    case "ace":
      _symAce(ctx, cx, cy, r, color, sg);
      break;
    case "coin":
      _symCoin(ctx, cx, cy, r, color);
      break;
    case "chip":
      _symChip(ctx, cx, cy, r, color);
      break;
    case "star":
      _symStar(ctx, cx, cy, r);
      break;
    case "clover":
      _symClover(ctx, cx, cy, r);
      break;
    case "joker":
      _symJoker(ctx, cx, cy, r, color, sg);
      break;
  }
  ctx.restore();
}

function _symDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.68, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.68, cy);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = lighten(color, 80);
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.68, cy);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = darken(color, 50);
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + r * 0.68, cy);
  ctx.lineTo(cx, cy + r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.1, cy - r * 0.7);
  ctx.lineTo(cx + r * 0.22, cy - r * 0.35);
  ctx.lineTo(cx, cy - r * 0.08);
  ctx.lineTo(cx - r * 0.28, cy - r * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function _symSpade(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.arc(cx - r * 0.24, cy - r * 0.22, r * 0.48, Math.PI, 0);
  ctx.arc(cx + r * 0.24, cy - r * 0.22, r * 0.48, Math.PI, 0);
  ctx.arc(cx, cy + r * 0.1, r * 0.52, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - r * 0.22, cy + r * 0.65);
  ctx.lineTo(cx + r * 0.22, cy + r * 0.65);
  ctx.lineTo(cx + r * 0.08, cy + r * 0.14);
  ctx.lineTo(cx - r * 0.08, cy + r * 0.14);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(
    cx - r * 0.1,
    cy - r * 0.4,
    r * 0.22,
    r * 0.28,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

function _symCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  const base = cy + r * 0.55,
    top = cy - r * 0.55;
  ctx.beginPath();
  ctx.moveTo(cx - r, base);
  ctx.lineTo(cx - r, cy);
  ctx.lineTo(cx - r * 0.52, top + r * 0.18);
  ctx.lineTo(cx - r * 0.22, cy + r * 0.06);
  ctx.lineTo(cx, top);
  ctx.lineTo(cx + r * 0.22, cy + r * 0.06);
  ctx.lineTo(cx + r * 0.52, top + r * 0.18);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx + r, base);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.52, top + r * 0.18);
  ctx.lineTo(cx - r * 0.22, cy + r * 0.06);
  ctx.lineTo(cx, top);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  const jewels: [number, number][] = [
    [cx - r * 0.52, top + r * 0.22],
    [cx, top + r * 0.02],
    [cx + r * 0.52, top + r * 0.22],
  ];
  jewels.forEach(([jx, jy]) => {
    const jr = r * 0.09;
    ctx.beginPath();
    ctx.arc(jx, jy, jr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(jx - jr * 0.25, jy - jr * 0.25, jr * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,220,1)";
    ctx.fill();
  });
  ctx.restore();
}

function _symFlame(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r);
  ctx.bezierCurveTo(
    cx - r * 0.78,
    cy + r * 0.26,
    cx - r * 0.58,
    cy - r * 0.2,
    cx - r * 0.14,
    cy - r * 0.5,
  );
  ctx.bezierCurveTo(
    cx - r * 0.04,
    cy - r * 0.1,
    cx - r * 0.2,
    cy - r * 0.6,
    cx,
    cy - r,
  );
  ctx.bezierCurveTo(
    cx + r * 0.2,
    cy - r * 0.6,
    cx + r * 0.04,
    cy - r * 0.1,
    cx + r * 0.14,
    cy - r * 0.5,
  );
  ctx.bezierCurveTo(
    cx + r * 0.58,
    cy - r * 0.2,
    cx + r * 0.78,
    cy + r * 0.26,
    cx,
    cy + r,
  );
  ctx.closePath();
  ctx.fill();

  const ig = ctx.createLinearGradient(cx, cy + r, cx, cy - r * 0.6);
  ig.addColorStop(0, "rgba(255,255,255,0)");
  ig.addColorStop(0.5, rgba(lighten(color, 70), 0.3));
  ig.addColorStop(1, "rgba(255,255,200,0.48)");
  ctx.save();
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.46);
  ctx.bezierCurveTo(
    cx - r * 0.28,
    cy + r * 0.18,
    cx - r * 0.18,
    cy - r * 0.1,
    cx,
    cy - r * 0.5,
  );
  ctx.bezierCurveTo(
    cx + r * 0.18,
    cy - r * 0.1,
    cx + r * 0.28,
    cy + r * 0.18,
    cx,
    cy + r * 0.46,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function _symAce(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  grad: CanvasGradient,
): void {
  const cw = r * 1.45,
    ch = r * 1.95,
    cr = r * 0.12;
  roundedRect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, cr);
  ctx.fillStyle = "#12121e";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.04;
  ctx.stroke();

  ctx.save();
  ctx.shadowBlur = r * 0.15;
  ctx.shadowColor = rgba(color, 0.55);
  ctx.font = `bold ${r * 1.05}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = grad;
  ctx.fillText("A", cx, cy);
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("A", cx, cy - r * 0.06);
  ctx.restore();
}

function _symCoin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(cx + 4, cy + 5, r, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const cg = ctx.createRadialGradient(
    cx - r * 0.2,
    cy - r * 0.2,
    r * 0.08,
    cx,
    cy,
    r,
  );
  cg.addColorStop(0, lighten(color, 80));
  cg.addColorStop(0.42, color);
  cg.addColorStop(1, darken(color, 52));
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.strokeStyle = darken(color, 35);
  ctx.lineWidth = r * 0.055;
  ctx.stroke();

  ctx.save();
  ctx.font = `bold ${r * 0.9}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = darken(color, 45);
  ctx.fillText("$", cx, cy);
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(
    cx - r * 0.28,
    cy - r * 0.45,
    r * 0.36,
    r * 0.24,
    -0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

function _symChip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(cx + 4, cy + 5, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#141414";
  ctx.fill();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72);
    ctx.arc(cx, cy, r, a, a + Math.PI / 8);
    ctx.lineTo(cx, cy);
    ctx.fillStyle = i % 2 === 0 ? color : lighten(color, 52);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.56, 0, Math.PI * 2);
  ctx.fillStyle = "#161616";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.04;
  ctx.stroke();
}

function _symStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  const ir = r * 0.43;

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : ir;
    const x = cx + Math.cos(a) * rad + 3,
      y = cy + Math.sin(a) * rad + 4;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : ir;
    i === 0
      ? ctx.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
      : ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

function _symClover(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  const br = r * 0.42;
  const buds: [number, number][] = [
    [cx, cy - br * 0.74],
    [cx - br * 0.74, cy + br * 0.3],
    [cx + br * 0.74, cy + br * 0.3],
  ];

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#000000";
  buds.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx + 3, by + 4, br, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  buds.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#ffffff";
  buds.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.ellipse(
      bx - br * 0.22,
      by - br * 0.32,
      br * 0.32,
      br * 0.2,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(cx - r * 0.18, cy + r);
  ctx.lineTo(cx + r * 0.18, cy + r);
  ctx.lineTo(cx + r * 0.07, cy + br * 0.55);
  ctx.lineTo(cx - r * 0.07, cy + br * 0.55);
  ctx.closePath();
  ctx.fill();
}

function _symJoker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  grad: CanvasGradient,
): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.32, r, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(
    cx - r * 0.18,
    cy + r * 0.28,
    r * 0.42,
    r * 0.07,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.52, cy + r * 0.32);
  ctx.lineTo(cx - r * 0.28, cy - r * 0.5);
  ctx.bezierCurveTo(
    cx - r * 0.14,
    cy - r * 0.82,
    cx + r * 0.14,
    cy - r * 0.82,
    cx + r * 0.28,
    cy - r * 0.5,
  );
  ctx.lineTo(cx + r * 0.52, cy + r * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = darken(color, 35);
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.52, cy + r * 0.12);
  ctx.lineTo(cx - r * 0.44, cy - r * 0.06);
  ctx.lineTo(cx + r * 0.44, cy - r * 0.06);
  ctx.lineTo(cx + r * 0.52, cy + r * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const br = r * 0.13;
  ctx.beginPath();
  ctx.arc(cx + r * 0.28, cy - r * 0.5, br, 0, Math.PI * 2);
  ctx.fillStyle = lighten(color, 78);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    cx + r * 0.28 - br * 0.28,
    cy - r * 0.5 - br * 0.28,
    br * 0.38,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "rgba(255,255,220,0.9)";
  ctx.fill();
}

function _iconLabel(
  ctx: CanvasRenderingContext2D,
  s: number,
  text: string,
  color: string,
): void {
  const disp = text.toUpperCase();
  const maxW = s * 0.86;
  let fs = s * 0.108;
  ctx.save();
  ctx.font = `bold ${fs}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Уменьшаем шрифт если текст с пробелами не влезает
  while (fs > s * 0.055 && ctx.measureText(disp).width > maxW) {
    fs -= 1;
    ctx.font = `bold ${fs}px serif`;
  }

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillText(disp, s / 2 + 1, s * 0.876 + 2);

  const g = ctx.createLinearGradient(0, s * 0.84, 0, s * 0.92);
  g.addColorStop(0, lighten(color, 65));
  g.addColorStop(1, darken(color, 22));
  ctx.fillStyle = g;
  ctx.shadowColor = rgba(color, 0.45);
  ctx.shadowBlur = s * 0.018;
  ctx.fillText(disp, s / 2, s * 0.876);
  ctx.restore();
}
