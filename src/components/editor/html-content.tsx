"use client"

import { UserProps } from '@/actions/get-user';
import { InitialEditorStateType } from '@lexical/react/LexicalComposer';
import dynamic from 'next/dynamic'

const LexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );

export default function HtmlContent({content, user, limitHeight=false}: {content: InitialEditorStateType, user: UserProps | null, limitHeight?: Boolean}) {
    
    const isDevPlayground = false
    const settings = {
        disableBeforeInput: false,
        emptyEditor: isDevPlayground,
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
        isComments: false,
        isDraggableBlock: false,
        useSuperscript: false,
        useStrikethrough: false,
        useSubscript: false,
        useCodeblock: false,
        placeholder: "...",
        isMarkdownEditor: false,
        initialData: content,
        isReadOnly: true,
        isAutofocus: true,
        editorClassName: "link",
        user: user,
        content: content,
        isHtmlEditor: false
    }
    const parsed_content = <LexicalEditor settings={settings} setEditor={(editor: any) => {}} setOutput={(output: any) => {}}/>
    
    if(limitHeight){
        return <div className="max-h-40 overflow-hidden overflow-y-auto">
            {parsed_content}
        </div>
    } else {
        return <div className="">
            {parsed_content}
        </div>
    }
}