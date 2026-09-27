import type {BlockType, SearchSourceKind} from '@cabildo-abierto/api';

export type {SearchSourceKind} from '@cabildo-abierto/api';
export type SearchSource = {
    id: string; kind: SearchSourceKind; file_id: string | null; source_url: string | null;
    generation: string; lease_token: string | null; content_hash: string | null; attempts: number;
};
export type SearchSegment = {
    title: string; text: string; type: BlockType['id'] | null;
    location: Record<string, number>; config?: 'search_simple' | 'search_spanish';
};
