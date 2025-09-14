./node_modules/.bin/lex gen-api --yes ./src/lex-api \
  ../ca-server/lexicons/ar/cabildoabierto/actor/* \
  ../ca-server/lexicons/ar/cabildoabierto/data/* \
  ../ca-server/lexicons/ar/cabildoabierto/embed/* \
  ../ca-server/lexicons/ar/cabildoabierto/feed/* \
  ../ca-server/lexicons/ar/cabildoabierto/wiki/* \
  ../ca-server/lexicons/ar/cabildoabierto/label/* \
  ../ca-server/lexicons/ar/cabildoabierto/notification/* \
  ../ca-server/lexicons/com/atproto/label/* \
  ../ca-server/lexicons/com/atproto/repo/* \
  ../ca-server/lexicons/app/bsky/feed/* \
  ../ca-server/lexicons/app/bsky/graph/* \
  ../ca-server/lexicons/app/bsky/actor/* \
  ../ca-server/lexicons/app/bsky/embed/* \
  ../ca-server/lexicons/app/bsky/labeler/* \
  ../ca-server/lexicons/app/bsky/richtext/*

node fix-imports.js
