import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { prisma } from '@governed-action-layer/database';
import axios from 'axios';
// Config
const EXECUTION_PLANE_URL = process.env.EXECUTION_PLANE_URL || 'http://localhost:3002';
const API_KEY = process.env.GATEWAY_API_KEY || 'test-key-123';
const server = new Server({
    name: "anti-gravity-gateway",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Helper: Sanitize skill name for tool name
function sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}
server.setRequestHandler(ListToolsRequestSchema, async () => {
    // 1. Fetch published skills
    const skills = await prisma.skill.findMany({
        where: { versions: { some: {} } }, // Must have at least one version
        include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    const tools = skills.map(skill => {
        const latestVersion = skill.versions[0];
        return {
            name: sanitizeName(skill.name),
            description: skill.description || `Execute ${skill.name}`,
            inputSchema: latestVersion.inputSchema // MCP expects JSON Schema
        };
    });
    return { tools };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    // 1. Resolve Tool Name -> Skill ID
    // Inefficient scan for MVP; Optimization: Store mapping or use ID in name
    const skills = await prisma.skill.findMany({
        include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    const matchedSkill = skills.find(s => sanitizeName(s.name) === name);
    if (!matchedSkill) {
        throw new Error(`Tool ${name} not found`);
    }
    try {
        // 2. Call Execution Plane
        const response = await axios.post(`${EXECUTION_PLANE_URL}/skills/${matchedSkill.id}/invoke`, args, { headers: { 'x-api-key': API_KEY } });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(response.data, null, 2)
                }]
        };
    }
    catch (err) {
        return {
            content: [{
                    type: "text",
                    text: `Error invoking skill: ${err.message}`
                }],
            isError: true
        };
    }
});
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Anti-Gravity Agent Gateway running on stdio");
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map