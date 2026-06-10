import crypto from "crypto";
import AppError from "../utils/AppError.js";
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

export const createNewProject = async (req, res, next) => {
  try {
    const { name, repoUrl, branch } = req.body;
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
      throw new AppError("Project not found", 404);
    }

    if (project.user_id !== userId) {
      throw new AppError("Access denied: you do not own this project", 403);
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
      throw new AppError("Project not found", 404);
    }

    if (project.user_id !== userId) {
      throw new AppError("Access denied: you do not own this project", 403);
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
      throw new AppError("Project not found", 404);
    }

    if (project.user_id !== userId) {
      throw new AppError("Access denied: you do not own this project", 403);
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
