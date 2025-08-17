import registerSchema from "../schemas/auth.register.schema.js";
import loginSchema from "../schemas/auth.login.schema.js";
import verifyEmailSchema from "../schemas/auth.verifyEmail.schema.js"
import refreshSchema from "../schemas/auth.refresh.schema.js";

export default {
	registerSchema,
	loginSchema,
	verifyEmailSchema,
	refreshSchema
};
