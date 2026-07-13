import { authApi, SignInResponse, VerifyOtpResponse } from "@/api/auth";
import { apiClient, DecodedToken } from "@/api/client";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  const refreshUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        setUser(null);
        setDecodedToken(null);
        setIsAuthenticated(false);
        return;
      }

      // Decode the token
      const decoded = await apiClient.decodeToken();
      if (decoded) {
        setDecodedToken(decoded);

        // Get full user details from API using userId from token
        try {
          const userData = await authApi.getUserById(decoded.userId);
          setUser(userData);
        } catch (error) {
          console.error("Failed to get user details:", error);
          // Fallback: use decoded token data
          setUser({
            id: decoded.userId,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            username: decoded.username,
            email: decoded.email,
            phoneNumber: decoded.phoneNumber,
            roles: decoded.role.map((r) => ({ name: r.replace("ROLE_", "") })),
          });
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setDecodedToken(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signIn({ username, password });
      // Store user email for OTP verification
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

      // Store access token (already stored in authApi.verifyOtp)
      // Decode token and get user info
      const decoded = await apiClient.decodeToken();
      if (decoded) {
        setDecodedToken(decoded);

        // Get full user details
        try {
          const userData = await authApi.getUserById(decoded.userId);
          setUser(userData);
        } catch (error) {
          console.error("Failed to get user details:", error);
          setUser({
            id: decoded.userId,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            username: decoded.username,
            email: decoded.email,
            phoneNumber: decoded.phoneNumber,
            roles: decoded.role.map((r) => ({ name: r.replace("ROLE_", "") })),
          });
        }
      }

      setIsAuthenticated(true);
      // Navigate to main app (dashboard)
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
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("userEmail");
      await SecureStore.deleteItemAsync("userData");
      setUser(null);
      setDecodedToken(null);
      setIsAuthenticated(false);
      router.replace("/(auth)/verify-device");
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

  // Check device verification and token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const verified = await checkDeviceVerification();
        if (!verified) {
          router.replace("/(auth)/verify-device");
          setIsLoading(false);
          return;
        }

        // Check if we have a valid token
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
          await refreshUser();
        } else {
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        router.replace("/(auth)/verify-device");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

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
