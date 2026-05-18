import { Router } from "express";
import {
  getHealthStatus
} from "../../controllers/health.controller.js";

const router = Router();

router.get("/",getHealthStatus);
router.get("/error", async (req, res) => {
  throw new Error("Test error");
});

export default router;