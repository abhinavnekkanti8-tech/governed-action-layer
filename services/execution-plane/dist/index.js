"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const shared_1 = require("@governed-action-layer/shared");
const invocation_js_1 = require("./routes/invocation.js");
const approvals_js_1 = require("./routes/approvals.js");
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
    console.error(error); // Log full error
    reply.status(500).send({
        code: shared_1.ErrorCode.INTERNAL_ERROR,
        message: 'Internal Server Error',
    });
});
server.get('/health', async () => ({ status: 'ok' }));
// Routes
server.register(invocation_js_1.invocationRoutes, { prefix: '/skills' });
server.register(approvals_js_1.approvalRoutes, { prefix: '/approvals' });
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Execution Plane listening on ${port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map