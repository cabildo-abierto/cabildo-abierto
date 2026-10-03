ALTER TABLE public.notification DROP CONSTRAINT notification_kind_check;
ALTER TABLE public.notification ADD CONSTRAINT notification_kind_check
    CHECK (kind IN ('comment', 'reply', 'replica', 'rejection', 'positive_vote', 'edit'));
