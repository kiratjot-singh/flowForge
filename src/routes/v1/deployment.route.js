import { Router } from "express";

import {
  getDeployment,
  getDeployments,
  getDeploymentLogs,
  getDetails
} from "../../controllers/deployment.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();


router.get("/", protect, getDeployments);

router.get("/:id", getDeployment);

router.get("/:id/details", protect, getDetails);

router.get(
  "/:id/logs", protect,
  getDeploymentLogs
);

export default router;