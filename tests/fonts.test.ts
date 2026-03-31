import { loadedFonts, getRandomFont } from "../src/utils/fonts";

describe("font loading", () => {
  it("getRandomFont returns a string", () => {
    const font = getRandomFont();
    expect(typeof font).toBe("string");
    expect(font).toMatch(/bold \d+px/);
  });
  it("loadedFonts is an array", () => {
    expect(Array.isArray(loadedFonts)).toBe(true);
  });
});
