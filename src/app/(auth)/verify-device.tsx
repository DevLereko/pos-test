import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { authApi } from "@/api/auth";
import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { deviceInfoService } from "@/services/device-info.service";

export default function VerifyDeviceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceVerified, setDeviceVerified] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [merchantInfo, setMerchantInfo] = useState<any>(null);
  const [deviceDetails, setDeviceDetails] = useState<any>(null);

  const verifyDevice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get real device information
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

      // Store device details for display
      setDeviceDetails(deviceInfo);

      // Prepare verification payload
      const verificationData = {
        deviceId: deviceInfo.deviceId,
        osVersion: deviceInfo.osVersion,
        deviceModel: deviceInfo.deviceModel,
        serialNumber: deviceInfo.serialNumber,
      };

      // Send verification request
      const response = await authApi.verifyDevice(verificationData);

      if (!response.verified) {
        throw new Error(response.message || "Device verification failed");
      }

      // Build device config from flat response
      const deviceConfig = {
        deviceUuid: response.deviceUuid,
        merchantId: response.merchantId,
        terminalId: response.terminalId,
        deviceName: response.deviceName,
        deviceDetails: deviceInfo,
      };

      setDeviceInfo(deviceConfig);
      setDeviceVerified(true);

      // Fetch merchant info
      try {
        const merchant = await authApi.getMerchantDevice(response.merchantId);
        setMerchantInfo(merchant);
        await SecureStore.setItemAsync("merchantInfo", JSON.stringify(merchant));
      } catch (merchantError) {
        console.warn("Failed to fetch merchant info:", merchantError);
        setMerchantInfo({ merchantId: response.merchantId });
      }

      // Store device config locally
      await SecureStore.setItemAsync(
        "deviceConfig",
        JSON.stringify(deviceConfig),
      );

      // Navigate to login after short delay
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

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    verifyDevice();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleRetry = () => {
    verifyDevice();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: VODACOM.red }]}>
            <AppSymbol
              name="creditcard.fill"
              size={40}
              tintColor={VODACOM.light}
            />
          </View>
          <ThemedText type="title" style={styles.logoText}>
            M-Pesa POS
          </ThemedText>
          <ThemedText
            style={[styles.logoSubtext, { color: colors.textSecondary }]}
          >
            Vodacom Lesotho
          </ThemedText>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color={VODACOM.red} />
              <ThemedText type="subtitle" style={styles.statusTitle}>
                Verifying Device...
              </ThemedText>
              <ThemedText
                style={[styles.statusSubtitle, { color: colors.textSecondary }]}
              >
                Please wait while we verify your device
              </ThemedText>
              {/* Show device info being collected */}
              {deviceDetails && (
                <View
                  style={[
                    styles.deviceInfo,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <ThemedText
                    style={[styles.deviceInfoTitle, { color: colors.text }]}
                  >
                    Device Information
                  </ThemedText>
                  <View style={styles.deviceInfoRow}>
                    <ThemedText
                      style={[
                        styles.deviceInfoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Model:
                    </ThemedText>
                    <ThemedText
                      style={[styles.deviceInfoValue, { color: colors.text }]}
                    >
                      {deviceDetails.deviceModel}
                    </ThemedText>
                  </View>
                  <View style={styles.deviceInfoRow}>
                    <ThemedText
                      style={[
                        styles.deviceInfoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      OS:
                    </ThemedText>
                    <ThemedText
                      style={[styles.deviceInfoValue, { color: colors.text }]}
                    >
                      {deviceDetails.osVersion}
                    </ThemedText>
                  </View>
                  <View style={styles.deviceInfoRow}>
                    <ThemedText
                      style={[
                        styles.deviceInfoLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Device ID:
                    </ThemedText>
                    <ThemedText
                      style={[styles.deviceInfoValue, { color: colors.text }]}
                    >
                      {deviceDetails.deviceId.substring(0, 8)}...
                    </ThemedText>
                  </View>
                </View>
              )}
            </>
          ) : error ? (
            <>
              <View
                style={[
                  styles.errorIcon,
                  { backgroundColor: `${VODACOM.red}15` },
                ]}
              >
                <AppSymbol
                  name="exclamationmark.circle.fill"
                  size={48}
                  tintColor={VODACOM.red}
                />
              </View>
              <ThemedText
                type="subtitle"
                style={[styles.statusTitle, { color: VODACOM.red }]}
              >
                Verification Failed
              </ThemedText>
              <ThemedText
                style={[styles.errorMessage, { color: colors.textSecondary }]}
              >
                {error}
              </ThemedText>
              <Pressable
                style={[styles.retryButton, { backgroundColor: VODACOM.red }]}
                onPress={handleRetry}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </Pressable>
            </>
          ) : deviceVerified ? (
            <>
              <View
                style={[
                  styles.successIcon,
                  { backgroundColor: `${VODACOM.green}15` },
                ]}
              >
                <AppSymbol
                  name="checkmark.seal.fill"
                  size={48}
                  tintColor={VODACOM.green}
                />
              </View>
              <ThemedText
                type="subtitle"
                style={[styles.statusTitle, { color: VODACOM.green }]}
              >
                Device Verified!
              </ThemedText>
              <ThemedText
                style={[styles.statusSubtitle, { color: colors.textSecondary }]}
              >
                Redirecting to login...
              </ThemedText>
              {/* Device Info */}
              {deviceInfo && (
                <View
                  style={[
                    styles.deviceInfo,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <ThemedText
                    style={[styles.deviceInfoTitle, { color: colors.text }]}
                  >
                    {deviceInfo.deviceName}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.deviceInfoDetail,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Terminal: {deviceInfo.terminalId}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.deviceInfoDetail,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Merchant:{" "}
                    {merchantInfo?.businessName || merchantInfo?.firstName}
                  </ThemedText>
                </View>
              )}
            </>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText
            style={[styles.footerText, { color: colors.textSecondary }]}
          >
            Need help? Contact support
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
  },
  logoContainer: {
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
  },
  logoSubtext: {
    fontSize: 14,
  },
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: Spacing.four,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  statusSubtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 320,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 320,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: VODACOM.light,
    fontSize: 16,
    fontWeight: "600",
  },
  deviceInfo: {
    width: "100%",
    padding: Spacing.three,
    borderRadius: 16,
    gap: 8,
    marginTop: 16,
  },
  deviceInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceInfoLabel: {
    fontSize: 14,
  },
  deviceInfoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  deviceInfoDetail: {
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.three,
  },
  footerText: {
    fontSize: 14,
  },
});