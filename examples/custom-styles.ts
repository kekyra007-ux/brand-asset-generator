/**
 * custom-styles.ts — Цветовые вариации и опции bgFill
 * Запуск: npx ts-node examples/custom-styles.ts
 */
import * as fs from "fs";
import * as path from "path";
import { generateLogo, generateIcon } from "../src/core/asset-generator";

const outputDir = path.join(__dirname, "../output/examples/custom");
fs.mkdirSync(outputDir, { recursive: true });

const colors = [
  { name: "gold",    color: "#FFD700" },
  { name: "silver",  color: "#C0C0C0" },
  { name: "rose",    color: "#FF4081" },
  { name: "cyan",    color: "#00E5FF" },
  { name: "emerald", color: "#00C853" },
];

for (const { name, color } of colors) {
  const logo = generateLogo({ text: "BRAND", color, style: "royal" });
  fs.writeFileSync(path.join(outputDir, `logo_${name}.png`), logo.buffer);

  const icon = generateIcon({ text: "B", color, style: "crown", size: 512, bgFill: "gradient" });
  fs.writeFileSync(path.join(outputDir, `icon_${name}.png`), icon.buffer);

  console.log(`✓ ${name}`);
}

console.log(`\nСохранено в: ${outputDir}`);
