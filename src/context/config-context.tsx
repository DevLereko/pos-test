import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/theme-context";
import { authApi } from "@/api/auth";

export interface MerchantConfig {
  id: string;
  name: string;
  terminalId: string;
  phoneNumber: string;
  email: string;
  address: string;
  code?: string;
  location?: string;
  district?: string;
  businessType?: string;
}

export interface ServerConfig {
  apiUrl: string;
  soapUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface PrinterConfig {
  name: string;
  autoConnect: boolean;
  paperSize: "58mm" | "80mm";
  copies: number;
}

export interface AppConfig {
  merchant: MerchantConfig;
  server: ServerConfig;
  printer: PrinterConfig;
  preferences: {
    autoPrint: boolean;
    soundEffects: boolean;
    offlineMode: boolean;
    darkMode: boolean;
    biometricAuth: boolean;
    sessionTimeout: number;
  };
}

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  isLoading: boolean;
  saveConfig: () => Promise<void>;
  loadConfigFromDevice: () => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const defaultConfig: AppConfig = {
  merchant: {
    id: "",
    name: "",
    terminalId: "",
    phoneNumber: "",
    email: "",
    address: "",
  },
  server: {
    apiUrl: "",
    soapUrl: "",
    timeout: 30000,
    retryAttempts: 3,
  },
  printer: {
    name: "",
    autoConnect: true,
    paperSize: "58mm",
    copies: 1,
  },
  preferences: {
    autoPrint: true,
    soundEffects: true,
    offlineMode: false,
    darkMode: false,
    biometricAuth: false,
    sessionTimeout: 5,
  },
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [configVersion, setConfigVersion] = useState(0);
  const { setTheme } = useTheme();

  const loadConfigFromStorage = useCallback(async () => {
    try {
      const savedConfig = await AsyncStorage.getItem("pos_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
        if (parsed.preferences?.darkMode !== undefined) {
          setTheme(parsed.preferences.darkMode ? "dark" : "light");
        }
      }
    } catch (error) {
      console.error("Failed to load saved config:", error);
    }
  }, [setTheme]);

  const loadConfigFromDevice = useCallback(async () => {
    try {
      const deviceConfigStr = await AsyncStorage.getItem("deviceConfig");
      const merchantInfoStr = await AsyncStorage.getItem("selectedMerchant");

      if (!deviceConfigStr) {
        console.log("No device config found");
        setIsLoading(false);
        return;
      }

      const deviceConfig = JSON.parse(deviceConfigStr);
      const merchantInfo = merchantInfoStr ? JSON.parse(merchantInfoStr) : null;

      console.log("Loading config from device:", { deviceConfig, merchantInfo });

      let apiUrl = deviceConfig.apiUrl || "";
      let soapUrl = deviceConfig.soapUrl || "";
      let timeout = deviceConfig.timeout || 30000;
      let retryAttempts = deviceConfig.retryAttempts || 3;
      let printerName = deviceConfig.printerName || "InnerPrinter";
      let autoConnect = deviceConfig.autoConnect ?? true;
      let paperSize = deviceConfig.paperSize || "58mm";
      let copies = deviceConfig.receiptCopies || 1;
      let autoPrint = deviceConfig.autoPrint ?? true;
      let soundEffects = deviceConfig.soundEffects ?? true;
      let offlineMode = deviceConfig.offlineMode ?? false;
      let biometricAuth = deviceConfig.biometricAuth ?? false;
      let sessionTimeout = deviceConfig.sessionTimeout || 5;

      if ((deviceConfig.deviceId || deviceConfig.id) && !apiUrl) {
        try {
          const deviceIdForLookup = deviceConfig.deviceId || deviceConfig.id;
          const fullDevice = await authApi.getDeviceById(deviceIdForLookup);
          apiUrl = fullDevice.apiUrl || "";
          soapUrl = fullDevice.soapUrl || "";
          timeout = fullDevice.timeout || timeout;
          retryAttempts = fullDevice.retryAttempts || retryAttempts;
          printerName = fullDevice.printerName || printerName;
          autoConnect = fullDevice.autoConnect ?? autoConnect;
          paperSize = fullDevice.paperSize || paperSize;
          copies = fullDevice.receiptCopies || copies;
          autoPrint = fullDevice.autoPrint ?? autoPrint;
          soundEffects = fullDevice.soundEffects ?? soundEffects;
          offlineMode = fullDevice.offlineMode ?? offlineMode;
          biometricAuth = fullDevice.biometricAuth ?? biometricAuth;
          sessionTimeout = fullDevice.sessionTimeout || sessionTimeout;
        } catch (err) {
          console.warn("Could not fetch device details:", err);
        }
      }

      const loadedConfig: AppConfig = {
        merchant: {
          id: merchantInfo?.id || deviceConfig.merchantId || "",
          name: merchantInfo?.name || deviceConfig.deviceName || "",
          terminalId: deviceConfig.terminalId || "",
          phoneNumber: merchantInfo?.phoneNumber || "",
          email: merchantInfo?.email || "",
          address: merchantInfo?.location || merchantInfo?.address || "",
          code: merchantInfo?.code,
          location: merchantInfo?.location,
          district: merchantInfo?.district,
          businessType: merchantInfo?.businessType,
        },
        server: {
          apiUrl,
          soapUrl,
          timeout,
          retryAttempts,
        },
        printer: {
          name: printerName,
          autoConnect,
          paperSize,
          copies,
        },
        preferences: {
          autoPrint,
          soundEffects,
          offlineMode,
          darkMode: false,
          biometricAuth,
          sessionTimeout,
        },
      };

      setConfig(loadedConfig);
      console.log("Config loaded successfully from device:", loadedConfig);
    } catch (error) {
      console.error("Failed to load config from device:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshConfig = useCallback(async () => {
    setConfigVersion(v => v + 1);
    await loadConfigFromDevice();
    await loadConfigFromStorage();
  }, [loadConfigFromDevice, loadConfigFromStorage]);

  useEffect(() => {
    loadConfigFromDevice();
    loadConfigFromStorage();
  }, [loadConfigFromDevice, loadConfigFromStorage, configVersion]);

  const saveConfig = async () => {
    try {
      await AsyncStorage.setItem("pos_config", JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);

    if (newConfig.preferences?.darkMode !== undefined) {
      setTheme(newConfig.preferences.darkMode ? "dark" : "light");
    }

    await saveConfig();
  };

  const resetConfig = async () => {
    setConfig(defaultConfig);
    await AsyncStorage.setItem("pos_config", JSON.stringify(defaultConfig));
  };

  return (
    <ConfigContext.Provider
      value={{ config, updateConfig, resetConfig, isLoading, saveConfig, loadConfigFromDevice, refreshConfig }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};