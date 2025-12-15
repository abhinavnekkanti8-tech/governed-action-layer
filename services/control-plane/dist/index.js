"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const shared_1 = require("@governed-action-layer/shared");
const workflows_js_1 = require("./routes/workflows.js");
const skills_js_1 = require("./routes/skills.js");
const server = (0, fastify_1.default)({ logger: true });
server.register(cors_1.default);
// Global Error Handler
server.setErrorHandler((error, request, reply) => {
    if (error instanceof shared_1.ApiError) {
        reply.status(error.statusCode).send({
            code: error.code,
            message: error.message,
            details: error.details,
        });
        return;
    }
    request.log.error(error);
    reply.status(500).send({
        code: shared_1.ErrorCode.INTERNAL_ERROR,
        message: 'Internal Server Error',
    });
});
// Health Check
server.get('/health', async () => ({ status: 'ok' }));
// Routes
server.register(workflows_js_1.workflowRoutes, { prefix: '/workflows' });
server.register(skills_js_1.skillRoutes, { prefix: '/skills' });
const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map