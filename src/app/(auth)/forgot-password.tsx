import { useState } from "react";
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
import { useRouter } from "expo-router";

import { AppLogo } from "@/components/app-logo";
import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";

export default function ForgotPasswordScreen() {
  const { colors, isDark } = useTheme();
  const { requestPasswordReset, pendingEmail, setPendingEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState(pendingEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(email.trim());
      if (result.success) {
        setPendingEmail(email.trim());
        router.push("/(auth)/otp?mode=reset");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting;

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
                Forgot Password
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.subtitle, { color: colors.textSecondary }]}
              >
                Enter your email to receive a verification code
              </ThemedText>
            </View>

            {/* Form */}
            <View
              style={[styles.formCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold" style={styles.label}>
                  Email Address
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
                  value={email}
                  onChangeText={setEmail}
                  placeholder="merchant@business.co.ls"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isDisabled}
                />
              </View>

              <Pressable
                onPress={handleRequestReset}
                disabled={isDisabled}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  isDisabled && styles.disabled,
                ]}
              >
                <View
                  style={[
                    styles.primaryButtonInner,
                    {
                      backgroundColor: isDisabled
                        ? colors.textSecondary
                        : VODACOM.gold,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.primaryButtonText,
                      { color: isDisabled ? VODACOM.light : VODACOM.dark },
                    ]}
                  >
                    {isSubmitting ? "Sending..." : "Send Verification Code"}
                  </ThemedText>
                  {!isSubmitting && (
                    <AppSymbol
                      name={{ ios: "arrow.right", android: "arrow_forward" }}
                      size={18}
                      tintColor={VODACOM.dark}
                    />
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  primaryButton: {
    borderRadius: 14,
    marginTop: Spacing.two,
    overflow: "hidden",
  },
  primaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
