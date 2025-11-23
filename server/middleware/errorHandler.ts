import { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: "Not Found" });
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({ message });
}
