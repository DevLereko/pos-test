import {
  authApi,
  SignInResponse,
  VerifyOtpResponse,
  MerchantDevice,
  Merchant,
} from "@/api/auth";
import { apiClient, DecodedToken } from "@/api/client";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: any | null;
  decodedToken: DecodedToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  deviceVerified: boolean;
  deviceConfig: any | null;
  merchantInfo: any | null;
  pendingEmail: string | null;
  userMerchants: Merchant[];
  showMerchantSelection: boolean;
  login: (username: string, password: string) => Promise<SignInResponse>;
  verifyOtp: (email: string, otp: string) => Promise<VerifyOtpResponse | undefined>;
  logout: () => Promise<void>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string,
  ) => Promise<{ message: string }>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean }>;
  setPendingEmail: (email: string | null) => void;
  checkDeviceVerification: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  getDecodedToken: () => DecodedToken | null;
  rehydrate: () => Promise<void>;
  fetchMerchantDetails: (merchantId: string) => Promise<MerchantDevice | null>;
  handleMerchantSelection: (merchant: Merchant) => Promise<void>;
  setShowMerchantSelection: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceVerified, setDeviceVerified] = useState(false);
  const [deviceConfig, setDeviceConfig] = useState<any | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<any | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [userMerchants, setUserMerchants] = useState<Merchant[]>([]);
  const [showMerchantSelection, setShowMerchantSelection] = useState(false);

  const checkDeviceVerification = async () => {
    try {
      const config = await SecureStore.getItemAsync("deviceConfig");
      const merchant = await SecureStore.getItemAsync("merchantInfo");

      if (config) {
        setDeviceConfig(JSON.parse(config));
        setDeviceVerified(true);
        if (merchant) {
          setMerchantInfo(JSON.parse(merchant));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to check device verification:", error);
      return false;
    }
  };

  const getDecodedToken = (): DecodedToken | null => {
    return decodedToken;
  };

  const handleMerchantSelection = async (merchant: Merchant) => {
    try {
      console.log("🔄 Handling merchant selection:", merchant.name);

      // Store selected merchant
      setMerchantInfo(merchant);
      await SecureStore.setItemAsync(
        "selectedMerchant",
        JSON.stringify(merchant),
      );

      // Fetch device for this merchant
      try {
        const deviceInfo = await authApi.getMerchantDevice(merchant.id);
        if (deviceInfo) {
          setDeviceConfig(deviceInfo);
          await SecureStore.setItemAsync(
            "deviceConfig",
            JSON.stringify(deviceInfo),
          );
          setDeviceVerified(true);
          console.log("✅ Device loaded for merchant:", merchant.name);
        }
      } catch (deviceError) {
        console.error("❌ Failed to fetch device info:", deviceError);
        // Don't fail the login if device fetch fails
      }

      setShowMerchantSelection(false);
      setIsAuthenticated(true);

      // Navigate after state updates complete
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 0);
    } catch (error) {
      console.error("Failed to select merchant:", error);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      console.log("🔐 Verifying OTP for:", email);

      const response = await authApi.verifyOtp({ email, otp });

      const decoded = await apiClient.decodeToken();
      if (!decoded) {
        throw new Error("Failed to decode token after OTP verification");
      }

      setDecodedToken(decoded);
      console.log("✅ Token decoded:", decoded.username);

      // Fetch user data
      const userData = await authApi.getUserById(decoded.userId);

      if (userData) {
        setUser(userData);
        await SecureStore.setItemAsync("userData", JSON.stringify(userData));
        console.log(
          "✅ User loaded from API:",
          userData.firstName,
          userData.lastName,
        );

        // Check if user has merchants
        const merchants = userData.merchants || [];
        setUserMerchants(merchants);

        if (merchants.length > 0) {
          console.log(`✅ ${merchants.length} merchants found for user`);

          // Check if there's a previously selected merchant
          const storedMerchantStr =
            await SecureStore.getItemAsync("selectedMerchant");
          let selectedMerchant: Merchant | null = null;

          if (storedMerchantStr) {
            const parsed = JSON.parse(storedMerchantStr);
            const stillExists = merchants.find(
              (m: Merchant) => m.id === parsed.id,
            );
            if (stillExists && stillExists.isActive) {
              selectedMerchant = stillExists;
              console.log(
                "✅ Using previously selected merchant:",
                selectedMerchant.name,
              );
            }
          }

          // If no valid stored merchant, find the first active one
          if (!selectedMerchant) {
            const activeMerchants = merchants.filter(
              (m: Merchant) => m.isActive,
            );
            if (activeMerchants.length === 1) {
              selectedMerchant = activeMerchants[0];
              console.log(
                "✅ Auto-selected only active merchant:",
                selectedMerchant.name,
              );
            } else if (activeMerchants.length > 1) {
              // Multiple active merchants - show selection
              console.log(
                "⚠️ Multiple active merchants found, showing selection",
              );
              setShowMerchantSelection(true);
              setIsLoading(false);
              return; // Don't navigate, wait for merchant selection
            } else {
              // No active merchants - use first one
              selectedMerchant = merchants[0];
              console.log(
                "⚠️ No active merchants, using first:",
                selectedMerchant.name,
              );
            }
          }

          if (selectedMerchant) {
            await handleMerchantSelection(selectedMerchant);
          }
        } else {
          console.warn("⚠️ No merchants found for user");
          // Still navigate to tabs even without merchants
          setIsAuthenticated(true);
          router.replace("/(tabs)");
        }
      } else {
        // Fallback to decoded token
        const fallbackUser = {
          id: decoded.userId,
          firstName: decoded.firstName || "",
          lastName: decoded.lastName || "",
          username: decoded.username,
          email: decoded.email,
          phoneNumber: decoded.phoneNumber || "",
          roles:
            decoded.role?.map((r) => ({ name: r.replace("ROLE_", "") })) || [],
          isMerchant:
            decoded.role?.some((r) => r.includes("MERCHANT")) || false,
        };
        setUser(fallbackUser);
        await SecureStore.setItemAsync(
          "userData",
          JSON.stringify(fallbackUser),
        );

        // Navigate to tabs even without merchant data
        setIsAuthenticated(true);
        router.replace("/(tabs)");
      }

      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const rehydrate = useCallback(async () => {
    try {
      console.log("🔐 Rehydrating auth state...");

      // Check device verification
      const config = await SecureStore.getItemAsync("deviceConfig");
      const merchant = await SecureStore.getItemAsync("merchantInfo");
      const userDataStr = await SecureStore.getItemAsync("userData");

      if (config) {
        setDeviceConfig(JSON.parse(config));
        setDeviceVerified(true);
      }

      if (merchant) {
        setMerchantInfo(JSON.parse(merchant));
      }

      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        const isValid = await apiClient.isTokenValid();
        if (isValid) {
          const decoded = await apiClient.decodeToken();
          if (decoded) {
            setDecodedToken(decoded);
            console.log("✅ Token rehydrated for:", decoded.username);

            // Try to get fresh user data from API
            try {
              const userData = await authApi.getUserById(decoded.userId);
              if (userData) {
                setUser(userData);
                await SecureStore.setItemAsync(
                  "userData",
                  JSON.stringify(userData),
                );
                console.log("✅ User rehydrated:", userData.firstName);

                // Check for merchants
                const merchants = userData.merchants || [];
                setUserMerchants(merchants);

                // If we don't have merchant info but user has merchants
                if (!merchant && merchants.length > 0) {
                  const firstMerchant = merchants[0];
                  setMerchantInfo(firstMerchant);
                  await SecureStore.setItemAsync(
                    "merchantInfo",
                    JSON.stringify(firstMerchant),
                  );

                  try {
                    const deviceInfo = await authApi.getMerchantDevice(
                      firstMerchant.id,
                    );
                    if (deviceInfo) {
                      setDeviceConfig(deviceInfo);
                      await SecureStore.setItemAsync(
                        "deviceConfig",
                        JSON.stringify(deviceInfo),
                      );
                      setDeviceVerified(true);
                    }
                  } catch (deviceError) {
                    console.error(
                      "Failed to fetch device during rehydrate:",
                      deviceError,
                    );
                  }
                }
              } else if (userDataStr) {
                const storedUser = JSON.parse(userDataStr);
                setUser(storedUser);
              }
            } catch (apiError) {
              console.warn(
                "API call failed during rehydrate, using stored data:",
                apiError,
              );
              if (userDataStr) {
                const storedUser = JSON.parse(userDataStr);
                setUser(storedUser);
              }
            }

            setIsAuthenticated(true);
            return;
          }
        } else {
          console.log("❌ Token expired, clearing...");
          await SecureStore.deleteItemAsync("accessToken");
        }
      }

      setIsAuthenticated(false);
      setUser(null);
      setDecodedToken(null);
    } catch (error) {
      console.error("❌ Rehydrate failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      setDecodedToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        setUser(null);
        setDecodedToken(null);
        setIsAuthenticated(false);
        return;
      }

      const decoded = await apiClient.decodeToken();
      if (decoded) {
        setDecodedToken(decoded);

        try {
          const userData = await authApi.getUserById(decoded.userId);
          if (userData) {
            setUser(userData);
            await SecureStore.setItemAsync(
              "userData",
              JSON.stringify(userData),
            );

            // Refresh merchants
            const merchants = userData.merchants || [];
            setUserMerchants(merchants);
          }
        } catch (error) {
          console.warn("Failed to refresh user details:", error);
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setDecodedToken(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signIn({ username, password });
      await SecureStore.setItemAsync("userEmail", response.userEmail);
      setPendingEmail(response.userEmail);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setDecodedToken(null);
      setIsAuthenticated(false);
      setUserMerchants([]);
      setShowMerchantSelection(false);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return authApi.forgotPassword({ email });
  };

  const requestPasswordReset = async (email: string) => {
    await authApi.forgotPassword({ email });
    return { success: true };
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
  ) => {
    return authApi.resetPassword({ email, otp, newPassword });
  };

  const fetchMerchantDetails = useCallback(
    async (merchantId: string): Promise<MerchantDevice | null> => {
      try {
        const data = await authApi.getMerchantDevice(merchantId);
        setMerchantInfo(data);
        return data;
      } catch (error) {
        console.error("Failed to fetch merchant details:", error);
        return null;
      }
    },
    [],
  );

  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    rehydrate();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  const value = {
    user,
    decodedToken,
    isAuthenticated,
    isLoading,
    deviceVerified,
    deviceConfig,
    merchantInfo,
    pendingEmail,
    userMerchants,
    showMerchantSelection,
    login,
    verifyOtp,
    logout,
    forgotPassword,
    requestPasswordReset,
    resetPassword,
    setPendingEmail,
    checkDeviceVerification,
    refreshUser,
    getDecodedToken,
    rehydrate,
    fetchMerchantDetails,
    handleMerchantSelection,
    setShowMerchantSelection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
