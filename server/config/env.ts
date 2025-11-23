import dotenv from "dotenv";
dotenv.config();

export function validateEnv(): void {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
}

export const env = {
  port: Number(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
};
