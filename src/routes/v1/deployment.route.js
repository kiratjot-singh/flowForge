import { Router } from "express";

import {
  getDeployment,
  getDeployments,
  getDeploymentLogs,
  getDetails
} from "../../controllers/deployment.controller.js";

const router = Router();

router.get("/", getDeployments);

router.get("/:id", getDeployment);

router.get("/:id/details",getDetails);

router.get(
  "/:id/logs",
  getDeploymentLogs
);

export default router;