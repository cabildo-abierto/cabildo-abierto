-- This is an empty migration.

INSERT INTO "EventType" (id, name) VALUES ('seen_notifications', 'Seen notifications')
    ON CONFLICT DO NOTHING;