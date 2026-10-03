-- Schema 3: PostgreSQL 18. Includes lookup data, no application records.

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE public.block (
    topic_id text NOT NULL,
    block_number text NOT NULL,
    type_id text CONSTRAINT block_type_id_not_null1 NOT NULL
);

CREATE TABLE public.block_type (
    id text NOT NULL,
    name text NOT NULL
);

CREATE TABLE public.block_version (
    id text CONSTRAINT "Block_id_not_null" NOT NULL,
    topic_id text CONSTRAINT "Block_topic_id_not_null" NOT NULL,
    block_number text CONSTRAINT "Block_block_number_not_null" NOT NULL,
    content text NOT NULL,
    "order" text NOT NULL,
    edit_id text NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    CONSTRAINT block_version_order_format_check CHECK ((("order" ~ '^[a-z]+$'::text) AND ("right"("order", 1) <> 'a'::text)))
);

CREATE TABLE public.comment (
    id text CONSTRAINT "Comment_id_not_null" NOT NULL,
    topic_id text CONSTRAINT "Comment_topic_id_not_null" NOT NULL,
    comment_number text CONSTRAINT "Comment_comment_number_not_null" NOT NULL,
    reply_to_id text CONSTRAINT "Comment_reply_to_id_not_null" NOT NULL,
    content text CONSTRAINT "Comment_content_not_null" NOT NULL,
    root_id text NOT NULL,
    block_number text,
    edit_id text,
    document_block_id text
);

CREATE TABLE public.document (
    id text NOT NULL,
    file_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL
);

CREATE TABLE public.document_block (
    id text NOT NULL,
    file_id text NOT NULL,
    "position" integer NOT NULL,
    type_id text NOT NULL,
    content text NOT NULL
);

CREATE TABLE public.edit (
    id text CONSTRAINT block_reorder_id_not_null NOT NULL,
    topic_id text CONSTRAINT block_reorder_topic_id_not_null NOT NULL,
    message text,
    title text
);

CREATE TABLE public.file (
    id text NOT NULL,
    author_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name text NOT NULL,
    bucket text NOT NULL,
    key text NOT NULL,
    mime text NOT NULL,
    size integer NOT NULL,
    sha256 text NOT NULL,
    format text,
    preview_file_id text,
    preview_status text DEFAULT 'ready'::text NOT NULL,
    preview_error text
);

CREATE TABLE public.reaction (
    id text CONSTRAINT "Reaction_id_not_null" NOT NULL,
    type text CONSTRAINT "Reaction_type_not_null" NOT NULL,
    subject_id text CONSTRAINT "Reaction_subjectId_not_null" NOT NULL,
    reason_id text
);

CREATE TABLE public.record (
    id text CONSTRAINT "Record_id_not_null" NOT NULL,
    type_id text CONSTRAINT "Record_type_not_null" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT "Record_created_at_not_null" NOT NULL,
    author_id text CONSTRAINT "Record_author_id_not_null" NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);

CREATE TABLE public.record_type (
    id text NOT NULL,
    name text NOT NULL
);

CREATE TABLE public.session (
    token_hash text CONSTRAINT "Session_token_hash_not_null" NOT NULL,
    user_id text CONSTRAINT "Session_user_id_not_null" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT "Session_created_at_not_null" NOT NULL,
    expires_at timestamp with time zone CONSTRAINT "Session_expires_at_not_null" NOT NULL
);

CREATE TABLE public.topic (
    id text CONSTRAINT "Topic_id_not_null" NOT NULL,
    title text CONSTRAINT "Topic_title_not_null" NOT NULL,
    slug text NOT NULL
);

CREATE TABLE public.topic_connection (
    connection_id text NOT NULL,
    topic_id text NOT NULL,
    viewer_id text NOT NULL,
    mode text NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

CREATE TABLE public.topic_redirect (
    slug text NOT NULL,
    topic_id text NOT NULL,
    edit_id text NOT NULL
);

CREATE TABLE public."user" (
    id text CONSTRAINT "User_id_not_null" NOT NULL,
    username text CONSTRAINT "User_username_not_null" NOT NULL,
    email text CONSTRAINT "User_email_not_null" NOT NULL,
    password_hash text CONSTRAINT "User_password_hash_not_null" NOT NULL
);

ALTER TABLE ONLY public.block
    ADD CONSTRAINT block_pkey PRIMARY KEY (topic_id, block_number);

ALTER TABLE ONLY public.block_type
    ADD CONSTRAINT block_type_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.block_version
    ADD CONSTRAINT block_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.document_block
    ADD CONSTRAINT document_block_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.edit
    ADD CONSTRAINT edit_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.record
    ADD CONSTRAINT record_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.record_type
    ADD CONSTRAINT record_type_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (token_hash);

ALTER TABLE ONLY public.topic_connection
    ADD CONSTRAINT topic_connection_pkey PRIMARY KEY (connection_id);

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.topic_redirect
    ADD CONSTRAINT topic_redirect_pkey PRIMARY KEY (slug);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX block_version_edit_id_block_number_key ON public.block_version USING btree (edit_id, block_number);

CREATE INDEX block_version_topic_id_block_number_idx ON public.block_version USING btree (topic_id, block_number);

CREATE INDEX comment_document_block_id_idx ON public.comment USING btree (document_block_id);

CREATE INDEX comment_edit_id_topic_id_idx ON public.comment USING btree (edit_id, topic_id);

CREATE INDEX comment_reply_to_id_idx ON public.comment USING btree (reply_to_id);

CREATE UNIQUE INDEX comment_topic_id_comment_number_key ON public.comment USING btree (topic_id, comment_number);

CREATE UNIQUE INDEX document_block_file_id_position_key ON public.document_block USING btree (file_id, "position");

CREATE INDEX document_file_id_idx ON public.document USING btree (file_id);

CREATE UNIQUE INDEX edit_id_topic_id_key ON public.edit USING btree (id, topic_id);

CREATE INDEX edit_topic_id_idx ON public.edit USING btree (topic_id);

CREATE UNIQUE INDEX file_key_key ON public.file USING btree (key);

CREATE INDEX session_expires_at_idx ON public.session USING btree (expires_at);

CREATE INDEX session_user_id_idx ON public.session USING btree (user_id);

CREATE INDEX topic_connection_topic_id_expires_at_idx ON public.topic_connection USING btree (topic_id, expires_at);

CREATE INDEX topic_connection_topic_id_mode_expires_at_idx ON public.topic_connection USING btree (topic_id, mode, expires_at);

CREATE INDEX topic_connection_viewer_id_idx ON public.topic_connection USING btree (viewer_id);

CREATE INDEX topic_redirect_edit_id_topic_id_idx ON public.topic_redirect USING btree (edit_id, topic_id);

CREATE INDEX topic_redirect_topic_id_idx ON public.topic_redirect USING btree (topic_id);

CREATE UNIQUE INDEX topic_slug_key ON public.topic USING btree (slug);

CREATE UNIQUE INDEX topic_title_key ON public.topic USING btree (title);

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);

CREATE UNIQUE INDEX user_username_key ON public."user" USING btree (username);

ALTER TABLE ONLY public.block
    ADD CONSTRAINT block_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.block
    ADD CONSTRAINT block_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.block_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.block_version
    ADD CONSTRAINT block_version_edit_id_topic_id_fkey FOREIGN KEY (edit_id, topic_id) REFERENCES public.edit(id, topic_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.block_version
    ADD CONSTRAINT block_version_topic_id_block_number_fkey FOREIGN KEY (topic_id, block_number) REFERENCES public.block(topic_id, block_number) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_block_number_topic_id_fkey FOREIGN KEY (block_number, topic_id) REFERENCES public.block(block_number, topic_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_document_block_id_fkey FOREIGN KEY (document_block_id) REFERENCES public.document_block(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_edit_id_topic_id_fkey FOREIGN KEY (edit_id, topic_id) REFERENCES public.edit(id, topic_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_id_fkey FOREIGN KEY (id) REFERENCES public.record(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.record(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_root_id_fkey FOREIGN KEY (root_id) REFERENCES public.record(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.document_block
    ADD CONSTRAINT document_block_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.file(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.file(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_id_fkey FOREIGN KEY (id) REFERENCES public.block_version(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.edit
    ADD CONSTRAINT edit_id_fkey FOREIGN KEY (id) REFERENCES public.record(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.edit
    ADD CONSTRAINT edit_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_author_id_fkey FOREIGN KEY (author_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_preview_file_id_fkey FOREIGN KEY (preview_file_id) REFERENCES public.file(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_id_fkey FOREIGN KEY (id) REFERENCES public.record(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_reason_id_fkey FOREIGN KEY (reason_id) REFERENCES public.comment(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.record(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.record
    ADD CONSTRAINT record_author_id_fkey FOREIGN KEY (author_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.record
    ADD CONSTRAINT record_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.record_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.topic_connection
    ADD CONSTRAINT topic_connection_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.topic_redirect
    ADD CONSTRAINT topic_redirect_edit_id_topic_id_fkey FOREIGN KEY (edit_id, topic_id) REFERENCES public.edit(id, topic_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.topic_redirect
    ADD CONSTRAINT topic_redirect_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE TABLE public.migration (
    migration_id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    run_date timestamp NOT NULL,
    file_name varchar(255) NOT NULL UNIQUE
);

INSERT INTO public.record_type (id, name) VALUES
    ('comment', 'Comentario'),
    ('edit', 'Edición'),
    ('reaction', 'Reacción');

INSERT INTO public.block_type (id, name) VALUES
    ('documento', 'Documento'),
    ('h1', 'Título de sección'),
    ('h2', 'Título de subsección'),
    ('parrafo', 'Párrafo');
CREATE TABLE public.dataset (
    id text NOT NULL PRIMARY KEY REFERENCES public.block_version(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    title text NOT NULL,
    description text NOT NULL,
    file_id text REFERENCES public.file(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    source_url text,
    columns jsonb NOT NULL CHECK (jsonb_typeof(columns) = 'array' AND jsonb_array_length(columns) > 0),
    csv_options jsonb NOT NULL CHECK (jsonb_typeof(csv_options) = 'object'),
    CONSTRAINT dataset_source_check CHECK ((file_id IS NOT NULL) <> (source_url IS NOT NULL))
);
CREATE INDEX dataset_file_id_idx ON public.dataset(file_id);
INSERT INTO public.block_type(id, name) VALUES ('dataset', 'Conjunto de datos');

CREATE TABLE public.visualization (
    id text NOT NULL PRIMARY KEY REFERENCES public.block_version(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    query text NOT NULL CHECK (btrim(query) <> ''),
    query_language_version integer NOT NULL CHECK (query_language_version = 1),
    spec jsonb NOT NULL CHECK (jsonb_typeof(spec) = 'object')
);

CREATE TABLE public.visualization_dataset (
    visualization_id text NOT NULL REFERENCES public.visualization(id) ON UPDATE CASCADE ON DELETE CASCADE,
    dataset_topic_id text NOT NULL,
    dataset_block_number text NOT NULL,
    PRIMARY KEY (visualization_id, dataset_topic_id, dataset_block_number),
    FOREIGN KEY (dataset_topic_id, dataset_block_number) REFERENCES public.block(topic_id, block_number) ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX visualization_dataset_dataset_idx ON public.visualization_dataset(dataset_topic_id, dataset_block_number);

INSERT INTO public.block_type(id, name) VALUES ('visualizacion', 'Visualización');

CREATE TABLE public.image_asset (
    file_id text PRIMARY KEY REFERENCES public.file(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    width integer NOT NULL CHECK (width > 0),
    height integer NOT NULL CHECK (height > 0)
);
CREATE TABLE public.image (
    id text PRIMARY KEY REFERENCES public.block_version(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    file_id text NOT NULL REFERENCES public.image_asset(file_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    width_percent double precision NOT NULL CHECK (width_percent >= 10 AND width_percent <= 100),
    alignment text NOT NULL CHECK (alignment IN ('left','center','right')),
    flow text NOT NULL CHECK (flow IN ('separate','wrap')),
    alt text NOT NULL CHECK (length(alt) <= 1000),
    caption text NOT NULL CHECK (length(caption) <= 5000),
    CHECK (flow <> 'wrap' OR alignment <> 'center')
);
CREATE INDEX image_file_id_idx ON public.image(file_id);
INSERT INTO public.block_type(id, name) VALUES ('imagen', 'Imagen');

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE TEXT SEARCH CONFIGURATION public.search_simple (COPY = pg_catalog.simple);
ALTER TEXT SEARCH CONFIGURATION public.search_simple ALTER MAPPING FOR hword, hword_part, word WITH public.unaccent, pg_catalog.simple;
CREATE TEXT SEARCH CONFIGURATION public.search_spanish (COPY = pg_catalog.spanish);
ALTER TEXT SEARCH CONFIGURATION public.search_spanish ALTER MAPPING FOR hword, hword_part, word WITH public.unaccent, pg_catalog.spanish_stem;
CREATE TEXT SEARCH DICTIONARY public.search_spanish_all_stem (
    TEMPLATE = pg_catalog.snowball,
    Language = spanish
);
CREATE TEXT SEARCH CONFIGURATION public.search_spanish_all (COPY = public.search_spanish);
ALTER TEXT SEARCH CONFIGURATION public.search_spanish_all
    ALTER MAPPING REPLACE pg_catalog.spanish_stem WITH public.search_spanish_all_stem;

CREATE TABLE public.search_source (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kind text NOT NULL CHECK (kind IN ('block_version', 'topic_title', 'comment', 'document_file', 'dataset_file', 'dataset_url')),
    block_version_id text REFERENCES public.block_version(id) ON DELETE CASCADE,
    title_edit_id text REFERENCES public.edit(id) ON DELETE CASCADE,
    comment_id text REFERENCES public.comment(id) ON DELETE CASCADE,
    file_id text REFERENCES public.file(id) ON DELETE CASCADE,
    source_url text,
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
    CHECK (num_nonnulls(block_version_id, title_edit_id, comment_id, file_id, source_url) = 1),
    CHECK ((kind = 'block_version' AND block_version_id IS NOT NULL)
        OR (kind = 'topic_title' AND title_edit_id IS NOT NULL)
        OR (kind = 'comment' AND comment_id IS NOT NULL)
        OR (kind IN ('document_file', 'dataset_file') AND file_id IS NOT NULL)
        OR (kind = 'dataset_url' AND source_url IS NOT NULL)),
    UNIQUE (block_version_id), UNIQUE (title_edit_id), UNIQUE (comment_id),
    UNIQUE (kind, file_id), UNIQUE (source_url)
);
CREATE INDEX search_source_pending_idx ON public.search_source(retry_at, id)
    WHERE indexed_generation < generation;

CREATE TABLE public.search_entry (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_id bigint NOT NULL REFERENCES public.search_source(id) ON DELETE CASCADE,
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
CREATE INDEX search_entry_current_gin ON public.search_entry USING gin(search_vector)
    WHERE is_visible AND is_current;
CREATE INDEX search_entry_history_gin ON public.search_entry USING gin(search_vector)
    WHERE is_visible;
CREATE INDEX search_entry_current_type_idx ON public.search_entry(block_type_id, id)
    WHERE is_visible AND is_current;
CREATE INDEX search_entry_history_type_idx ON public.search_entry(block_type_id, id)
    WHERE is_visible;

CREATE TABLE public.search_reference (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_id bigint NOT NULL REFERENCES public.search_source(id) ON DELETE CASCADE,
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
CREATE INDEX search_reference_current_idx ON public.search_reference(source_id, topic_id)
    WHERE is_visible AND is_current;
CREATE INDEX search_reference_history_idx ON public.search_reference(source_id, topic_id)
    WHERE is_visible;
CREATE INDEX search_reference_topic_idx ON public.search_reference(topic_id, source_id);
CREATE TABLE public.notification (
    id text PRIMARY KEY,
    recipient_id text NOT NULL REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    actor_id text NOT NULL REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    kind text NOT NULL CHECK (kind IN ('comment', 'reply', 'replica', 'positive_vote', 'edit')),
    source_id text NOT NULL,
    topic_id text NOT NULL REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    block_number text,
    target_id text NOT NULL,
    document_block_id text,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at timestamptz,
    UNIQUE (recipient_id, kind, source_id)
);

CREATE INDEX notification_recipient_created_idx ON public.notification(recipient_id, created_at DESC, id DESC);
CREATE INDEX notification_recipient_unread_idx ON public.notification(recipient_id) WHERE read_at IS NULL;
