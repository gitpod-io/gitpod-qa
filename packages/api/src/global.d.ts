import type { QASearcher } from '@gitpod/docs-qa';
import type { ErrorResponse } from './types';

declare module 'fastify' {
    interface FastifyReply {
        error: (code: number, message?: string) => ErrorResponse;
    }

    interface FastifyInstance {
        search: QASearcher;
    }
}
