import { authApi, SignInResponse, VerifyOtpResponse } from "@/api/auth";
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

  const rehydrate = useCallback(async () => {
    try {
      const config = await SecureStore.getItemAsync("deviceConfig");
      const merchant = await SecureStore.getItemAsync("merchantInfo");

      if (config) {
        setDeviceConfig(JSON.parse(config));
        setDeviceVerified(true);
        if (merchant) {
          setMerchantInfo(JSON.parse(merchant));
        }
      } else {
        setDeviceVerified(false);
      }

      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        const isValid = await apiClient.isTokenValid();
        if (isValid) {
          const decoded = await apiClient.decodeToken();
          if (decoded) {
            setDecodedToken(decoded);

            try {
              const userData = await authApi.getUserById(decoded.userId);
              if (userData) {
                setUser(userData);
              } else {
                const storedUserData = await SecureStore.getItemAsync("userData");
                if (storedUserData) {
                  setUser(JSON.parse(storedUserData));
                } else {
                  setUser({
                    id: decoded.userId,
                    firstName: decoded.firstName || "",
                    lastName: decoded.lastName || "",
                    username: decoded.username,
                    email: decoded.email,
                    phoneNumber: decoded.phoneNumber || "",
                    roles:
                      decoded.role?.map((r) => ({
                        name: r.replace("ROLE_", ""),
                      })) || [],
                    isMerchant:
                      decoded.role?.some((r) => r.includes("MERCHANT")) || false,
                  });
                }
              }
            } catch (apiError) {
              console.warn(
                "API call failed, using decoded token:",
                apiError,
              );
              const storedUserData = await SecureStore.getItemAsync("userData");
              if (storedUserData) {
                setUser(JSON.parse(storedUserData));
              } else {
                setUser({
                  id: decoded.userId,
                  firstName: decoded.firstName || "",
                  lastName: decoded.lastName || "",
                  username: decoded.username,
                  email: decoded.email,
                  phoneNumber: decoded.phoneNumber || "",
                  roles:
                    decoded.role?.map((r) => ({
                      name: r.replace("ROLE_", ""),
                    })) || [],
                  isMerchant:
                    decoded.role?.some((r) => r.includes("MERCHANT")) || false,
                });
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
    } catch (error) {
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
            await SecureStore.setItemAsync("userData", JSON.stringify(userData));
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
            await SecureStore.setItemAsync("userData", JSON.stringify(fallbackUser));
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
          await SecureStore.setItemAsync("userData", JSON.stringify(fallbackUser));
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

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({ email, otp });

      const decoded = await apiClient.decodeToken();
      if (decoded) {
        setDecodedToken(decoded);

        try {
          const userData = await authApi.getUserById(decoded.userId);
          if (userData) {
            setUser(userData);
            await SecureStore.setItemAsync("userData", JSON.stringify(userData));
            console.log(
              "User loaded from API after OTP:",
              userData.firstName,
              userData.lastName,
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
                decoded.role?.map((r) => ({ name: r.replace("ROLE_", "") })) || [],
              isMerchant:
                decoded.role?.some((r) => r.includes("MERCHANT")) || false,
            };
            setUser(fallbackUser);
            await SecureStore.setItemAsync("userData", JSON.stringify(fallbackUser));
          }
        } catch (error) {
          console.warn(
            "Failed to get user details after OTP, using decoded token:",
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
              decoded.role?.map((r) => ({ name: r.replace("ROLE_", "") })) || [],
            isMerchant:
              decoded.role?.some((r) => r.includes("MERCHANT")) || false,
          };
          setUser(fallbackUser);
          await SecureStore.setItemAsync("userData", JSON.stringify(fallbackUser));
        }
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
    const result = await authApi.forgotPassword({ email });
    return { success: true };
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
  ) => {
    return authApi.resetPassword({ email, otp, newPassword });
  };

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

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