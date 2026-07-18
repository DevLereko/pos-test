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
import { MerchantProvider } from "@/context/merchant-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <CustomThemeProvider>
        <ConfigProvider>
          <AuthProvider>
            <MerchantProvider>
              <SafeAreaProvider>
                <Slot />
              </SafeAreaProvider>
            </MerchantProvider>
          </AuthProvider>
        </ConfigProvider>
      </CustomThemeProvider>
    </NavigationThemeProvider>
  );
}
