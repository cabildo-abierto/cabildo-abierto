
insert into "User" ("did", "inCA", "hasAccess", "platformAdmin")
values ('did:plc:2semihha42b7efhu4ywv7whi', true, true, true)
on conflict do nothing;


insert into "UserConfig" ("id", "label", "default")
    values ('at_scope', 'at_scope', 'atproto transition:generic transition:email')
    on conflict do nothing;
