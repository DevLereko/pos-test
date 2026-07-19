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

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const { login, isLoading, setPendingEmail } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      router.push("/(auth)/otp?mode=login");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setPendingEmail(username.trim());
    router.push("/(auth)/forgot-password");
  };

  const isDisabled = isSubmitting || isLoading;

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
            {/* Logo */}
            <AppLogo size="medium" />

            <View style={styles.headerText}>
              <ThemedText type="title" style={styles.title}>
                Welcome Back
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.subtitle, { color: colors.textSecondary }]}
              >
                Sign in to your M-Pesa POS
              </ThemedText>
            </View>

            {/* Form */}
            <View
              style={[styles.formCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold" style={styles.label}>
                  Username
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
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isDisabled}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText type="smallBold" style={styles.label}>
                  Password
                </ThemedText>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceStrong
                          : VODACOM.grey,
                        color: colors.text,
                      },
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    editable={!isDisabled}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    hitSlop={8}
                  >
                    <AppSymbol
                      name={showPassword ? "eye.slash" : "eye"}
                      size={20}
                      tintColor={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={isDisabled}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.pressed,
                  isDisabled && styles.disabled,
                ]}
              >
                <View
                  style={[
                    styles.loginButtonInner,
                    {
                      backgroundColor: isDisabled
                        ? colors.textSecondary
                        : VODACOM.red,
                    },
                  ]}
                >
                  {isSubmitting || isLoading ? (
                    <ThemedText
                      type="smallBold"
                      style={[styles.loginButtonText, { color: VODACOM.light }]}
                    >
                      Signing in...
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.loginButtonText,
                          { color: VODACOM.light },
                        ]}
                      >
                        Sign In
                      </ThemedText>
                      <AppSymbol
                        name={{ ios: "arrow.right", android: "arrow_forward" }}
                        size={18}
                        tintColor={VODACOM.light}
                      />
                    </>
                  )}
                </View>
              </Pressable>

              <Pressable onPress={handleForgotPassword} disabled={isDisabled}>
                <ThemedText
                  type="small"
                  style={[styles.forgotText, { color: VODACOM.red }]}
                >
                  Forgot Password?
                </ThemedText>
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
  headerText: {
    alignItems: "center",
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  loginButton: {
    borderRadius: 14,
    marginTop: Spacing.two,
    overflow: "hidden",
  },
  loginButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loginButtonText: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
