ALTER TABLE public.topic ADD COLUMN visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private'));

CREATE TABLE public.topic_member (
    topic_id text NOT NULL REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('member', 'admin')),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (topic_id, user_id)
);
CREATE INDEX topic_member_user_idx ON public.topic_member(user_id, topic_id);

CREATE TABLE public.topic_invitation (
    id uuid PRIMARY KEY,
    topic_id text NOT NULL REFERENCES public.topic(id) ON UPDATE CASCADE ON DELETE CASCADE,
    recipient_id text NOT NULL REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    inviter_id text NOT NULL REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    role text NOT NULL CHECK (role IN ('member', 'admin')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    CHECK ((status = 'pending') = (resolved_at IS NULL))
);
CREATE UNIQUE INDEX topic_invitation_pending_idx ON public.topic_invitation(topic_id, recipient_id) WHERE status = 'pending';
CREATE INDEX topic_invitation_recipient_idx ON public.topic_invitation(recipient_id, created_at DESC);
