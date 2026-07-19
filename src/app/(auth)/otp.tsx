import { useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { AppLogo } from "@/components/app-logo";
import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { MerchantSelector } from "@/components/merchant-selector";

export default function OtpScreen() {
  const { colors, isDark } = useTheme();
  const {
    verifyOtp,
    resetPassword,
    pendingEmail,
    setPendingEmail,
    showMerchantSelection,
    userMerchants,
    handleMerchantSelection,
    setShowMerchantSelection,
  } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: "login" | "reset" = params.mode === "reset" ? "reset" : "login";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pendingEmail) {
      router.back();
    }
  }, [pendingEmail, router]);

  const handleVerifyLogin = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(pendingEmail!, otp.trim());
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(pendingEmail!, otp.trim(), newPassword);
      setPendingEmail(null);
      Alert.alert("Success", "Your password has been reset", [
        {
          text: "Sign In",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReset = mode === "reset";

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Back Button */}
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <AppSymbol
                name={{ ios: "chevron.left", android: "arrow_back" }}
                size={24}
                tintColor={VODACOM.red}
              />
            </Pressable>

            {/* Logo */}
            <AppLogo size="medium" />

            <View style={styles.headerText}>
              <ThemedText type="title" style={styles.title}>
                {isReset ? "Reset Password" : "Verify Code"}
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.subtitle, { color: colors.textSecondary }]}
              >
                {isReset
                  ? "Enter the code sent to your email"
                  : `We sent a 6-digit code to ${pendingEmail ?? "your email"}`}
              </ThemedText>
            </View>

            {/* Form */}
            <View
              style={[styles.formCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold" style={styles.label}>
                  Verification Code
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.otpInput,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceStrong
                        : VODACOM.grey,
                      color: colors.text,
                    },
                  ]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="000000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isSubmitting}
                />
              </View>

              {isReset && (
                <>
                  <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold" style={styles.label}>
                      New Password
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceStrong
                            : VODACOM.grey,
                          color: colors.text,
                        },
                      ]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Min 6 characters"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      editable={!isSubmitting}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold" style={styles.label}>
                      Confirm Password
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceStrong
                            : VODACOM.grey,
                          color: colors.text,
                        },
                      ]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      editable={!isSubmitting}
                    />
                  </View>
                </>
              )}

              <Pressable
                onPress={isReset ? handleResetPassword : handleVerifyLogin}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  isSubmitting && styles.disabled,
                ]}
              >
                <View
                  style={[
                    styles.primaryButtonInner,
                    {
                      backgroundColor: isSubmitting
                        ? colors.textSecondary
                        : isReset
                          ? VODACOM.gold
                          : VODACOM.green,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.primaryButtonText,
                      {
                        color: isReset ? VODACOM.dark : VODACOM.light,
                      },
                    ]}
                  >
                    {isSubmitting
                      ? "Please wait..."
                      : isReset
                        ? "Reset Password"
                        : "Verify Code"}
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <MerchantSelector
        visible={showMerchantSelection}
        merchants={userMerchants}
        onSelect={handleMerchantSelection}
        onClose={() => setShowMerchantSelection(false)}
        title="Select Merchant"
        subtitle="Choose which merchant to associate with this device"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: -Spacing.one,
  },
  headerText: {
    alignItems: "center",
    gap: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  formCard: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 0,
  },
  otpInput: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 8,
  },
  primaryButton: {
    borderRadius: 14,
    marginTop: Spacing.two,
    overflow: "hidden",
  },
  primaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
