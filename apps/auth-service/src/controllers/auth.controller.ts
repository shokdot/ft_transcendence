import registerUserHandler from './registerUser.controller.js';
import loginUserHandler from './loginUser.controller.js';
import verifyUserHandler from './verifyUser.controller.js';
import refreshToken from './refreshToken.controller.js';
import getCurrentUser from './getCurrentUser.controller.js';
import logoutUserHandler from './logoutUser.controller.js';
import twoFaSetupHandler from './twoFaSetup.controller.js';
import twoFaConfirmHandler from './twoFaConfirm.controller.js';
import twoFaVerifyHandler from './twoFaVerify.controller.js';
import twoFaDisableHandler from './twoFaDisable.controller.js';

export default {
	registerUserHandler,
	loginUserHandler,
	verifyUserHandler,
	refreshToken,
	getCurrentUser,
	logoutUserHandler,
	twoFaSetupHandler,
	twoFaConfirmHandler,
	twoFaVerifyHandler,
	twoFaDisableHandler
}
