import express from "express";
import {
  createNewProject,
  listProjects,
  getProjectDetails,
  removeProject,
  triggerManualDeploy
} from "../../controllers/project.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { createProjectSchema } from "../../validators/project.validator.js";

const router = express.Router();

// All project routes require authentication
router.use(protect);

router.post("/", validate(createProjectSchema), createNewProject);
router.get("/", listProjects);
router.get("/:id", getProjectDetails);
router.delete("/:id", removeProject);
router.post("/:id/deploy", triggerManualDeploy);

export default router;
