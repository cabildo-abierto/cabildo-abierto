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
