import express from "express";
import {
  createNewProject,
  listProjects,
  getProjectDetails,
  removeProject,
  triggerManualDeploy
} from "../../controllers/project.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All project routes require authentication
router.use(protect);

router.post("/", createNewProject);
router.get("/", listProjects);
router.get("/:id", getProjectDetails);
router.delete("/:id", removeProject);
router.post("/:id/deploy", triggerManualDeploy);

export default router;
