import { z } from "zod";

export const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export function parseEnv<T extends z.ZodTypeAny>(schema: T, data: Record<string, string | undefined>): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", z.prettifyError(result.error));
    throw new Error("Invalid environment variables — check server logs.");
  }
  return result.data;
}

export const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
