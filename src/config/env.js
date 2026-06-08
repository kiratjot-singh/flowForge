import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  VITE_API_URL: z.string().default("http:/localhost:3000"),
  JWT_SECRET: z.string().default("flowforge_default_jwt_secret_key_12345")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables");

  console.error(parsedEnv.error.format());

  process.exit(1);
}


const env = parsedEnv.data;

export default env;