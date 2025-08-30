import registerSchema from "./auth.register.schema.js";
import loginSchema from "./auth.login.schema.js";
import verifyEmailSchema from "./auth.verifyEmail.schema.js"
import refreshSchema from "./auth.refresh.schema.js";
import getCurrentUserSchema from "./auth.getCurrentUser.schema.js";
import logoutUserSchema from "./auth.logout.schema.js";
import twoFaSetupSchema from "./auth.twoFaSetup.schema.js"
import twoFaConfirmSchema from "./auth.twoFaConfirm.schema.js";
import twoFaVerifySchema from "./auth.twoFaVerify.schema.js";
import twoFaDisableSchema from "./auth.twoFaDisable.schema.js";
import oauthLoginSchema from "./auth.oauthLogin.schema.js"
import forgotPassSchema from "./auth.forgetPass.schema.js";

export default {
	registerSchema,
	loginSchema,
	verifyEmailSchema,
	refreshSchema,
	getCurrentUserSchema,
	logoutUserSchema,
	twoFaSetupSchema,
	twoFaConfirmSchema,
	twoFaVerifySchema,
	twoFaDisableSchema,
	oauthLoginSchema,
	forgotPassSchema
};
