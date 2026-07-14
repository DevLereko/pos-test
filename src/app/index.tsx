import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export default function IndexScreen() {
  const { isAuthenticated, isLoading, deviceVerified } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else if (!deviceVerified) {
        router.replace("/(auth)/verify-device");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, deviceVerified, isLoading, router]);

  // Hide splash screen when auth state is determined
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={colors.accent || "#E60000"} />
    </View>
  );
}