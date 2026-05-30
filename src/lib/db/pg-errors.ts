import { BadRequestError, NotFoundError } from "@/lib/errors";

const PG_RAISE_EXCEPTION = "P0001";

function getPgError(error: unknown): { code?: string; message?: string } | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const record = error as {
    code?: string;
    message?: string;
    driverError?: { code?: string; message?: string };
  };

  const driver = record.driverError;

  return {
    code: driver?.code ?? record.code,
    message: driver?.message ?? record.message,
  };
}

/**
 * Converts PostgreSQL RAISE EXCEPTION (SQLSTATE P0001) into AppError.
 * All other errors are re-thrown unchanged.
 */
export function rethrowPgBusinessRule(error: unknown): never {
  const pgError = getPgError(error);

  if (pgError?.code !== PG_RAISE_EXCEPTION || !pgError.message) {
    throw error;
  }

  if (pgError.message === "Court not found") {
    throw new NotFoundError(pgError.message);
  }

  throw new BadRequestError(pgError.message);
}
