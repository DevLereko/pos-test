/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState, useEffect } from "react";

/**
 * Hook to get the current theme colors based on the system color scheme
 * Works consistently across web and native platforms
 */
export function useTheme() {
  const scheme = useColorScheme();
  // Ensure we have a valid scheme ('light' or 'dark')
  const theme = scheme === "unspecified" ? "light" : scheme;

  return Colors[theme];
}

/**
 * Extended hook that also provides theme switching capabilities
 * Use this when you need to manually toggle the theme
 */
export function useThemeWithControls() {
  const scheme = useColorScheme();
  const [theme, setTheme] = useState<"light" | "dark">(
    scheme === "unspecified" ? "light" : scheme,
  );

  // Update theme when system scheme changes
  useEffect(() => {
    setTheme(scheme === "unspecified" ? "light" : scheme);
  }, [scheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return {
    theme,
    colors: Colors[theme],
    isDark: theme === "dark",
    toggleTheme,
  };
}
