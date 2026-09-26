import type {ColumnType} from "kysely";

type Generated<T> = T extends ColumnType<infer Select, infer Insert, infer Update>
    ? ColumnType<Select, Insert | undefined, Update>
    : ColumnType<T, T | undefined, T>;

type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type DB = {
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
    dataset: {
        id: string; title: string; description: string; file_id: string | null; source_url: string | null;
        columns: ColumnType<import("@cabildo-abierto/api").DatasetColumn[], string, string>;
        csv_options: ColumnType<import("@cabildo-abierto/api").CSVOptions, string, string>;
    };
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
