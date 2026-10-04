import type {TopicSummary} from './topic';

export type DatasetColumnType = 'text' | 'integer' | 'decimal' | 'boolean' | 'date' | 'datetime';
export type DatasetColumn = {name: string; type: DatasetColumnType};
export type CSVOptions = {delimiter: ',' | ';'; decimal: '.' | ','};
export type DatasetSourceOptions = {sourceFormat: 'csv' | 'json'; jqFilter: string | null};
export type DatasetContent = DatasetSourceOptions & {
    title: string; description: string; fileId: string | null; sourceUrl: string | null;
    columns: DatasetColumn[]; csvOptions: CSVOptions; rowCount?: number;
};
export type DatasetCell = {raw: string; value: string | number | boolean | null; error: string | null};
export type DatasetPreview = DatasetSourceOptions & {
    fileId: string | null; fileName: string | null; sourceUrl: string | null;
    columns: DatasetColumn[]; csvOptions: CSVOptions; rows: string[][]; rowCount: number; snapshotId: string; page: number;
};
export type DatasetOutput = DatasetContent & {
    id: string; topic: TopicSummary; rows: DatasetCell[][]; rowCount: number; snapshotId: string; page: number;
};
export type DatasetMetadata = Pick<DatasetContent, 'title' | 'description'> & {rowCount?: number; checkedAt?: string | null};
