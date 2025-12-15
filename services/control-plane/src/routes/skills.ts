import { FastifyInstance } from 'fastify';
import { prisma } from '@governed-action-layer/database';
import { authMiddleware } from '../middleware/auth.js';

export async function skillRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authMiddleware);

    // List All Skills
    fastify.get('/', async (req) => {
        const skills = await prisma.skill.findMany({
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
        const { id } = req.params as { id: string };
        const skill = await prisma.skill.findFirst({
            where: { id, tenantId: req.principal.tenantId },
            include: { versions: { orderBy: { createdAt: 'desc' } } }
        });
        return skill;
    });
}
