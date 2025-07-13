import Fastify from 'fastify';
import authRoutes from './routes/auth.js'

const app = Fastify({ logger: true });

await app.register(authRoutes, { prefix: '/api/v1/auth' });

export default app;
