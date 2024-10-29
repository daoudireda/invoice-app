import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: "./.env.local",
});
if (typeof process.env.XATA_DATABASE_URL !== "string") {
  throw new Error("XATA_DATABASE_URL is required in .env.local");
}
export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.XATA_DATABASE_URL,
  },
});
