import {createHash} from 'node:crypto';
import type {Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import type {TopicAttachmentsOutput, TopicReadingOutput} from '@cabildo-abierto/api';
import {blockRichTextContents, isAttachmentBlock, parseFootnoteAttrs, parseRichTextContent, richTextInlineNodes} from '@cabildo-abierto/utils';
import {loadConvergedBlocks, topicConvergenceReferences, topicConvergencePage} from './topic-convergence.js';
import {searchAttachments} from './search/attachments.js';

export async function topicReading(database: Transaction<DB>, topicId: string): Promise<TopicReadingOutput> {
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
    return {blocks: activeBlocks, deletedBlocks: blocks.filter(block => block.deleted), footnoteAttachments,
        attachments: {documento: summary('documento'), dataset: summary('dataset')}};
}

export async function topicAttachments(database: Transaction<DB>, topicId: string, type: 'documento' | 'dataset', search: string, requestedPage: number, includeDeleted: boolean): Promise<TopicAttachmentsOutput> {
    if (search.trim()) {
        const {results, ...pagination} = await searchAttachments(database, {q: search, type, topicId, page: requestedPage});
        const references = results.map(({id, blockNumber, typeId, order, deleted}) => ({id, blockNumber, typeId, order, deleted}));
        return {...pagination, blocks: await loadConvergedBlocks(database, references)};
    }
    const {references, ...pagination} = await topicConvergencePage(database,topicId,type,requestedPage,includeDeleted);
    return {blocks: await loadConvergedBlocks(database, references), ...pagination};
}
