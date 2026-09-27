import type {ColumnType} from "kysely";

type Generated<T> = T extends ColumnType<infer Select, infer Insert, infer Update>
    ? ColumnType<Select, Insert | undefined, Update>
    : ColumnType<T, T | undefined, T>;

type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type DB = {
    search_source: {
        id: Generated<string>;
        kind: import('@cabildo-abierto/api').SearchSourceKind;
        block_version_id: Generated<string | null>; title_edit_id: Generated<string | null>;
        comment_id: Generated<string | null>; file_id: Generated<string | null>; source_url: Generated<string | null>;
        extractor_version: Generated<number>; content_hash: Generated<string | null>;
        indexed_at: Generated<Timestamp | null>; last_checked_at: Generated<Timestamp | null>;
        status: Generated<'pending' | 'ready' | 'failed'>;
        generation: Generated<string>; indexed_generation: Generated<string>;
        attempts: Generated<number>; retry_at: Generated<Timestamp>;
        lease_token: Generated<string | null>; lease_until: Generated<Timestamp | null>; last_error: Generated<string | null>;
    };
    search_entry: {
        id: Generated<string>; source_id: string; segment_number: number;
        block_type_id: Generated<string | null>; title_text: Generated<string>; body_text: Generated<string>;
        location: ColumnType<Record<string, number>, string | undefined, string>;
        search_config: Generated<string>;
        is_visible: Generated<boolean>; is_current: Generated<boolean>; indexed_at: Generated<Timestamp>;
        search_vector: ColumnType<string, never, never>;
    };
    search_reference: {
        id: Generated<string>; source_id: string; topic_id: string;
        block_version_id: Generated<string | null>; title_edit_id: Generated<string | null>; comment_id: Generated<string | null>;
        is_visible: Generated<boolean>; is_current: Generated<boolean>;
    };
    migration: {
        migration_id: Generated<string>;
        run_date: Timestamp;
        file_name: string;
    };
    user: {
        id: Generated<string>;
        username: string;
        email: string;
        password_hash: string;
    };
    session: {
        token_hash: string;
        user_id: string;
        created_at: Generated<Timestamp>;
        expires_at: Timestamp;
    };
    topic: {
        id: string;
        title: string;
        slug: string;
    };
    topic_redirect: {
        slug: string;
        topic_id: string;
        edit_id: string;
    };
    topic_connection: {
        connection_id: string;
        topic_id: string;
        viewer_id: string;
        mode: string;
        expires_at: Timestamp;
    };
    record: {
        id: string;
        type_id: string;
        created_at: Generated<Timestamp>;
        author_id: string;
        deleted: Generated<boolean>;
    };
    record_type: {
        id: string;
        name: string;
    };
    block_version: {
        id: string;
        topic_id: string;
        block_number: string;
        content: string;
        order: string;
        edit_id: string;
        deleted: Generated<boolean>;
    };
    edit: {
        title: Generated<string | null>;
        id: string;
        topic_id: string;
        message: string | null;
    };
    block: {
        topic_id: string;
        block_number: string;
        type_id: string;
    };
    block_type: {
        id: string;
        name: string;
    };
    comment: {
        document_block_id: Generated<string | null>;
        id: string;
        topic_id: string;
        comment_number: string;
        root_id: string;
        reply_to_id: string;
        content: string;
        block_number: string | null;
        edit_id: string | null;
    };
    file: {
        id: string; author_id: string; created_at: Generated<Timestamp>;
        format: Generated<string | null>; preview_file_id: Generated<string | null>;
        preview_status: Generated<string>; preview_error: Generated<string | null>;
        name: string; bucket: string; key: string; mime: string; size: number; sha256: string;
    };
    image_asset: {file_id: string; width: number; height: number};
    image: {id: string; file_id: string; width_percent: number; alignment: string; flow: string; alt: string; caption: string};
    dataset: {
        id: string; title: string; description: string; file_id: string | null; source_url: string | null;
        columns: ColumnType<import("@cabildo-abierto/api").DatasetColumn[], string, string>;
        csv_options: ColumnType<import("@cabildo-abierto/api").CSVOptions, string, string>;
    };
    visualization: {
        id: string; query: string; query_language_version: number;
        spec: ColumnType<import("@cabildo-abierto/api").VisualizationSpecV1, string, string>;
    };
    visualization_dataset: {visualization_id: string; dataset_topic_id: string; dataset_block_number: string};
    document: {
        id: string; file_id: string; title: string; description: string;
    };
    document_block: {
        id: string; file_id: string; position: number; type_id: string; content: string;
    };
    reaction: {
        id: string;
        type: string;
        subject_id: string;
        reason_id: string | null;
    };
};
