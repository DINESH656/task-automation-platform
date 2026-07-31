import type { Request, Response } from "express";
import { getHealthStatus } from "./health.service.js";

export const health = (_req: Request, res: Response) => {
  const result = getHealthStatus();

  return res.status(200).json(result);
};