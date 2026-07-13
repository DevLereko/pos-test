import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "expo-router/react-navigation";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot } from "expo-router";

import { ThemeProvider as CustomThemeProvider } from "@/context/theme-context";
import { ConfigProvider } from "@/context/config-context";
import { AuthProvider } from "@/context/auth-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <CustomThemeProvider>
        <ConfigProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <Slot />
            </SafeAreaProvider>
          </AuthProvider>
        </ConfigProvider>
      </CustomThemeProvider>
    </NavigationThemeProvider>
  );
}
