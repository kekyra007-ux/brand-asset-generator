import { hexToRgb, lighten, darken, rgba } from "../src/utils/colors";

describe("hexToRgb", () => {
  it("parses hex with #", () => {
    expect(hexToRgb("#FFD700")).toEqual({ r: 255, g: 215, b: 0 });
  });
  it("parses hex without #", () => {
    expect(hexToRgb("FFD700")).toEqual({ r: 255, g: 215, b: 0 });
  });
  it("returns gold fallback for invalid hex", () => {
    expect(hexToRgb("invalid")).toEqual({ r: 255, g: 215, b: 0 });
  });
});

describe("lighten", () => {
  it("lightens a color", () => {
    expect(lighten("#000000", 50)).toBe("rgb(50,50,50)");
  });
  it("clamps at 255", () => {
    expect(lighten("#FFFFFF", 50)).toBe("rgb(255,255,255)");
  });
});

describe("darken", () => {
  it("darkens a color", () => {
    expect(darken("#FF0000", 50)).toBe("rgb(205,0,0)");
  });
  it("clamps at 0", () => {
    expect(darken("#000000", 50)).toBe("rgb(0,0,0)");
  });
});

describe("rgba", () => {
  it("converts hex to rgba string", () => {
    expect(rgba("#FF0000", 0.5)).toBe("rgba(255,0,0,0.5)");
  });
});
