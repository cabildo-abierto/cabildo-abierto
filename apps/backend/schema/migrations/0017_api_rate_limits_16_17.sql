CREATE TABLE public.api_rate_limit (
    policy text NOT NULL,
    client_key text NOT NULL,
    hits integer NOT NULL CHECK (hits >= 0),
    expires_at timestamptz NOT NULL,
    PRIMARY KEY (policy, client_key)
);
CREATE INDEX api_rate_limit_expires_idx ON public.api_rate_limit(expires_at);
