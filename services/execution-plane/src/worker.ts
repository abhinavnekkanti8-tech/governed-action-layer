import { Worker } from '@temporalio/worker';
import * as activities from './temporal/activities.js';
import path from 'path';

async function run() {
    const connectionOptions = {
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    };

    const worker = await Worker.create({
        workflowsPath: path.resolve(__dirname, './temporal/workflows.ts'), // Path to source? TS worker
        activities,
        taskQueue: 'anti-gravity-queue',
        connection: undefined, // Default connection to localhost
        // On production need real connection details
    });

    console.log('Worker started. Polling queue: anti-gravity-queue');
    await worker.run();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
