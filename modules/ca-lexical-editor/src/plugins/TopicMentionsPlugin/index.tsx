import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useEffect} from "react";
import {mergeRegister} from "@lexical/utils";
import {CustomLinkNode} from "../../nodes/CustomLinkNode";
import {$createTopicMentionNode, TopicMentionNode} from "../../nodes/TopicMentionNode";
import {AutoLinkNode} from "@lexical/link";
import {
    $getSelection, $isElementNode, $isRangeSelection, $isTextNode,
    COMMAND_PRIORITY_HIGH,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND
} from "lexical";
import {isTopicUrl} from "../../get-initial-data";


export default function TopicMentionsPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {

        const removeNodeIfSelected = (direction: "delete" | "backspace") => () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

            const anchor = selection.anchor;
            const anchorNode = anchor.getNode();
            const anchorOffset = anchor.offset;

            if (direction === "delete") {
                // Check if caret is at the end of a text node
                if ($isTextNode(anchorNode) && anchorOffset === anchorNode.getTextContentSize()) {
                    const parent = anchorNode.getParentOrThrow();
                    const siblings = parent.getChildren();
                    const anchorIndex = siblings.findIndex(child => child.__key === anchorNode.__key);

                    if (anchorIndex !== -1 && anchorIndex + 1 < siblings.length) {
                        const nextNode = siblings[anchorIndex + 1];

                        if (nextNode instanceof TopicMentionNode) {
                            nextNode.remove();
                            return true;
                        }
                    }
                }

                // Handle caret at end of an element node (e.g., paragraph)
                if ($isElementNode(anchorNode) && anchorOffset === anchorNode.getChildrenSize()) {
                    const children = anchorNode.getChildren();
                    if (children.length > 0) {
                        const nextNode = children[anchorOffset];
                        if (nextNode instanceof TopicMentionNode) {
                            nextNode.remove();
                            return true;
                        }
                    }
                }
            }

            if (direction === "backspace") {
                if ($isTextNode(anchorNode) && anchorOffset === 0) {
                    const parent = anchorNode.getParentOrThrow();
                    const siblings = parent.getChildren();
                    const anchorIndex = siblings.findIndex(child => child.__key === anchorNode.__key);

                    if (anchorIndex > 0) {
                        const prevNode = siblings[anchorIndex - 1];

                        if (prevNode instanceof TopicMentionNode) {
                            prevNode.remove();
                            return true;
                        }
                    }
                }

                if ($isElementNode(anchorNode) && anchorOffset === 0) {
                    const children = anchorNode.getChildren();
                    if (children.length > 0) {
                        const prevNode = children[anchorOffset - 1];
                        if (prevNode instanceof TopicMentionNode) {
                            prevNode.remove();
                            return true;
                        }
                    }
                }
            }

            return false;
        };


        return mergeRegister(
            editor.registerNodeTransform(CustomLinkNode, (node) => {
                if(editor.isEditable()){
                    const url = node.getURL()

                    if(isTopicUrl(url)){
                        const newNode = $createTopicMentionNode({url})
                        node.replace(newNode)
                        newNode.selectEnd()
                    }
                }
            }),
            editor.registerNodeTransform(AutoLinkNode, (node) => {
                if(editor.isEditable()) {
                    const url = node.getURL()
                    if(isTopicUrl(url)){
                        const newNode = $createTopicMentionNode({url})
                        node.replace(newNode)
                        newNode.selectEnd()
                    }
                }

            }),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                removeNodeIfSelected("backspace"),
                COMMAND_PRIORITY_HIGH
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                removeNodeIfSelected("delete"),
                COMMAND_PRIORITY_HIGH
            )
        )

    }, [editor])

    return <>

    </>
}
