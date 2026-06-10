import crypto from "crypto";
import { createDeployment } from "../repositories/deployment.repository.js";
import { findProjectsByRepoAndBranch } from "../repositories/project.repository.js";
import deploymentQueue from "../queues/deployment.queue.js";
import AppError from "../utils/AppError.js";

export const githubWebhook = async (req, res, next) => {
  try {
    const repoUrl = req.body.repository?.clone_url;
    const ref = req.body.ref || "";
    const branch = ref.replace("refs/heads/", "");

    if (!repoUrl || !branch) {
      throw new AppError("Invalid webhook payload: repository clone_url and ref are required", 400);
    }

    const commitSha = req.body.after || req.body.head_commit?.id || "webhook-trigger";

    // Find all projects registered with this repo URL and branch
    const projects = await findProjectsByRepoAndBranch(repoUrl, branch);

    if (projects.length === 0) {
      return res.json({
        success: true,
        message: "No matching projects registered for this repository and branch"
      });
    }

    const deployments = [];

    for (const project of projects) {
      const deployment = await createDeployment({
        id: crypto.randomUUID(),
        projectId: project.id,
        commitSha,
        status: "PENDING"
      });

      await deploymentQueue.add("build-project", {
        deploymentId: deployment.id
      });

      deployments.push(deployment);
    }

    return res.status(201).json({
      success: true,
      message: `Triggered ${deployments.length} deployment(s)`,
      deployments
    });
  } catch (error) {
    next(error);
  }
};