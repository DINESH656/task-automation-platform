import { apiClient } from "../../lib/api/apiClient";
import type {
  ApiMessageResponse,
  ApiResponse,
  AuthPayload,
  LoginRequest,
  RegisterRequest,
  User,
} from "../../types/api";

export const authApi = {
  register: async (payload: RegisterRequest) => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/auth/register",
      payload,
    );

    return response.data.data;
  },

  login: async (payload: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<AuthPayload>>(
      "/auth/login",
      payload,
    );

    return response.data.data;
  },

  refresh: async () => {
    const response =
      await apiClient.post<ApiResponse<AuthPayload>>("/auth/refresh");

    return response.data.data;
  },

  logout: async () => {
    const response = await apiClient.post<ApiMessageResponse>("/auth/logout");

    return response.data;
  },

  me: async () => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");

    return response.data.data;
  },
};
