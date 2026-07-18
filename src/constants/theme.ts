import "@/global.css";
import { Platform } from "react-native";

export const VODACOM = {
  red: "#E0001B",
  redDark: "#B30015",
  redLight: "#FFE5E8",
  dark: "#1A1A1A",
  light: "#FFFFFF",
  grey: "#F5F5F5",
  greyDark: "#64748B",
  green: "#00A651",
  greenLight: "#E6F7ED",
  gold: "#F59E0B",
  goldLight: "#FEF3C7",
};

export const Colors = {
  light: {
    text: VODACOM.dark,
    background: VODACOM.grey,
    backgroundElement: VODACOM.light,
    backgroundSelected: VODACOM.redLight,
    textSecondary: VODACOM.greyDark,
    surface: VODACOM.light,
    surfaceStrong: "#F1F5F9",
    accent: VODACOM.red,
    accentSoft: VODACOM.redLight,
    success: VODACOM.green,
    successSoft: VODACOM.greenLight,
    warning: VODACOM.gold,
    warningSoft: VODACOM.goldLight,
    danger: "#EF4444",
    dangerSoft: "#FEE2E2",
  },
  dark: {
    text: "#F8F5F6",
    background: "#120B0D",
    backgroundElement: "#211417",
    backgroundSelected: "#3A1B20",
    textSecondary: "#C8B8BC",
    surface: "#1A1013",
    surfaceStrong: "#2A171B",
    accent: "#FF5A62",
    accentSoft: "#3E171B",
    success: "#62D89A",
    successSoft: "#163629",
    warning: "#F3C66C",
    warningSoft: "#3A2A11",
    danger: "#FF97A3",
    dangerSoft: "#3A1820",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset =
  Platform.select({
    ios: 80,
    android: 70,
  }) ?? 0;

export const MaxContentWidth = 800;
