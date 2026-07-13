import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 * This hook provides a consistent color scheme across web and native platforms
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const colorScheme = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // During SSR/hydration, return 'light' as a fallback
  // Once hydrated, return the actual system color scheme
  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
