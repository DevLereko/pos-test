import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
} from "react-native";

import { authApi } from "@/api/auth";
import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { deviceInfoService } from "@/services/device-info.service";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

export default function VerifyDeviceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceVerified, setDeviceVerified] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [merchantInfo, setMerchantInfo] = useState<any>(null);
  const [deviceDetails, setDeviceDetails] = useState<any>(null);
  const [verificationData, setVerificationData] = useState<any>(null);

  const verifyDevice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const deviceInfo = await deviceInfoService.getDeviceInfo();
      console.log("Real Device Info:", {
        deviceId: deviceInfo.deviceId,
        osVersion: deviceInfo.osVersion,
        deviceModel: deviceInfo.deviceModel,
        serialNumber: deviceInfo.serialNumber,
        manufacturer: deviceInfo.manufacturer,
        brand: deviceInfo.brand,
        deviceName: deviceInfo.deviceName,
      });

      setDeviceDetails(deviceInfo);

      const verificationData = {
        deviceId: deviceInfo.deviceId,
        osVersion: deviceInfo.osVersion,
        deviceModel: deviceInfo.deviceModel,
        serialNumber: deviceInfo.serialNumber,
      };
      setVerificationData(verificationData);

      const response = await authApi.verifyDevice(verificationData);

      if (!response.verified) {
        throw new Error(response.message || "Device verification failed");
      }

      const deviceConfig = {
        deviceUuid: response.deviceUuid,
        merchantId: response.merchantId,
        terminalId: response.terminalId,
        deviceName: response.deviceName,
        deviceDetails: deviceInfo,
      };

      setDeviceInfo(deviceConfig);
      setDeviceVerified(true);

      await SecureStore.setItemAsync(
        "deviceConfig",
        JSON.stringify(deviceConfig),
      );

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (err: any) {
      console.error("Device verification failed:", err);
      setError(
        err.message || "Failed to verify device. Please contact support.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyDevice();
  }, []);

  const handleRetry = () => {
    verifyDevice();
  };

  // Device Info Card Component
  const DeviceInfoCard = ({ title, data, compact = false }: any) => (
    <View
      style={[
        styles.deviceInfo,
        {
          backgroundColor: colors.surface,
          padding: compact ? Spacing.two : Spacing.three,
          marginTop: compact ? 8 : 12,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.deviceInfoTitle,
          { color: colors.text, fontSize: compact ? 13 : 15 },
        ]}
      >
        {title}
      </ThemedText>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} style={styles.deviceInfoRow}>
          <ThemedText
            style={[
              styles.deviceInfoLabel,
              { color: colors.textSecondary, fontSize: compact ? 11 : 12 },
            ]}
          >
            {key}:
          </ThemedText>
          <ThemedText
            style={[
              styles.deviceInfoValue,
              { color: colors.text, fontSize: compact ? 11 : 12 },
            ]}
            numberOfLines={1}
          >
            {String(value) || "N/A"}
          </ThemedText>
        </View>
      ))}
    </View>
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo - Compact on small screens */}
          <View
            style={[
              styles.logoContainer,
              isSmallScreen && styles.logoContainerSmall,
            ]}
          >
            <View
              style={[
                styles.logoIcon,
                { backgroundColor: VODACOM.red },
                isSmallScreen && styles.logoIconSmall,
              ]}
            >
              <AppSymbol
                name="creditcard.fill"
                size={isSmallScreen ? 28 : 40}
                tintColor={VODACOM.light}
              />
            </View>
            <ThemedText
              type="title"
              style={[styles.logoText, isSmallScreen && styles.logoTextSmall]}
            >
              M-Pesa POS
            </ThemedText>
            <ThemedText
              style={[
                styles.logoSubtext,
                { color: colors.textSecondary },
                isSmallScreen && styles.logoSubtextSmall,
              ]}
            >
              Vodacom Lesotho
            </ThemedText>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            {isLoading ? (
              <>
                <ActivityIndicator
                  size={isSmallScreen ? "small" : "large"}
                  color={VODACOM.red}
                />
                <ThemedText
                  type="subtitle"
                  style={[
                    styles.statusTitle,
                    isSmallScreen && styles.statusTitleSmall,
                  ]}
                >
                  Verifying Device...
                </ThemedText>
                <ThemedText
                  style={[
                    styles.statusSubtitle,
                    { color: colors.textSecondary },
                    isSmallScreen && styles.statusSubtitleSmall,
                  ]}
                >
                  Please wait...
                </ThemedText>
                {deviceDetails && (
                  <DeviceInfoCard
                    title="Device Information"
                    data={{
                      "Device ID": deviceDetails.deviceId,
                      Model: deviceDetails.deviceModel,
                      OS: deviceDetails.osVersion,
                      Serial: verificationData.serialNumber,
                    }}
                    compact={isSmallScreen}
                  />
                )}
              </>
            ) : error ? (
              <>
                <View
                  style={[
                    styles.errorIcon,
                    { backgroundColor: `${VODACOM.red}15` },
                    isSmallScreen && styles.errorIconSmall,
                  ]}
                >
                  <AppSymbol
                    name="exclamationmark.circle.fill"
                    size={isSmallScreen ? 36 : 48}
                    tintColor={VODACOM.red}
                  />
                </View>
                <ThemedText
                  type="subtitle"
                  style={[
                    styles.statusTitle,
                    { color: VODACOM.red },
                    isSmallScreen && styles.statusTitleSmall,
                  ]}
                >
                  Verification Failed
                </ThemedText>
                <ThemedText
                  style={[
                    styles.errorMessage,
                    { color: colors.textSecondary },
                    isSmallScreen && styles.errorMessageSmall,
                  ]}
                >
                  {error}
                </ThemedText>

                {deviceDetails && verificationData && (
                  <DeviceInfoCard
                    title="Device Details Sent"
                    data={{
                      "Device ID": verificationData.deviceId,
                      "OS Version": verificationData.osVersion,
                      Model: verificationData.deviceModel,
                      Serial: verificationData.serialNumber,
                    }}
                    compact={isSmallScreen}
                  />
                )}

                <Pressable
                  style={[
                    styles.retryButton,
                    { backgroundColor: VODACOM.red },
                    isSmallScreen && styles.retryButtonSmall,
                  ]}
                  onPress={handleRetry}
                >
                  <ThemedText
                    style={[
                      styles.retryButtonText,
                      isSmallScreen && styles.retryButtonTextSmall,
                    ]}
                  >
                    Retry
                  </ThemedText>
                </Pressable>
              </>
            ) : deviceVerified ? (
              <>
                <View
                  style={[
                    styles.successIcon,
                    { backgroundColor: `${VODACOM.green}15` },
                    isSmallScreen && styles.successIconSmall,
                  ]}
                >
                  <AppSymbol
                    name="checkmark.seal.fill"
                    size={isSmallScreen ? 36 : 48}
                    tintColor={VODACOM.green}
                  />
                </View>
                <ThemedText
                  type="subtitle"
                  style={[
                    styles.statusTitle,
                    { color: VODACOM.green },
                    isSmallScreen && styles.statusTitleSmall,
                  ]}
                >
                  Device Verified!
                </ThemedText>
                <ThemedText
                  style={[
                    styles.statusSubtitle,
                    { color: colors.textSecondary },
                    isSmallScreen && styles.statusSubtitleSmall,
                  ]}
                >
                  Redirecting to login...
                </ThemedText>
                {deviceInfo && (
                  <View
                    style={[
                      styles.deviceInfo,
                      {
                        backgroundColor: colors.surface,
                        padding: Spacing.two,
                        marginTop: 8,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.deviceInfoTitle,
                        { color: colors.text, fontSize: 13 },
                      ]}
                    >
                      {deviceInfo.deviceName}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.deviceInfoDetail,
                        { color: colors.textSecondary, fontSize: 12 },
                      ]}
                    >
                      Terminal: {deviceInfo.terminalId}
                    </ThemedText>
                  </View>
                )}
              </>
            ) : null}
          </View>

          {/* Footer */}
          <View style={[styles.footer, isSmallScreen && styles.footerSmall]}>
            <ThemedText
              style={[
                styles.footerText,
                { color: colors.textSecondary },
                isSmallScreen && styles.footerTextSmall,
              ]}
            >
              Need help? Contact support
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  logoContainer: {
    alignItems: "center",
    gap: 6,
    paddingTop: Spacing.two,
  },
  logoContainerSmall: {
    gap: 4,
    paddingTop: Spacing.one,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoIconSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 2,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
  },
  logoTextSmall: {
    fontSize: 22,
  },
  logoSubtext: {
    fontSize: 14,
  },
  logoSubtextSmall: {
    fontSize: 12,
  },
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: Spacing.two,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  statusTitleSmall: {
    fontSize: 18,
  },
  statusSubtitle: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 300,
  },
  statusSubtitleSmall: {
    fontSize: 13,
    maxWidth: 260,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorIconSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successIconSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  errorMessage: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 300,
  },
  errorMessageSmall: {
    fontSize: 13,
    maxWidth: 260,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  retryButtonSmall: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: VODACOM.light,
    fontSize: 16,
    fontWeight: "600",
  },
  retryButtonTextSmall: {
    fontSize: 14,
  },
  deviceInfo: {
    width: "100%",
    borderRadius: 12,
    gap: 4,
  },
  deviceInfoTitle: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceInfoLabel: {
    fontWeight: "500",
  },
  deviceInfoValue: {
    fontWeight: "500",
    maxWidth: "55%",
  },
  deviceInfoDetail: {
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  footerSmall: {
    paddingVertical: Spacing.one,
  },
  footerText: {
    fontSize: 13,
  },
  footerTextSmall: {
    fontSize: 11,
  },
});
