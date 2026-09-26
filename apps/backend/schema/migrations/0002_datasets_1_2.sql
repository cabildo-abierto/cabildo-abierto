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
