import type {Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {TablePageInput, TablePageOutput} from '@cabildo-abierto/api';
import {datasetCell, parseTableBlock} from '@cabildo-abierto/utils';
import {TopicActionError} from '../topic-title-edits.js';
import {requireDatasetAccess} from '../datasets/access.js';
import {readySnapshot, snapshotCSVOptions} from '../datasets/snapshots.js';
import {datasetJob} from '../datasets/process.js';
import {datasetUpdate} from '../datasets/update.js';
import type {ObjectStorage} from '../storage/storage.js';

export async function loadTablePage(database: Kysely<DB>, id: string, body: TablePageInput, storage: ObjectStorage): Promise<TablePageOutput> {
    const valid = parseTableBlock(JSON.stringify({version: 1, mode: 'dataset', source: {topicId: 'preview', blockNumber: 'preview'},
        columns: Array.isArray(body.columns) ? body.columns.map(field => ({field})) : null, pageSize: body.pageSize, order: body.order}));
    if (!valid || !Number.isSafeInteger(body.page) || body.page < 0 || typeof body.search !== 'string' || body.search.length > 500)
        throw new TopicActionError(400, 'La página, columnas o búsqueda de la tabla no son válidas.');
    const dataset = await requireDatasetAccess(database, id);
    const snapshot = await readySnapshot(database, dataset.source_id, storage, {snapshotId: body.snapshotId, retry: body.retry === true, background: true});
    const columns = body.columns.map(field => {
        const column = dataset.columns.find(column => column.name === field);
        if (!column || !snapshot.columns.some(column => column.name === field)) throw new TopicActionError(400, `La columna «${field}» ya no está disponible. Editá la tabla para elegir otra.`);
        return column;
    });
    const csvOptions = snapshotCSVOptions(snapshot);
    const page = await datasetJob<{rows: string[][]; rowCount: number; page: number}>('page', {...body, kind: 'table',
        url: await storage.signedUrl(snapshot, 'inline', 'application/vnd.apache.parquet'), columns, csvOptions,
        indices: columns.map(column => snapshot.columns.findIndex(item => item.name === column.name)), totalRows: snapshot.row_count}, 30);
    const value = {...page, rows: page.rows.map(row => row.map((value, index) => datasetCell(value, columns[index].type, csvOptions))),
        columns, snapshotId: snapshot.id, totalRows: snapshot.row_count, update: await datasetUpdate(database, dataset.source_id)};
    if (Buffer.byteLength(JSON.stringify(value)) > 10 * 1024 * 1024) throw new TopicActionError(413, 'La página supera los 10 MiB permitidos. Elegí menos columnas o filas por página.');
    return value;
}
