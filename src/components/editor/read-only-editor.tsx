import { InitialEditorStateType } from "@lexical/react/LexicalComposer"

import { SettingsProps } from "./lexical-editor"

import dynamic from "next/dynamic";
import { UserProps } from "@/actions/get-user";
import { ContentProps } from "@/actions/get-content";
const MyLexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );


export const ReadOnlyEditor = ({initialData, enableComments=false, user, content, editorClassName="link"}: 
    {initialData: InitialEditorStateType,
    enableComments?: boolean, 
    user?: UserProps | null, 
    content?: ContentProps,
    editorClassName?: string}) => {

    const settings: SettingsProps = {
        disableBeforeInput: false,
        emptyEditor: false,
        isAutocomplete: false,
        isCharLimit: false,
        isCharLimitUtf8: false,
        isCollab: false,
        isMaxLength: false,
        isRichText: true,
        measureTypingPerf: false,
        shouldPreserveNewLinesInMarkdown: true,
        shouldUseLexicalContextMenu: false,
        showNestedEditorTreeView: false,
        showTableOfContents: false,
        showTreeView: false,
        tableCellBackgroundColor: false,
        tableCellMerge: false,
        showActions: false,
        showToolbar: false,
        isComments: enableComments,
        isDraggableBlock: false,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "Escribí tu publicación acá...",
        initialData: initialData,
        isAutofocus: true,
        editorClassName: editorClassName,
        isReadOnly: true,
        user: user,
        content: content
    }
    
    return <MyLexicalEditor settings={settings} setEditor={() => {}} setOutput={() => {}}/>
}