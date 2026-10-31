import type {DatasetReference, TableColumn, TableOrder} from './datasets';

export type StaticTableContent = {version: 1; mode: 'static'; headers: string[]; showHeaders: boolean; rows: string[][]};
export type DatasetTableContent = {version: 1; mode: 'dataset'; source: DatasetReference; columns: TableColumn[]; pageSize: number; order: TableOrder | null};
export type TableContent = StaticTableContent | DatasetTableContent;
