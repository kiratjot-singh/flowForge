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

const worker = new Worker(
  "deployment",
  async (job) => {
    const { deploymentId } = job.data;

    try {
      const deployment =
        await findDeploymentById(deploymentId);

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

      console.log("Creating folder:", deploymentPath);
      await fs.mkdir(
        deploymentPath,
        { recursive: true }
      );

      await execAsync(
        `git clone ${deployment.repo_url} "${deploymentPath}"`
    );

      await updateDeploymentStatus(
        deploymentId,
        "SUCCESS"
      );

      console.log(
        `Repository cloned: ${deployment.id}`
      );
    } catch (error) {
      console.error(error);

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