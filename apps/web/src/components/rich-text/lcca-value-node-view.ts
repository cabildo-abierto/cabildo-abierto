import type {NodeViewConstructor} from "prosemirror-view";
import {NodeSelection} from "prosemirror-state";
import {parseLccaValueAttrs, type LccaValueAttrs} from "@cabildo-abierto/utils";
import {richTextSchema} from "./rich-text-schema";

export type LccaValueMount = {id: string; dom: HTMLElement; attrs: LccaValueAttrs; select: () => void};

export function lccaValueNodeView(onMount: (mount: LccaValueMount) => void, onDestroy: (dom: HTMLElement) => void, onSelect: () => void): NodeViewConstructor {
    return (node, view, getPos) => {
        const dom = document.createElement("span");
        const id = crypto.randomUUID();
        dom.contentEditable = "false";
        const select = () => {
            const position = getPos();
            if (position === undefined) return;
            view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, position)));
            onSelect();
        };
        const render = (attrs: LccaValueAttrs) => {
            dom.dataset.lccaValue = JSON.stringify(attrs);
            onMount({id, dom, attrs, select});
        };
        render(parseLccaValueAttrs(node.attrs)!);
        return {
            dom,
            update: nextNode => {
                if (nextNode.type !== richTextSchema.nodes.lcca_value) return false;
                if (!nextNode.eq(node)) {
                    node = nextNode;
                    render(parseLccaValueAttrs(node.attrs)!);
                }
                return true;
            },
            ignoreMutation: () => true,
            stopEvent: event => event.target instanceof Element && !!event.target.closest("button"),
            destroy: () => onDestroy(dom),
        };
    };
}
