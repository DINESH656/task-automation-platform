import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ms from "ms";
import { randomBytes, createHash } from "node:crypto";

import prisma from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/AppErrors.js";

interface RegisterUserInput {
  firstName: string;
  lastName: string | undefined;
  email: string;
  password: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    Number(env.BCRYPT_SALT_ROUNDS),
  );

  const publicId = "USR-" + randomBytes(3).toString("hex").toUpperCase();

  const user = await prisma.user.create({
    data: {
      publicId,
      firstName: data.firstName,
      lastName: data.lastName ?? null, // Fix: explicit null for Prisma
      email: data.email,
      passwordHash,
    },
  });

  return {
    publicId: user.publicId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

export const loginUser = async (data: LoginUserInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // 1. Generate Access Token (JWT)
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any },
  );

  // 2. Generate Opaque Refresh Token
  const refreshToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(refreshToken).digest("hex");

  // 3. Persist Hashed Refresh Token
  const refreshTokenExpiresIn = env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue;
  const expiresAt = new Date(Date.now() + ms(refreshTokenExpiresIn));
  await prisma.refreshToken.create({
    data: {
      hashedToken,
      expiresAt,
      userId: user.id,
    },
  });

  const safeUser = {
    publicId: user.publicId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { user: safeUser, accessToken, refreshToken };
};
// ... existing imports and code (registerUser, loginUser) ...

export const refreshAccessToken = async (refreshToken: string) => {
  // 1. Hash the incoming token to match DB
  const hashedToken = createHash("sha256").update(refreshToken).digest("hex");

  const existingToken = await prisma.refreshToken.findUnique({
    where: { hashedToken },
    include: { user: true },
  });

  // 2. Validate token existence
  if (!existingToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  // 3. Check if token is already revoked
  if (existingToken.isRevoked) {
    // Note: In a production hardened system, seeing a revoked token being used
    // means the token was stolen. We would revoke the whole family here.
    throw new AppError("Refresh token revoked", 401);
  }

  // 4. Check if token is expired
  if (existingToken.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401);
  }

  // 5. Rotate: Revoke the old token
  await prisma.refreshToken.update({
    where: { id: existingToken.id },
    data: { isRevoked: true },
  });

  // 6. Generate new opaque refresh token
  const newRefreshToken = randomBytes(32).toString("hex");
  const newHashedToken = createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const refreshTokenExpiresIn = env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue;
  const expiresAt = new Date(Date.now() + ms(refreshTokenExpiresIn));

  await prisma.refreshToken.create({
    data: {
      hashedToken: newHashedToken,
      expiresAt,
      userId: existingToken.userId,
    },
  });

  // 7. Generate new Access Token (JWT)
  const accessToken = jwt.sign(
    { sub: existingToken.user.id, role: existingToken.user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as ms.StringValue },
  );

  const safeUser = {
    publicId: existingToken.user.publicId,
    firstName: existingToken.user.firstName,
    lastName: existingToken.user.lastName,
    email: existingToken.user.email,
    role: existingToken.user.role,
    createdAt: existingToken.user.createdAt,
  };

  return { user: safeUser, accessToken, refreshToken: newRefreshToken };
};

// Add to bottom of src/modules/auth/auth.service.ts

export const logoutUser = async (refreshToken: string) => {
  const hashedToken = createHash("sha256").update(refreshToken).digest("hex");

  await prisma.refreshToken.updateMany({
    where: {
      hashedToken,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
    },
  });
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      publicId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
