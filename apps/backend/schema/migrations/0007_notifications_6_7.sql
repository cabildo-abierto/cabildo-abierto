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
