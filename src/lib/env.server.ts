import "server-only";

import { z } from "zod";

import { clientSchema, parseEnv } from "@/lib/env";

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z.string().optional(),
  // MVP single-court configuration: explicitly set court ID instead of relying on first-by-createdAt
  COURT_ID: z.string().uuid().optional(),
});

export const serverEnv = parseEnv(serverSchema, process.env);
