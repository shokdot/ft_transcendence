import registerUserHandler from './registerUser.controller.js';
import loginUserHandler from './loginUser.controller.js';
import verifyUserHandler from './verifyUser.controller.js';
import refreshToken from './refreshToken.controller.js';
import getCurrentUser from './getCurrentUser.controller.js';
import logoutUserHandler from './logoutUser.controller.js';

export default {
	registerUserHandler,
	loginUserHandler,
	verifyUserHandler,
	refreshToken,
	getCurrentUser,
	logoutUserHandler
}
