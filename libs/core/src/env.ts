import { z } from "zod";

const envSchema = z.object({
	COOKIE_SECRET: z.string().min(1, "COOKIE_SECRET is required"),
	API_PREFIX: z.string().default("/api/v1"),
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const env = envSchema.parse(process.env);

export const COOKIE_SECRET = env.COOKIE_SECRET;
export const API_PREFIX = env.API_PREFIX;
export const LOG_LEVEL = env.LOG_LEVEL;
