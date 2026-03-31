import { generateLogo, LOGO_STYLES } from "../src/core/asset-generator";

describe("generateLogo", () => {
  it("returns a valid PNG asset", () => {
    const asset = generateLogo({ text: "TEST", color: "#FFD700" });
    expect(asset.buffer).toBeInstanceOf(Buffer);
    expect(asset.buffer.length).toBeGreaterThan(0);
    expect(asset.mimeType).toBe("image/png");
    expect(asset.width).toBeGreaterThan(0);
    expect(asset.height).toBeGreaterThan(0);
  });

  it("auto-selects style when none provided", () => {
    const asset = generateLogo({ text: "BRAND" });
    expect(asset.buffer.length).toBeGreaterThan(0);
  });

  it("handles text with spaces", () => {
    const asset = generateLogo({ text: "MY BRAND NAME", color: "#FFD700", style: "gold" });
    expect(asset.width).toBeGreaterThan(100);
  });

  it("generates all logo styles without error", () => {
    for (const style of LOGO_STYLES) {
      expect(() => generateLogo({ text: "TEST", color: "#FFD700", style })).not.toThrow();
    }
  });

  it("plain style produces PNG asset", () => {
    const asset = generateLogo({ text: "PLAIN", color: "#FFD700", style: "plain" });
    expect(asset.mimeType).toBe("image/png");
  });

  it("returns JPG when format is jpg", () => {
    const asset = generateLogo({ text: "JPG", color: "#FFD700", style: "gold" }, { format: "jpg" });
    expect(asset.mimeType).toBe("image/jpeg");
  });
});
