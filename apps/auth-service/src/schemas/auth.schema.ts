import registerSchema from "../schemas/auth.register.schema.js";
import loginSchema from "../schemas/auth.login.schema.js";
import verifyEmailSchema from "../schemas/auth.verifyEmail.schema.js"
import refreshSchema from "../schemas/auth.refresh.schema.js";
import getCurrentUserSchema from "./auth.getCurrentUser.schema.js";
import logutUserSchema from "./auth.logout.schema.js";
import twoFaSetupSchema from "./auth.twoFaSetup.schema.js"
import twoFaConfirmSchema from "./auth.twoFaConfirm.schema.js";
import twoFaVerifySchema from "./auth.twoFaVerify.schema.js";
import twoFaDisableSchema from "./auth.twoFaDisable.schema.js";

export default {
	registerSchema,
	loginSchema,
	verifyEmailSchema,
	refreshSchema,
	getCurrentUserSchema,
	logutUserSchema,
	twoFaSetupSchema,
	twoFaConfirmSchema,
	twoFaVerifySchema,
	twoFaDisableSchema
};
