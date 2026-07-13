import { Redirect } from "expo-router";
import { Tabs, TabSlot, TabList, TabTrigger } from "expo-router/ui";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";

import AppTabs from "@/components/app-tabs";
import { MaxContentWidth, Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AppTabs />;
}
