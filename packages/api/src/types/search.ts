import type {BlockType, TopicSummary} from './topic';

export type SearchSourceKind = 'block_version' | 'topic_title' | 'comment' | 'document_file' | 'dataset_file' | 'dataset_url';
export type SearchSnippet = {text: string; highlights: {start: number; end: number}[]};
export type ContentSearchResult = {
    topic: TopicSummary;
    matchCount: number;
    entryId: string;
    kind: SearchSourceKind;
    blockType: BlockType['id'] | null;
    versionId: string | null;
    commentId: string | null;
    comment: {author: {id: string; username: string}; createdAt: string} | null;
    attachmentTitle: string | null;
    historical: boolean;
    snippet: SearchSnippet;
};
export type ContentSearchOutput = {
    results: ContentSearchResult[];
    totalTopics: number;
    totalMatches: number;
    offset: number;
    limit: number;
};
