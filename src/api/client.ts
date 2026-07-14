import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export interface DecodedToken {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string[];
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface DeviceVerificationRequest {
  deviceId: string;
  osVersion: string;
  deviceModel: string;
  serialNumber: string;
}

export interface DeviceVerificationResponse {
  message: string;
  verified: boolean;
  deviceUuid: string;
  merchantId: string;
  terminalId: string;
  deviceName: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(
    requiresAuth: boolean = false,
  ): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (requiresAuth) {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        headers["x-access-token"] = token;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders(requiresAuth);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, requiresAuth);
  }

  async post<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      requiresAuth,
    );
  }

  async put<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      requiresAuth,
    );
  }

  async patch<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      requiresAuth,
    );
  }

  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, requiresAuth);
  }

  // Token management
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync("accessToken", token);
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync("accessToken");
  }

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync("accessToken");
  }

  async decodeToken(): Promise<DecodedToken | null> {
    const token = await this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
