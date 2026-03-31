/**
 * basic-logo.ts — Базовый пример генерации логотипов
 * Запуск: npx ts-node examples/basic-logo.ts
 */
import * as fs from "fs";
import * as path from "path";
import { generateLogo } from "../src/core/asset-generator";

const outputDir = path.join(__dirname, "../output/examples");
fs.mkdirSync(outputDir, { recursive: true });

const logo1 = generateLogo({ text: "MY BRAND", color: "#FFD700" });
fs.writeFileSync(path.join(outputDir, "basic-gold.png"), logo1.buffer);
console.log(`✓ basic-gold.png [${logo1.width}×${logo1.height}]`);

const logo2 = generateLogo({ text: "MY BRAND", color: "#00FFFF", style: "neon" });
fs.writeFileSync(path.join(outputDir, "basic-neon.png"), logo2.buffer);
console.log(`✓ basic-neon.png [${logo2.width}×${logo2.height}]`);

const logo3 = generateLogo({ text: "MY BRAND", color: "#FF4400", style: "plain" });
fs.writeFileSync(path.join(outputDir, "basic-plain.png"), logo3.buffer);
console.log(`✓ basic-plain.png [${logo3.width}×${logo3.height}]`);

console.log(`\nСохранено в: ${outputDir}`);
