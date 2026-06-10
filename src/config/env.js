import { z } from "zod";
import logger from "./logger.js";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  VITE_API_URL: z.string().default("http:/localhost:5173"),
  JWT_SECRET: z.string().default("flowforge_default_jwt_secret_key_12345")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error(parsedEnv.error.format(), "Invalid environment variables");
  process.exit(1);
}


const env = parsedEnv.data;

export default env;