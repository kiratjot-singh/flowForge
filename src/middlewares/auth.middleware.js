import jwt from "jsonwebtoken";
import env from "../config/env.js";

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
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. Token is missing."
      });
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
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. Token is invalid or expired."
      });
    }
  } catch (error) {
    next(error);
  }
};
