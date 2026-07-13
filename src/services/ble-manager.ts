import { Platform } from "react-native";

export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  isPaired: boolean;
}

export interface BLETestResult {
  success: boolean;
  message: string;
  devices?: BLEDevice[];
  connectedDevice?: BLEDevice | null;
}

const mockDevices: BLEDevice[] = [
  { id: "device-001", name: "Inateck Thermal Printer", rssi: -45, isPaired: true },
  { id: "device-002", name: "GP58BT Printer", rssi: -62, isPaired: false },
  { id: "device-003", name: "POS Printer Pro", rssi: -78, isPaired: false },
];

let connectedDevice: BLEDevice | null = null;

async function mockDelay(ms: number = 1500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const bleManager = {
  async isBluetoothEnabled(): Promise<boolean> {
    await mockDelay(300);
    return true;
  },

  async requestPermission(): Promise<boolean> {
    await mockDelay(500);
    return true;
  },

  async startScan(): Promise<BLEDevice[]> {
    await mockDelay(2000);
    return [...mockDevices];
  },

  async stopScan(): Promise<void> {
    await mockDelay(200);
  },

  async connectToDevice(deviceId: string): Promise<BLETestResult> {
    await mockDelay(1200);
    const device = mockDevices.find((d) => d.id === deviceId);
    if (!device) {
      return { success: false, message: "Device not found" };
    }
    connectedDevice = device;
    return { success: true, message: `Connected to ${device.name}`, connectedDevice: device };
  },

  async disconnect(): Promise<void> {
    await mockDelay(400);
    connectedDevice = null;
  },

  async testConnection(): Promise<BLETestResult> {
    await mockDelay(800);
    if (!connectedDevice) {
      return { success: false, message: "No device connected" };
    }
    return { success: true, message: "Connection stable", connectedDevice };
  },

  async printTestPage(): Promise<BLETestResult> {
    await mockDelay(1500);
    if (!connectedDevice) {
      return { success: false, message: "No printer connected. Please connect to a printer first." };
    }
    return {
      success: true,
      message: "Test page sent to printer",
      connectedDevice,
    };
  },

  getConnectedDevice(): BLEDevice | null {
    return connectedDevice;
  },
};
