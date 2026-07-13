import {
  apiClient,
  DeviceVerificationRequest,
  DeviceVerificationResponse,
} from "./client";

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

export const authApi = {
  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    return apiClient.post<SignInResponse>("/auth/sign-in", data, false);
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    return apiClient.post<VerifyOtpResponse>(
      "/auth/verify-login-otp",
      data,
      false,
    );
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
};
