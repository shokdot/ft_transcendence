import authenticate from '@core/middlewares/authenticate.middleware.js'
import { FastifyInstance } from "fastify";
import {
	createNotifcationHandler,
	getNotificationsHandler,
	markReadHandler,
	markAllReadHandler,
	deleteNotificationHandler
} from '@controllers/notification/index.js'

export default async function notifyRoutes(app: FastifyInstance): Promise<void> {
	app.get('/', { preHandler: authenticate }, getNotificationsHandler); //done
	app.post('/', createNotifcationHandler); //done
	app.patch('/:id/read', { preHandler: authenticate }, markReadHandler); //done except param
	app.patch('/read-all', { preHandler: authenticate }, markAllReadHandler); //done 
	app.delete('/:id', { preHandler: authenticate }, deleteNotificationHandler); //done except param
}
