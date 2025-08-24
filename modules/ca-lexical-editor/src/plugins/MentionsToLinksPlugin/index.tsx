import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useEffect} from "react";
import {mergeRegister} from "@lexical/utils";
import {$createCustomLinkNode} from "../../nodes/CustomLinkNode";
import {profileUrl} from "@/utils/uri";
import {CustomBeautifulMentionNode} from "lexical-beautiful-mentions";
import {$createTextNode} from "lexical";


export default function MentionsToLinksPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {

    return mergeRegister(
        editor.registerNodeTransform(CustomBeautifulMentionNode, (node) => {
          if(editor.isEditable()){
            const name = node.__value
            const url = profileUrl(name)

            const newNode = $createCustomLinkNode(url)
            newNode.append($createTextNode(`@${name}`))
            node.replace(newNode)
            newNode.selectEnd()
          }
        })
    )
  }, [editor])

  return <>

  </>
}
