import { authApi, SignInResponse, VerifyOtpResponse, MerchantDevice } from "@/api/auth";
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
  login: (username: string, password: string) => Promise<SignInResponse>;
  verifyOtp: (email: string, otp: string) => Promise<VerifyOtpResponse>;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceVerified, setDeviceVerified] = useState(false);
  const [deviceConfig, setDeviceConfig] = useState<any | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<any | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

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

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({ email, otp });

      const decoded = await apiClient.decodeToken();
      if (!decoded) {
        throw new Error("Failed to decode token after OTP verification");
      }

      setDecodedToken(decoded);

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
        const userMerchants = userData.merchants || [];
        if (userMerchants.length > 0) {
          // Use the first merchant
          const firstMerchant = userMerchants[0];
          console.log(
            "✅ Merchant found:",
            firstMerchant.name,
            firstMerchant.id,
          );

          // Store merchant info
          setMerchantInfo(firstMerchant);
          await SecureStore.setItemAsync(
            "merchantInfo",
            JSON.stringify(firstMerchant),
          );

          // Fetch device for this merchant
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
              console.log(
                "✅ Device loaded:",
                deviceInfo.deviceName || deviceInfo.id,
              );
            }
          } catch (deviceError) {
            console.error("❌ Failed to fetch device info:", deviceError);
            // Don't fail the login if device fetch fails
          }
        } else {
          console.warn("⚠️ No merchants found for user");
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
      }

      setIsAuthenticated(true);
      router.replace("/(tabs)");
      return response;
    } catch (error) {
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

            // Try to get fresh user data from API
            try {
              const userData = await authApi.getUserById(decoded.userId);
              if (userData) {
                setUser(userData);
                await SecureStore.setItemAsync(
                  "userData",
                  JSON.stringify(userData),
                );
                console.log("✅ User loaded from API:", userData.firstName);

                // If we don't have merchant info but user has merchants, fetch device
                if (
                  !merchant &&
                  userData.merchants &&
                  userData.merchants.length > 0
                ) {
                  const firstMerchant = userData.merchants[0];
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
                    console.error("Failed to fetch device:", deviceError);
                  }
                }
              } else if (userDataStr) {
                // Fallback to stored user data
                const storedUser = JSON.parse(userDataStr);
                setUser(storedUser);
              }
            } catch (apiError) {
              console.warn("API call failed, using stored data:", apiError);
              if (userDataStr) {
                const storedUser = JSON.parse(userDataStr);
                setUser(storedUser);
              }
            }

            setIsAuthenticated(true);
            return;
          }
        } else {
          await SecureStore.deleteItemAsync("accessToken");
        }
      }

      setIsAuthenticated(false);
      setUser(null);
      setDecodedToken(null);
    } catch {
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
          } else {
            const fallbackUser = {
              id: decoded.userId,
              firstName: decoded.firstName || "",
              lastName: decoded.lastName || "",
              username: decoded.username,
              email: decoded.email,
              phoneNumber: decoded.phoneNumber || "",
              roles:
                decoded.role?.map((r) => ({ name: r.replace("ROLE_", "") })) ||
                [],
              isMerchant:
                decoded.role?.some((r) => r.includes("MERCHANT")) || false,
            };
            setUser(fallbackUser);
            await SecureStore.setItemAsync(
              "userData",
              JSON.stringify(fallbackUser),
            );
          }
        } catch (error) {
          console.warn(
            "Failed to get user details, using decoded token:",
            error,
          );
          const fallbackUser = {
            id: decoded.userId,
            firstName: decoded.firstName || "",
            lastName: decoded.lastName || "",
            username: decoded.username,
            email: decoded.email,
            phoneNumber: decoded.phoneNumber || "",
            roles:
              decoded.role?.map((r) => ({ name: r.replace("ROLE_", "") })) ||
              [],
            isMerchant:
              decoded.role?.some((r) => r.includes("MERCHANT")) || false,
          };
          setUser(fallbackUser);
          await SecureStore.setItemAsync(
            "userData",
            JSON.stringify(fallbackUser),
          );
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

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    rehydrate(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const value = {
    user,
    decodedToken,
    isAuthenticated,
    isLoading,
    deviceVerified,
    deviceConfig,
    merchantInfo,
    pendingEmail,
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