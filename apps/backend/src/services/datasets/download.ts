import {downloadRemoteFile} from '../storage/download.js';
import {datasetLimits} from './csv.js';
export {publicRemoteAddress as publicDatasetAddress} from '../storage/download.js';
export function downloadCSV(source: string) {
    return downloadRemoteFile(source, {maxBytes: datasetLimits().bytes, accept: 'text/csv, text/plain;q=0.9', label: 'el CSV'});
}
