"use client"

import {EditorWithQuoteComments} from "@/components/editor/editor-with-quote-comments";
import {getEditorSettings} from "@/components/editor/settings";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";
import MainLayout from "@/components/layout/main-layout";
import {ReplyToContent} from "../../../../modules/ca-lexical-editor/src/plugins/CommentPlugin";
import {useEffect, useState} from "react";
import {EditorState} from "lexical";
import {
    getStandardSelection
} from "../../../../modules/ca-lexical-editor/src/plugins/CommentPlugin/standard-selection";
import {
    lexicalSelectionToMarkdownSelection
} from "../../../../modules/ca-lexical-editor/src/selection-transforms";
import {ContentQuote} from "@/components/feed/content-quote";
import {quotedContentFromReplyTo} from "@/components/writing/write-panel";
import {logTimes} from "@/server-actions/utils";

const text = `
Marked - Markdown Parser
========================

[Marked] lets you convert [Markdown] into HTML.  Markdown is a simple text format whose goal is to be very easy to read and write, even when not converted to HTML.  This demo page will let you type anything you like and see how it gets converted.  Live.  No more waiting around.

How To Use The Demo
-------------------

1. Type in stuff on the left.
2. See the live updates on the right.

That's it.  Pretty simple.  There's also a drop-down option above to switch between various views:

- **Preview:**  A live display of the generated HTML as it would render in a browser.
- **HTML Source:**  The generated HTML before your browser makes it pretty.
- **Lexer Data:**  What [marked] uses internally, in case you like gory stuff like this.
- **Quick Reference:**  A brief run-down of how to format things using markdown.

Why Markdown?
-------------

It's easy.  It's not overly bloated, unlike HTML.  Also, as the creator of [markdown] says,

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

Ready to start writing?  Either start changing stuff on the left or
[clear everything](/demo/?text=) with a simple click.

[Marked]: https://github.com/markedjs/marked/
[Markdown]: http://daringfireball.net/projects/markdown/
`

const text2 = `Abc

Def

Ghi`

export default function Page(){
    const [editorState, setEditorState] = useState<EditorState | null>(null)
    const [markdownSelection, setMarkdownSelection] = useState<[number, number] | null>(null)
    //const [lexicalSelection, setLexicalSelection] = useState<LexicalStandardSelection | null>(null)
    //const [lexicalSelection2, setLexicalSelection2] = useState<LexicalStandardSelection | null>(null)

    useEffect(() => {
        if(editorState){
            const t1 = Date.now()
            const lexicalSelection = getStandardSelection(editorState)
            const t2 = Date.now()
            if(!lexicalSelection) return
            const markdownSelection = lexicalSelectionToMarkdownSelection(JSON.stringify(editorState), lexicalSelection)

            const t3 = Date.now()
            if(markdownSelection){
                //const lexicalSelection2 = markdownSelectionToLexicalSelection(JSON.stringify(editorState), markdownSelection)
                const t4 = Date.now()
                //setLexicalSelection2(lexicalSelection2)
                logTimes("selection", [t1, t2, t3, t4])
            }
            //setLexicalSelection(lexicalSelection)
            setMarkdownSelection(markdownSelection)
        }
    }, [editorState])

    const settings = getEditorSettings({
        initialText: text,
        initialTextFormat: "markdown",
        showTreeView: true
    })

    const replyTo: ReplyToContent = {
        collection: "ar.com.cabildoabierto.topic",
        uri: "at://asd/ar.com.cabildoabierto.topic/asd",
        content: {
            text,
            format: "markdown"
        }
    }

    return <MainLayout openRightPanel={false} openSidebar={false} maxWidthCenter={"1200px"}>
        <div className={"flex space-x-10"}>
            <div className={"border flex flex-col space-y-4 w-[300px]"}>
                {markdownSelection && <div className="max-w-[250px]" key={markdownSelection ? (markdownSelection[0] + "-" + markdownSelection[1]) : undefined}>
                    <ContentQuote quotedContent={quotedContentFromReplyTo(replyTo)} quote={markdownSelection}/>
                </div>}
                {/*<PrettyJSON data={lexicalSelection}/>
                <PrettyJSON data={markdownSelection}/>
                <PrettyJSON data={lexicalSelection2}/>*/}
            </div>

            <div className={"flex justify-center"}>
                <div className={"max-w-[600px] space-y-4"}>
                    <h1>Test selection</h1>
                    <div className={"border"}>
                        <EditorWithQuoteComments
                            settings={settings}
                            onSubmitReply={async () => {}}
                            replyTo={replyTo}
                            editor={null}
                            setEditor={() => {}}
                            setEditorState={setEditorState}
                            pinnedReplies={[]}
                            setPinnedReplies={() => {}}
                            quoteReplies={[]}
                        />
                    </div>
                    <div className={"whitespace-pre-wrap border font-mono"}>
                        {Array.from(text).map((c, index) => {
                            return <div key={index}>
                                {index}. {c}
                            </div>
                        })}
                        {text.replaceAll("\n", "N")}
                    </div>
                    <PrettyJSON data={settings}/>
            </div>
        </div>
        </div>
    </MainLayout>
}