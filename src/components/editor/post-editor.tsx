import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import {SettingsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {EditorState, LexicalEditor} from "lexical";
import {getPlainText} from "@/components/topics/topic/diff";
import {getEditorSettings} from "@/components/editor/settings";
import {$dfs} from "@lexical/utils";
import { $isLinkNode } from "@lexical/link";
import {setsEqual} from "chart.js/helpers";

const MyLexicalEditor = dynamic(() => import('../../../modules/ca-lexical-editor/src/lexical-editor'), {
    ssr: false,
    loading: () => <></>,
})


const settings: SettingsProps = getEditorSettings({
    placeholder: "¿Qué está pasando?",
    placeholderClassName: "text-[var(--text-light)] absolute top-0",
    editorClassName: "link relative",
    isReadOnly: false,
    isRichText: false
})


type PostEditorProps = {
    placeholder: string
    setText: (t: string) => void
    setExternalEmbed: (e: string) => void
}



function getLinksFromEditor(editor: LexicalEditor) {
    const links: string[] = []
    editor.read(() => {
        const nodes = $dfs()
        nodes.forEach(n => {
            if($isLinkNode(n.node)){
                links.push(n.node.getURL())
            }
        })
    })
    return links
}



export const PostEditor = ({setText, setExternalEmbed, placeholder}: PostEditorProps) => {
    const [editorState, setEditorState] = useState<EditorState | null>(null)
    const [editor, setEditor] = useState<LexicalEditor | null>(null)
    const [links, setLinks] = useState<string[]>([])

    useEffect(() => {
        if(editorState){
            let text = getPlainText(editorState.toJSON().root)
            if(text.endsWith("\n")) text = text.slice(0, text.length-1)
            setText(text)

            const newLinks = getLinksFromEditor(editor)
            for(let i = 0; i < newLinks.length; i++){
                const l = newLinks[i]
                if(!links.includes(l)){
                    setExternalEmbed(l)
                    break
                }
            }
            if(!setsEqual(new Set(newLinks), new Set(links))){
                setLinks(newLinks)
            }
        }
    }, [editorState, setText, editor, links, setExternalEmbed])

    return <MyLexicalEditor
        setEditor={setEditor}
        setEditorState={setEditorState}
        settings={{...settings, placeholder}}
    />
}