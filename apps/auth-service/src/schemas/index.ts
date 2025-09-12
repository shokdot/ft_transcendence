import registerSchema from "./basic/register.schema.js";
import loginSchema from "./basic/login.schema.js";
import verifyEmailSchema from "./basic/verifyEmail.schema.js"
import refreshSchema from "./basic/refresh.schema.js";
import getCurrentUserSchema from "./basic/getCurrentUser.schema.js";
import logoutUserSchema from "./basic/logout.schema.js";
import twoFaSetupSchema from "./twofa/twoFaSetup.schema.js"
import twoFaConfirmSchema from "./twofa/twoFaConfirm.schema.js";
import twoFaVerifySchema from "./twofa/twoFaVerify.schema.js";
import twoFaDisableSchema from "./twofa/twoFaDisable.schema.js";
import oauthLoginSchema from "./oauth/oauthLogin.schema.js"
import forgotPassSchema from "./password/forgetPass.schema.js";
import resetPassSchema from "./password/restPass.schema.js";
import changePassSchema from "./password/changePass.schema.js";
import deleteUserSchema from "./basic/delete.schema.js";

export const basic = {
	register: registerSchema,
	login: loginSchema,
	verifyEmail: verifyEmailSchema,
	refresh: refreshSchema,
	getCurrentUser: getCurrentUserSchema,
	logout: logoutUserSchema,
	deleteUser: deleteUserSchema
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
