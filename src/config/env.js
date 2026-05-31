import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables");

  console.error(parsedEnv.error.format());

  process.exit(1);
}


const env = parsedEnv.data;

export default env;