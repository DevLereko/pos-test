import { SymbolView } from "expo-symbols";
import { useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
  VODACOM,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useConfig } from "@/context/config-context";
import { authApi } from "@/api/auth";

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { config, updateConfig } = useConfig();
  const {
    user,
    decodedToken,
    logout,
    deviceConfig,
    merchantInfo,
    refreshUser,
  } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<{
    connected: boolean;
    name: string;
  }>({
    connected: false,
    name: "Unknown",
  });
  const [testingPrinter, setTestingPrinter] = useState(false);

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  useEffect(() => {
    loadPrinterStatus();
  }, [deviceConfig]);

  const loadPrinterStatus = async () => {
    if (deviceConfig?.id) {
      // Get printer name from device config
      setPrinterStatus({
        connected: true, // This would come from actual BLE connection status
        name: deviceConfig.printerName || "InnerPrinter",
      });
    }
  };

  const handleTestPrinter = async () => {
    if (!deviceConfig?.id) {
      Alert.alert("Error", "No device configuration found");
      return;
    }

    setTestingPrinter(true);
    try {
      const result = await authApi.testPrinter(deviceConfig.id);

      if (result.success) {
        Alert.alert(
          "Printer Test Successful",
          `Printer is working properly.\n\n${result.message}`,
        );
      } else {
        Alert.alert("Printer Test Failed", result.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to test printer");
    } finally {
      setTestingPrinter(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshUser();
      Alert.alert("Success", "Settings refreshed successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to refresh settings");
    } finally {
      setLoading(false);
    }
  };

  // Preference toggle handler
  const handlePreferenceToggle = (key: string, value: boolean) => {
    const preferences = {
      ...config.preferences,
      [key]: value,
    };
    updateConfig({ preferences });

    if (key === "darkMode") {
      toggleTheme();
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user) {
      return (
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.username ||
        "User"
      );
    }
    if (decodedToken) {
      return (
        `${decodedToken.firstName || ""} ${decodedToken.lastName || ""}`.trim() ||
        decodedToken.username ||
        "User"
      );
    }
    return "User";
  };

  const getUserEmail = () => {
    if (user) return user.email;
    if (decodedToken) return decodedToken.email;
    return "N/A";
  };

  const getUserRoles = () => {
    if (user?.roles) {
      return user.roles.map((r: any) => r.name);
    }
    if (decodedToken?.role) {
      return decodedToken.role.map((r) => r.replace("ROLE_", ""));
    }
    return [];
  };

  const getMerchantDisplayName = () => {
    if (merchantInfo) {
      return merchantInfo.businessName || merchantInfo.name || "N/A";
    }
    return "N/A";
  };

  const getMerchantPhone = () => {
    if (merchantInfo) {
      return merchantInfo.phoneNumber || "N/A";
    }
    return "N/A";
  };

  const getMerchantAddress = () => {
    if (merchantInfo) {
      return merchantInfo.businessAddress || merchantInfo.location || "N/A";
    }
    return "N/A";
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
            <View style={styles.headerRow}>
              <ThemedText
                type="title"
                style={[styles.headerTitle, { color: colors.text }]}
              >
                Settings
              </ThemedText>
              <Pressable onPress={handleRefresh} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color={VODACOM.red} />
                ) : (
                  <SymbolView
                    name={{ ios: "arrow.clockwise", android: "refresh" }}
                    size={22}
                    tintColor={VODACOM.red}
                  />
                )}
              </Pressable>
            </View>
            <ThemedText
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              Manage your account and POS configuration
            </ThemedText>
          </View>

          {/* User Section */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              User Information
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.userInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: `${VODACOM.red}15` },
                  ]}
                >
                  <ThemedText
                    style={[styles.avatarText, { color: VODACOM.red }]}
                  >
                    {getUserDisplayName().charAt(0)}
                  </ThemedText>
                </View>
                <View style={styles.userDetails}>
                  <ThemedText style={[styles.userName, { color: colors.text }]}>
                    {getUserDisplayName()}
                  </ThemedText>
                  <ThemedText
                    style={[styles.userEmail, { color: colors.textSecondary }]}
                  >
                    {getUserEmail()}
                  </ThemedText>
                  <View style={styles.userBadges}>
                    {getUserRoles().map((role: string, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.badge,
                          { backgroundColor: `${VODACOM.red}15` },
                        ]}
                      >
                        <ThemedText
                          style={[styles.badgeText, { color: VODACOM.red }]}
                        >
                          {role}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Merchant Section */}
          {merchantInfo && (
            <View style={styles.section}>
              <ThemedText
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                Merchant Details
              </ThemedText>
              <View
                style={[
                  styles.sectionContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.settingItem}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Business Name
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {getMerchantDisplayName()}
                  </ThemedText>
                </View>
                <View style={[styles.settingItem, styles.settingBorder]}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Phone
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {getMerchantPhone()}
                  </ThemedText>
                </View>
                <View style={[styles.settingItem, styles.settingBorder]}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Address
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {getMerchantAddress()}
                  </ThemedText>
                </View>
                {deviceConfig && (
                  <View style={[styles.settingItem, styles.settingBorder]}>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      Terminal ID
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {deviceConfig.terminalId || "N/A"}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Device Section */}
          {deviceConfig && (
            <View style={styles.section}>
              <ThemedText
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                Device Configuration
              </ThemedText>
              <View
                style={[
                  styles.sectionContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.settingItem}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Device Name
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {deviceConfig.deviceName || "N/A"}
                  </ThemedText>
                </View>
                <View style={[styles.settingItem, styles.settingBorder]}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Device ID
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {deviceConfig.deviceId || "N/A"}
                  </ThemedText>
                </View>
                <View style={[styles.settingItem, styles.settingBorder]}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    API URL
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {deviceConfig.apiUrl || "N/A"}
                  </ThemedText>
                </View>
                <View style={[styles.settingItem, styles.settingBorder]}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    SOAP URL
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {deviceConfig.soapUrl || "N/A"}
                  </ThemedText>
                </View>
                <View style={[styles.settingItem, styles.settingBorder]}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Status
                  </ThemedText>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: deviceConfig.isActive
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.statusText,
                        {
                          color: deviceConfig.isActive
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    >
                      {deviceConfig.isActive ? "Active" : "Inactive"}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Printer Section */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Printer Settings
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Printer Status
                  </ThemedText>
                  <View style={styles.printerStatusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: printerStatus.connected
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.printerStatusText,
                        {
                          color: printerStatus.connected
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    >
                      {printerStatus.connected ? "Connected" : "Disconnected"}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {printerStatus.name}
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.settingItem, styles.settingBorder]}>
                <View style={styles.settingLeft}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Test Printer
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Print a test receipt to verify printer connectivity
                  </ThemedText>
                </View>
                <Pressable
                  onPress={handleTestPrinter}
                  disabled={testingPrinter}
                  style={({ pressed }) => [
                    styles.testButton,
                    { backgroundColor: VODACOM.red },
                    pressed && styles.pressed,
                    testingPrinter && styles.testButtonDisabled,
                  ]}
                >
                  {testingPrinter ? (
                    <ActivityIndicator size="small" color={VODACOM.light} />
                  ) : (
                    <ThemedText style={styles.testButtonText}>Test</ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Preferences
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              {[
                {
                  key: "autoPrint",
                  label: "Auto Print Receipt",
                  value: config.preferences.autoPrint,
                },
                {
                  key: "soundEffects",
                  label: "Sound Effects",
                  value: config.preferences.soundEffects,
                },
                {
                  key: "offlineMode",
                  label: "Offline Mode",
                  value: config.preferences.offlineMode,
                },
                {
                  key: "darkMode",
                  label: "Dark Mode",
                  value: config.preferences.darkMode,
                },
                {
                  key: "biometricAuth",
                  label: "Biometric Authentication",
                  value: config.preferences.biometricAuth,
                },
              ].map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.settingItem,
                    index < 4 && styles.settingBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      {item.label}
                    </ThemedText>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={(value) =>
                      handlePreferenceToggle(item.key, value)
                    }
                    trackColor={{ false: "#E2E8F0", true: VODACOM.red }}
                    thumbColor={VODACOM.light}
                    ios_backgroundColor="#E2E8F0"
                  />
                </View>
              ))}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Session Timeout
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Auto-logout after inactivity
                  </ThemedText>
                </View>
                <View style={styles.settingRight}>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {config.preferences.sessionTimeout} min
                  </ThemedText>
                  <Pressable
                    onPress={() => {
                      const current = config.preferences.sessionTimeout;
                      const options = [1, 5, 10, 15, 30];
                      const next =
                        options[
                          (options.indexOf(current) + 1) % options.length
                        ];
                      const preferences = {
                        ...config.preferences,
                        sessionTimeout: next,
                      };
                      updateConfig({ preferences });
                    }}
                  >
                    <SymbolView
                      name={{ ios: "chevron.right", android: "arrow_forward" }}
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "rectangle.portrait.and.arrow.right",
                  android: "logout",
                }}
                size={20}
                tintColor={VODACOM.red}
              />
              <ThemedText style={[styles.logoutText, { color: VODACOM.red }]}>
                Logout
              </ThemedText>
            </Pressable>
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
            {decodedToken && (
              <ThemedText
                style={[
                  styles.footerSubtext,
                  { color: colors.textSecondary, fontSize: 10 },
                ]}
              >
                User: {decodedToken.username} | Exp:{" "}
                {new Date(decodedToken.exp * 1000).toLocaleString()}
              </ThemedText>
            )}
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
  header: {
    paddingTop: Spacing.three,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
  },
  userBadges: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 52,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLeft: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  printerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  printerStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  testButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: VODACOM.light,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.7,
  },
  actionsContainer: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VODACOM.redLight,
    backgroundColor: VODACOM.light,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerSubtext: {
    fontSize: 12,
  },
});
