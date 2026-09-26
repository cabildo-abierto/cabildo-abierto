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
