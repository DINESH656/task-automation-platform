import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getApiErrorMessage,
  registerApiAuthHandlers,
  setApiAccessToken,
} from "../../lib/api/apiClient";
import type { AuthPayload, LoginRequest, RegisterRequest, User } from "../../types/api";
import { authApi } from "./authApi";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  hasBootstrapped: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
  hasBootstrapped: false,
};

export const registerUser = createAsyncThunk<
  User,
  RegisterRequest,
  { rejectValue: string }
>("auth/registerUser", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const loginUser = createAsyncThunk<
  AuthPayload,
  LoginRequest,
  { rejectValue: string }
>("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.login(payload);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const refreshSession = createAsyncThunk<
  AuthPayload,
  void,
  { rejectValue: string }
>("auth/refreshSession", async (_, { rejectWithValue }) => {
  try {
    return await authApi.refresh();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authTokenRefreshed: (state, action: PayloadAction<AuthPayload>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
      state.error = null;
      setApiAccessToken(action.payload.accessToken);
    },
    sessionExpired: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
      state.error = null;
      state.hasBootstrapped = true;
      setApiAccessToken(null);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = state.accessToken ? "authenticated" : "unauthenticated";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload ?? "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.hasBootstrapped = true;
        state.error = null;
        setApiAccessToken(action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.hasBootstrapped = true;
        state.error = action.payload ?? "Login failed";
        setApiAccessToken(null);
      })
      .addCase(refreshSession.pending, (state) => {
        state.status = state.hasBootstrapped ? state.status : "loading";
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.hasBootstrapped = true;
        state.error = null;
        setApiAccessToken(action.payload.accessToken);
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.hasBootstrapped = true;
        setApiAccessToken(null);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.hasBootstrapped = true;
        state.error = null;
        setApiAccessToken(null);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.hasBootstrapped = true;
        state.error = action.payload ?? null;
        setApiAccessToken(null);
      });
  },
});

export const { authTokenRefreshed, clearAuthError, sessionExpired } =
  authSlice.actions;

export const initializeApiAuthHandlers = (dispatch: (action: unknown) => void) => {
  registerApiAuthHandlers({
    onTokenRefreshed: (payload) => dispatch(authTokenRefreshed(payload)),
    onSessionExpired: () => dispatch(sessionExpired()),
  });
};

export default authSlice.reducer;
