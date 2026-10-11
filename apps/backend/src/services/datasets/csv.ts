import {env} from '#/lib/env.js';

export function datasetLimits(format: 'csv' | 'json' = 'csv') {
    return {bytes: (format === 'json' ? env.DATASET_JSON_MAX_MB : env.DATASET_MAX_MB) * 1024 * 1024};
}
