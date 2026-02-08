type ColorSwatch = { light: string; dark: string };

export const themeColors: {
  primary: ColorSwatch;
  primaryAlpha: ColorSwatch;
  background: ColorSwatch;
  surface: ColorSwatch;
  surfaceSecondary: ColorSwatch;
  foreground: ColorSwatch;
  muted: ColorSwatch;
  onPrimary: ColorSwatch;
  border: ColorSwatch;
  success: ColorSwatch;
  successAlpha: ColorSwatch;
  warning: ColorSwatch;
  warningAlpha: ColorSwatch;
  error: ColorSwatch;
  errorAlpha: ColorSwatch;
  accent: ColorSwatch;
  accentAlpha: ColorSwatch;
  gold: ColorSwatch;
  silver: ColorSwatch;
  bronze: ColorSwatch;
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
