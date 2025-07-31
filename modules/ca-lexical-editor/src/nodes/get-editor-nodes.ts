import {createBeautifulMentionNode} from "lexical-beautiful-mentions";
import {CustomMentionComponent} from "../ui/custom-mention-component";
import {ImageNode} from "./ImageNode";
import {EmbedNode} from "./EmbedNode";
import {CustomMarkNode} from "./CustomMarkNode";
import {SidenoteNode} from "./SidenoteNode";
import {MarkNode} from "@lexical/mark";
import {DiffNode} from "./DiffNode";
import {AuthorNode} from "./AuthorNode";
import {CustomTableNode} from "./CustomTableNode";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {KlassConstructor, LexicalNode, LexicalNodeReplacement} from "lexical";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import {ListItemNode, ListNode} from "@lexical/list";
import {HashtagNode} from "@lexical/hashtag";
import {OverflowNode} from "@lexical/overflow";
import {HorizontalRuleNode} from "@lexical/react/LexicalHorizontalRuleNode";
import {LayoutContainerNode} from "./LayoutContainerNode";
import {LayoutItemNode} from "./LayoutItemNode";
import {CustomLinkNode} from "./CustomLinkNode";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {TopicMentionNode} from "./TopicMentionNode";

export function getEditorNodes(settings: { allowImages: boolean, topicMentions: boolean }): readonly (KlassConstructor<typeof LexicalNode> | LexicalNodeReplacement)[] {
    const {allowImages, topicMentions} = settings

    return [
        ...createBeautifulMentionNode(CustomMentionComponent),
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        HashtagNode,
        OverflowNode,
        HorizontalRuleNode,
        LayoutContainerNode,
        LayoutItemNode,
        ...(allowImages ? [ImageNode] : []),
        ...(topicMentions ? [TopicMentionNode] : []),
        EmbedNode,
        CustomMarkNode,
        SidenoteNode,
        CustomLinkNode,
        AutoLinkNode,
        {
            replace: LinkNode,
            with: (node: LinkNode) => {
                return new CustomLinkNode(node.getURL(), {
                    rel: node.getRel(), target: node.getTarget(), title: node.getTitle()
                })
            }
        },
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