import { Router } from "express";
import {
  getHealthStatus,
  testPost,
  testError
} from "../../controllers/health.controller.js";
import validate from "../../middlewares/validate.middleware.js"
import { testPostSchema } from "../../validators/health.validator.js";

const router = Router();

router.get("/",getHealthStatus);
router.post("/test",validate(testPostSchema),testPost);
router.get("/error", testError);

export default router;