ALTER TABLE public.notification DROP CONSTRAINT notification_kind_check;
ALTER TABLE public.notification ADD CONSTRAINT notification_kind_check
    CHECK (kind IN ('comment', 'reply', 'replica', 'rejection', 'positive_vote', 'edit', 'topic_invitation'));
ALTER TABLE public.notification ADD COLUMN invitation_id uuid REFERENCES public.topic_invitation(id) ON DELETE CASCADE;
ALTER TABLE public.notification ADD CONSTRAINT notification_invitation_check
    CHECK ((kind = 'topic_invitation') = (invitation_id IS NOT NULL));
CREATE UNIQUE INDEX notification_invitation_idx ON public.notification(invitation_id) WHERE invitation_id IS NOT NULL;
