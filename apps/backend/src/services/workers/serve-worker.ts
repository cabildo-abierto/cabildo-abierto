import {datasetError} from '../datasets/errors.js';
import type {WorkerResponse} from './persistent-worker.js';

export function serveWorker<Job>(handle: (job: Job) => Promise<WorkerResponse>) {
    let busy = false;
    process.on('message', async (job: Job) => {
        if (busy) { process.exit(1); return; }
        busy = true;
        let response: WorkerResponse;
        try { response = await handle(job); }
        catch (error) { response = {success: false, error: datasetError(error)}; }
        finally { busy = false; }
        // The handler closes its DuckDB instance before making this worker available again.
        process.send?.({...response, workerRssBytes: process.memoryUsage().rss}, error => {
            if (error) process.exit(1);
        });
    });
    process.once('disconnect', () => process.exit(0));
    process.send?.({ready: true});
}
