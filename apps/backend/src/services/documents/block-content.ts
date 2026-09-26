import {sql} from "kysely";

/** Expose document and dataset metadata through the existing block content API without duplicating stored data. */
export function documentBlockContent() {
    return sql<string>`case when document.id is not null then json_build_object(
        'fileId', document.file_id, 'title', document.title, 'description', document.description
    )::text else coalesce((select json_build_object(
        'fileId', dataset.file_id, 'sourceUrl', dataset.source_url, 'title', dataset.title,
        'description', dataset.description, 'columns', dataset.columns, 'csvOptions', dataset.csv_options
    )::text from dataset where dataset.id = block_version.id), block_version.content) end`;
}
