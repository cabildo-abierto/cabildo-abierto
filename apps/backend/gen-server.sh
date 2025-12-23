./node_modules/.bin/lex gen-server --yes ./src/server \
  ../../lexicons/ar/cabildoabierto/actor/* \
  ../../lexicons/ar/cabildoabierto/data/* \
  ../../lexicons/ar/cabildoabierto/embed/* \
  ../../lexicons/ar/cabildoabierto/feed/* \
  ../../lexicons/ar/cabildoabierto/wiki/* \
  ../../lexicons/ar/cabildoabierto/label/* \
  ../../lexicons/ar/cabildoabierto/notification/* \
  ../../lexicons/com/atproto/repo/* \
  ../../lexicons/com/atproto/identity/* \
  ../../lexicons/com/atproto/label/* \
  ../../lexicons/com/atproto/server/* \
  ../../lexicons/com/atproto/moderation/* \
  ../../lexicons/com/atproto/lexicon/* \
  ../../lexicons/com/atproto/sync/* \
  ../../lexicons/com/atproto/temp/* \
  ../../lexicons/com/atproto/admin/* \
  ../../lexicons/app/bsky/feed/* \
  ../../lexicons/app/bsky/embed/* \
  ../../lexicons/app/bsky/graph/* \
  ../../lexicons/app/bsky/labeler/* \
  ../../lexicons/app/bsky/notification/* \
  ../../lexicons/app/bsky/unspecced/* \
  ../../lexicons/app/bsky/video/* \
  ../../lexicons/app/bsky/actor/* \
  ../../lexicons/app/bsky/richtext/* \
  ../../lexicons/chat/bsky/convo/* \
  ../../lexicons/chat/bsky/actor/* \
  ../../lexicons/chat/bsky/moderation/*

#node fix-imports.mjs
#cd ../cabildo-abierto && node fix-imports.js
