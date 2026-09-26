import type {Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {ObjectStorage} from '../storage/storage.js';
import {datasetCell} from '@cabildo-abierto/utils';
import type {DatasetOutput} from '@cabildo-abierto/api';
import {requireDatasetAccess, requireDatasetFileAccess} from './access.js';
import {downloadCSV} from './download.js';
import {parseCSV, datasetLimits} from './csv.js';
import {TopicActionError} from '../topic-title-edits.js';
export async function loadDataset(database: Kysely<DB>, id: string, getStorage: () => ObjectStorage): Promise<DatasetOutput> {
    const dataset = await requireDatasetAccess(database, id);
    const data = dataset.source_url ? await downloadCSV(dataset.source_url) : await getStorage().read(await requireDatasetFileAccess(database, dataset.file_id!));
    const parsed = parseCSV(data);
    if ((parsed.rows.length + 1) * dataset.columns.length > datasetLimits().cells) throw new TopicActionError(413, 'La tabla supera la cantidad de celdas permitida.');
    const indices = new Map(parsed.columns.map((c,i) => [c.name,i]));
    const rows = parsed.rows.map(row => dataset.columns.map(column => {
        const index = indices.get(column.name);
        return index === undefined ? {raw: '', value: null, error: 'La columna ya no está en el CSV.'} : datasetCell(row[index], column.type, parsed.csvOptions);
    }));
    return {id: dataset.id, title: dataset.title, description: dataset.description, fileId: dataset.file_id,
        sourceUrl: dataset.source_url, columns: dataset.columns, csvOptions: parsed.csvOptions, rows, rowCount: rows.length,
        topic: {id: dataset.topicId, title: dataset.topicTitle, slug: dataset.topicSlug}};
}
