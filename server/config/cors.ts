import cors, { CorsOptions } from "cors";

const whitelist = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions =
  whitelist.length > 0
    ? { origin: whitelist, credentials: true }
    : { origin: true, credentials: true };

export function corsMiddleware() {
  return cors(corsOptions);
}
