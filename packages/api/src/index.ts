import { adapter } from '@nerujs/fastify';
import fastify from 'fastify';
import { neru } from 'neru';
import { join } from 'desm';

const server = fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
        },
    },
});

await neru({
    routes: join(import.meta.url, './routes'),
    adapter,
    server,
});

server.listen({ port: 4000 }, (error, address) => {
    console.log(error ? `Error: ${error}` : `Online: ${address}`);
});
