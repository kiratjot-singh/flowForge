import path from "path";
import AppError from "../utils/AppError.js";
import {
  findAllDeployments,
  findDeploymentById
} from "../repositories/deployment.repository.js";
import {
  findDeploymentLogs
} from "../repositories/deploymentLog.repository.js";

export const getDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deployment = await findDeploymentById(id);

    if (!deployment) {
      throw new AppError("Deployment not found", 404);
    }

    if (deployment.user_id !== req.user.id) {
      throw new AppError("Access denied", 403);
    }

    return res.send(deployment);
  } catch (error) {
    next(error);
  }
};


export const getDeployment = async (
  req,
  res,
  next
) => {
  console.log("GET DEPLOYMENT HIT");
  console.log("USER:", req.user);
  try {

    const { id } = req.params;

    const deployment =
      await findDeploymentById(id);

    if (!deployment) {
      throw new AppError("Deployment not found", 404);
    }



    if (deployment.status !== "SUCCESS") {
      throw new AppError("Deployment not ready", 400);
    }

    if (!deployment.output_directory) {
      throw new AppError("No build output found", 400);
    }

    const indexPath = path.join(
      process.cwd(),
      "deployments",
      deployment.id,
      deployment.output_directory,
      "index.html"
    );

    return res.sendFile(indexPath);

  } catch (error) {
    next(error);
  }
};

export const getDeployments = async (
  req,
  res,
  next
) => {
  try {
    const deployments =
      await findAllDeployments(req.user.id);

    return res.json({
      success: true,
      deployments
    });
  } catch (error) {
    next(error);
  }
};

export const getDeploymentLogs =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const deployment = await findDeploymentById(id);

      if (!deployment) {
        throw new AppError("Deployment not found", 404);
      }

      if (deployment.user_id !== req.user.id) {
        throw new AppError("Access denied", 403);
      }

      const logs =
        await findDeploymentLogs(id);

      return res.json({
        success: true,
        logs
      });
    } catch (error) {
      next(error);
    }
  };