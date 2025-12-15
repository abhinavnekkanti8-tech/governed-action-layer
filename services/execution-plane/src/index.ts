import fastify from 'fastify';
import cors from '@fastify/cors';
import { ApiError, ErrorCode } from '@governed-action-layer/shared';
import { invocationRoutes } from './routes/invocation.js';
import { approvalRoutes } from './routes/approvals.js';

const server = fastify({ logger: true });

server.register(cors);

// Global Error Handler
server.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
        reply.status(error.statusCode).send({
            code: error.code,
            message: error.message,
            details: error.details,
        });
        return;
    }

    console.error(error); // Log full error
    reply.status(500).send({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal Server Error',
    });
});

server.get('/health', async () => ({ status: 'ok' }));

// Routes
server.register(invocationRoutes, { prefix: '/skills' });
server.register(approvalRoutes, { prefix: '/approvals' });

const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Execution Plane listening on ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
