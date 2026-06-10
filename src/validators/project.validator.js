import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  repoUrl: z.string().url("Invalid repository URL"),
  branch: z.string().min(1, "Branch name is required").default("main")
});
