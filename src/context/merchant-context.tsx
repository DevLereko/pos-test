import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export interface Merchant {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  location: string;
  district: string;
  businessType: string;
  assignedAt?: string;
  assignedBy?: string;
}

interface MerchantContextType {
  selectedMerchant: Merchant | null;
  merchants: Merchant[];
  setMerchants: (merchants: Merchant[]) => void;
  selectMerchant: (merchant: Merchant) => Promise<void>;
  isMerchantSelectorVisible: boolean;
  showMerchantSelector: (show: boolean) => void;
  loading: boolean;
  hasMultipleActiveMerchants: boolean;
  clearSelectedMerchant: () => Promise<void>;
}

const MerchantContext = createContext<MerchantContextType | undefined>(
  undefined,
);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null,
  );
  const [isMerchantSelectorVisible, setIsMerchantSelectorVisible] =
    useState(false);
  const [loading, setLoading] = useState(true);

  const hasMultipleActiveMerchants =
    merchants.filter((m) => m.isActive).length > 1;

  // Load selected merchant from storage
  useEffect(() => {
    const loadSelectedMerchant = async () => {
      try {
        const stored = await SecureStore.getItemAsync("selectedMerchant");
        if (stored) {
          setSelectedMerchant(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load selected merchant:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSelectedMerchant();
  }, []);

  const selectMerchant = async (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    await SecureStore.setItemAsync(
      "selectedMerchant",
      JSON.stringify(merchant),
    );
    setIsMerchantSelectorVisible(false);
  };

  const showMerchantSelector = (show: boolean) => {
    setIsMerchantSelectorVisible(show);
  };

  const clearSelectedMerchant = async () => {
    setSelectedMerchant(null);
    await SecureStore.deleteItemAsync("selectedMerchant");
  };

  const value = {
    selectedMerchant,
    merchants,
    setMerchants,
    selectMerchant,
    isMerchantSelectorVisible,
    showMerchantSelector,
    loading,
    hasMultipleActiveMerchants,
    clearSelectedMerchant,
  };

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error("useMerchant must be used within a MerchantProvider");
  }
  return context;
};
