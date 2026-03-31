// src/utils/export.ts
import { Canvas } from "canvas";
import { Asset, ExportOptions } from "../core/types";

export function canvasToAsset(
  canvas: Canvas,
  options: ExportOptions = {},
): Asset {
  const { format = "png", quality = 90 } = options;

  if (format === "jpg" || format === "jpeg" as string) {
    const q = Math.max(0, Math.min(100, quality)) / 100;
    const buffer = canvas.toBuffer("image/jpeg", { quality: q });
    return { buffer, width: canvas.width, height: canvas.height, mimeType: "image/jpeg" };
  }

  const buffer = canvas.toBuffer("image/png");
  return { buffer, width: canvas.width, height: canvas.height, mimeType: "image/png" };
}

export function getFileExtension(format?: string): string {
  if (format === "jpg" || format === "jpeg") return "jpg";
  return "png";
}
