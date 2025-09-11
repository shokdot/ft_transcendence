import { FastifyInstance } from "fastify";
import { basic } from 'src/schemas/index.js';
import {
	getCurrentUserHandler,
	verifyUserHandler,
	refreshTokenHandler,
	loginUserHandler,
	registerUserHandler,
	logoutUserHandler,
	deleteUserHandler
} from 'src/controllers/basic/index.js'

const basicAuthRoutes = async (app: FastifyInstance) => {
	app.get('/me', basic.getCurrentUser, getCurrentUserHandler);
	app.delete('/me', basic.deleteUser, deleteUserHandler);
	app.get('/verify-email', basic.verifyEmail, verifyUserHandler);
	app.post('/register', basic.register, registerUserHandler);
	app.post('/login', basic.login, loginUserHandler);
	app.post('/logout', basic.logout, logoutUserHandler);
	app.post('/refresh', basic.refresh, refreshTokenHandler);
}

export default basicAuthRoutes;
