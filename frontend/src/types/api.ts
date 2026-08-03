export type UserRole = "ADMIN" | "USER";

export type TaskStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface User {
  publicId: string;
  firstName: string;
  lastName: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName?: string;
}

export interface Task {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  scheduledAt: string | null;
  completedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  scheduledAt?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  search?: string;
  sort?: "createdAt" | "updatedAt" | "title" | "status";
  order?: "asc" | "desc";
}

export interface TaskStats {
  totalTasks: number;
  PENDING: number;
  PROCESSING: number;
  COMPLETED: number;
  FAILED: number;
}

export interface UploadedFile {
  id: string;
  publicId: string;
  originalName: string;
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  size: string;
  uploadedById: string;
  taskId: string | null;
  createdAt: string;
}
