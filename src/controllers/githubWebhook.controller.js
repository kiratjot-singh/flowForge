import crypto from "crypto";
import { createDeployment } from "../repositories/deployment.repository.js";

export const githubWebhook = async (req, res) => {
  const repoUrl = req.body.repository.clone_url;

  const branch = req.body.ref.replace(
    "refs/heads/",
    ""
  );

  const commitSha = req.body.after;

  const deployment = await createDeployment({
    id: crypto.randomUUID(),

    repoUrl,

    branch,

    commitSha,

    status: "PENDING"
  });

  return res.status(201).json({
    success: true,
    deployment
  });
};