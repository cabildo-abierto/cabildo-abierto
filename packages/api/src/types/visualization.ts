import type {DatasetColumn, DatasetColumnType} from './dataset';
import type {TopicSummary, TopicBlock} from './topic';
import type {VisualizationSpecV1} from './generated/visualization';
export * from './generated/visualization';

export type TableValue = string | number | boolean | null;
export type TypedTable = {columns: DatasetColumn[]; rows: TableValue[][]};
export type DatasetReference = {topicId: string; blockNumber: string};
export type VisualizationContent = {query: string; queryLanguageVersion: 1; spec: VisualizationSpecV1};
export type DatasetSource = DatasetReference & {versionId: string; title: string; columns: DatasetColumn[]; topic: TopicSummary};
export type ViewFilterOperator = 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'notIn' | 'contains' | 'isNull' | 'isNotNull';
export type ViewFilter = {field: string; type: DatasetColumnType; operator: ViewFilterOperator; values: Exclude<TableValue, null>[]};
export type BasicDataView = {source: DatasetReference; columns: string[]; filters: ViewFilter[]; filterMode: 'and' | 'or'; orderBy: {field: string; direction: 'asc' | 'desc'}[]};
export type LccaInput = {query: string; queryLanguageVersion: 1};
export type LccaAnalysis = {sources: DatasetReference[]; basicView: BasicDataView | null};
export type LccaOutput = TypedTable & {sources: (DatasetReference & {versionId: string; snapshotId: string})[]};
export type VisualizationSourcesOutput = {sources: {topic: TopicSummary; block: TopicBlock}[]};
