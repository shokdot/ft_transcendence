import Fastify from 'fastify';

const app = Fastify();

app.get('/users', async (req, res) => {
	return [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
});

app.listen({ port: 3001 }, () => {
	console.log('UserService listening on http://localhost:3001');
});
