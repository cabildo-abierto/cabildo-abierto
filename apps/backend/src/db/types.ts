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
    record: {
        id: string;
        topic_id: string;
        type: string;
        created_at: Generated<Timestamp>;
        author_id: string;
    };
    block: {
        id: string;
        topic_id: string;
        block_number: string;
        type: string;
        content: string | null;
    };
    comment: {
        id: string;
        topic_id: string;
        comment_number: string;
        reply_to_id: string;
        content: string;
    };
    reaction: {
        id: string;
        type: string;
        subject_id: string;
        reason_id: string;
    };
};
