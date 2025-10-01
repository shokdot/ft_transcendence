import { FastifyInstance } from "fastify";
import { updateAvatarHandler, deleteAvatarHandler } from '@controllers/avatar/index.js'
import { avatar } from "@schemas/index.js";

const avatarRoutes = async (app: FastifyInstance) => {
	app.patch('/', avatar.updateAvatar, updateAvatarHandler);
	app.delete('/', avatar.deleteAvatar, deleteAvatarHandler);
}

export default avatarRoutes;
