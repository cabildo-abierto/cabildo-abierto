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
