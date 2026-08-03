import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../../lib/api/apiClient";
import type {
  CreateTaskRequest,
  GetTasksParams,
  PaginationMeta,
  Task,
  TaskStats,
} from "../../types/api";
import { tasksApi } from "./tasksApi";

interface TasksState {
  items: Task[];
  pagination: PaginationMeta | null;
  stats: TaskStats | null;
  query: GetTasksParams;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  pagination: null,
  stats: null,
  query: { page: 1, limit: 10, sort: "createdAt", order: "desc" },
  status: "idle",
  error: null,
};

export const fetchTasks = createAsyncThunk<
  Awaited<ReturnType<typeof tasksApi.list>>,
  GetTasksParams | undefined,
  { rejectValue: string }
>("tasks/fetchTasks", async (params, { rejectWithValue }) => {
  try {
    return await tasksApi.list(params);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const fetchTaskStats = createAsyncThunk<
  TaskStats,
  void,
  { rejectValue: string }
>("tasks/fetchTaskStats", async (_, { rejectWithValue }) => {
  try {
    return await tasksApi.stats();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const createTask = createAsyncThunk<
  Task,
  CreateTaskRequest,
  { rejectValue: string }
>("tasks/createTask", async (payload, { rejectWithValue }) => {
  try {
    return await tasksApi.create(payload);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const retryTask = createAsyncThunk<Task, string, { rejectValue: string }>(
  "tasks/retryTask",
  async (publicId, { rejectWithValue }) => {
    try {
      return await tasksApi.retry(publicId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("tasks/deleteTask", async (publicId, { rejectWithValue }) => {
  try {
    await tasksApi.remove(publicId);
    return publicId;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.query = { ...state.query, ...action.meta.arg };
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
        state.status = "succeeded";
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to load tasks";
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(retryTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (task) => task.publicId === action.payload.publicId,
        );

        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (task) => task.publicId !== action.payload,
        );
      });
  },
});

export default tasksSlice.reducer;
