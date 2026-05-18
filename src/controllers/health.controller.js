import AppError from "../utils/AppError.js";

export const getHealthStatus = async (req, res) => {
  return res.json({
    status: "ok",
    message: "FlowForge API healthy"
  });
};

export const testPost = async (req, res) => {
  return res.json({
    success: true,
    data: req.body
  });
};
export const testError=async (req, res) => {
  throw new AppError("user not found",404);
}