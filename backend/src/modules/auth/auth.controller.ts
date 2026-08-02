import { z } from "zod";
import ms from "ms";
import type { Request, Response } from "express";

import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/AppErrors.js";
import { AsyncHandler } from "../../common/errors/AsyncHandler.js";
import { registerUser, loginUser, refreshAccessToken  , logoutUser , getMe  } from "./auth.service.js";

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().max(50).optional(),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const register = AsyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const normalizedData = {
    ...data,
    lastName: data.lastName ?? undefined,
  };
  const user = await registerUser(normalizedData);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

export const login = AsyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await loginUser(data);
  const refreshTokenExpiresIn = env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue;

  // Set httpOnly cookie for refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ms(refreshTokenExpiresIn),
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user, accessToken },
  });
});
// ... existing imports and code (registerSchema, loginSchema, register, login) ...

export const refresh = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  } = await refreshAccessToken(refreshToken);

  const refreshTokenExpiresIn = env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue;

  // Set the new rotated refresh token in the httpOnly cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ms(refreshTokenExpiresIn),
  });

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: { user, accessToken },
  });
});

// Add to bottom of src/modules/auth/auth.controller.ts

export const logout = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  // Clear the cookie on the client regardless of DB outcome
  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const me = AsyncHandler(async (req: Request, res: Response) => {
  const user = await getMe(req.user.id);

  return res.status(200).json({
    success: true,
    data: user,
  });
});