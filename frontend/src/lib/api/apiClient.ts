import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthPayload, ApiResponse } from "../../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

let accessToken: string | null = null;
let onTokenRefreshed: ((payload: AuthPayload) => void) | null = null;
let onSessionExpired: (() => void) | null = null;
let refreshPromise: Promise<AuthPayload> | null = null;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setApiAccessToken = (token: string | null) => {
  accessToken = token;
};

export const registerApiAuthHandlers = (handlers: {
  onTokenRefreshed: (payload: AuthPayload) => void;
  onSessionExpired: () => void;
}) => {
  onTokenRefreshed = handlers.onTokenRefreshed;
  onSessionExpired = handlers.onSessionExpired;
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= apiClient
        .post<ApiResponse<AuthPayload>>("/auth/refresh")
        .then((response) => response.data.data);

      const payload = await refreshPromise;
      refreshPromise = null;
      setApiAccessToken(payload.accessToken);
      onTokenRefreshed?.(payload);
      originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      setApiAccessToken(null);
      onSessionExpired?.();

      return Promise.reject(refreshError);
    }
  },
);

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
};
