import registerUser from './registerUser.service.js';
import loginUser from './loginUser.service.js';
import verifyUser from './verifyUser.service.js';
import refreshToken from './refreshToken.service.js';
import getCurrentUser from './getCurrentUser.service.js';
import twoFaSetup from './twoFaSetup.service.js';
import twoFaDisable from './twoFaDisable.service.js';
import oauthLogin from './oauthLogin.service.js';
import passForgot from './passForget.service.js';

export default {
	registerUser,
	loginUser,
	verifyUser,
	refreshToken,
	getCurrentUser,
	twoFaSetup,
	twoFaDisable,
	oauthLogin,
	passForgot
};



