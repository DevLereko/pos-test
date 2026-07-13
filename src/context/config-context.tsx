import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/theme-context";

export interface MerchantConfig {
  id: string;
  name: string;
  terminalId: string;
  phoneNumber: string;
  email: string;
  address: string;
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
}

const defaultConfig: AppConfig = {
  merchant: {
    id: "MERC-001",
    name: "Highveld Butchery",
    terminalId: "012186",
    phoneNumber: "+266 5885 1015",
    email: "info@highveldbutchery.co.ls",
    address: "Naleli, Maseru 100",
  },
  server: {
    apiUrl: "https://api.vodacom.co.ls/pos",
    soapUrl: "http://10.0.44.100:8086",
    timeout: 30000,
    retryAttempts: 3,
  },
  printer: {
    name: "InnerPrinter",
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
  const { toggleTheme, setTheme } = useTheme();

  // Load config from storage on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem("pos_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        // Apply dark mode preference
        if (parsed.preferences?.darkMode !== undefined) {
          setTheme(parsed.preferences.darkMode ? "dark" : "light");
        }
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

    // If dark mode preference changed, update theme
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
      value={{ config, updateConfig, resetConfig, isLoading, saveConfig }}
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
