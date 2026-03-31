/**
 * advanced-usage.ts — Многословный текст, форматы экспорта, варианты bgFill
 * Запуск: npx ts-node examples/advanced-usage.ts
 */
import * as fs from "fs";
import * as path from "path";
import { generateLogo, generateIcon } from "../src/core/asset-generator";

const outputDir = path.join(__dirname, "../output/examples/advanced");
fs.mkdirSync(outputDir, { recursive: true });

// Multi-word text
const logos = [
  { text: "THE GOLDEN AGE", color: "#FFD700", style: "gold" as const },
  { text: "NEON CITY LIGHTS", color: "#00FFFF", style: "neon" as const },
  { text: "MIDNIGHT AURORA", color: "#AA00FF", style: "aurora" as const },
  { text: "PURE GRADIENT", color: "#FF4081", style: "gradient" as const },
  { text: "CLEAN TEXT", color: "#00C853", style: "plain" as const },
];

for (const opts of logos) {
  const asset = generateLogo(opts);
  const name = opts.text.toLowerCase().replace(/\s+/g, "_");
  fs.writeFileSync(path.join(outputDir, `logo_${name}.png`), asset.buffer);
  console.log(`✓ "${opts.text}" [${asset.width}×${asset.height}]`);
}

// Icon bgFill variants
const fills = [undefined, "solid" as const, "gradient" as const];
const fillNames = ["transparent", "solid", "gradient"];
fills.forEach((bgFill, i) => {
  const asset = generateIcon({ text: "PRO", color: "#FFD700", style: "diamond", bgFill, size: 512 });
  fs.writeFileSync(path.join(outputDir, `icon_diamond_${fillNames[i]}.png`), asset.buffer);
  console.log(`✓ diamond icon (${fillNames[i]})`);
});

// JPG export
const jpgAsset = generateLogo({ text: "JPEG TEST", color: "#FF4400", style: "royal" }, { format: "jpg", quality: 85 });
fs.writeFileSync(path.join(outputDir, "logo_jpeg.jpg"), jpgAsset.buffer);
console.log(`✓ Экспорт JPEG [${jpgAsset.mimeType}]`);

console.log(`\nСохранено в: ${outputDir}`);
