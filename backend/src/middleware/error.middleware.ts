import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  // Handle specific error types
  if (err.code === "23505") {
    // PostgreSQL unique violation
    return res.status(409).json({ message: "Duplicate entry" });
  }

  if (err.code === "23503") {
    // PostgreSQL foreign key violation
    return res.status(400).json({ message: "Invalid reference" });
  }

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};