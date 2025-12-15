"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillRoutes = skillRoutes;
const database_1 = require("@governed-action-layer/database");
const auth_js_1 = require("../middleware/auth.js");
async function skillRoutes(fastify) {
    fastify.addHook('preHandler', auth_js_1.authMiddleware);
    // List All Skills
    fastify.get('/', async (req) => {
        const skills = await database_1.prisma.skill.findMany({
            where: { tenantId: req.principal.tenantId },
            include: {
                versions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        return skills;
    });
    // Get Specific Skill with all versions
    fastify.get('/:id', async (req) => {
        const { id } = req.params;
        const skill = await database_1.prisma.skill.findFirst({
            where: { id, tenantId: req.principal.tenantId },
            include: { versions: { orderBy: { createdAt: 'desc' } } }
        });
        return skill;
    });
}
//# sourceMappingURL=skills.js.map