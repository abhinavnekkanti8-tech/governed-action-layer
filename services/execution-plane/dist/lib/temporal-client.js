"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemporalClient = getTemporalClient;
const client_1 = require("@temporalio/client");
let client;
async function getTemporalClient() {
    if (client)
        return client;
    const connection = await client_1.Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
    client = new client_1.Client({
        connection,
        namespace: 'default', // MVP default namespace
    });
    return client;
}
//# sourceMappingURL=temporal-client.js.map