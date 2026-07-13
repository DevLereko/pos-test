import { useRouter, useSegments } from "expo-router";
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { MaxContentWidth, Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { AppSymbol } from "./app-symbol";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

// Tab configuration
const TABS = [
  {
    name: "index",
    label: "Sales",
    icon: "creditcard.fill",
    activeIcon: "creditcard.circle.fill",
    href: "/",
  },
  {
    name: "history",
    label: "History",
    icon: "clock.arrow.circlepath",
    activeIcon: "clock.circle.fill",
    href: "/history",
  },
  {
    name: "explore",
    label: "Features",
    icon: "square.grid.2x2.fill",
    activeIcon: "square.grid.2x2.circle.fill",
    href: "/explore",
  },
  {
    name: "settings",
    label: "Settings",
    icon: "gear",
    activeIcon: "gear.circle.fill",
    href: "/settings",
  },
] as const;

export default function AppTabs() {
  const segments = useSegments();
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["name"]>("index");

  // Update active tab based on current route
  useEffect(() => {
    const currentSegment = segments[segments.length - 1] || "index";
    if (TABS.some((tab) => tab.name === currentSegment)) {
      setActiveTab(currentSegment as (typeof TABS)[number]["name"]);
    }
  }, [segments]);

  const handleTabPress = (tab: (typeof TABS)[number]) => {
    setActiveTab(tab.name);
    router.push(tab.href);
  };

  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger
              key={tab.name}
              name={tab.name}
              href={tab.href as any}
              asChild
            >
              <TabButton
                icon={tab.icon}
                activeIcon={tab.activeIcon}
                label={tab.label}
                isFocused={activeTab === tab.name}
                onPress={() => handleTabPress(tab)}
              />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  activeIcon,
  label,
  onPress,
  ...props
}: TabTriggerSlotProps & {
  icon?: string;
  activeIcon?: string;
  label?: string;
  onPress?: () => void;
}) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  useEffect(() => {
    if (isFocused) {
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
        friction: 4,
        tension: 150,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 150,
      }).start();
    }
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 4,
      tension: 150,
    }).start();
  };

  const iconName = isFocused ? activeIcon || icon : icon;

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.pressed,
        isSmallScreen && styles.tabButtonSmall,
      ]}
    >
      <Animated.View
        style={[
          styles.tabButtonContent,
          isFocused && [
            styles.activeTab,
            { backgroundColor: `${VODACOM.red}15` },
          ],
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconContainer}>
          <AppSymbol
            name={iconName as any}
            size={isSmallScreen ? 20 : 22}
            tintColor={
              isFocused
                ? VODACOM.red
                : isDark
                  ? colors.textSecondary
                  : "#94A3B8"
            }
            style={styles.icon}
          />
          {isFocused && (
            <View
              style={[styles.activeIndicator, { backgroundColor: VODACOM.red }]}
            />
          )}
        </View>
        <ThemedText
          type="small"
          style={[
            styles.tabLabel,
            {
              color: isFocused
                ? VODACOM.red
                : isDark
                  ? colors.textSecondary
                  : "#94A3B8",
            },
            isFocused && styles.activeLabel,
            isSmallScreen && styles.tabLabelSmall,
          ]}
        >
          {label || children}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 420;

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView
        type="surface"
        style={[
          styles.innerContainer,
          isSmallScreen && styles.innerContainerSmall,
          {
            backgroundColor: isDark ? colors.surface : VODACOM.light,
            borderColor: isDark ? colors.surfaceStrong : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        {/* Brand Section - Hidden on small screens */}
        {!isSmallScreen && (
          <View
            style={[
              styles.brandSection,
              { borderRightColor: isDark ? colors.surfaceStrong : "#E2E8F0" },
            ]}
          >
            <View style={styles.brandLogo}>
              <View
                style={[styles.brandDot, { backgroundColor: VODACOM.red }]}
              />
              <View
                style={[
                  styles.brandDot,
                  { backgroundColor: VODACOM.red, opacity: 0.7 },
                ]}
              />
            </View>
            <View style={styles.brandTextContainer}>
              <ThemedText
                type="smallBold"
                style={[styles.brandTitle, { color: colors.text }]}
              >
                M-Pesa POS
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.brandSubtitle, { color: colors.textSecondary }]}
              >
                Vodacom Lesotho
              </ThemedText>
            </View>
          </View>
        )}

        {/* Tab Buttons */}
        <View style={styles.tabsContainer}>{props.children}</View>

        {/* Status Indicator - Hidden on very small screens */}
        {width > 480 && (
          <View
            style={[styles.statusPill, { backgroundColor: `${VODACOM.red}10` }]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: VODACOM.red }]}
            />
            <ThemedText
              type="smallBold"
              style={[styles.statusText, { color: VODACOM.red }]}
            >
              Live
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 16,
    width: "100%",
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    zIndex: 100,
  },
  innerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    maxWidth: MaxContentWidth,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    borderWidth: 1,
  },
  innerContainerSmall: {
    paddingHorizontal: 12,
    gap: 8,
    borderRadius: 24,
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 12,
    borderRightWidth: 1,
  },
  brandLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brandTextContainer: {
    gap: 0,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  brandSubtitle: {
    fontSize: 10,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    maxHeight: 52,
  },
  tabButtonSmall: {
    minHeight: 40,
  },
  tabButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 2,
    minWidth: 60,
  },
  activeTab: {
    backgroundColor: `${VODACOM.red}15`,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginBottom: 1,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -4,
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  tabLabelSmall: {
    fontSize: 10,
  },
  activeLabel: {
    color: VODACOM.red,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
  },
});
