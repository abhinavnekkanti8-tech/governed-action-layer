import fastify from 'fastify';
import cors from '@fastify/cors';
import { ApiError, ErrorCode } from '@governed-action-layer/shared';
import { workflowRoutes } from './routes/workflows.js';
import { skillRoutes } from './routes/skills.js';

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

    request.log.error(error);
    reply.status(500).send({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal Server Error',
    });
});

// Health Check
server.get('/health', async () => ({ status: 'ok' }));

// Routes
server.register(workflowRoutes, { prefix: '/workflows' });
server.register(skillRoutes, { prefix: '/skills' });

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
