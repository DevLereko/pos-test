import { Tabs, router } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { StyleSheet, ActivityIndicator, View, Platform } from "react-native";
import { useTheme } from "@/context/theme-context";
import { AppSymbol } from "@/components/app-symbol";
import { VODACOM } from "@/constants/theme";

export default function TabLayout() {
  const { isAuthenticated, isLoading, deviceVerified } = useAuth();
  const { colors, isDark } = useTheme();

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

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={VODACOM.red} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: VODACOM.red,
        tabBarInactiveTintColor: isDark ? "#94A3B8" : "#94A3B8",
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: isDark ? colors.surface : VODACOM.light,
            borderTopColor: isDark ? colors.surfaceStrong : "#F1F5F9",
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sales",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <AppSymbol
                name={focused ? "creditcard.circle.fill" : "creditcard.fill"}
                size={24}
                tintColor={
                  focused ? VODACOM.red : isDark ? "#94A3B8" : "#94A3B8"
                }
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <AppSymbol
                name={focused ? "clock.circle.fill" : "clock.arrow.circlepath"}
                size={24}
                tintColor={
                  focused ? VODACOM.red : isDark ? "#94A3B8" : "#94A3B8"
                }
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Features",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <AppSymbol
                name={
                  focused
                    ? "square.grid.2x2.circle.fill"
                    : "square.grid.2x2.fill"
                }
                size={24}
                tintColor={
                  focused ? VODACOM.red : isDark ? "#94A3B8" : "#94A3B8"
                }
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <AppSymbol
                name={focused ? "gear.circle.fill" : "gear"}
                size={24}
                tintColor={
                  focused ? VODACOM.red : isDark ? "#94A3B8" : "#94A3B8"
                }
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
tabBar: {
    position: "absolute",
    bottom: 4,
    left: 16,
    right: 16,
    height: Platform.OS === "ios" ? 80 : 70,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 8,
    borderRadius: 24,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    marginHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 4,
    borderRadius: 0,
  },
  tabIcon: {
    marginTop: 0,
    marginBottom: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: `${VODACOM.red}12`,
  },
});
