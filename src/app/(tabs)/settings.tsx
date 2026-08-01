import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  Dimensions,
} from "react-native";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import { Buffer } from "buffer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ConnectedState from "@/components/bluetooth/ConnectedState";
import DisconnectedState from "@/components/bluetooth/DisconnectedState";
import { MerchantSelector } from "@/components/merchant-selector";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
import { buildTestReceipt, chunkData } from "@/utils/printer-commands";
import { handleAndroidPermissions } from "@/utils/permission";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 380;

const KNOWN_PRINTER_NAME = "IposPrinter";
const KNOWN_PRINTER_ID = process.env.EXPO_PUBLIC_KNOWN_PRINTER_ID;
const WRITE_CHUNK_SIZE = parseInt(
  process.env.EXPO_PUBLIC_WRITE_CHUNK_SIZE || "20",
  10,
);

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
  const [isLoading, setIsLoading] = useState(false);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);

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

  useEffect(() => {
    loadPairedDevices();
  }, []);

  const loadPairedDevices = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        return;
      }
      await handleAndroidPermissions();
      const devices = await RNBluetoothClassic.getBondedDevices();
      setPairedDevices(devices);
    } catch (error) {
      console.error("[loadPairedDevices] error", error);
    }
  };

  const connectPeripheral = async (peripheral: {
    id: string;
    name?: string;
  }) => {
    try {
      setIsLoading(true);
      const device = pairedDevices.find((d) => d.address === peripheral.id);
      if (!device) {
        Alert.alert("Device Not Found", "The selected device is not paired.");
        setIsLoading(false);
        return;
      }
      const connected = await device.connect();
      if (connected) {
        setConnectedDevice(device);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("[connectPeripheral] error", error);
      Alert.alert("Connection Failed", "Could not connect to the printer.");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectPeripheral = async () => {
    try {
      if (connectedDevice) {
        await connectedDevice.disconnect();
      }
    } catch (error) {
      console.error("[disconnectPeripheral] error", error);
    } finally {
      setIsConnected(false);
      setConnectedDevice(null);
    }
  };

  const refreshPairedDevices = async () => {
    setIsLoading(true);
    await loadPairedDevices();
    setIsLoading(false);
  };

  const printTestReceipt = async (): Promise<void> => {
    if (!connectedDevice) {
      throw new Error("No printer connected");
    }

    const merchantName =
      selectedMerchant?.name || merchantInfo?.name || "Merchant";
    const userName = user?.firstName || decodedToken?.firstName || "User";
    const terminalId = deviceConfig?.terminalId || "T-001";

    const commands = buildTestReceipt(merchantName, userName, terminalId);
    const chunks = chunkData(commands, WRITE_CHUNK_SIZE);

    for (const chunk of chunks) {
      await connectedDevice.write(Buffer.from(chunk), "base64");
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const handleTestPrinter = async () => {
    setTestingPrinter(true);
    try {
      if (isConnected && connectedDevice) {
        await printTestReceipt();
        Alert.alert("Success", "Test receipt printed successfully");
        return;
      }

      const connected = await connectToKnownPrinter();
      if (!connected) {
        Alert.alert(
          "Printer Not Found",
          "Could not connect to the built-in printer. Please ensure it is paired.",
        );
        return;
      }

      await printTestReceipt();
      Alert.alert("Success", "Test receipt printed successfully");
    } catch (error: any) {
      console.error("[handleTestPrinter] error", error);
      Alert.alert("Error", error.message || "Failed to print test receipt");
    } finally {
      setTestingPrinter(false);
    }
  };

  const connectToKnownPrinter = async (): Promise<boolean> => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        Alert.alert("Bluetooth", "Please enable Bluetooth.");
        return false;
      }

      await handleAndroidPermissions();
      const devices = await RNBluetoothClassic.getBondedDevices();

      const targetDevice = devices.find(
        (d) => d.name === KNOWN_PRINTER_NAME || d.address === KNOWN_PRINTER_ID,
      );

      if (!targetDevice) {
        return false;
      }

      const connected = await targetDevice.connect();
      if (connected) {
        setConnectedDevice(targetDevice);
        setIsConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("[connectToKnownPrinter] error", error);
      return false;
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
    const preferences = { ...config.preferences, [key]: value };
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

  const getPrinterStatusText = () => {
    if (isConnected) return "Connected";
    if (pairedDevices.length > 0) return "Paired";
    return "No Printer";
  };

  const getPrinterStatusColor = () => {
    if (isConnected) return VODACOM.green;
    if (pairedDevices.length > 0) return VODACOM.gold;
    return VODACOM.greyDark;
  };

  // Settings sections data
  const userSection = {
    title: "Account",
    icon: "person.circle.fill",
    items: [
      { label: "Name", value: getUserDisplayName() },
      { label: "Username", value: `@${getUserUsername()}` },
      { label: "Email", value: getUserEmail() },
      { label: "Phone", value: getUserPhone() },
    ],
  };

  const merchantSection = {
    title: "Business",
    icon: "storefront.fill",
    items: [
      { label: "Name", value: getMerchantName() },
      { label: "Code", value: getMerchantCode() },
      { label: "Location", value: getMerchantLocation() },
      { label: "District", value: getMerchantDistrict() },
      { label: "Type", value: getMerchantBusinessType() },
    ],
  };

  const deviceSection = {
    title: "Device",
    icon: "desktopcomputer",
    items: [
      { label: "Name", value: getDeviceName() },
      { label: "ID", value: getDeviceId() },
      { label: "Model", value: getDeviceModel() },
      { label: "OS", value: getDeviceOS() },
      { label: "Terminal", value: getTerminalId() },
    ],
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
                Settings
              </ThemedText>
              <ThemedText
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                Manage your account and device
              </ThemedText>
            </View>
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

          {/* Quick Status Cards */}
          <View style={styles.quickStatus}>
            <View
              style={[styles.statusCard, { backgroundColor: colors.surface }]}
            >
              <SymbolView
                name={{ ios: "person.circle.fill", android: "person" }}
                size={24}
                tintColor={VODACOM.red}
              />
              <ThemedText
                style={[
                  styles.statusCardLabel,
                  { color: colors.textSecondary },
                ]}
              >
                User
              </ThemedText>
              <ThemedText
                style={[styles.statusCardValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {getUserDisplayName()}
              </ThemedText>
            </View>

            <View
              style={[styles.statusCard, { backgroundColor: colors.surface }]}
            >
              <SymbolView
                name={{ ios: "storefront.fill", android: "store" }}
                size={24}
                tintColor={VODACOM.gold}
              />
              <ThemedText
                style={[
                  styles.statusCardLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Merchant
              </ThemedText>
              <ThemedText
                style={[styles.statusCardValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {getMerchantName()}
              </ThemedText>
            </View>

            <View
              style={[styles.statusCard, { backgroundColor: colors.surface }]}
            >
              <SymbolView
                name={{ ios: "printer.fill", android: "print" }}
                size={24}
                tintColor={getPrinterStatusColor()}
              />
              <ThemedText
                style={[
                  styles.statusCardLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Printer
              </ThemedText>
              <ThemedText
                style={[
                  styles.statusCardValue,
                  { color: getPrinterStatusColor() },
                ]}
              >
                {getPrinterStatusText()}
              </ThemedText>
            </View>
          </View>

          {/* Printer Section - Combined with Bluetooth */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SymbolView
                name={{ ios: "printer.fill", android: "print" }}
                size={20}
                tintColor={VODACOM.red}
              />
              <ThemedText
                type="subtitle"
                style={[styles.sectionTitle, { color: colors.text }]}
              >
                Printer
              </ThemedText>
            </View>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              {/* Bluetooth Status */}
              <View style={styles.printerHeader}>
                <View style={styles.printerStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getPrinterStatusColor() },
                    ]}
                  />
                  <View>
                    <ThemedText
                      style={[
                        styles.printerStatusLabel,
                        { color: colors.text },
                      ]}
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.printerStatusSub,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {isConnected
                        ? "IposPrinter"
                        : pairedDevices.length > 0
                          ? "Paired but not connected"
                          : "No printer paired"}
                    </ThemedText>
                  </View>
                </View>
                {!isConnected && (
                  <Pressable
                    onPress={refreshPairedDevices}
                    disabled={isLoading}
                    style={styles.refreshButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={VODACOM.red} />
                    ) : (
                      <SymbolView
                        name={{ ios: "arrow.clockwise", android: "refresh" }}
                        size={18}
                        tintColor={VODACOM.red}
                      />
                    )}
                  </Pressable>
                )}
              </View>

              {/* Device List or Connection Status */}
              {!isConnected ? (
                <DisconnectedState
                  peripherals={pairedDevices.map((d) => ({
                    id: d.address,
                    name: d.name || d.address,
                    localName: d.name,
                    rssi: 0,
                  }))}
                  isScanning={isLoading}
                  onScanPress={refreshPairedDevices}
                  onConnect={connectPeripheral}
                />
              ) : (
                <ConnectedState
                  onDisconnect={disconnectPeripheral}
                  printerName="IposPrinter"
                />
              )}

              {/* Test Printer */}
              <View style={styles.printerTest}>
                <View style={styles.divider} />
                <View style={styles.testRow}>
                  <View style={styles.testLeft}>
                    <ThemedText
                      style={[styles.testLabel, { color: colors.text }]}
                    >
                      Test Print
                    </ThemedText>
                    <ThemedText
                      style={[styles.testDesc, { color: colors.textSecondary }]}
                    >
                      Print a test receipt
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={handleTestPrinter}
                    disabled={testingPrinter}
                    style={({ pressed }) => [
                      styles.printButton,
                      { backgroundColor: VODACOM.red },
                      pressed && styles.pressed,
                      testingPrinter && styles.printButtonDisabled,
                    ]}
                  >
                    {testingPrinter ? (
                      <ActivityIndicator size="small" color={VODACOM.light} />
                    ) : (
                      <>
                        <SymbolView
                          name={{ ios: "printer.fill", android: "print" }}
                          size={16}
                          tintColor={VODACOM.light}
                        />
                        <ThemedText style={styles.printButtonText}>
                          Print
                        </ThemedText>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* User Section */}
          <InfoSection
            title="Account"
            icon="person.circle.fill"
            items={userSection.items}
            colors={colors}
          />

          {/* Merchant Section */}
          {selectedMerchant && (
            <InfoSection
              title="Business"
              icon="storefront.fill"
              items={merchantSection.items}
              colors={colors}
              status={isMerchantActive()}
            />
          )}

          {/* Device Section */}
          {deviceConfig && (
            <InfoSection
              title="Device"
              icon="desktopcomputer"
              items={deviceSection.items}
              colors={colors}
              status={deviceConfig.isActive}
            />
          )}

          {/* Preferences */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SymbolView
                name={{ ios: "gear", android: "settings" }}
                size={20}
                tintColor={VODACOM.red}
              />
              <ThemedText
                type="subtitle"
                style={[styles.sectionTitle, { color: colors.text }]}
              >
                Preferences
              </ThemedText>
            </View>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <SymbolView
                    name={{ ios: "moon.fill", android: "dark_mode" }}
                    size={20}
                    tintColor={colors.text}
                  />
                  <View>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      Dark Mode
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.settingDesc,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Switch to dark theme
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={config.preferences.darkMode}
                  onValueChange={(value) =>
                    handlePreferenceToggle("darkMode", value)
                  }
                  trackColor={{ false: "#E2E8F0", true: VODACOM.red }}
                  thumbColor={VODACOM.light}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            </View>
          </View>

          {/* Merchant Selector */}
          {hasMultipleActiveMerchants && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SymbolView
                  name={{
                    ios: "arrow.left.arrow.right",
                    android: "swap_horiz",
                  }}
                  size={20}
                  tintColor={VODACOM.gold}
                />
                <ThemedText
                  type="subtitle"
                  style={[styles.sectionTitle, { color: colors.text }]}
                >
                  Switch Merchant
                </ThemedText>
              </View>
              <View
                style={[
                  styles.sectionContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Pressable
                  onPress={() => showMerchantSelector(true)}
                  style={({ pressed }) => [
                    styles.merchantSelector,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.merchantSelectorLeft}>
                    <SymbolView
                      name={{ ios: "storefront.fill", android: "store" }}
                      size={20}
                      tintColor={VODACOM.red}
                    />
                    <View>
                      <ThemedText
                        style={[
                          styles.merchantSelectorLabel,
                          { color: colors.text },
                        ]}
                      >
                        {selectedMerchant?.name || "Select Merchant"}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.merchantSelectorCode,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Code: {selectedMerchant?.code || "N/A"}
                      </ThemedText>
                    </View>
                  </View>
                  <SymbolView
                    name={{ ios: "chevron.right", android: "arrow_forward" }}
                    size={16}
                    tintColor={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* Logout */}
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

// Info Section Component
function InfoSection({ title, icon, items, colors, status }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SymbolView
          name={{ ios: icon, android: icon }}
          size={20}
          tintColor={VODACOM.red}
        />
        <ThemedText
          type="subtitle"
          style={[styles.sectionTitle, { color: colors.text }]}
        >
          {title}
        </ThemedText>
        {status !== undefined && (
          <View
            style={[
              styles.statusBadgeSmall,
              { backgroundColor: status ? VODACOM.green : VODACOM.red },
            ]}
          >
            <ThemedText style={styles.statusBadgeSmallText}>
              {status ? "Active" : "Inactive"}
            </ThemedText>
          </View>
        )}
      </View>
      <View
        style={[styles.sectionContainer, { backgroundColor: colors.surface }]}
      >
        {items.map((item: any, index: number) => (
          <View
            key={item.label}
            style={[
              styles.infoItem,
              index < items.length - 1 && styles.infoItemBorder,
            ]}
          >
            <ThemedText
              style={[styles.infoLabel, { color: colors.textSecondary }]}
            >
              {item.label}
            </ThemedText>
            <ThemedText
              style={[styles.infoValue, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.value}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.three,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 13 : 14,
  },
  quickStatus: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  statusCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusCardLabel: {
    fontSize: isSmallScreen ? 10 : 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusCardValue: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "600",
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
  printerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
  },
  printerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  printerStatusLabel: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "600",
  },
  printerStatusSub: {
    fontSize: isSmallScreen ? 11 : 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${VODACOM.red}10`,
  },
  printerTest: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: Spacing.two,
  },
  testRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  testLeft: {
    flex: 1,
    gap: 2,
  },
  testLabel: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: "500",
  },
  testDesc: {
    fontSize: isSmallScreen ? 11 : 12,
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
  },
  printButtonDisabled: {
    opacity: 0.6,
  },
  printButtonText: {
    color: VODACOM.light,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "600",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 44,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusBadgeSmallText: {
    fontSize: 10,
    color: VODACOM.light,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 52,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: isSmallScreen ? 11 : 12,
  },
  merchantSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
  },
  merchantSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  merchantSelectorLabel: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: "500",
  },
  merchantSelectorCode: {
    fontSize: isSmallScreen ? 11 : 12,
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
    marginTop: Spacing.two,
  },
  logoutText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
    gap: 2,
  },
  footerText: {
    fontSize: isSmallScreen ? 12 : 13,
  },
  footerSubtext: {
    fontSize: isSmallScreen ? 10 : 11,
  },
  pressed: {
    opacity: 0.7,
  },
});
