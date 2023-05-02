import { Static, Type } from '@sinclair/typebox';
import { route } from '@nerujs/fastify';

const schema = Type.Object({
    question: Type.String({
        minLength: 10,
        maxLength: 2000,
    }),
});

type Data = Static<typeof schema>;

export const POST = route({
    schema: {
        body: schema,
    },
    async handler(request, reply) {
        const { question } = request.body as Data;

        const result = await this.search(question);

        return result;
    },
});
