import jwt from "jsonwebtoken";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized to access this route. Token is missing.", 401);
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      
      // Inject user ID and other fields in request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      };

      next();
    } catch (error) {
      throw new AppError("Not authorized to access this route. Token is invalid or expired.", 401);
    }
  } catch (error) {
    next(error);
  }
};
