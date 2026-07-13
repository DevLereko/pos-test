import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

interface DeviceInfo {
  deviceId: string;
  osVersion: string;
  deviceModel: string;
  serialNumber: string;
  manufacturer: string;
  brand: string;
  deviceName: string;
}

class DeviceInfoService {
  private static instance: DeviceInfoService;
  private cachedDeviceInfo: DeviceInfo | null = null;

  static getInstance(): DeviceInfoService {
    if (!DeviceInfoService.instance) {
      DeviceInfoService.instance = new DeviceInfoService();
    }
    return DeviceInfoService.instance;
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    // Return cached if available
    if (this.cachedDeviceInfo) {
      return this.cachedDeviceInfo;
    }

    try {
      const deviceInfo = await this.collectDeviceInfo();
      this.cachedDeviceInfo = deviceInfo;
      // Cache in SecureStore for offline access
      await SecureStore.setItemAsync("deviceInfo", JSON.stringify(deviceInfo));
      return deviceInfo;
    } catch (error) {
      console.error("Failed to get device info:", error);
      // Try to get from cache if available
      const cached = await SecureStore.getItemAsync("deviceInfo");
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  }

  private async collectDeviceInfo(): Promise<DeviceInfo> {
    const isAndroid = Platform.OS === "android";
    const isIOS = Platform.OS === "ios";

    // Get deviceId (IMEI on Android, identifierForVendor on iOS)
    let deviceId = "";
    try {
      if (isAndroid) {
        deviceId = Application.getAndroidId() || "";
      } else if (isIOS) {
        deviceId = (await Application.getIosIdForVendorAsync()) || "";
      }
    } catch (error) {
      console.warn("Failed to get device ID, using fallback:", error);
      deviceId =
        Constants.sessionId ||
        Constants.expoConfig?.extra?.deviceId ||
        "unknown";
    }

    // Get OS Version
    let osVersion = "";
    if (isAndroid) {
      osVersion = `Android ${Device.osVersion || ""}`;
    } else if (isIOS) {
      osVersion = `iOS ${Device.osVersion || ""}`;
    }

    // Get Device Model
    let deviceModel = Device.modelName || "";
    if (!deviceModel) {
      // Fallback for web or unknown
      deviceModel = isAndroid ? "Android Device" : "iOS Device";
    }

    // Get Serial Number (Android only, with fallback)
    let serialNumber = "";
    try {
      if (isAndroid) {
        serialNumber = Constants.expoConfig?.extra?.serialNumber || "";
      }
      if (!serialNumber) {
        serialNumber = isAndroid
          ? Application.getAndroidId() || ""
          : (await Application.getIosIdForVendorAsync()) || "";
      }
    } catch (error) {
      console.warn("Failed to get serial number, using fallback:", error);
      serialNumber = Constants.sessionId || "unknown";
    }

    // Get Manufacturer
    let manufacturer = Device.manufacturer || "";
    if (!manufacturer) {
      manufacturer = isAndroid ? "Unknown Manufacturer" : "Apple";
    }

    // Get Brand
    let brand = Device.brand || "";
    if (!brand) {
      brand = isAndroid ? "Android" : "Apple";
    }

    // Get Device Name
    let deviceName = Device.deviceName || "";
    if (!deviceName) {
      deviceName = deviceModel || (isAndroid ? "Android Device" : "iOS Device");
    }

    return {
      deviceId: deviceId || Constants.sessionId || "unknown",
      osVersion: osVersion || "Unknown OS",
      deviceModel: deviceModel,
      serialNumber: serialNumber || deviceId || "unknown",
      manufacturer: manufacturer,
      brand: brand,
      deviceName: deviceName,
    };
  }

  async getDeviceId(): Promise<string> {
    const info = await this.getDeviceInfo();
    return info.deviceId;
  }

  async getDeviceModel(): Promise<string> {
    const info = await this.getDeviceInfo();
    return info.deviceModel;
  }

  async getOSVersion(): Promise<string> {
    const info = await this.getDeviceInfo();
    return info.osVersion;
  }

  async getSerialNumber(): Promise<string> {
    const info = await this.getDeviceInfo();
    return info.serialNumber;
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cachedDeviceInfo = null;
    SecureStore.deleteItemAsync("deviceInfo");
  }
}

export const deviceInfoService = DeviceInfoService.getInstance();
