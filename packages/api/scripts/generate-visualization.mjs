import {readFile, writeFile} from 'node:fs/promises';
import {compile} from 'json-schema-to-typescript';
const schema = JSON.parse(await readFile(new URL('../../../schemas/visualization/spec_v1.schema.json', import.meta.url), 'utf8'));
await writeFile(new URL('../src/types/generated/visualization.ts', import.meta.url), await compile(schema, 'VisualizationSpecV1', {ignoreMinAndMaxItems: true, additionalProperties: false, bannerComment: '/* Generated from schemas/visualization/spec_v1.schema.json. */'}));
await writeFile(new URL('../../utils/src/generated/visualization-schema.ts', import.meta.url), '/* Generated from schemas/visualization/spec_v1.schema.json. */\nexport const visualizationSchema = ' + JSON.stringify(schema, null, 2) + ';\n');
