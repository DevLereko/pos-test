import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
  VODACOM,
} from "@/constants/theme";
import { useConfig } from "@/context/config-context";
import { useTheme } from "@/context/theme-context";
import { PinPrompt } from "@/components/pin-prompt";

// Mock data
const stats = [
  { label: "Today's Sales", value: "M 18,420", icon: "chart.bar.fill" },
  { label: "Transactions", value: "84", icon: "doc.text.fill" },
  { label: "Average Ticket", value: "M 219", icon: "creditcard.fill" },
];

const quickActions = [
  { icon: "qrcode", label: "Scan QR", route: "/scan" },
  { icon: "clock.arrow.circlepath", label: "History", route: "/history" },
  { icon: "printer", label: "Print", route: "/print" },
  { icon: "gear", label: "Settings", route: "/settings" },
];

const recentSales = [
  { customer: "266 588 510 15", amount: "M 320.00", status: "Completed" },
  { customer: "266 690 204 88", amount: "M 48.00", status: "Completed" },
  { customer: "266 704 819 21", amount: "M 126.50", status: "Pending" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { config } = useConfig();
  const isDark = useColorScheme() === "dark";

  const [mobile, setMobile] = useState("266");
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready for the next sale");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  const handleMobileChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setMobile("266");
      return;
    }
    if (digits.startsWith("266")) {
      setMobile(digits.slice(0, 11));
      return;
    }
    setMobile(`266${digits.replace(/^266/, "").slice(0, 8)}`);
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const pieces = sanitized.split(".");
    const whole = pieces[0]?.slice(0, 6) ?? "";
    const decimal = pieces[1]?.slice(0, 2) ?? "";
    if (sanitized.includes(".")) {
      setAmount(decimal ? `${whole}.${decimal}` : `${whole}.`);
      return;
    }
    setAmount(whole);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        friction: 4,
        tension: 150,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 150,
      }),
    ]).start();
  };

  const handleQuickAction = (route: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  const handlePayNow = () => {
    if (!mobile || !amount) {
      Alert.alert("Error", "Please enter both mobile number and amount");
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount greater than 0");
      return;
    }

    setShowPinPrompt(true);
    setPinError(null);
  };

  const handlePinConfirm = (pin: string) => {
    setIsPinLoading(true);
    setPinError(null);

    setTimeout(() => {
      const correctPin = "1234";

      if (pin === correctPin) {
        setShowPinPrompt(false);
        setIsPinLoading(false);
        processTransaction();
      } else {
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);

        if (newAttempts >= 3) {
          setPinError("Too many failed attempts. Please try again later.");
          setTimeout(() => {
            setShowPinPrompt(false);
            setPinAttempts(0);
            setPinError(null);
            setIsPinLoading(false);
          }, 3000);
        } else {
          setPinError(`Invalid PIN. ${3 - newAttempts} attempts remaining.`);
          setIsPinLoading(false);
        }
      }
    }, 1500);
  };

  const processTransaction = () => {
    animateButton();
    setIsProcessing(true);
    const finalAmount = amount ? `M ${amount}` : "an amount";
    setStatusMessage(`Processing transaction for ${mobile}...`);

    setTimeout(() => {
      setStatusMessage(
        `✓ Transaction of ${finalAmount} completed successfully`,
      );
      setIsProcessing(false);
      setAmount("");
      setMobile("266");
      setPinAttempts(0);
      setPinError(null);
    }, 2000);
  };

  const handlePinCancel = () => {
    setShowPinPrompt(false);
    setPinError(null);
    setPinAttempts(0);
    setIsPinLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return VODACOM.green;
      case "Pending":
        return VODACOM.gold;
      default:
        return VODACOM.red;
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, contentInset]}
        >
          <View style={styles.shell}>
            {/* Integrated Header */}
            <View style={styles.headerSection}>
              <View style={styles.headerContent}>
                <View style={styles.merchantInfo}>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.greeting}
                  >
                    Good morning
                  </ThemedText>
                  <ThemedText type="title" style={styles.merchantName}>
                    Highveld Butchery
                  </ThemedText>
                </View>
                <View style={styles.headerActions}>
                  <Pressable style={styles.iconButton}>
                    <AppSymbol
                      name={{ ios: "bell.fill", android: "notifications" }}
                      size={22}
                      tintColor={colors.text}
                    />
                  </Pressable>
                  <Pressable style={styles.avatarButton}>
                    <AppSymbol
                      name={{ ios: "person.circle.fill", android: "person" }}
                      size={40}
                      tintColor={VODACOM.red}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.brandBar}>
                <View
                  style={[
                    styles.brandPill,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceStrong
                        : VODACOM.grey,
                    },
                  ]}
                >
                  <AppSymbol
                    name={{ ios: "checkmark.seal.fill", android: "verified" }}
                    size={14}
                    tintColor={VODACOM.green}
                  />
                  <ThemedText type="smallBold" style={styles.brandText}>
                    Verified Merchant
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.brandPill,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceStrong
                        : VODACOM.grey,
                    },
                  ]}
                >
                  <AppSymbol
                    name={{ ios: "printer.fill", android: "print" }}
                    size={14}
                    tintColor={VODACOM.red}
                  />
                  <ThemedText type="smallBold" style={styles.brandText}>
                    Printer Ready
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Hero Banner - Integrated with content */}
            <View
              style={[styles.vodacomBanner, { backgroundColor: VODACOM.red }]}
            >
              <AppSymbol
                name={{ ios: "megaphone.fill", android: "announcement" }}
                size={20}
                tintColor={VODACOM.light}
              />
              <ThemedText
                type="smallBold"
                style={[styles.bannerText, { color: VODACOM.light }]}
              >
                Introducing the new M-Pesa Business App for Merchants
              </ThemedText>
            </View>

            {/* Hero Text */}
            <View style={styles.heroContent}>
              <ThemedText type="title" style={styles.heroTitle}>
                Take your business further with convenience and ease
              </ThemedText>
              <Pressable style={styles.seeMoreButton}>
                <ThemedText
                  type="smallBold"
                  style={[styles.seeMoreText, { color: VODACOM.red }]}
                >
                  See more →
                </ThemedText>
              </Pressable>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <ThemedView
                  key={stat.label}
                  type="surface"
                  style={styles.statCard}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: `${VODACOM.red}15` },
                    ]}
                  >
                    <AppSymbol
                      name={stat.icon as any}
                      size={20}
                      tintColor={VODACOM.red}
                    />
                  </View>
                  <ThemedText type="subtitle" style={styles.statValue}>
                    {stat.value}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.statLabel}
                  >
                    {stat.label}
                  </ThemedText>
                </ThemedView>
              ))}
            </View>

            {/* Quick Actions */}
            <ThemedView type="surface" style={styles.quickActions}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.label}
                  style={styles.quickActionItem}
                  onPress={() => handleQuickAction(action.route)}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${VODACOM.red}10` },
                    ]}
                  >
                    <AppSymbol
                      name={action.icon}
                      size={24}
                      tintColor={VODACOM.red}
                    />
                  </View>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.quickActionLabel}
                  >
                    {action.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>

            {/* Transaction Form */}
            <ThemedView type="surface" style={styles.transactionCard}>
              <View style={styles.cardHeader}>
                <View>
                  <ThemedText type="subtitle" style={styles.cardTitle}>
                    New Payment
                  </ThemedText>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.cardSubtitle}
                  >
                    Complete a sale with M-Pesa
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.secureBadge,
                    { backgroundColor: `${VODACOM.green}15` },
                  ]}
                >
                  <AppSymbol
                    name={{ ios: "lock.fill", android: "lock" }}
                    size={14}
                    tintColor={VODACOM.green}
                  />
                  <ThemedText
                    type="smallBold"
                    style={[styles.secureText, { color: VODACOM.green }]}
                  >
                    Secure
                  </ThemedText>
                </View>
              </View>

              <View style={styles.formFields}>
                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold" style={styles.fieldLabel}>
                    Mobile Number
                  </ThemedText>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceStrong
                          : VODACOM.grey,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.prefixContainer,
                        { backgroundColor: `${VODACOM.red}10` },
                      ]}
                    >
                      <ThemedText
                        type="code"
                        style={[styles.prefixText, { color: VODACOM.red }]}
                      >
                        266
                      </ThemedText>
                    </View>
                    <TextInput
                      value={mobile.slice(3)}
                      onChangeText={handleMobileChange}
                      keyboardType="number-pad"
                      maxLength={8}
                      placeholder="588 510 15"
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.input, { color: colors.text }]}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="smallBold" style={styles.fieldLabel}>
                    Amount (M)
                  </ThemedText>
                  <View
                    style={[
                      styles.inputContainer,
                      styles.amountInput,
                      { borderColor: VODACOM.red },
                    ]}
                  >
                    <TextInput
                      value={amount}
                      onChangeText={handleAmountChange}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      style={[
                        styles.input,
                        styles.amountText,
                        { color: colors.text },
                      ]}
                    />
                  </View>
                </View>

                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Pressable
                    onPress={handlePayNow}
                    disabled={isProcessing || isPinLoading}
                    style={({ pressed }) => [
                      styles.payButton,
                      pressed && styles.pressed,
                      (isProcessing || isPinLoading) && styles.processing,
                    ]}
                  >
                    <View
                      style={[
                        styles.payButtonContent,
                        {
                          backgroundColor:
                            isProcessing || isPinLoading
                              ? colors.textSecondary
                              : VODACOM.red,
                        },
                      ]}
                    >
                      {isProcessing || isPinLoading ? (
                        <>
                          <AppSymbol
                            name={{
                              ios: "clock.badge.exclamationmark",
                              android: "hourglass",
                            }}
                            size={20}
                            tintColor={VODACOM.light}
                          />
                          <ThemedText
                            type="smallBold"
                            style={[
                              styles.payButtonText,
                              { color: VODACOM.light },
                            ]}
                          >
                            Processing...
                          </ThemedText>
                        </>
                      ) : (
                        <>
                          <ThemedText
                            type="smallBold"
                            style={[
                              styles.payButtonText,
                              { color: VODACOM.light },
                            ]}
                          >
                            Pay Now
                          </ThemedText>
                          <AppSymbol
                            name={{
                              ios: "arrow.right.circle.fill",
                              android: "arrow_forward",
                            }}
                            size={20}
                            tintColor={VODACOM.light}
                          />
                        </>
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              </View>

              <View
                style={[
                  styles.statusContainer,
                  { backgroundColor: `${VODACOM.green}10` },
                ]}
              >
                <AppSymbol
                  name={{ ios: "message.fill", android: "message" }}
                  size={16}
                  tintColor={VODACOM.green}
                />
                <ThemedText
                  type="small"
                  style={[styles.statusText, { color: colors.text }]}
                >
                  {statusMessage}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Recent Activity */}
            <ThemedView type="surface" style={styles.activityCard}>
              <View style={styles.cardHeader}>
                <View>
                  <ThemedText type="subtitle" style={styles.cardTitle}>
                    Recent Activity
                  </ThemedText>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.cardSubtitle}
                  >
                    Latest transactions
                  </ThemedText>
                </View>
                <Pressable
                  style={styles.viewAllButton}
                  onPress={() => router.push("/history" as any)}
                >
                  <ThemedText
                    type="smallBold"
                    style={[styles.viewAllText, { color: VODACOM.red }]}
                  >
                    View All
                  </ThemedText>
                </Pressable>
              </View>

              {recentSales.map((item, index) => (
                <View
                  key={`${item.customer}-${index}`}
                  style={[
                    styles.activityItem,
                    index < recentSales.length - 1 && styles.activityBorder,
                  ]}
                >
                  <View style={styles.activityInfo}>
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: `${VODACOM.red}10` },
                      ]}
                    >
                      <AppSymbol
                        name={{ ios: "person.fill", android: "person" }}
                        size={16}
                        tintColor={VODACOM.red}
                      />
                    </View>
                    <View>
                      <ThemedText
                        type="smallBold"
                        style={[styles.customerText, { color: colors.text }]}
                      >
                        {item.customer}
                      </ThemedText>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor: getStatusColor(item.status),
                            },
                          ]}
                        />
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                          style={styles.statusLabel}
                        >
                          {item.status}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <ThemedText
                    type="subtitle"
                    style={[styles.amountText, { color: colors.text }]}
                  >
                    {item.amount}
                  </ThemedText>
                </View>
              ))}
              <PinPrompt
                visible={showPinPrompt}
                onClose={handlePinCancel}
                onConfirm={handlePinConfirm}
                amount={amount}
                phoneNumber={mobile}
                merchantName={config.merchant.name}
                isLoading={isPinLoading}
                error={pinError}
              />
            </ThemedView>

            {/* Footer */}
            <View style={styles.vodacomFooter}>
              <View style={styles.footerContent}>
                <AppSymbol
                  name={{ ios: "iphone", android: "phone_android" }}
                  size={24}
                  tintColor={VODACOM.red}
                />
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.footerText}
                >
                  Scan-a QR code to download the Business App
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
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
    gap: Spacing.four,
  },
  headerSection: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  merchantInfo: {
    gap: 2,
  },
  greeting: {
    fontSize: 14,
  },
  merchantName: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconButton: {
    padding: 8,
  },
  avatarButton: {
    padding: 4,
  },
  brandBar: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  brandText: {
    fontSize: 12,
  },
  vodacomBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bannerText: {
    flex: 1,
  },
  heroContent: {
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  seeMoreButton: {
    alignSelf: "flex-start",
  },
  seeMoreText: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionItem: {
    alignItems: "center",
    gap: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 12,
  },
  transactionCard: {
    borderRadius: 20,
    padding: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 14,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  secureText: {
    fontSize: 12,
  },
  formFields: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  prefixContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  prefixText: {
    fontWeight: "600",
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  amountInput: {
    borderWidth: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  payButton: {
    borderRadius: 12,
    marginTop: Spacing.two,
    overflow: "hidden",
  },
  payButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  payButtonText: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  processing: {
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Spacing.two,
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    flex: 1,
  },
  activityCard: {
    borderRadius: 20,
    padding: Spacing.four,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  activityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  customerText: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 12,
  },
  vodacomFooter: {
    marginBottom: Spacing.four,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
  },
});
