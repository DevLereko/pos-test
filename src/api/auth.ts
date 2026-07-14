import {
  apiClient,
  DeviceVerificationRequest,
  DeviceVerificationResponse,
} from "./client";
import * as SecureStore from "expo-secure-store";

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignInResponse {
  message: string;
  userEmail: string;
  expiresAt: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  accessToken: string;
  roles: string[];
  userId: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface MerchantDevice {
  id: string;
  deviceName?: string;
  deviceId?: string;
  terminalId: string;
  deviceModel?: string;
  serialNumber?: string;
  merchantId: string;
  assignedUserId?: string | null;
  osVersion?: string;
  isActive: boolean;
  status?: string;
  lastSyncAt?: string;
  pairingSecretHash?: string;
  deviceFingerprint?: string;
  pairingApprovedAt?: string;
  linkedAt?: string;
  unlinkedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface POSDevice {
  id: string;
  deviceName: string;
  deviceId: string;
  terminalId: string;
  merchantId: string;
  printerName: string;
  paperSize: string;
  receiptCopies: number;
  apiUrl: string;
  soapUrl: string;
  timeout: number;
  retryAttempts: number;
  autoConnect: boolean;
  autoPrint: boolean;
  soundEffects: boolean;
  offlineMode: boolean;
  biometricAuth: boolean;
  sessionTimeout: number;
  isActive: boolean;
  lastSyncAt: string;
}

export interface GetUserResponse {
  message: string;
  user: User;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  businessName?: string;
  businessAddress?: string;
  isActive: boolean;
  roles: { id: string; name: string }[];
  merchants?: Merchant[];
  merchantCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

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

export const authApi = {
  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    return apiClient.post<SignInResponse>("/auth/sign-in", data, false);
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>(
      "/auth/verify-login-otp",
      data,
      false,
    );
    if (response.accessToken) {
      await SecureStore.setItemAsync("accessToken", response.accessToken);
    }
    return response;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      "/auth/forgot-password",
      data,
      false,
    );
  },

  resetPassword: async (
    data: ResetPasswordRequest,
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      "/auth/reset-password",
      data,
      false,
    );
  },

  verifyDevice: async (
    data: DeviceVerificationRequest,
  ): Promise<DeviceVerificationResponse> => {
    return apiClient.post<DeviceVerificationResponse>(
      "/pos/devices/verify",
      data,
      false,
    );
  },

  getCurrentUser: async (): Promise<User> => {
    const decoded = await apiClient.decodeToken();
    if (!decoded) throw new Error("No valid token found");
    return authApi.getUserById(decoded.userId);
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<GetUserResponse>(`/auth/user/${userId}`, true);
    return response.user;
  },

  getMerchantDevice: async (merchantId: string): Promise<MerchantDevice> => {
    const response = await apiClient.get<{ message: string; device: MerchantDevice }>(`/portal/merchants/${merchantId}/device`, true);
    return response.device;
  },

  updateUser: async (email: string, userData: Partial<User>): Promise<User> => {
    return apiClient.put<User>("/auth/update-user", { email, userData });
  },

  getDeviceById: async (deviceId: string): Promise<POSDevice> => {
    return apiClient.get<POSDevice>(`/pos/devices/${deviceId}`);
  },

  syncDevice: async (deviceId: string): Promise<POSDevice> => {
    return apiClient.post<POSDevice>(`/pos/devices/${deviceId}/sync`, {});
  },

  testPrinter: async (
    deviceId: string,
  ): Promise<{ message: string; success: boolean }> => {
    return apiClient.post<{ message: string; success: boolean }>(
      `/pos/devices/${deviceId}/test-printer`,
      {},
    );
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("userEmail");
    await SecureStore.deleteItemAsync("userData");
  },
};
