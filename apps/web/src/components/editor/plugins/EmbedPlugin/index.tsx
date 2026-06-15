import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
    $createParagraphNode,
    $createRangeSelection, $getRoot,
    $getSelection,
    $insertNodes,
    $isNodeSelection, $isParagraphNode,
    $isRootOrShadowRoot,
    $setSelection,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    LexicalCommand,
    LexicalEditor, RootNode,
} from 'lexical';
import {useEffect} from 'react';
import {CAN_USE_DOM} from '../../shared/canUseDOM';

import {
    $createEmbedNode,
    $isEmbedNode,
    EmbedNode,
    EmbedPayload
} from '../../nodes/EmbedNode';
import {$isSidenoteNode} from "../../nodes/SidenoteNode";
import {$isCustomMarkNode} from "../../nodes/CustomMarkNode";

export type InsertEmbedPayload = Readonly<EmbedPayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
    CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_EMBED_COMMAND: LexicalCommand<InsertEmbedPayload> =
    createCommand('INSERT_EMBED_COMMAND');



export default function EmbedPlugin() {
    const [editor] = useLexicalComposerContext();

    const TRANSPARENT_IMAGE =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    const img = document.createElement('img');
    img.src = TRANSPARENT_IMAGE;

    function $onDragStart(event: DragEvent): boolean {
        const node = $getVisualizationNodeInSelection();
        if (!node) {
            return false;
        }
        const dataTransfer = event.dataTransfer;
        if (!dataTransfer) {
            return false;
        }
        dataTransfer.setData('text/plain', '_');
        dataTransfer.setDragImage(img, 0, 0);
        dataTransfer.setData(
            'application/x-lexical-drag',
            JSON.stringify({
                data: {
                    spec: node.__spec
                },
                type: 'image',
            }),
        );

        return true;
    }

    useEffect(() => {
        if (!editor.hasNodes([EmbedNode])) {
            throw new Error('PlotPlugin: VisualizationNode not registered on editor');
        }

        return mergeRegister(
            editor.registerCommand<InsertEmbedPayload>(
                INSERT_EMBED_COMMAND,
                (payload) => {
                    const visualizationNode = $createEmbedNode(payload)
                    $insertNodes([visualizationNode])
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
            editor.registerCommand<DragEvent>(
                DRAGSTART_COMMAND,
                (event) => {
                    return $onDragStart(event);
                },
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand<DragEvent>(
                DRAGOVER_COMMAND,
                (event) => {
                    return $onDragover(event);
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<DragEvent>(
                DROP_COMMAND,
                (event) => {
                    return $onDrop(event, editor);
                },
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerNodeTransform(EmbedNode, (node) => {
                if(editor.isEditable()){
                    const parent = node.getParent();
                    if (parent && !$isRootOrShadowRoot(parent) && !$isSidenoteNode(parent) && !$isCustomMarkNode(parent)) {
                        const grandParent = parent.getParent();
                        const clone = EmbedNode.clone(node);
                        node.remove();

                        if (grandParent && $isRootOrShadowRoot(grandParent)) {
                            parent.insertAfter(clone);
                        } else {
                            const root = $getRoot();
                            root.append(clone);
                        }
                    }
                }
            }),
            editor.registerNodeTransform(RootNode, (node) => {
                if(editor.isEditable()){
                    const children = node.getChildren()
                    if(children.length > 0) {
                        const last = children[children.length - 1]
                        if(!$isParagraphNode(last)) {
                            const p = $createParagraphNode()
                            last.insertAfter(p)
                        }
                    }
                }
            })
        )
    }, [editor]);

    return null;
}

function $onDragover(event: DragEvent): boolean {
    const node = $getVisualizationNodeInSelection();
    if (!node) {
        return false;
    }
    if (!canDropImage(event)) {
        event.preventDefault();
    }
    return true;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
    const node = $getVisualizationNodeInSelection();
    if (!node) {
        return false;
    }
    const data = getDragImageData(event);
    if (!data) {
        return false;
    }
    event.preventDefault();
    if (canDropImage(event)) {
        const range = getDragSelection(event);
        node.remove();
        const rangeSelection = $createRangeSelection();
        if (range !== null && range !== undefined) {
            rangeSelection.applyDOMRange(range);
        }
        $setSelection(rangeSelection);
        editor.dispatchCommand(INSERT_EMBED_COMMAND, data);
    }
    return true;
}

function $getVisualizationNodeInSelection(): EmbedNode | null {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
        return null;
    }
    const nodes = selection.getNodes();
    const node = nodes[0];
    return $isEmbedNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertEmbedPayload {
    const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
    if (!dragData) {
        return null;
    }
    const {type, data} = JSON.parse(dragData);
    if (type !== 'image') {
        return null;
    }

    return data;
}

function canDropImage(event: DragEvent): boolean {
    const target = event.target;
    return !!(
        target &&
        target instanceof HTMLElement &&
        !target.closest('code, span.editor-image') &&
        target.parentElement &&
        target.parentElement.closest('div.ContentEditable__root')
    );
}

function getDragSelection(event: DragEvent & {rangeOffset?: number, rangeParent?: Node}): Range | null | undefined {
    let range;
    const target = event.target as null | Element | Document;
    const targetWindow =
        target == null
            ? null
            : target.nodeType === 9
                ? (target as Document).defaultView
                : (target as Element).ownerDocument.defaultView;
    const domSelection = getDOMSelection(targetWindow);
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
    } else if (event.rangeParent && domSelection !== null) {
        domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
        range = domSelection.getRangeAt(0);
    } else {
        throw Error(`Cannot get the selection when dragging`);
    }

    return range;
}
