#!/usr/bin/env ts-node
/**
 * cli.ts — Генератор казино-ассетов (терминал)
 *
 * Запуск:
 *   npx ts-node src/cli.ts               → интерактивный режим
 *   npx ts-node src/cli.ts --batch       → сгенерировать все встроенные примеры
 */

import * as fs       from "fs";
import * as path     from "path";
import * as readline from "readline";
import {
  generateLogo,
  generateIcon,
  LOGO_STYLES,
  LOGO_STYLES_FRAMED,
  LOGO_STYLES_FRAMELESS,
  ICON_STYLES,
  LogoStyle,
  IconStyle,
} from "./casino-generator";

// ══════════════════════════════════════════════════════════════════
//  ПАЛИТРА
// ══════════════════════════════════════════════════════════════════

interface ColorEntry { label: string; hex: string }

const COLORS: Record<string, ColorEntry> = {
  "1": { label: "Золото",          hex: "#FFD700" },
  "2": { label: "Неоновый циан",   hex: "#00FFFF" },
  "3": { label: "Серебро",         hex: "#C0C0C0" },
  "4": { label: "Фиолетовый",      hex: "#CC44FF" },
  "5": { label: "Голубой",         hex: "#4FC3F7" },
  "6": { label: "Красный неон",    hex: "#FF3355" },
  "7": { label: "Оранжевый",       hex: "#FFA500" },
  "8": { label: "Зелёный",         hex: "#00C853" },
  "9": { label: "Розовый",         hex: "#FF4081" },
};

// ══════════════════════════════════════════════════════════════════
//  ПАКЕТНЫЕ ПРИМЕРЫ
// ══════════════════════════════════════════════════════════════════

interface LogoBatchItem { text: string; color: string; style: LogoStyle }
interface IconBatchItem { text: string; color: string; style: IconStyle; bgFill?: "solid" | "gradient" }

const BATCH_LOGOS: LogoBatchItem[] = [
  { text: "LUCKY STAR",    color: "#FFD700", style: "gold"     },
  { text: "NEON PALACE",   color: "#00FFFF", style: "neon"     },
  { text: "ROYAL FLUSH",   color: "#C0C0C0", style: "chrome"   },
  { text: "VELVET ROOM",   color: "#CC44FF", style: "velvet"   },
  { text: "BLUE DIAMOND",  color: "#4FC3F7", style: "diamond"  },
  { text: "JACKPOT KING",  color: "#FFA500", style: "royal"    },
  { text: "GOLDEN WAVE",   color: "#FFD700", style: "gradient" },
  { text: "AURORA CASINO", color: "#00FFAA", style: "aurora"   },
];

const BATCH_ICONS: IconBatchItem[] = [
  { text: "LUCKY",      color: "#FFD700", style: "diamond" },
  { text: "SPADES",     color: "#E0E0E0", style: "spade"   },
  { text: "ROYAL",      color: "#FFD700", style: "crown"   },
  { text: "INFERNO",    color: "#FF4400", style: "flame"   },
  { text: "ACE",        color: "#FFD700", style: "ace"     },
  { text: "RICH",       color: "#FFD700", style: "coin"    },
  { text: "CASINO",     color: "#FF1744", style: "chip"    },
  { text: "STAR",       color: "#00E5FF", style: "star"    },
  { text: "LUCK",       color: "#00C853", style: "clover"  },
  { text: "JOKER",      color: "#AA00FF", style: "joker"   },
  // Иконки с залитым фоном (solid)
  { text: "LUCKY STAR", color: "#FFD700", style: "star",    bgFill: "solid"    },
  { text: "RED QUEEN",  color: "#FF1744", style: "crown",   bgFill: "solid"    },
  { text: "DEEP SEA",   color: "#0080FF", style: "diamond", bgFill: "solid"    },
  // Иконки с градиентным фоном
  { text: "HOT FLAME",  color: "#FF6600", style: "flame",   bgFill: "gradient" },
  { text: "LUCKY COIN", color: "#FFD700", style: "coin",    bgFill: "gradient" },
  { text: "ACE HIGH",   color: "#CC44FF", style: "ace",     bgFill: "gradient" },
];

// ══════════════════════════════════════════════════════════════════
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ══════════════════════════════════════════════════════════════════

const OUT = path.join(__dirname, "..", "output");

function save(buffer: Buffer, filename: string): string {
  fs.mkdirSync(OUT, { recursive: true });
  const p = path.join(OUT, filename);
  fs.writeFileSync(p, buffer);
  return p;
}

function slug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

// ══════════════════════════════════════════════════════════════════
//  ПАКЕТНЫЙ РЕЖИМ
// ══════════════════════════════════════════════════════════════════

function runBatch(): void {
  fs.mkdirSync(OUT, { recursive: true });
  console.log("\n  ── Пакетная генерация ──────────────────────────────────────");

  console.log("  Генерируем логотипы…");
  BATCH_LOGOS.forEach((opts, i) => {
    const asset = generateLogo(opts);
    const file  = save(asset.buffer, `logo_${String(i + 1).padStart(2, "0")}_${slug(opts.text)}.png`);
    console.log(`  ✓ [${asset.width}×${asset.height}]  ${path.basename(file)}`);
  });

  console.log("\n  Генерируем иконки…");
  BATCH_ICONS.forEach((opts, i) => {
    const asset = generateIcon({ ...opts, size: 512 });
    const bgSuffix = opts.bgFill ? `_${opts.bgFill}` : "";
    const file  = save(asset.buffer, `icon_${String(i + 1).padStart(2, "0")}_${slug(opts.text)}_${opts.style}${bgSuffix}.png`);
    console.log(`  ✓ [${asset.width}×${asset.height}]  ${path.basename(file)}`);
  });

  console.log(`\n  Все файлы сохранены → ${OUT}\n`);
}

// ══════════════════════════════════════════════════════════════════
//  ИНТЕРАКТИВНЫЙ РЕЖИМ
// ══════════════════════════════════════════════════════════════════

async function pickColor(rl: readline.Interface): Promise<string> {
  console.log("\n  Доступные цвета:");
  for (const [k, v] of Object.entries(COLORS)) {
    console.log(`    ${k}) ${v.label.padEnd(20)} ${v.hex}`);
  }
  console.log("    c) Свой цвет (формат #RRGGBB)");

  const input = (await ask(rl, "\n  Выберите цвет [1-9 или c]: ")).trim();
  if (input === "c") {
    const hex = (await ask(rl, "  Введите hex (#RRGGBB): ")).trim();
    return /^#?[0-9a-fA-F]{6}$/.test(hex)
      ? (hex.startsWith("#") ? hex : `#${hex}`)
      : "#FFD700";
  }
  return COLORS[input]?.hex ?? "#FFD700";
}

async function runInteractive(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n  ╔══════════════════════════════════════════╗");
  console.log("  ║   ГЕНЕРАТОР КАЗИНО-АССЕТОВ  v2.0         ║");
  console.log("  ╚══════════════════════════════════════════╝\n");

  let running = true;
  while (running) {
    console.log("  Что сгенерировать?");
    console.log("    1) Логотип");
    console.log("    2) Иконка  (512×512)");
    console.log("    3) Оба     (один текст и цвет)");
    console.log("    4) Пакет   (все встроенные примеры)");
    console.log("    0) Выход\n");

    const choice = (await ask(rl, "  Выбор: ")).trim();

    if (choice === "0") { running = false; break; }
    if (choice === "4") { runBatch(); continue; }
    if (!["1", "2", "3"].includes(choice)) continue;

    const text  = (await ask(rl, "\n  Введите текст: ")).trim() || "CASINO";
    const color = await pickColor(rl);
    console.log(`\n  Выбран цвет: ${color}`);

    if (choice === "1" || choice === "3") {
      console.log("\n  Рамка логотипа:");
      console.log("    1) С рамкой        (случайный: gold, neon, chrome, velvet, diamond, royal)");
      console.log("    2) Без рамки       (случайный: gradient, aurora)");
      console.log("    3) Только текст    (прозрачный фон, без всего)");
      console.log("    4) Выбрать стиль вручную");
      console.log("    0) Полностью случайно");
      const fi = (await ask(rl, "\n  Выбор [0-4]: ")).trim();

      let style: LogoStyle | undefined;
      if (fi === "1") {
        style = LOGO_STYLES_FRAMED[Math.floor(Math.random() * LOGO_STYLES_FRAMED.length)];
        console.log(`  → Стиль: ${style}`);
      } else if (fi === "2") {
        style = LOGO_STYLES_FRAMELESS[Math.floor(Math.random() * LOGO_STYLES_FRAMELESS.length)];
        console.log(`  → Стиль: ${style}`);
      } else if (fi === "3") {
        style = "plain";
        console.log(`  → Стиль: plain`);
      } else if (fi === "4") {
        const stylesStr = LOGO_STYLES.map((s, i) => `${i + 1}) ${s}`).join("  ");
        console.log(`\n  Стили: ${stylesStr}`);
        const si = (await ask(rl, `  Выберите стиль [1-${LOGO_STYLES.length}]: `)).trim();
        style = LOGO_STYLES[parseInt(si, 10) - 1] ?? "gold";
      }
      // fi === "0" или любой другой → style остаётся undefined → случайный

      const asset = generateLogo({ text, color, style });
      const styleName = style ?? "random";
      const file  = save(asset.buffer, `logo_${slug(text)}_${styleName}.png`);
      console.log(`\n  ✓ Логотип сохранён → ${file}  [${asset.width}×${asset.height}]\n`);
    }

    if (choice === "2" || choice === "3") {
      const stylesStr = ICON_STYLES.map((s, i) => `${i + 1}) ${s}`).join("  ");
      console.log(`\n  Стили иконки: ${stylesStr}`);
      const si    = (await ask(rl, "  Выберите стиль [1-10]: ")).trim();
      const style = ICON_STYLES[parseInt(si, 10) - 1] ?? "diamond";
      console.log("\n  Фон иконки:  1) Прозрачный  2) Тёмный (solid)  3) Цветной градиент");
      const bi     = (await ask(rl, "  Выберите фон [1-3]: ")).trim();
      const bgFill = bi === "2" ? "solid" as const : bi === "3" ? "gradient" as const : undefined;
      const asset = generateIcon({ text, color, style, size: 512, bgFill });
      const bgSuffix = bgFill ? `_${bgFill}` : "";
      const file  = save(asset.buffer, `icon_${slug(text)}_${style}${bgSuffix}.png`);
      console.log(`\n  ✓ Иконка сохранена → ${file}  [${asset.width}×${asset.height}]\n`);
    }
  }

  rl.close();
  console.log("  До свидания!\n");
}

// ══════════════════════════════════════════════════════════════════
//  ТОЧКА ВХОДА
// ══════════════════════════════════════════════════════════════════

if (process.argv.includes("--batch")) {
  runBatch();
} else {
  runInteractive().catch(console.error);
}
