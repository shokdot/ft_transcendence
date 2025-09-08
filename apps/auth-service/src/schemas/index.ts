import registerSchema from "./basic/auth.register.schema.js";
import loginSchema from "./basic/auth.login.schema.js";
import verifyEmailSchema from "./basic/auth.verifyEmail.schema.js"
import refreshSchema from "./basic/auth.refresh.schema.js";
import getCurrentUserSchema from "./basic/auth.getCurrentUser.schema.js";
import logoutUserSchema from "./basic/auth.logout.schema.js";
import twoFaSetupSchema from "./twofa/auth.twoFaSetup.schema.js"
import twoFaConfirmSchema from "./twofa/auth.twoFaConfirm.schema.js";
import twoFaVerifySchema from "./twofa/auth.twoFaVerify.schema.js";
import twoFaDisableSchema from "./twofa/auth.twoFaDisable.schema.js";
import oauthLoginSchema from "./oauth/auth.oauthLogin.schema.js"
import forgotPassSchema from "./password/auth.forgetPass.schema.js";
import resetPassSchema from "./password/auth.restPass.schema.js";
import changePassSchema from "./password/auth.changePass.schema.js";

export const basic = {
	register: registerSchema,
	login: loginSchema,
	verifyEmail: verifyEmailSchema,
	refresh: refreshSchema,
	getCurrentUser: getCurrentUserSchema,
	logout: logoutUserSchema,
};

export const twoFa = {
	setup: twoFaSetupSchema,
	confirm: twoFaConfirmSchema,
	verify: twoFaVerifySchema,
	disable: twoFaDisableSchema,
};

export const password = {
	forgotPass: forgotPassSchema,
	resetPass: resetPassSchema,
	changePass: changePassSchema,
};

export const oauth = { oauthLogin: oauthLoginSchema };
