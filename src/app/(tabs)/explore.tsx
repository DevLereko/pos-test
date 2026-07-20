import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
  VODACOM,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 380;

const PLAY_STORE_URL =
  "https://play.google.com/store";
const APP_STORE_URL =
  "https://apps.apple.com/";

const features = [
  {
    icon: "creditcard.fill",
    title: "Quick Payments",
    description: "Process M-Pesa payments in seconds",
    color: VODACOM.red,
    bgColor: `${VODACOM.red}15`,
  },
  {
    icon: "chart.bar.fill",
    title: "Sales Analytics",
    description: "Track daily sales and performance",
    color: VODACOM.green,
    bgColor: `${VODACOM.green}15`,
  },
  {
    icon: "printer.fill",
    title: "Receipt Printing",
    description: "Print professional receipts",
    color: VODACOM.gold,
    bgColor: `${VODACOM.gold}15`,
  },
  {
    icon: "qrcode",
    title: "QR Payments",
    description: "Scan & pay with QR codes",
    color: VODACOM.red,
    bgColor: `${VODACOM.red}15`,
  },
];

export default function ExploreScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  const handleDownloadApp = () => {
    const url = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(url).catch(() => {
      // Fallback to web if app store link fails
      Linking.openURL("https://www.vodacom.co.ls/");
    });
  };

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentInset]}
      >
        <View style={styles.shell}>
          {/* Hero Header */}
          <View style={styles.heroSection}>
            <ThemedText
              type="title"
              style={[styles.heroTitle, { color: colors.text }]}
            >
              Made for Merchants
            </ThemedText>
            <ThemedText
              style={[styles.heroSubtitle, { color: colors.textSecondary }]}
            >
              Simple, reliable tools to help you serve customers faster
            </ThemedText>
          </View>

          {/* Feature Grid */}
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Key Features
            </ThemedText>
            <ThemedText
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Built for busy merchants like you
            </ThemedText>
          </View>

          <View style={styles.featureGrid}>
            {features.map((feature) => (
              <Pressable
                key={feature.title}
                style={({ pressed }) => [
                  styles.featureCard,
                  { backgroundColor: colors.surface },
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.bgColor },
                  ]}
                >
                  <AppSymbol
                    name={feature.icon as any}
                    size={isSmallScreen ? 24 : 28}
                    tintColor={feature.color}
                  />
                </View>
                <ThemedText
                  style={[styles.featureTitle, { color: colors.text }]}
                >
                  {feature.title}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {feature.description}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* M-Pesa Business App Card */}
          <View style={[styles.promoCard, { backgroundColor: VODACOM.red }]}>
            <View style={styles.promoContent}>
              <View style={styles.promoIconContainer}>
                <AppSymbol
                  name={{ ios: "iphone.gen1", android: "phone_android" }}
                  size={32}
                  tintColor={VODACOM.light}
                />
              </View>
              <ThemedText style={[styles.promoTitle, { color: VODACOM.light }]}>
                M-Pesa Business App
              </ThemedText>
              <ThemedText
                style={[
                  styles.promoDescription,
                  { color: `${VODACOM.light}CC` },
                ]}
              >
                Download the official M-Pesa Business App to manage payments,
                track sales, and serve customers better—anytime, anywhere.
              </ThemedText>
              <Pressable style={styles.promoButton} onPress={handleDownloadApp}>
                <ThemedText
                  style={[styles.promoButtonText, { color: VODACOM.red }]}
                >
                  Download App
                </ThemedText>
                <AppSymbol
                  name={{
                    ios: "arrow.right.circle.fill",
                    android: "arrow_forward",
                  }}
                  size={20}
                  tintColor={VODACOM.red}
                />
              </Pressable>
            </View>
          </View>

          {/* Quick Tips */}
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Tips
            </ThemedText>
            <ThemedText
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Helpful reminders for smooth operations
            </ThemedText>
          </View>

          <View
            style={[styles.tipsContainer, { backgroundColor: colors.surface }]}
          >
            <View style={styles.tipItem}>
              <View
                style={[
                  styles.tipIcon,
                  { backgroundColor: `${VODACOM.red}15` },
                ]}
              >
                <AppSymbol
                  name="checkmark.circle.fill"
                  size={20}
                  tintColor={VODACOM.red}
                />
              </View>
              <View style={styles.tipContent}>
                <ThemedText style={[styles.tipTitle, { color: colors.text }]}>
                  Verify Customer Number
                </ThemedText>
                <ThemedText
                  style={[
                    styles.tipDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Always confirm the customer&apos;s number before processing
                </ThemedText>
              </View>
            </View>

            <View
              style={[
                styles.tipItem,
                styles.tipBorder,
                { borderTopColor: isDark ? colors.surfaceStrong : "#F1F5F9" },
              ]}
            >
              <View
                style={[
                  styles.tipIcon,
                  { backgroundColor: `${VODACOM.green}15` },
                ]}
              >
                <AppSymbol
                  name="printer.fill"
                  size={20}
                  tintColor={VODACOM.green}
                />
              </View>
              <View style={styles.tipContent}>
                <ThemedText style={[styles.tipTitle, { color: colors.text }]}>
                  Keep Printer Close
                </ThemedText>
                <ThemedText
                  style={[
                    styles.tipDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Stay within 10 meters of the Bluetooth printer
                </ThemedText>
              </View>
            </View>

            <View
              style={[
                styles.tipItem,
                styles.tipBorder,
                { borderTopColor: isDark ? colors.surfaceStrong : "#F1F5F9" },
              ]}
            >
              <View
                style={[
                  styles.tipIcon,
                  { backgroundColor: `${VODACOM.gold}15` },
                ]}
              >
                <AppSymbol
                  name="chart.bar.fill"
                  size={20}
                  tintColor={VODACOM.gold}
                />
              </View>
              <View style={styles.tipContent}>
                <ThemedText style={[styles.tipTitle, { color: colors.text }]}>
                  Review Daily Sales
                </ThemedText>
                <ThemedText
                  style={[
                    styles.tipDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Check your sales summary at the end of each shift
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText
              style={[styles.footerText, { color: colors.textSecondary }]}
            >
              M-Pesa POS v2.0.0
            </ThemedText>
            <ThemedText
              style={[styles.footerSubtext, { color: colors.textSecondary }]}
            >
              Vodacom Lesotho
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  shell: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  // Hero Section
  heroSection: {
    paddingTop: Spacing.three,
    gap: 6,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Section Header
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  // Feature Grid
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  featureCard: {
    flex: 1,
    minWidth: isSmallScreen ? "100%" : "45%",
    borderRadius: 14,
    padding: Spacing.three,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: isSmallScreen ? 48 : 56,
    height: isSmallScreen ? 48 : 56,
    borderRadius: isSmallScreen ? 24 : 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: isSmallScreen ? 12 : 14,
    lineHeight: isSmallScreen ? 16 : 20,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  // Promo Card
  promoCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  promoContent: {
    padding: Spacing.four,
    gap: 10,
  },
  promoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${VODACOM.light}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  promoDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  promoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: VODACOM.light,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Tips
  tipsContainer: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.three,
  },
  tipBorder: {
    borderTopWidth: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  tipDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
    gap: 2,
  },
  footerText: {
    fontSize: 13,
  },
  footerSubtext: {
    fontSize: 11,
  },
});
