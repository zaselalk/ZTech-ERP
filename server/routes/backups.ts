import { Router, Request, Response, NextFunction } from "express";
import { backupService } from "../services/backupService";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await backupService.createBackup();
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:filename/restore",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.params as { filename: string };
      await backupService.restoreBackup(filename);
      res.json({ message: "Database restored successfully" });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:filename",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.params as { filename: string };
      const deleted = await backupService.deleteBackup(filename);
      if (deleted) {
        res.json({ message: "Backup deleted successfully" });
      } else {
        res.status(404).json({ message: "Backup not found" });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
