import * as SecureStore from "expo-secure-store";

export interface PrinterTestResult {
  success: boolean;
  message: string;
  details?: any;
}

class PrinterService {
  private static instance: PrinterService;

  static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService();
    }
    return PrinterService.instance;
  }

  async testPrinter(deviceId: string): Promise<PrinterTestResult> {
    try {
      const deviceConfig = await SecureStore.getItemAsync("deviceConfig");
      if (!deviceConfig) {
        return {
          success: false,
          message: "Device configuration not found",
        };
      }

      const device = JSON.parse(deviceConfig);

      return {
        success: true,
        message: "Printer test is handled directly in Settings via BLE",
        details: {
          printerName: device.printerName || "InnerPrinter",
          paperSize: device.paperSize || "58mm",
          deviceId,
        },
      };
    } catch (error: any) {
      console.error("Printer test failed:", error);
      return {
        success: false,
        message: error.message || "Failed to test printer",
      };
    }
  }

  async getPrinterStatus(
    deviceId: string,
  ): Promise<{ connected: boolean; name: string }> {
    try {
      const deviceConfig = await SecureStore.getItemAsync("deviceConfig");
      if (!deviceConfig) {
        return { connected: false, name: "Unknown" };
      }

      const device = JSON.parse(deviceConfig);
      return {
        connected: true,
        name: device.printerName || "InnerPrinter",
      };
    } catch (error) {
      return { connected: false, name: "Unknown" };
    }
  }
}

export const printerService = PrinterService.getInstance();
