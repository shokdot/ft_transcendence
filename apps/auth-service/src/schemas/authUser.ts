import { z } from "zod";

export const registerSchema = z.object({
	email: z.email(),
	username: z.string().min(3).max(20),
	name: z.string().min(1).max(50),
	password: z.string().min(8).max(100),
});

export const LoginSchema = z.object({
	email: z.email(),
	password: z.string().min(6)
});
