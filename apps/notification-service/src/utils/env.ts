import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().default(3002),
	HOST: z.string().default("0.0.0.0"),
});

const env = envSchema.parse(process.env);

export const PORT = env.PORT;
export const HOST = env.HOST;
export const SERVICE_NAME = 'NOTIFICATION_SERVICE';
