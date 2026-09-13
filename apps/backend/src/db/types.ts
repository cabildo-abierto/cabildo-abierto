import type {ColumnType} from "kysely";

type Generated<T> = T extends ColumnType<infer Select, infer Insert, infer Update>
    ? ColumnType<Select, Insert | undefined, Update>
    : ColumnType<T, T | undefined, T>;

type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type DB = {
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
        id: string;
        topic_id: string;
        comment_number: string;
        root_id: string;
        reply_to_id: string;
        content: string;
        block_number: string;
    };
    reaction: {
        id: string;
        type: string;
        subject_id: string;
        reason_id: string | null;
    };
};
