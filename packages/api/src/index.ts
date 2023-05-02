import type { ErrorResponse } from './types';
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

const errorNames: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    500: 'Internal Server Error',
};

server.decorateReply('error', function (code: number, message: string) {
    this.status(code);

    const error = errorNames[code] || 'Unknown';

    return {
        message: message || error,
        statusCode: code,
        error,
    } satisfies ErrorResponse;
});

server.listen({ port: 4000 }, (error, address) => {
    console.log(error ? `Error: ${error}` : `Online: ${address}`);
});
