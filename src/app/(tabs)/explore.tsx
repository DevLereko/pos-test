import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
  VODACOM,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

const features = [
  {
    icon: "creditcard.fill",
    title: "Quick Payments",
    description:
      "Process M-Pesa payments in seconds with our streamlined interface",
    color: VODACOM.red,
  },
  {
    icon: "chart.bar.fill",
    title: "Sales Analytics",
    description: "Track your daily sales and performance metrics",
    color: VODACOM.green,
  },
  {
    icon: "printer.fill",
    title: "Receipt Printing",
    description: "Print professional receipts with Bluetooth printers",
    color: VODACOM.gold,
  },
  {
    icon: "qrcode",
    title: "QR Payments",
    description: "Accept payments by scanning customer QR codes",
    color: VODACOM.red,
  },
];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentInset]}
      >
        <View style={styles.shell}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText
                type="title"
                style={[styles.headerTitle, { color: colors.text }]}
              >
                Features
              </ThemedText>
              <ThemedText
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                Everything you need for your business
              </ThemedText>
            </View>
          </View>

          {/* Feature Grid */}
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
                    { backgroundColor: `${feature.color}15` },
                  ]}
                >
                  <AppSymbol
                    name={feature.icon as any}
                    size={28}
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

          {/* Info Cards */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.infoHeader}>
              <AppSymbol
                name={{ ios: "iphone.gen1", android: "phone_android" }}
                size={24}
                tintColor={VODACOM.red}
              />
              <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
                M-Pesa Business App
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.infoDescription, { color: colors.textSecondary }]}
            >
              Take your business further with convenience and ease. The M-Pesa
              Business App helps you manage payments, track sales, and serve
              customers better.
            </ThemedText>
            <Pressable style={styles.infoButton}>
              <ThemedText
                style={[styles.infoButtonText, { color: VODACOM.red }]}
              >
                Learn More →
              </ThemedText>
            </Pressable>
          </View>

          {/* Quick Tips */}
          <Collapsible title="Quick Tips">
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <View
                  style={[styles.tipDot, { backgroundColor: VODACOM.red }]}
                />
                <ThemedText style={[styles.tipText, { color: colors.text }]}>
                  Always verify customer number before processing
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <View
                  style={[styles.tipDot, { backgroundColor: VODACOM.green }]}
                />
                <ThemedText style={[styles.tipText, { color: colors.text }]}>
                  Keep Bluetooth printer within 10 meters range
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <View
                  style={[styles.tipDot, { backgroundColor: VODACOM.gold }]}
                />
                <ThemedText style={[styles.tipText, { color: colors.text }]}>
                  Check daily sales summary at the end of each shift
                </ThemedText>
              </View>
            </View>
          </Collapsible>
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
  header: {
    paddingTop: Spacing.three,
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  featureCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: Spacing.three,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  infoCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tipsContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});
