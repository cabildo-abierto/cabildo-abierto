import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useEffect} from "react";
import {mergeRegister} from "@lexical/utils";
import {$createBeautifulMentionNode} from "lexical-beautiful-mentions";
import {LinkNode} from "@lexical/link";
import {isValidHandle} from "@atproto/syntax";


export default function MentionsToLinksPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {

        return mergeRegister(
            editor.registerNodeTransform(LinkNode, (node) => {
                if (editor.isEditable()) {
                    const url = node.getURL()
                    if(url.startsWith("/perfil/")) {
                        const handle = url.replace("/perfil/", "")
                        if(isValidHandle(handle)) {
                            const mention = $createBeautifulMentionNode("@", handle, {
                                handle
                            })
                            node.replace(mention)
                            mention.selectEnd()
                        }
                    }
                }
            })
        )
    }, [editor])

    return <>

    </>
}
