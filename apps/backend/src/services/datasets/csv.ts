import {env} from '#/lib/env.js';

export function datasetLimits() {
    return {bytes: env.DATASET_MAX_MB * 1024 * 1024};
}
