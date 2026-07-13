import { Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

interface PinPromptProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  amount: string;
  phoneNumber: string;
  merchantName: string;
  isLoading?: boolean;
  error?: string | null;
}

export function PinPrompt({
  visible,
  onClose,
  onConfirm,
  amount,
  phoneNumber,
  merchantName,
  isLoading = false,
  error = null,
}: PinPromptProps) {
  const { colors, isDark } = useTheme();
  const [pin, setPin] = useState("");
  const [showError, setShowError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const maxAttempts = 3;

  // Auto-focus input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setPin("");
      setShowError(false);
    }
  }, [visible]);

  // Handle PIN submission
  const handleSubmit = () => {
    if (pin.length === 4) {
      onConfirm(pin);
    } else {
      setShowError(true);
      shakeAnimation();
    }
  };

  // Shake animation for error
  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle PIN input change
  const handlePinChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    setPin(cleaned);
    setShowError(false);
  };

  // Format phone number for display
  const formatPhoneNumber = (number: string) => {
    if (number.length === 11) {
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 9)} ${number.slice(9)}`;
    }
    return number;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: colors.surface,
                  transform: [{ translateX: shakeAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.headerIcon,
                    { backgroundColor: `${VODACOM.red}15` },
                  ]}
                >
                  <SymbolView
                    name={{ ios: "lock.fill", android: "lock" }}
                    size={24}
                    tintColor={VODACOM.red}
                  />
                </View>
                <ThemedText type="subtitle" style={styles.headerTitle}>
                  Confirm PIN
                </ThemedText>
                <ThemedText
                  style={[
                    styles.headerSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Enter your 4-digit PIN to authorize this payment
                </ThemedText>
              </View>

              {/* Transaction Summary */}
              <View
                style={[
                  styles.summary,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceStrong
                      : VODACOM.grey,
                  },
                ]}
              >
                <View style={styles.summaryRow}>
                  <ThemedText
                    style={[
                      styles.summaryLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Merchant
                  </ThemedText>
                  <ThemedText
                    style={[styles.summaryValue, { color: colors.text }]}
                  >
                    {merchantName}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText
                    style={[
                      styles.summaryLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Customer
                  </ThemedText>
                  <ThemedText
                    style={[styles.summaryValue, { color: colors.text }]}
                  >
                    {formatPhoneNumber(phoneNumber)}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText
                    style={[
                      styles.summaryLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Amount
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: VODACOM.red, fontWeight: "700" },
                    ]}
                  >
                    M {amount}
                  </ThemedText>
                </View>
              </View>

              {/* PIN Input with Native Keyboard */}
              <View style={styles.pinContainer}>
                {/* PIN Dots */}
                <View style={styles.pinDots}>
                  {[0, 1, 2, 3].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.pinDot,
                        {
                          borderColor:
                            pin.length > index
                              ? VODACOM.red
                              : colors.textSecondary,
                          backgroundColor:
                            pin.length > index ? VODACOM.red : "transparent",
                        },
                      ]}
                    >
                      {pin.length > index && (
                        <View
                          style={[
                            styles.pinDotFilled,
                            { backgroundColor: VODACOM.red },
                          ]}
                        />
                      )}
                    </View>
                  ))}
                </View>

                {/* Hidden TextInput for Native Keyboard */}
                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  value={pin}
                  onChangeText={handlePinChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  autoFocus
                  onSubmitEditing={handleSubmit}
                  returnKeyType="done"
                  editable={!isLoading}
                />

                {/* Error Messages */}
                {error && (
                  <View style={styles.errorContainer}>
                    <SymbolView
                      name={{
                        ios: "exclamationmark.circle.fill",
                        android: "error",
                      }}
                      size={16}
                      tintColor={VODACOM.red}
                    />
                    <ThemedText
                      style={[styles.errorText, { color: VODACOM.red }]}
                    >
                      {error}
                    </ThemedText>
                  </View>
                )}

                {!error && showError && (
                  <View style={styles.errorContainer}>
                    <SymbolView
                      name={{
                        ios: "exclamationmark.circle.fill",
                        android: "error",
                      }}
                      size={16}
                      tintColor={VODACOM.red}
                    />
                    <ThemedText
                      style={[styles.errorText, { color: VODACOM.red }]}
                    >
                      Please enter a valid 4-digit PIN
                    </ThemedText>
                  </View>
                )}

                {attempts >= maxAttempts && (
                  <View style={styles.errorContainer}>
                    <SymbolView
                      name={{
                        ios: "exclamationmark.triangle.fill",
                        android: "warning",
                      }}
                      size={16}
                      tintColor={VODACOM.gold}
                    />
                    <ThemedText
                      style={[styles.errorText, { color: VODACOM.gold }]}
                    >
                      Too many failed attempts. Please try again later.
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Pressable
                  style={[
                    styles.cancelButton,
                    { borderColor: colors.textSecondary },
                  ]}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <ThemedText
                    style={[styles.cancelText, { color: colors.textSecondary }]}
                  >
                    Cancel
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.confirmButton,
                    { backgroundColor: VODACOM.red },
                    (pin.length !== 4 || isLoading) &&
                      styles.confirmButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSubmit}
                  disabled={pin.length !== 4 || isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <SymbolView
                        name={{
                          ios: "clock.badge.exclamationmark",
                          android: "hourglass",
                        }}
                        size={20}
                        tintColor={VODACOM.light}
                      />
                      <ThemedText
                        style={[styles.confirmText, { color: VODACOM.light }]}
                      >
                        Processing...
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText
                      style={[styles.confirmText, { color: VODACOM.light }]}
                    >
                      Confirm Payment
                    </ThemedText>
                  )}
                </Pressable>
              </View>

              {/* Attempts Indicator */}
              <View style={styles.attemptsIndicator}>
                {Array.from({ length: maxAttempts }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.attemptDot,
                      {
                        backgroundColor:
                          index < attempts ? VODACOM.red : colors.textSecondary,
                        opacity: index < attempts ? 1 : 0.3,
                      },
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  summary: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  pinContainer: {
    alignItems: "center",
    gap: 12,
  },
  pinDots: {
    flexDirection: "row",
    gap: 16,
  },
  pinDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDotFilled: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  attemptsIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  attemptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
