import {createBeautifulMentionNode} from "lexical-beautiful-mentions";
import {CustomMentionComponent} from "../ui/custom-mention-component";
import PlaygroundNodes from "./PlaygroundNodes";
import {ImageNode} from "./ImageNode";
import {VisualizationNode} from "./VisualizationNode";
import {CustomMarkNode} from "./CustomMarkNode";
import {SidenoteNode} from "./SidenoteNode";
import {MarkNode} from "@lexical/mark";
import {DiffNode} from "./DiffNode";
import {AuthorNode} from "./AuthorNode";
import {CustomTableNode} from "./CustomTableNode";
import {TableNode} from "@lexical/table";
import {KlassConstructor, LexicalNode, LexicalNodeReplacement} from "lexical";

export function getEditorNodes(settings: { allowImages: boolean }): readonly (KlassConstructor<typeof LexicalNode> | LexicalNodeReplacement)[] {
    const {allowImages} = settings

    return [
        ...createBeautifulMentionNode(CustomMentionComponent),
        ...PlaygroundNodes,
        ...(allowImages ? [ImageNode] : []),
        VisualizationNode,
        CustomMarkNode,
        SidenoteNode,
        {
            replace: MarkNode,
            with: (node: MarkNode) => {
                return new CustomMarkNode(node.getIDs());
            }
        },
        DiffNode,
        AuthorNode,
        CustomTableNode,
        { replace: TableNode, with: (_: TableNode) => new CustomTableNode(), withKlass: CustomTableNode }
    ]
}