import {sql} from "kysely";

/** Expose document metadata through the existing block content API without duplicating stored data. */
export function documentBlockContent() {
    return sql<string>`case when document.id is not null then json_build_object(
        'fileId', document.file_id, 'title', document.title, 'description', document.description
    )::text else block_version.content end`;
}
