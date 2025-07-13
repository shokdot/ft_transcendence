import { FastifyInstance } from 'fastify';
import {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser
} from '../controllers/user.controller';

export default async function userRoutes(server: FastifyInstance) {
	server.get('/', getAllUsers);
	server.post('/', createUser);
	server.get('/:id', getUserById);
	server.put('/:id', updateUser);
	server.delete('/:id', deleteUser);
}
