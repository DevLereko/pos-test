import { Tabs, router } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { useTheme } from "@/context/theme-context";
import { AppSymbol } from "@/components/app-symbol";

export default function TabLayout() {
  const { isAuthenticated, isLoading, deviceVerified } = useAuth();
  const { colors } = useTheme();

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (!deviceVerified) {
          router.replace("/(auth)/verify-device");
        } else {
          router.replace("/(auth)/login");
        }
      }
    }
  }, [isAuthenticated, isLoading, deviceVerified]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent || "#E60000"} />
      </View>
    );
  }

  // If not authenticated, don't render tabs
  if (!isAuthenticated) {
    return null;
  }

  // Render tabs using standard React Navigation tab options
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E60000",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sales",
          tabBarIcon: ({ color }) => <AppSymbol name="chart.bar.fill" tintColor={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <AppSymbol name="clock.arrow.circlepath" tintColor={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Features",
          tabBarIcon: ({ color }) => <AppSymbol name="square.grid.2x2.fill" tintColor={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <AppSymbol name="gear" tintColor={String(color)} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E2E8F0",
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
  },
});