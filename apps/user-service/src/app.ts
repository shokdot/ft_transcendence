import Fastify, { FastifyReply } from 'fastify';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import rateLimit from '@fastify/rate-limit';
import sendError from '@core/utils/sendError.js'
import userRoutes from './routes/user.routes.js'
// import websocket from "@fastify/websocket";

const app = Fastify({ logger: true });

// app.register(websocket);

// WebSocket route
// app.register(async function (fastify) {
// 	fastify.get("/ws", { websocket: true }, async (connection, req) => {
// 		const userId = (req.query as any).userId; // get userId from query

// 		// ✅ When user connects → set online
// 		await prisma.user.update({
// 			where: { id: userId },
// 			data: { status: "online", lastSeen: new Date() },
// 		});

// 		console.log(`User ${userId} connected`);

// 		connection.socket.on("close", async () => {
// 			// ✅ When user disconnects → set offline
// 			await prisma.user.update({
// 				where: { id: userId },
// 				data: { status: "offline", lastSeen: new Date() },
// 			});

// 			console.log(`User ${userId} disconnected`);
// 		});
// 	});
// });

await app.register(swagger, {
	swagger: {
		info: {
			title: 'ft_transcendence',
			description: 'Auth Service documentation',
			version: '1.0.0',
		},
		host: 'localhost:3001',
		schemes: ['http'],
		consumes: ['application/json'],
		produces: ['application/json'],
	}
})

await app.register(swaggerUI, {
	routePrefix: '/docs',
	uiConfig: {
		docExpansion: 'full',
		deepLinking: false
	},
})

app.setErrorHandler((error, _, reply: FastifyReply) => {
	if (error.validation) {
		const firstError = error.validation[0];
		const field = firstError.instancePath?.replace(/^\//, '') || firstError.params?.missingProperty || 'unknown';
		const message = firstError.message;

		const details = { field, message };
		return sendError(reply, 400, 'VALIDATION_FAILED', `Request ${error.validationContext} validation failed`, details);
	}

	return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', error.message || 'Something went wrong');
});

app.register(rateLimit, {
	max: 5,
	timeWindow: '1 minute',
	keyGenerator: (request) => {
		return request.ip;
	},
	errorResponseBuilder: () => ({
		status: 'error',
		error: 'TOO_MANY_REQUESTS',
		message: 'Too many login attempts. Please try again later.'
	})
});

await app.register(userRoutes, { prefix: '/api/v1/users' });

export default app;
