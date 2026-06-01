import { Router } from "express";
import { githubWebhook } from "../../controllers/githubWebhook.controller.js";

const router = Router();

router.post("/", githubWebhook);

export default router;