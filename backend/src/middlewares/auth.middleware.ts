import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../common/errors/AppErrors.js";

// Module Augmentation: tells TypeScript that Express Request now has a `user` property
declare module "express-serve-static-core" {
  interface Request {
    user: {
      id: string;
      role: string;
    };
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    
    // Fix: explicitly check for undefined to satisfy strict index access
    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    // jwt.verify returns string | JwtPayload. We handle both cases safely.
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (typeof decoded === "string") {
      throw new AppError("Invalid or expired access token", 401);
    }

    const payload = decoded as JwtPayload;

    if (!payload || !payload.sub || !payload.role) {
      throw new AppError("Invalid or expired access token", 401);
    }

    req.user = {
      id: payload.sub,
      role: payload.role as string,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // If jwt.verify throws its own error (e.g., TokenExpiredError)
    throw new AppError("Invalid or expired access token", 401);
  }
};