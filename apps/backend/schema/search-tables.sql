CREATE TABLE __SEARCH_SCHEMA__.search_source (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kind text NOT NULL CHECK (kind IN ('block_version', 'topic_title', 'comment', 'document_file', 'dataset')),
    block_version_id text REFERENCES public.block_version(id) ON DELETE CASCADE,
    title_edit_id text REFERENCES public.edit(id) ON DELETE CASCADE,
    comment_id text REFERENCES public.comment(id) ON DELETE CASCADE,
    file_id text REFERENCES public.file(id) ON DELETE CASCADE,
    dataset_source_id text REFERENCES public.dataset_source(id) ON DELETE CASCADE,
    extractor_version integer NOT NULL DEFAULT 1 CHECK (extractor_version > 0),
    content_hash text,
    indexed_at timestamptz,
    last_checked_at timestamptz,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
    generation bigint NOT NULL DEFAULT 1,
    indexed_generation bigint NOT NULL DEFAULT 0,
    attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    retry_at timestamptz NOT NULL DEFAULT now(),
    lease_token uuid,
    lease_until timestamptz,
    last_error text,
    CHECK (generation >= indexed_generation),
    CHECK ((lease_token IS NULL) = (lease_until IS NULL)),
    CHECK (num_nonnulls(block_version_id, title_edit_id, comment_id, file_id, dataset_source_id) = 1),
    CHECK ((kind = 'block_version' AND block_version_id IS NOT NULL)
        OR (kind = 'topic_title' AND title_edit_id IS NOT NULL)
        OR (kind = 'comment' AND comment_id IS NOT NULL)
        OR (kind = 'document_file' AND file_id IS NOT NULL)
        OR (kind = 'dataset' AND dataset_source_id IS NOT NULL)),
    UNIQUE (block_version_id), UNIQUE (title_edit_id), UNIQUE (comment_id),
    UNIQUE (kind, file_id), UNIQUE (dataset_source_id)
);
CREATE INDEX search_source_pending_idx ON __SEARCH_SCHEMA__.search_source(retry_at, id)
    WHERE indexed_generation < generation;

CREATE TABLE __SEARCH_SCHEMA__.search_entry (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_id bigint NOT NULL REFERENCES __SEARCH_SCHEMA__.search_source(id) ON DELETE CASCADE,
    segment_number integer NOT NULL CHECK (segment_number >= 0),
    block_type_id text REFERENCES public.block_type(id),
    title_text text NOT NULL DEFAULT '',
    body_text text NOT NULL DEFAULT '',
    location jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(location) = 'object'),
    search_config regconfig NOT NULL DEFAULT 'public.search_spanish_all'::regconfig,
    is_visible boolean NOT NULL DEFAULT false,
    is_current boolean NOT NULL DEFAULT false,
    indexed_at timestamptz NOT NULL DEFAULT now(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector(search_config, title_text), 'A') ||
        setweight(to_tsvector(search_config, body_text), 'B')
    ) STORED,
    CHECK (NOT is_current OR is_visible),
    UNIQUE (source_id, segment_number)
);
CREATE INDEX search_entry_current_gin ON __SEARCH_SCHEMA__.search_entry USING gin(search_vector)
    WHERE is_visible AND is_current;
CREATE INDEX search_entry_history_gin ON __SEARCH_SCHEMA__.search_entry USING gin(search_vector)
    WHERE is_visible;
CREATE INDEX search_entry_current_type_idx ON __SEARCH_SCHEMA__.search_entry(block_type_id, id)
    WHERE is_visible AND is_current;
CREATE INDEX search_entry_history_type_idx ON __SEARCH_SCHEMA__.search_entry(block_type_id, id)
    WHERE is_visible;

CREATE TABLE __SEARCH_SCHEMA__.search_reference (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_id bigint NOT NULL REFERENCES __SEARCH_SCHEMA__.search_source(id) ON DELETE CASCADE,
    topic_id text NOT NULL REFERENCES public.topic(id) ON DELETE CASCADE,
    block_version_id text REFERENCES public.block_version(id) ON DELETE CASCADE,
    title_edit_id text REFERENCES public.edit(id) ON DELETE CASCADE,
    comment_id text REFERENCES public.comment(id) ON DELETE CASCADE,
    is_visible boolean NOT NULL DEFAULT false,
    is_current boolean NOT NULL DEFAULT false,
    CHECK (num_nonnulls(block_version_id, title_edit_id, comment_id) = 1),
    CHECK (NOT is_current OR is_visible),
    UNIQUE (source_id, block_version_id), UNIQUE (source_id, title_edit_id), UNIQUE (source_id, comment_id)
);
CREATE INDEX search_reference_current_idx ON __SEARCH_SCHEMA__.search_reference(source_id, topic_id)
    WHERE is_visible AND is_current;
CREATE INDEX search_reference_history_idx ON __SEARCH_SCHEMA__.search_reference(source_id, topic_id)
    WHERE is_visible;
CREATE INDEX search_reference_topic_idx ON __SEARCH_SCHEMA__.search_reference(topic_id, source_id);
