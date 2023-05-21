import type { ErrorResponse } from './types';
import type { QABox } from 'qabox';

declare module 'fastify' {
    interface FastifyReply {
        error: (code: number, message?: string) => ErrorResponse;
    }

    interface FastifyInstance {
        qabox: QABox;
    }
}
