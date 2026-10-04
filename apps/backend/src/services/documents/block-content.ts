import {sql} from "kysely";

/** Expose structured block metadata through the existing block content API without duplicating stored data. */
export function documentBlockContent() {
    return sql<string>`case when document.id is not null then json_build_object(
        'fileId', document.file_id, 'title', document.title, 'description', document.description
    )::text else coalesce((select json_build_object(
        'sourceFormat', dataset_source.source_format, 'jqFilter', dataset_source.jq_filter, 'fileId', dataset_source.file_id, 'sourceUrl', dataset_source.source_url, 'title', dataset.title,
        'description', dataset.description, 'columns', dataset.columns, 'csvOptions', dataset.csv_options
    )::text from dataset join dataset_source on dataset_source.id = dataset.source_id where dataset.id = block_version.id), (select json_build_object('query', visualization.query, 'queryMode', visualization.query_mode, 'queryLanguageVersion', visualization.query_language_version, 'spec', visualization.spec)::text from visualization where visualization.id = block_version.id), (select json_build_object('fileId', image.file_id, 'widthPercent', image.width_percent, 'alignment', image.alignment,
        'flow', image.flow, 'alt', image.alt, 'caption', image.caption)::text from image where image.id = block_version.id), block_version.content) end`;
}
