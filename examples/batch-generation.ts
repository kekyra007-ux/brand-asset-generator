/**
 * batch-generation.ts — Генерация всех комбинаций стилей
 * Запуск: npx ts-node examples/batch-generation.ts
 */
import * as fs from "fs";
import * as path from "path";
import { generateLogo, generateIcon, LOGO_STYLES, ICON_STYLES } from "../src/core/asset-generator";

const outputDir = path.join(__dirname, "../output/examples/batch");
fs.mkdirSync(outputDir, { recursive: true });

const text = "ACME";
const color = "#FFD700";

console.log("Стили логотипов:");
for (const style of LOGO_STYLES) {
  const asset = generateLogo({ text, color, style });
  fs.writeFileSync(path.join(outputDir, `logo_${style}.png`), asset.buffer);
  console.log(`  ✓ logo_${style}.png [${asset.width}×${asset.height}]`);
}

console.log("\nСтили иконок:");
for (const style of ICON_STYLES) {
  const asset = generateIcon({ text, color, style, size: 512 });
  fs.writeFileSync(path.join(outputDir, `icon_${style}.png`), asset.buffer);
  console.log(`  ✓ icon_${style}.png`);
}

console.log(`\nСохранено в: ${outputDir}`);
