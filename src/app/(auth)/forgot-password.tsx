import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

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
      <ScrollView
        contentContainerStyle={[styles.scrollContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AppSymbol
              name={{ ios: "chevron.left", android: "arrow_back" }}
              size={24}
              tintColor={VODACOM.red}
            />
          </Pressable>
          <View style={[styles.logoCircle, { backgroundColor: colors.surface }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <ThemedText type="title" style={styles.title}>
            Forgot Password
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Enter your email and we will send you a verification code
          </ThemedText>
        </View>

        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.surface },
          ]}
        >
          <View style={styles.fieldGroup}>
            <ThemedText type="smallBold" style={styles.label}>
              Email Address
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.surfaceStrong : VODACOM.light,
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
                  backgroundColor:
                    isDisabled ? colors.textSecondary : VODACOM.gold,
                },
              ]}
            >
              <ThemedText
                type="smallBold"
                style={[styles.primaryButtonText, { color: VODACOM.dark }]}
              >
                {isSubmitting ? "Sending..." : "Send Verification Code"}
              </ThemedText>
              <AppSymbol
                name={{ ios: "arrow.right", android: "arrow_forward" }}
                size={18}
                tintColor={VODACOM.dark}
              />
            </View>
          </Pressable>
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
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  headerSection: {
    marginBottom: Spacing.five,
    gap: Spacing.two,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: Spacing.two,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  formCard: {
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    marginBottom: 2,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
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
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
