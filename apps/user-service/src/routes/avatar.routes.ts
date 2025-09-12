import { FastifyInstance } from "fastify";
import { updateAvatarHandler, deleteAvatarHandler } from 'src/controllers/avatar/index.js'
import authenticate from "@core/middlewares/authenticate.middleware.js";

const avatarRoutes = async (app: FastifyInstance) => {
	app.patch('/', { preHandler: authenticate }, updateAvatarHandler); // add schema
	app.delete('/', { preHandler: authenticate }, deleteAvatarHandler); // add schema
}

export default avatarRoutes;
