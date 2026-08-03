import { apiClient } from "../../lib/api/apiClient";
import type {
  ApiMessageResponse,
  ApiResponse,
  CreateTaskRequest,
  GetTasksParams,
  PaginatedResponse,
  Task,
  TaskStats,
  UpdateTaskRequest,
  UploadedFile,
} from "../../types/api";

export const tasksApi = {
  list: async (params: GetTasksParams = {}) => {
    const response = await apiClient.get<PaginatedResponse<Task>>("/tasks", {
      params,
    });

    return response.data;
  },

  stats: async () => {
    const response = await apiClient.get<ApiResponse<TaskStats>>("/tasks/stats");

    return response.data.data;
  },

  create: async (payload: CreateTaskRequest) => {
    const response = await apiClient.post<ApiResponse<Task>>("/tasks", payload);

    return response.data.data;
  },

  update: async (publicId: string, payload: UpdateTaskRequest) => {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/tasks/${publicId}`,
      payload,
    );

    return response.data.data;
  },

  remove: async (publicId: string) => {
    const response =
      await apiClient.delete<ApiMessageResponse>(`/tasks/${publicId}`);

    return response.data;
  },

  retry: async (publicId: string) => {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/tasks/${publicId}/retry`,
    );

    return response.data.data;
  },

  uploadFiles: async (publicId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await apiClient.post<ApiResponse<UploadedFile[]>>(
      `/tasks/${publicId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return response.data.data;
  },
};
