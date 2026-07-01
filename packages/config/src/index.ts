import { z } from "zod";

const webEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1)
});

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url()
});

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

export function validateWebEnv(env: NodeJS.ProcessEnv = process.env) {
  const result = webEnvSchema.safeParse(env);

  if (!result.success) {
    throw new Error(`Invalid web environment: ${formatEnvError(result.error)}`);
  }

  return result.data;
}

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const result = databaseEnvSchema.safeParse(env);

  if (!result.success) {
    throw new Error(`Invalid database environment: ${formatEnvError(result.error)}`);
  }

  return result.data.DATABASE_URL;
}
