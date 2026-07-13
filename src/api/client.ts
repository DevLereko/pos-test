import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

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

  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, requiresAuth);
  }
}

export const apiClient = new ApiClient();
