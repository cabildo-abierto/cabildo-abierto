CREATE TABLE public.api_token (
    id uuid PRIMARY KEY,
    user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 80),
    token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
    token_prefix text NOT NULL CHECK (length(token_prefix) = 11),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL CHECK (expires_at > created_at)
);
CREATE INDEX api_token_user_idx ON public.api_token(user_id, created_at DESC);
