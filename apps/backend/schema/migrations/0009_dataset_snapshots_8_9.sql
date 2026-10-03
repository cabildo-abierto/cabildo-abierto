CREATE TABLE public.dataset_source (
    id text PRIMARY KEY,
    file_id text REFERENCES public.file(id) ON DELETE CASCADE,
    source_url text,
    snapshot_id uuid,
    checked_at timestamptz,
    etag text,
    last_modified text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','checking','preparing','ready','failed')),
    error text,
    lease_token uuid,
    lease_until timestamptz,
    CHECK ((file_id IS NULL) <> (source_url IS NULL))
);
CREATE TABLE public.dataset_snapshot (
    id uuid PRIMARY KEY,
    source_id text NOT NULL REFERENCES public.dataset_source(id) ON DELETE CASCADE,
    bucket text NOT NULL,
    key text NOT NULL UNIQUE,
    content_hash text NOT NULL,
    columns jsonb NOT NULL,
    csv_options jsonb NOT NULL,
    row_count integer NOT NULL CHECK (row_count >= 0),
    size_bytes bigint NOT NULL,
    column_bytes jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    retired_at timestamptz
);
ALTER TABLE public.dataset_source ADD CONSTRAINT dataset_source_snapshot_fk FOREIGN KEY (snapshot_id) REFERENCES public.dataset_snapshot(id);
CREATE INDEX dataset_snapshot_retired_idx ON public.dataset_snapshot(retired_at) WHERE retired_at IS NOT NULL;
