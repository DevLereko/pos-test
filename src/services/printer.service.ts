// src/services/printer.service.ts
import { authApi } from "@/api/auth";
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
      // Get device config
      const deviceConfig = await SecureStore.getItemAsync("deviceConfig");
      if (!deviceConfig) {
        return {
          success: false,
          message: "Device configuration not found",
        };
      }

      const device = JSON.parse(deviceConfig);

      // Call API to test printer
      const result = await authApi.testPrinter(deviceId);

      return {
        success: true,
        message: result.message || "Printer test successful",
        details: {
          printerName: device.printerName || "InnerPrinter",
          paperSize: device.paperSize || "58mm",
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
        connected: true, // This would come from actual BLE connection status
        name: device.printerName || "InnerPrinter",
      };
    } catch (error) {
      return { connected: false, name: "Unknown" };
    }
  }
}

export const printerService = PrinterService.getInstance();
