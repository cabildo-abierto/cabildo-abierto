import {TopicActionError} from './topic-title-edits.js';
import {createHash} from 'node:crypto';
import type {Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import type {TopicBlocksOutput} from '@cabildo-abierto/api';
import {blockRichTextContents, isAttachmentBlock, parseFootnoteAttrs, parseRichTextContent, richTextInlineNodes} from '@cabildo-abierto/utils';
import {loadConvergedBlocks, topicConvergenceReferences} from './topic-convergence.js';

export async function topicBlocks(database: Transaction<DB>, topicId: string): Promise<TopicBlocksOutput> {
    const references = await topicConvergenceReferences(database, topicId);
    const blocks = await loadConvergedBlocks(database, references.filter(block => !isAttachmentBlock(block.typeId)));
    const activeBlocks = blocks.filter(block => !block.deleted);
    const footnoteTargets = new Set<string>();
    for (const block of activeBlocks) {
        for (const content of blockRichTextContents(block)) {
            const richText = parseRichTextContent(content);
            for (const node of richText ? richTextInlineNodes(richText.doc) : []) {
                if (node.type !== 'footnote') continue;
                const note = parseFootnoteAttrs(node.attrs);
                if (note?.kind === 'document' || note?.kind === 'dataset') footnoteTargets.add(note.blockNumber);
            }
        }
    }
    const footnoteAttachments = await loadConvergedBlocks(database, references.filter(block =>
        !block.deleted && isAttachmentBlock(block.typeId) && footnoteTargets.has(block.blockNumber)));
    const summary = (type: 'documento' | 'dataset') => {
        const selected = references.filter(block => block.typeId === type);
        return {
            count: selected.filter(block => !block.deleted).length,
            deletedCount: selected.filter(block => block.deleted).length,
            revision: createHash('sha256').update(JSON.stringify(selected)).digest('hex'),
        };
    };
    const blockTypes = await database.selectFrom('block_type').select(['id', 'name'])
        .where('id', 'in', ['parrafo', 'h1', 'h2', 'documento', 'dataset', 'visualizacion', 'imagen', 'tabla']).orderBy('id').execute();
    return {blockTypes: blockTypes as TopicBlocksOutput['blockTypes'], blocks: activeBlocks, deletedBlocks: blocks.filter(block => block.deleted), footnoteAttachments,
        attachments: {documento: summary('documento'), dataset: summary('dataset')}};
}

export async function topicBlock(database: Transaction<DB>, topicId: string, blockNumber: string) {
    const references = await topicConvergenceReferences(database, topicId, undefined, [blockNumber]);
    const [block] = await loadConvergedBlocks(database, references);
    if (!block) throw new TopicActionError(404, 'No encontramos ese bloque.');
    return {block};
}
