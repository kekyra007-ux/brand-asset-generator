// src/core/types.ts

export interface BaseResourceI {
  text: string;
  color?: string | undefined;
}

export interface LogoOptions extends BaseResourceI {
  style?: LogoStyle;
}

export interface IconOptions extends BaseResourceI {
  size?: number;
  style?: IconStyle;
  bgFill?: "solid" | "gradient";
}

export interface Asset {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/png" | "image/jpeg";
}

export interface ExportOptions {
  format?: "png" | "jpg";
  quality?: number;
}

export type LogoStyle =
  | "gold"
  | "neon"
  | "chrome"
  | "velvet"
  | "diamond"
  | "royal"
  | "gradient"
  | "aurora"
  | "plain";

export type IconStyle =
  | "diamond"
  | "spade"
  | "crown"
  | "flame"
  | "ace"
  | "coin"
  | "chip"
  | "star"
  | "clover"
  | "joker";

export interface GlowSpot {
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
}

export interface FontInfo {
  name: string;
  path: string;
}
