import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PinPrompt } from "@/components/pin-prompt";
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
  VODACOM,
} from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useConfig } from "@/context/config-context";
import { useMerchant } from "@/context/merchant-context";
import { useTheme } from "@/context/theme-context";
import { authApi, Transaction } from "@/api/auth";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { config } = useConfig();
  const { user, deviceConfig } = useAuth();
  const { selectedMerchant } = useMerchant();
  const isDark = useColorScheme() === "dark";

  const [mobile, setMobile] = useState("266");
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [loadingRecent, setLoadingRecent] = useState(true);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  const merchantId = selectedMerchant?.id || config?.merchant?.id;
  const deviceId = deviceConfig?.id;

  const loadRecentTransactions = async () => {
    try {
      setLoadingRecent(true);
      const response = await authApi.getRecentTransactions(merchantId, 5);
      setRecentTransactions(response);
    } catch (error) {
      console.error("Failed to load recent transactions:", error);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Load recent transactions
  useEffect(() => {
    if (merchantId) {
      loadRecentTransactions();
    }
  }, [merchantId]);

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

  const handlePayNow = () => {
    if (!amount || amount.trim() === "") {
      Alert.alert("Error", "Please enter the amount");
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount greater than 0");
      return;
    }

    const phoneDigits = mobile.replace("266", "");
    if (!phoneDigits || phoneDigits.length < 8) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    // Validate merchant and device
    if (!merchantId) {
      Alert.alert(
        "Error",
        "No merchant selected. Please configure your device.",
      );
      return;
    }

    if (!deviceId) {
      Alert.alert("Error", "No device found. Please contact support.");
      return;
    }

    setShowPinPrompt(true);
    setPinError(null);
  };

  const handlePinConfirm = async (pin: string) => {
    setIsPinLoading(true);
    setPinError(null);

    try {
      const response = await authApi.processTransaction({
        merchantId,
        deviceId,
        customerPhone: mobile.startsWith("266") ? mobile : `266${mobile}`,
        amount: parseFloat(amount),
      });

      setShowPinPrompt(false);
      setIsPinLoading(false);
      processTransaction(response);
    } catch (error: any) {
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
        setPinError(
          `Transaction failed: ${error.message || "Please try again"}. ${3 - newAttempts} attempts remaining.`,
        );
        setIsPinLoading(false);
      }
    }
  };

  const processTransaction = (response: any) => {
    animateButton();
    setIsProcessing(true);
    setStatusMessage(`Processing...`);

    setTimeout(() => {
      setStatusMessage(`✓ Complete`);
      setIsProcessing(false);
      setAmount("");
      setMobile("266");
      setPinAttempts(0);
      setPinError(null);

      loadRecentTransactions();

      Alert.alert(
        "Transaction Complete",
        `Amount: M ${amount}\nCustomer: ${mobile}\nReference: ${response.transaction?.reference || "N/A"}`,
        [{ text: "OK" }],
      );
    }, 1000);
  };

  const handlePinCancel = () => {
    setShowPinPrompt(false);
    setPinError(null);
    setPinAttempts(0);
    setIsPinLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return VODACOM.green;
      case "pending":
        return VODACOM.gold;
      case "failed":
        return VODACOM.red;
      default:
        return VODACOM.greyDark;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "checkmark.circle.fill";
      case "pending":
        return "clock.fill";
      case "failed":
        return "exclamationmark.circle.fill";
      default:
        return "circle.fill";
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `M ${num.toFixed(2)}`;
  };

  const getMerchantName = () => {
    return selectedMerchant?.name || config?.merchant?.name || "Merchant";
  };

  const getMerchantCode = () => {
    return selectedMerchant?.code || "0000";
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
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
            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.merchantInfo}>
                <View>
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.greeting}
                  >
                    {getGreeting()}
                  </ThemedText>
                  <ThemedText type="title" style={styles.merchantName}>
                    {getMerchantName()} - {getMerchantCode()}
                  </ThemedText>
                </View>
              </View>
            </View>

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
                          <ActivityIndicator
                            size="small"
                            color={VODACOM.light}
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
                  {
                    backgroundColor: `${statusMessage.includes("✓") ? VODACOM.green : VODACOM.gold}15`,
                  },
                ]}
              >
                <AppSymbol
                  name={{
                    ios: statusMessage.includes("✓")
                      ? "checkmark.circle.fill"
                      : "clock.fill",
                    android: statusMessage.includes("✓")
                      ? "check_circle"
                      : "schedule",
                  }}
                  size={16}
                  tintColor={
                    statusMessage.includes("✓") ? VODACOM.green : VODACOM.gold
                  }
                />
                <ThemedText
                  type="small"
                  style={[
                    styles.statusText,
                    {
                      color: statusMessage.includes("✓")
                        ? VODACOM.green
                        : colors.text,
                    },
                  ]}
                >
                  {statusMessage}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Recent Transactions */}
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

              {loadingRecent ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={VODACOM.red} />
                </View>
              ) : recentTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <AppSymbol
                    name={{ ios: "doc.text", android: "description" }}
                    size={32}
                    tintColor={colors.textSecondary}
                  />
                  <ThemedText
                    style={[
                      styles.emptyStateText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No transactions yet
                  </ThemedText>
                </View>
              ) : (
                recentTransactions.map((tx, index) => (
                  <View
                    key={tx.id}
                    style={[
                      styles.activityItem,
                      index < recentTransactions.length - 1 &&
                        styles.activityBorder,
                    ]}
                  >
                    <View style={styles.activityInfo}>
                      <View
                        style={[
                          styles.activityIcon,
                          { backgroundColor: `${getStatusColor(tx.status)}15` },
                        ]}
                      >
                        <AppSymbol
                          name={getStatusIcon(tx.status) as any}
                          size={16}
                          tintColor={getStatusColor(tx.status)}
                        />
                      </View>
                      <View>
                        <ThemedText
                          type="smallBold"
                          style={[styles.customerText, { color: colors.text }]}
                        >
                          {tx.customerPhone}
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={[
                            styles.referenceText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {tx.reference}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.activityRight}>
                      <ThemedText
                        type="subtitle"
                        style={[styles.activityAmountText, { color: colors.text }]}
                      >
                        {formatAmount(tx.amount)}
                      </ThemedText>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(tx.status) },
                          ]}
                        />
                        <ThemedText
                          type="small"
                          style={[
                            styles.statusLabel,
                            { color: getStatusColor(tx.status) },
                          ]}
                        >
                          {tx.status.charAt(0).toUpperCase() +
                            tx.status.slice(1)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ThemedView>

            {/* PIN Prompt */}
            <PinPrompt
              visible={showPinPrompt}
              onClose={handlePinCancel}
              onConfirm={handlePinConfirm}
              amount={amount}
              phoneNumber={mobile}
              merchantName={getMerchantName()}
              isLoading={isPinLoading}
              error={pinError}
            />
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
  greeting: {
    fontSize: 14,
  },
  merchantName: {
    fontSize: 24,
    fontWeight: "700",
  },
  merchantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  avatarButton: {
    padding: 8,
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
    fontSize: 24,
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  emptyStateText: {
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
  referenceText: {
    fontSize: 12,
  },
  activityRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  activityAmountText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 12,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: 2,
  },
  footerText: {
    fontSize: 13,
  },
  footerSubtext: {
    fontSize: 11,
  },
});
