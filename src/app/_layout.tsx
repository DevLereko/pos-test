import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "expo-router/react-navigation";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { ThemeProvider as CustomThemeProvider } from "@/context/theme-context";
import { ConfigProvider } from "@/context/config-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <CustomThemeProvider>
        <ConfigProvider>
          <SafeAreaProvider>
            <AnimatedSplashOverlay />
            <AppTabs />
          </SafeAreaProvider>
        </ConfigProvider>
      </CustomThemeProvider>
    </NavigationThemeProvider>
  );
}
