import 'dotenv/config';
import { createWriteStream } from 'pino-logflare';
import { createSearch } from '@gitpod/docs-qa';
import type { ErrorResponse } from './types';
import rateLimit from '@fastify/rate-limit';
import { adapter } from '@nerujs/fastify';
import fastify from 'fastify';
import { neru } from 'neru';
import { join } from 'desm';

const dev = process.env['NODE_ENV'] == 'development';

const server = fastify({
    logger: {
        transport: dev
            ? {
                  target: 'pino-pretty',
              }
            : undefined,

        stream: dev
            ? undefined
            : createWriteStream({
                  apiKey: process.env.LOGFLARE_API_KEY!,
                  sourceToken: process.env.LOGFLARE_SOURCE_TOKEN!,
              }),
    },
});

await server.register(rateLimit, {
    timeWindow: 5000,
    global: true,
    max: 3,
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

const search = await createSearch();

server.decorate('search', search);

await neru({
    routes: join(import.meta.url, './routes'),
    adapter,
    server,
});

server.listen({ port: 4000 }, (error, address) => {
    console.log(error ? `Error: ${error}` : `Online: ${address}`);
});
