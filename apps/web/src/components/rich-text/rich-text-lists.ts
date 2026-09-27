import type {Command} from 'prosemirror-state';
import {Selection, TextSelection} from 'prosemirror-state';
import {liftListItem, wrapInList} from 'prosemirror-schema-list';
import {richTextSchema} from './rich-text-schema';

export type RichTextListType = 'bullet_list' | 'ordered_list';

export function activeListType(selection: Selection): RichTextListType | null {
    for (let depth = selection.$from.depth; depth > 0; depth--) {
        const type = selection.$from.node(depth).type.name;
        if (type === 'bullet_list' || type === 'ordered_list') return type;
    }
    return null;
}

export function toggleList(type: RichTextListType): Command {
    return (state, dispatch) => {
        if (!(state.selection instanceof TextSelection)) return false;
        const {from, to, $to} = state.selection;
        if (to > from && ($to.parentOffset === 0 || state.doc.nodeAt(to - 1)?.type === richTextSchema.nodes.hard_break)) {
            state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, from, to - 1)));
        }
        const currentType = activeListType(state.selection);
        const listRange = state.selection.$from.blockRange(state.selection.$to, node => node.firstChild?.type === richTextSchema.nodes.list_item);
        const transaction = state.tr;
        const run = (command: Command, localSelection?: TextSelection) => {
            let current = state.apply(transaction);
            if (localSelection) current = current.apply(current.tr.setSelection(localSelection));
            const originalSelection = transaction.selection;
            return command(current, next => {
                next.steps.forEach(step => transaction.step(step));
                transaction.setSelection(localSelection ? originalSelection.map(transaction.doc, next.mapping)
                    : Selection.fromJSON(transaction.doc, next.selection.toJSON()));
                if (next.storedMarks) transaction.setStoredMarks(next.storedMarks);
            });
        };
        if (currentType && listRange) {
            if (currentType === type) {
                if (!run(liftListItem(richTextSchema.nodes.list_item))) return false;
            } else {
                const {from, to, $from} = state.selection;
                const range = listRange;
                const list = range.parent;
                const position = $from.before(range.depth);
                const startOffset = range.start - position - 1;
                const endOffset = range.end - position - 1;
                const before = range.startIndex ? list.copy(list.content.cut(0, startOffset)) : null;
                const selected = richTextSchema.nodes[type].create(null, list.content.cut(startOffset, endOffset));
                const after = range.endIndex < list.childCount ? list.type.create(
                    list.type === richTextSchema.nodes.ordered_list ? {order: list.attrs.order + range.endIndex} : list.attrs,
                    list.content.cut(endOffset),
                ) : null;
                transaction.replaceWith(position, position + list.nodeSize, [before, selected, after].filter(node => node !== null));
                const offset = position + (before?.nodeSize ?? 0) + 1 - range.start;
                transaction.setSelection(TextSelection.create(transaction.doc, from + offset, to + offset));
            }
        } else {
            // Selections crossing existing lists and plain text are lifted first,
            // preserving the original selection as each structural change is mapped.
            for (;;) {
                let paragraphPosition: number | null = null;
                transaction.doc.nodesBetween(transaction.selection.from, transaction.selection.to, (node, position) => {
                    if (paragraphPosition !== null) return false;
                    if (node.type === richTextSchema.nodes.paragraph && activeListType(TextSelection.create(transaction.doc, position + 1))) {
                        paragraphPosition = position;
                        return false;
                    }
                });
                if (paragraphPosition === null) break;
                if (!run(liftListItem(richTextSchema.nodes.list_item), TextSelection.create(transaction.doc, paragraphPosition + 1))) return false;
            }
            // Existing paragraphs use hard breaks: split their lines before wrapping
            // only the selected line range into list items.
            const {from, to} = transaction.selection;
            const doc = transaction.doc;
            const mappingStart = transaction.mapping.maps.length;
            const breaks: number[] = [];
            const fromAssociation = doc.nodeAt(from)?.type === richTextSchema.nodes.hard_break ? -1 : 1;
            doc.nodesBetween(from, to, (node, position) => {
                if (node.type !== richTextSchema.nodes.paragraph) return;
                node.forEach((child, offset) => {
                    if (child.type === richTextSchema.nodes.hard_break) breaks.push(position + 1 + offset);
                });
                return false;
            });
            for (const position of breaks.reverse()) {
                transaction.delete(position, position + 1);
                transaction.split(position);
            }
            const mapping = transaction.mapping.slice(mappingStart);
            const selectedFrom = mapping.map(from, fromAssociation);
            const selectedTo = mapping.map(to, from === to ? fromAssociation : -1);
            transaction.setSelection(TextSelection.create(transaction.doc, selectedFrom, selectedTo));
            if (!run(wrapInList(richTextSchema.nodes[type]))) return false;
        }
        dispatch?.(transaction.scrollIntoView());
        return true;
    };
}
