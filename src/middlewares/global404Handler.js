import AppError from "../utils/AppError.js";

const global404Handler = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

export default global404Handler;