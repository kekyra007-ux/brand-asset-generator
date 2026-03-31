// src/utils/fonts.ts
import { registerFont } from "canvas";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { FontInfo } from "../core/types";

export const loadedFonts: FontInfo[] = [];

export function loadFontsFromDirectory(): void {
  const fontsDir = join(__dirname, "../../fonts");
  try {
    const fontFamilies = readdirSync(fontsDir);
    for (const family of fontFamilies) {
      const familyPath = join(fontsDir, family);
      if (!statSync(familyPath).isDirectory()) continue;
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
          registerFont(fontPath, { family });
          loadedFonts.push({ name: family, path: fontPath });
          break;
        } catch (e) { /* skip */ }
      }
    }
  } catch (e) {
    console.warn("Could not load fonts from fonts/ directory");
  }
}

export function getRandomFont(): string {
  if (loadedFonts.length === 0) return "bold 70px serif";
  const f = loadedFonts[Math.floor(Math.random() * loadedFonts.length)];
  return `bold 70px '${f.name}'`;
}

loadFontsFromDirectory();
