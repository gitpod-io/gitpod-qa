import { route } from '@nerujs/fastify';

export const GET = route({
    handler(request, reply) {
        return 'Hello world!';
    },
});
