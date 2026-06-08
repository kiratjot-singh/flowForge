import crypto from "crypto";
import { z } from "zod";
import {
  createProject,
  findProjectById,
  findProjectsByUserId,
  deleteProject
} from "../repositories/project.repository.js";
import {
  createDeployment,
  findDeploymentsByProjectId
} from "../repositories/deployment.repository.js";
import deploymentQueue from "../queues/deployment.queue.js";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  repoUrl: z.string().url("Invalid repository URL"),
  branch: z.string().min(1, "Branch name is required").default("main")
});

export const createNewProject = async (req, res, next) => {
  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
        errors: parseResult.error.format()
      });
    }

    const { name, repoUrl, branch } = parseResult.data;
    const userId = req.user.id;

    // Create the project
    const projectId = crypto.randomUUID();
    const project = await createProject({
      id: projectId,
      name,
      repoUrl,
      branch,
      userId
    });

    // Automatically trigger initial deployment
    const deploymentId = crypto.randomUUID();
    const deployment = await createDeployment({
      id: deploymentId,
      projectId,
      commitSha: "Initial Trigger",
      status: "PENDING"
    });

    // Queue the deployment build
    await deploymentQueue.add("build-project", {
      deploymentId
    });

    return res.status(201).json({
      success: true,
      message: "Project created and initial deployment triggered successfully",
      project,
      deployment
    });
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await findProjectsByUserId(userId);

    return res.json({
      success: true,
      projects
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await findProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you do not own this project"
      });
    }

    const deployments = await findDeploymentsByProjectId(id);

    return res.json({
      success: true,
      project,
      deployments
    });
  } catch (error) {
    next(error);
  }
};

export const removeProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await findProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you do not own this project"
      });
    }

    await deleteProject(id);

    return res.json({
      success: true,
      message: "Project and all associated deployments/logs deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const triggerManualDeploy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await findProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you do not own this project"
      });
    }

    // Trigger deployment
    const deploymentId = crypto.randomUUID();
    const deployment = await createDeployment({
      id: deploymentId,
      projectId: id,
      commitSha: req.body.commitSha || `manual-${crypto.randomBytes(3).toString("hex")}`,
      status: "PENDING"
    });

    // Queue build
    await deploymentQueue.add("build-project", {
      deploymentId
    });

    return res.status(201).json({
      success: true,
      message: "Deployment triggered successfully",
      deployment
    });
  } catch (error) {
    next(error);
  }
};
