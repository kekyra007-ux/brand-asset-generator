import { generateIcon, ICON_STYLES } from "../src/core/asset-generator";

describe("generateIcon", () => {
  it("returns a valid 512x512 PNG asset", () => {
    const asset = generateIcon({ text: "TEST", color: "#FFD700", size: 512 });
    expect(asset.buffer).toBeInstanceOf(Buffer);
    expect(asset.width).toBe(512);
    expect(asset.height).toBe(512);
    expect(asset.mimeType).toBe("image/png");
  });

  it("generates all icon styles without error", () => {
    for (const style of ICON_STYLES) {
      expect(() => generateIcon({ text: "T", color: "#FFD700", style, size: 256 })).not.toThrow();
    }
  });

  it("supports text with spaces in label", () => {
    const asset = generateIcon({ text: "LUCKY STAR", color: "#FFD700", style: "star", size: 512 });
    expect(asset.buffer.length).toBeGreaterThan(0);
  });

  it("supports solid bgFill", () => {
    const asset = generateIcon({ text: "TEST", color: "#FF0000", style: "crown", bgFill: "solid", size: 512 });
    expect(asset.buffer.length).toBeGreaterThan(0);
  });

  it("supports gradient bgFill", () => {
    const asset = generateIcon({ text: "TEST", color: "#FF0000", style: "diamond", bgFill: "gradient", size: 512 });
    expect(asset.buffer.length).toBeGreaterThan(0);
  });

  it("respects custom size", () => {
    const asset = generateIcon({ text: "T", color: "#FFD700", style: "star", size: 256 });
    expect(asset.width).toBe(256);
    expect(asset.height).toBe(256);
  });
});
