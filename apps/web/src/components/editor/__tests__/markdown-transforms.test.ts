import {
    editorStateToMarkdown,
    editorStateToMarkdownNoEmbeds,
    markdownToEditorState,
    markdownToEditorStateNoEmbeds,
    normalizeMarkdown
} from "../markdown-transforms";
import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api";
import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api";
import {$Typed} from "@atproto/api";
//import {prettyPrintJSON} from "@/utils/strings";

/*function nodeForPrint(node: any){
    return {
        type: node.type,
        children: node.children ? node.children.map(nodeForPrint) : undefined,
        text: node.text ? node.text : undefined,
    }
}


function prettyPrintLexicalState(s: any){
    prettyPrintJSON(nodeForPrint(s.root))
}*/

export const longText = `
Marked - Markdown Parser

Marked lets you convert Markdown into HTML.  Markdown is a simple text format whose goal is to be very easy to read and write, even when not converted to HTML.  This demo page will let you type anything you like and see how it gets converted.  Live.  No more waiting around.

How To Use The Demo

1. Type in stuff on the left.
2. See the live updates on the right.

That's it.  Pretty simple.  There's also a drop-down option above to switch between various views:

- __Preview:__  A live display of the generated HTML as it would render in a browser.
- __HTML Source:__  The generated HTML before your browser makes it pretty.
- __Lexer Data:__  What marked uses internally, in case you like gory stuff like this.
- __Quick Reference:__  A brief run-down of how to format things using markdown.

Why Markdown?

It's easy.  It's not overly bloated, unlike HTML.  Also, as the creator of markdown says,

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

Ready to start writing?  Either start changing stuff on the left or
[clear everything](/demo/?text=) with a simple click.
`


test('markdownTransformsIdempotentABC', () => {
    const markdown = "ABC"
    const s = markdownToEditorStateNoEmbeds(markdown)
    const markdownBack = editorStateToMarkdownNoEmbeds(s)
    expect(markdownBack).toStrictEqual(markdown)
})


test('markdownTransformsIdempotentSingleNewLines', () => {
    const markdown = normalizeMarkdown("a\nb")
    const s = markdownToEditorStateNoEmbeds(markdown, true)
    const markdownBack = editorStateToMarkdownNoEmbeds(s)
    expect(markdownBack).toStrictEqual(markdown)
})


test('markdownTransformsIdempotentLongTextNoFootnotes', () => {
    const markdown = normalizeMarkdown(longText)
    const s = markdownToEditorStateNoEmbeds(markdown)
    const markdownBack = editorStateToMarkdownNoEmbeds(s)
    expect(markdownBack).toStrictEqual(markdown)
})


test('markdownTransformABCNNDEF', () => {
    const markdown = normalizeMarkdown("abc\n\ndef")
    const s = markdownToEditorStateNoEmbeds(markdown, true)

    expect(s.root.children.length).toStrictEqual(2) // dos párrafos
})


test('markdownTransformsIdempotentABCNNDEF', () => {
    const markdown = normalizeMarkdown("abc\n\ndef")
    const s = markdownToEditorStateNoEmbeds(markdown)

    const markdownBack = editorStateToMarkdownNoEmbeds(JSON.stringify(s))
    expect(markdownBack).toStrictEqual(markdown)
})


const titanicVisualization: $Typed<ArCabildoabiertoEmbedVisualization.Main> = {
    $type: "ar.cabildoabierto.embed.visualization",
    dataSource: {
        $type: "ar.cabildoabierto.embed.visualization#datasetDataSource",
        dataset: "at://did:plc:2356xofv4ntrbu42xeilxjnb/ar.cabildoabierto.data.dataset/3lok7wonohh2x"
    },
    spec: {
        $type: "ar.cabildoabierto.embed.visualization#twoAxisPlot",
        xAxis: "Survived",
        yAxis: "Age"
    }
}


test('markdown transform with visualization', () => {
    const markdown = "abc\n\ndef"
    const embeds: ArCabildoabiertoFeedArticle.ArticleEmbedView[] = [
        {
            $type: "ar.cabildoabierto.feed.article#articleEmbedView",
            value: titanicVisualization,
            index: 3
        }
    ]
    const editorState = markdownToEditorState(markdown, true, true, embeds)
    //prettyPrintLexicalState(editorState)

    const {markdown: markdownBack, embeds: embedsBack} = editorStateToMarkdown(editorState)

    expect(markdownBack).toStrictEqual(markdown)
    expect(embedsBack).toStrictEqual(embeds)
})


test('markdown bold italic transform', () => {
    const markdown = "abc__xy__*z*abc"

    const lexical = markdownToEditorState(markdown, true, true, [])
    const markdownBack = editorStateToMarkdown(lexical)

    expect(markdownBack.markdown).toStrictEqual(markdown)
    const p = lexical.root.children[0]
    expect(p.type).toStrictEqual("paragraph")

    // children debería ser:
    // - abc
    // - xy
    // - z
    // - abc

    expect((p as any).children.length).toStrictEqual(4)
})
