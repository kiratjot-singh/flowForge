import { z } from "zod";

export const testPostSchema = z.object({
  name: z.string().min(1, "Name is required")
});