import express, { Express } from "express";
import { corsMiddleware } from "./config/cors";
import { registerRoutes } from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.json());

  registerRoutes(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
