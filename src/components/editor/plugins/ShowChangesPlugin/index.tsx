import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RootNode } from "lexical";
import { useEffect } from "react";
import { useContent } from "src/app/hooks/contents"
import { diff } from "src/components/diff";



export const ShowChangesPlugin = ({withRespectToContentId}: {withRespectToContentId: string}) => {
    const [editor] = useLexicalComposerContext();
    const prevContent = useContent(withRespectToContentId)

    editor.registerNodeTransform(RootNode, (root) => {
        //console.log("root is", root)
    })
    /*useEffect(() => {
        if(prevContent.isLoading){
            return null
        }
        const prevState = JSON.parse(prevContent.content.text)

        const state = JSON.parse(JSON.stringify(editor.getEditorState()))
    
        const {matches, newNodes, removedNodes} = diff(prevState, state)
        console.log(matches, newNodes, removedNodes)
    }, [editor, prevContent])*/

    return null
}