import { Worker } from "bullmq";
import redis from "../config/redis.js";

import fs from "fs/promises";
import path from "path";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

import {
  findDeploymentById,
  updateDeploymentStatus,
  updateDeploymentOutputDirectory
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

      // --------------------
      // CLONE REPOSITORY
      // --------------------

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

      // --------------------
      // CHECK PACKAGE.JSON
      // --------------------

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

      // --------------------
      // NPM INSTALL
      // --------------------

      await createDeploymentLog(
        deploymentId,
        "Installing dependencies..."
      );

      const {
        stdout: npmInstallStdout,
        stderr: npmInstallStderr
      } = await execAsync(
        `docker run --rm \
        -v "${deploymentPath}:/app" \
        -w /app \
        flowforge-builder \
        npm install`
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

      // --------------------
      // BUILD SCRIPT CHECK
      // --------------------

      const packageJson = JSON.parse(
        await fs.readFile(
          packageJsonPath,
          "utf-8"
        )
      );

      const hasBuildScript =
  packageJson.scripts?.build;

if (!hasBuildScript) {

  await createDeploymentLog(
    deploymentId,
    "No build script found"
  );

  const indexHtmlPath = path.join(
    deploymentPath,
    "index.html"
  );

  try {

    await fs.access(indexHtmlPath);

    await createDeploymentLog(
      deploymentId,
      "Static site detected"
    );

    await updateDeploymentOutputDirectory(
      deploymentId,
      "."
    );

    await updateDeploymentStatus(
      deploymentId,
      "SUCCESS"
    );

    return;

  } catch {

    await createDeploymentLog(
      deploymentId,
      "No deployable output found"
    );

    await updateDeploymentStatus(
      deploymentId,
      "FAILED"
    );

    return;
  }
}

      // --------------------
      // RUN BUILD
      // --------------------

      await createDeploymentLog(
        deploymentId,
        "Starting build..."
      );

      const {
        stdout: buildStdout,
        stderr: buildStderr
      } = await execAsync(
        `docker run --rm \
        -v "${deploymentPath}:/app" \
        -w /app \
        flowforge-builder \
        npm run build`
      );

      if (buildStdout) {
        await createDeploymentLog(
          deploymentId,
          buildStdout
        );
      }

      if (buildStderr) {
        await createDeploymentLog(
          deploymentId,
          buildStderr
        );
      }

      await createDeploymentLog(
        deploymentId,
        "Build completed successfully"
      );

      // --------------------
      // DETECT BUILD OUTPUT
      // --------------------

      const possibleOutputs = [
        "dist",
        "build",
        ".next",
        "out"
      ];

      let outputDirectory = null;

      for (const dir of possibleOutputs) {
        const fullPath = path.join(
          deploymentPath,
          dir
        );

        try {
          await fs.access(fullPath);

          outputDirectory = dir;

          await updateDeploymentOutputDirectory(
            deploymentId,
            dir
          );

          await createDeploymentLog(
            deploymentId,
            `Output directory detected: ${dir}`
          );

          break;
        } catch {
          // ignore
        }
      }

      if (!outputDirectory) {
        await createDeploymentLog(
          deploymentId,
          "No output directory detected"
        );
      }

      // --------------------
      // SUCCESS
      // --------------------

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