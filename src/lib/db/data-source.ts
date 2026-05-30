import "reflect-metadata";

import { DataSource } from "typeorm";

import {
  BookingEntity,
  BookingSlotEntity,
  CourtEntity,
  ProfileEntity,
} from "./entities";

const isSslEnabled = process.env.DATABASE_SSL !== "false";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL ?? "",
  entities: [BookingEntity, BookingSlotEntity, CourtEntity, ProfileEntity],
  synchronize: false,
  logging: process.env.NODE_ENV !== "production" && process.env.TYPEORM_LOGGING === "true",
  ssl: isSslEnabled ? { rejectUnauthorized: false } : undefined,
});

export async function getDataSource() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}
