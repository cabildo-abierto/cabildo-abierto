import type {DatasetColumn, DatasetCell, DatasetUpdate} from './dataset';
import type {DatasetReference} from './visualization';

export type TableOrder = {field: string; direction: 'asc' | 'desc'};
export type TableColumn = {field: string; label?: string};
export type StaticTableContent = {version: 1; mode: 'static'; headers: string[]; showHeaders: boolean; rows: string[][]};
export type DatasetTableContent = {version: 1; mode: 'dataset'; source: DatasetReference; columns: TableColumn[]; pageSize: number; order: TableOrder | null};
export type TableContent = StaticTableContent | DatasetTableContent;
export type TablePageInput = {columns: string[]; page: number; pageSize: number; search: string; order: TableOrder | null; snapshotId?: string; retry?: boolean};
export type TablePageOutput = {columns: DatasetColumn[]; rows: DatasetCell[][]; page: number; rowCount: number; totalRows: number; snapshotId: string; update: DatasetUpdate};
