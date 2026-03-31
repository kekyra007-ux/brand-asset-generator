// src/index.ts — public API
export {
  generateLogo,
  generateIcon,
  LOGO_STYLES,
  ICON_STYLES,
  LOGO_STYLES_FRAMED,
  LOGO_STYLES_FRAMELESS,
} from "./core/asset-generator";

export type {
  LogoOptions,
  IconOptions,
  Asset,
  LogoStyle,
  IconStyle,
  ExportOptions,
  BaseResourceI,
} from "./core/types";
