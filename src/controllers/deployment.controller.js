import path from "path";
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
      return res.status(404).json({
        success: false,
        message: "Deployment not found"
      });
    }

    if (deployment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
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
      return res.status(404).json({
        success: false,
        message: "Deployment not found"
      });
    }



    if (deployment.status !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Deployment not ready"
      });
    }

    if (!deployment.output_directory) {
      return res.status(400).json({
        success: false,
        message:
          "No build output found"
      });
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
        return res.status(404).json({
          success: false,
          message: "Deployment not found"
        });
      }

      if (deployment.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
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