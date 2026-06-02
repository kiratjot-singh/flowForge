import { Worker } from "bullmq";
import redis from "../config/redis.js";

import fs from "fs/promises";
import path from "path";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

import {
  findDeploymentById,
  updateDeploymentStatus
} from "../repositories/deployment.repository.js";

import {
  createDeploymentLog
} from "../repositories/deploymentLog.repository.js";

const worker = new Worker(
  "deployment",
  async (job) => {
    const { deploymentId } = job.data;

    try {
      const deployment = await findDeploymentById(
        deploymentId
      );

      if (!deployment) {
        throw new Error(
          `Deployment ${deploymentId} not found`
        );
      }

      await updateDeploymentStatus(
        deploymentId,
        "RUNNING"
      );

      const deploymentPath = path.join(
        process.cwd(),
        "deployments",
        deployment.id
      );

      await fs.mkdir(
        deploymentPath,
        { recursive: true }
      );

      // Clone repository

      await createDeploymentLog(
        deploymentId,
        "Cloning repository..."
      );

      const {
        stdout: cloneStdout,
        stderr: cloneStderr
      } = await execAsync(
        `git clone --depth 1 ${deployment.repo_url} "${deploymentPath}"`
      );

      if (cloneStdout) {
        await createDeploymentLog(
          deploymentId,
          cloneStdout
        );
      }

      if (cloneStderr) {
        await createDeploymentLog(
          deploymentId,
          cloneStderr
        );
      }

      await createDeploymentLog(
        deploymentId,
        "Repository cloned successfully"
      );

      // Check package.json

      const packageJsonPath = path.join(
        deploymentPath,
        "package.json"
      );

      try {
        await fs.access(packageJsonPath);

        await createDeploymentLog(
          deploymentId,
          "package.json found"
        );
      } catch {
        await createDeploymentLog(
          deploymentId,
          "No package.json found"
        );

        await updateDeploymentStatus(
          deploymentId,
          "SUCCESS"
        );

        return;
      }

      // npm install

      await createDeploymentLog(
        deploymentId,
        "Installing dependencies..."
      );

      const {
        stdout: npmInstallStdout,
        stderr: npmInstallStderr
      } = await execAsync(
        "npm install",
        {
          cwd: deploymentPath
        }
      );

      if (npmInstallStdout) {
        await createDeploymentLog(
          deploymentId,
          npmInstallStdout
        );
      }

      if (npmInstallStderr) {
        await createDeploymentLog(
          deploymentId,
          npmInstallStderr
        );
      }

      await createDeploymentLog(
        deploymentId,
        "Dependencies installed successfully"
      );

      await updateDeploymentStatus(
        deploymentId,
        "SUCCESS"
      );

      console.log(
        `Deployment completed: ${deployment.id}`
      );

    } catch (error) {
      console.error(error);

      await createDeploymentLog(
        deploymentId,
        `ERROR: ${error.message}`
      );

      await updateDeploymentStatus(
        deploymentId,
        "FAILED"
      );

      throw error;
    }
  },
  {
    connection: redis
  }
);

console.log("Deployment worker started");