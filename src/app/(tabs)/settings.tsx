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
import { MerchantSelector } from "@/components/merchant-selector";
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
  VODACOM,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useConfig } from "@/context/config-context";
import { useMerchant } from "@/context/merchant-context";
import { authApi } from "@/api/auth";

export default function SettingsScreen() {
  const { colors, toggleTheme } = useTheme();
  const { config, updateConfig } = useConfig();
  const {
    user,
    decodedToken,
    logout,
    deviceConfig,
    merchantInfo,
    refreshUser,
    fetchMerchantDetails,
    userMerchants,
  } = useAuth();
  const {
    selectedMerchant,
    selectMerchant,
    isMerchantSelectorVisible,
    showMerchantSelector,
    hasMultipleActiveMerchants,
  } = useMerchant();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [testingPrinter, setTestingPrinter] = useState(false);

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  useEffect(() => {
    const loadMerchantDetails = async () => {
      const merchantId = deviceConfig?.merchantId || selectedMerchant?.id;
      if (merchantId && !merchantInfo) {
        await fetchMerchantDetails(merchantId);
      }
    };
    loadMerchantDetails();
  }, [
    deviceConfig?.merchantId,
    selectedMerchant,
    merchantInfo,
    fetchMerchantDetails,
  ]);

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
      const merchantId = deviceConfig?.merchantId || selectedMerchant?.id;
      if (merchantId) {
        await fetchMerchantDetails(merchantId);
      }
      Alert.alert("Success", "Settings refreshed successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to refresh settings");
    } finally {
      setLoading(false);
    }
  };

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

  const getUserDisplayName = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    if (decodedToken?.firstName || decodedToken?.lastName) {
      return `${decodedToken.firstName || ""} ${decodedToken.lastName || ""}`.trim();
    }
    return user?.username || decodedToken?.username || "User";
  };

  const getUserUsername = () => {
    return user?.username || decodedToken?.username || "N/A";
  };

  const getUserEmail = () => {
    return user?.email || decodedToken?.email || "N/A";
  };

  const getUserPhone = () => {
    return user?.phoneNumber || decodedToken?.phoneNumber || "N/A";
  };

  const isUserActive = () => {
    return user?.isActive !== undefined ? user.isActive : true;
  };

  const getMerchantName = () => {
    return (
      selectedMerchant?.name ||
      merchantInfo?.name ||
      merchantInfo?.businessName ||
      "N/A"
    );
  };

  const getMerchantCode = () => {
    return selectedMerchant?.code || merchantInfo?.code || "N/A";
  };

  const getMerchantLocation = () => {
    return selectedMerchant?.location || merchantInfo?.location || "N/A";
  };

  const getMerchantDistrict = () => {
    return selectedMerchant?.district || merchantInfo?.district || "N/A";
  };

  const getMerchantBusinessType = () => {
    return (
      selectedMerchant?.businessType || merchantInfo?.businessType || "N/A"
    );
  };

  const isMerchantActive = () => {
    return selectedMerchant?.isActive !== undefined
      ? selectedMerchant.isActive
      : true;
  };

  const getDeviceName = () => {
    return deviceConfig?.deviceName || deviceConfig?.id || "N/A";
  };

  const getDeviceId = () => {
    return deviceConfig?.deviceId || deviceConfig?.id || "N/A";
  };

  const getDeviceModel = () => {
    return deviceConfig?.deviceModel || "N/A";
  };

  const getDeviceOS = () => {
    return deviceConfig?.osVersion || "N/A";
  };

  const getDeviceStatus = () => {
    if (deviceConfig?.status) return deviceConfig.status;
    if (deviceConfig?.isActive === undefined) return "Unknown";
    return deviceConfig.isActive ? "Active" : "Inactive";
  };

  const getDeviceStatusColor = () => {
    if (deviceConfig?.status) {
      return deviceConfig.status === "Active" ? VODACOM.green : VODACOM.red;
    }
    if (deviceConfig?.isActive === undefined) return VODACOM.greyDark;
    return deviceConfig.isActive ? VODACOM.green : VODACOM.red;
  };

  const getTerminalId = () => {
    return deviceConfig?.terminalId || "N/A";
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
              Account & device configuration
            </ThemedText>
          </View>

          {/* User Information */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              User
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.userInfoCompact}>
                <View style={styles.avatarContainer}>
                  <View
                    style={[
                      styles.avatarSmall,
                      { backgroundColor: `${VODACOM.red}15` },
                    ]}
                  >
                    <ThemedText
                      style={[styles.avatarTextSmall, { color: VODACOM.red }]}
                    >
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.statusBadgeAvatar,
                      {
                        backgroundColor: isUserActive()
                          ? VODACOM.green
                          : VODACOM.red,
                      },
                    ]}
                  />
                </View>
                <View style={styles.userDetailsCompact}>
                  <View style={styles.userNameRow}>
                    <ThemedText
                      style={[styles.userName, { color: colors.text }]}
                    >
                      {getUserDisplayName()}
                    </ThemedText>
                    <View
                      style={[
                        styles.statusDotSmall,
                        {
                          backgroundColor: isUserActive()
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.userInfoRow}>
                    <SymbolView
                      name={{ ios: "person.fill", android: "person" }}
                      size={12}
                      tintColor={colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.userInfoText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      @{getUserUsername()}
                    </ThemedText>
                  </View>
                  <View style={styles.userInfoRow}>
                    <SymbolView
                      name={{ ios: "envelope.fill", android: "email" }}
                      size={12}
                      tintColor={colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.userInfoText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {getUserEmail()}
                    </ThemedText>
                  </View>
                  <View style={styles.userInfoRow}>
                    <SymbolView
                      name={{ ios: "phone.fill", android: "phone" }}
                      size={12}
                      tintColor={colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.userInfoText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {getUserPhone()}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Merchant Selection - Show only if multiple merchants */}
          {hasMultipleActiveMerchants && (
            <View style={styles.section}>
              <ThemedText
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                Merchant Selection
              </ThemedText>
              <View
                style={[
                  styles.sectionContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.settingItem,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => showMerchantSelector(true)}
                >
                  <View style={styles.settingLeft}>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      Active Merchant
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {selectedMerchant?.name || "Select a merchant"}
                    </ThemedText>
                  </View>
                  <View style={styles.settingRight}>
                    <ThemedText
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {selectedMerchant?.code || "N/A"}
                    </ThemedText>
                    <SymbolView
                      name={{ ios: "chevron.right", android: "arrow_forward" }}
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {/* Merchant Information */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Merchant
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.infoGrid}>
                <View style={styles.infoGridItem}>
                  <ThemedText
                    style={[
                      styles.infoGridLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Name
                  </ThemedText>
                  <View style={styles.infoGridValueRow}>
                    <ThemedText
                      style={[styles.infoGridValue, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {getMerchantName()}
                    </ThemedText>
                    <View
                      style={[
                        styles.statusDotSmall,
                        {
                          backgroundColor: isMerchantActive()
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.infoGridItem}>
                  <ThemedText
                    style={[
                      styles.infoGridLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Code
                  </ThemedText>
                  <ThemedText
                    style={[styles.infoGridValue, { color: colors.text }]}
                  >
                    {getMerchantCode()}
                  </ThemedText>
                </View>
                <View style={styles.infoGridItem}>
                  <ThemedText
                    style={[
                      styles.infoGridLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Location
                  </ThemedText>
                  <ThemedText
                    style={[styles.infoGridValue, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {getMerchantLocation()}
                  </ThemedText>
                </View>
                <View style={styles.infoGridItem}>
                  <ThemedText
                    style={[
                      styles.infoGridLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    District
                  </ThemedText>
                  <ThemedText
                    style={[styles.infoGridValue, { color: colors.text }]}
                  >
                    {getMerchantDistrict()}
                  </ThemedText>
                </View>
                <View style={styles.infoGridItem}>
                  <ThemedText
                    style={[
                      styles.infoGridLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Business Type
                  </ThemedText>
                  <ThemedText
                    style={[styles.infoGridValue, { color: colors.text }]}
                  >
                    {getMerchantBusinessType()}
                  </ThemedText>
                </View>
                <View style={styles.infoGridItem}>
                  <ThemedText
                    style={[
                      styles.infoGridLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Status
                  </ThemedText>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDotSmall,
                        {
                          backgroundColor: isMerchantActive()
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.statusTextSmall,
                        {
                          color: isMerchantActive()
                            ? VODACOM.green
                            : VODACOM.red,
                        },
                      ]}
                    >
                      {isMerchantActive() ? "Active" : "Inactive"}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Device Information */}
          {deviceConfig && (
            <View style={styles.section}>
              <ThemedText
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                Device
              </ThemedText>
              <View
                style={[
                  styles.sectionContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.infoGrid}>
                  <View style={styles.infoGridItem}>
                    <ThemedText
                      style={[
                        styles.infoGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Name
                    </ThemedText>
                    <ThemedText
                      style={[styles.infoGridValue, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {getDeviceName()}
                    </ThemedText>
                  </View>
                  <View style={styles.infoGridItem}>
                    <ThemedText
                      style={[
                        styles.infoGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      ID
                    </ThemedText>
                    <ThemedText
                      style={[styles.infoGridValue, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {getDeviceId()}
                    </ThemedText>
                  </View>
                  <View style={styles.infoGridItem}>
                    <ThemedText
                      style={[
                        styles.infoGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Model
                    </ThemedText>
                    <ThemedText
                      style={[styles.infoGridValue, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {getDeviceModel()}
                    </ThemedText>
                  </View>
                  <View style={styles.infoGridItem}>
                    <ThemedText
                      style={[
                        styles.infoGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      OS
                    </ThemedText>
                    <ThemedText
                      style={[styles.infoGridValue, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {getDeviceOS()}
                    </ThemedText>
                  </View>
                  <View style={styles.infoGridItem}>
                    <ThemedText
                      style={[
                        styles.infoGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Terminal
                    </ThemedText>
                    <ThemedText
                      style={[styles.infoGridValue, { color: colors.text }]}
                    >
                      {getTerminalId()}
                    </ThemedText>
                  </View>
                  <View style={styles.infoGridItem}>
                    <ThemedText
                      style={[
                        styles.infoGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Status
                    </ThemedText>
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusDotSmall,
                          { backgroundColor: getDeviceStatusColor() },
                        ]}
                      />
                      <ThemedText
                        style={[
                          styles.statusTextSmall,
                          { color: getDeviceStatusColor() },
                        ]}
                      >
                        {getDeviceStatus()}
                      </ThemedText>
                    </View>
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
              Printer
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
                    Test Printer
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Print a test receipt to verify connectivity
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
                  key: "darkMode",
                  label: "Dark Mode",
                  value: config.preferences.darkMode,
                },
              ].map((item) => (
                <View key={item.key} style={styles.settingItem}>
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
          </View>
        </View>
      </ScrollView>

      {/* Merchant Selector Modal */}
      <MerchantSelector
        visible={isMerchantSelectorVisible}
        merchants={userMerchants}
        onSelect={selectMerchant}
        onClose={() => showMerchantSelector(false)}
        title="Switch Merchant"
        subtitle="Select which merchant to associate with this device"
      />
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
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContainer: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    width: 48,
    height: 48,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextSmall: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusBadgeAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfoCompact: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  userDetailsCompact: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userInfoText: {
    fontSize: 13,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.three,
    gap: 8,
  },
  infoGridItem: {
    width: "48%",
    gap: 2,
  },
  infoGridLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoGridValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoGridValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 44,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLeft: {
    flex: 1,
    gap: 1,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingDescription: {
    fontSize: 12,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTextSmall: {
    fontSize: 13,
    fontWeight: "500",
  },
  testButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 50,
    alignItems: "center",
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: VODACOM.light,
    fontWeight: "600",
    fontSize: 13,
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
    paddingVertical: 14,
    borderRadius: 14,
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
    gap: 2,
  },
  footerText: {
    fontSize: 13,
  },
  footerSubtext: {
    fontSize: 11,
  },
});
