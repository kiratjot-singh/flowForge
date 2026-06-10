import AppError from "../utils/AppError.js";
import logger from "../config/logger.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error(err);

  // Handle invalid JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format"
    });
  }

  // Handle custom errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Fallback
  return res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
};

export default errorMiddleware;