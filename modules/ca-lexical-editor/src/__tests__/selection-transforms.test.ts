import {
    editorStateToMarkdownNoEmbeds,
    markdownToEditorState,
    markdownToEditorStateNoEmbeds,
    normalizeMarkdown
} from "../markdown-transforms";
import {
    LexicalPointer,
    LexicalSelection
} from "../selection/lexical-selection";
import {MarkdownSelection} from "../selection/markdown-selection";
import {ArticleEmbed} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {ProcessedLexicalState} from "../selection/processed-lexical-state";
import {$Typed} from "@atproto/api";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {prettyPrintLexicalState} from "../utils/print";



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


const titanicVisualization: $Typed<Visualization> = {
    $type: "ar.cabildoabierto.embed.visualization",
    dataSource: {
        $type: "ar.cabildoabierto.embed.visualization#datasetDataSource",
        dataset: "at://did:plc:2356xofv4ntrbu42xeilxjnb/ar.cabildoabierto.data.dataset/3lok7wonohh2x"
    },
    spec: {
        $type: "ar.cabildoabierto.embed.visualization#lines",
        xAxis: "Survived",
        yAxis: "Age"
    }
}


test('getMarkdownUpToEsExcluyente', () => {
    const markdown = "abc"
    const s = markdownToEditorStateNoEmbeds(markdown)

    const lexicalPointer = new LexicalPointer([0, 0], 1)
    const processedState = new ProcessedLexicalState(s)
    const markdownUpTo = lexicalPointer.getMarkdownUpTo(processedState)
    expect(markdownUpTo).toStrictEqual("a")
})


test('lexical selection to markdown with undefined', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorStateNoEmbeds(markdown)
    const lexicalPointer = new LexicalPointer([1, 0])
    const processedState = new ProcessedLexicalState(s)
    const markdownUpTo = lexicalPointer.getMarkdownUpTo(processedState, true)
    expect(markdownUpTo).toStrictEqual("abc")
})


test('markdown up to end offset 1', () => {
    const markdown = normalizeMarkdown(markdownWithImage)
    const s = markdownToEditorStateNoEmbeds(markdown)
    const lexicalPointer = new LexicalPointer([2, 0], 1)
    const processedState = new ProcessedLexicalState(s)
    const markdownUpTo = lexicalPointer.getMarkdownUpTo(processedState, true)
    expect(markdownUpTo).toStrictEqual(markdown)
})


function testSelectionTransform(markdown: string, markdownSelection: MarkdownSelection, expectedLexicalSelection?: LexicalSelection){
    markdown = normalizeMarkdown(markdown, true)
    const s = markdownToEditorStateNoEmbeds(markdown)
    const processedState = new ProcessedLexicalState(s)

    console.log("markdown slice of", markdownSelection, Array.from(markdown.slice(markdownSelection.start, markdownSelection.end)))

    prettyPrintLexicalState(s)

    // Primero chequeamos idempotencia del markdown
    const markdownBack = editorStateToMarkdownNoEmbeds(processedState)
    expect(markdownBack).toStrictEqual(markdown)

    const lexicalSelection = markdownSelection.toLexicalSelection(processedState)
    console.log("lexicalSelection", lexicalSelection)
    const markdownSelectionBack = lexicalSelection.toMarkdownSelection(processedState)
    console.log("markdownSelectionBack", markdownSelectionBack)
    const lexicalSelectionBack = markdownSelectionBack.toLexicalSelection(processedState)
    console.log("lexicalSelectionBack", lexicalSelectionBack)

    if(!expectedLexicalSelection){
        expect(markdownSelectionBack).toStrictEqual(
            markdownSelection
        )
        expect(lexicalSelectionBack).toStrictEqual(
            lexicalSelection
        )
    } else {
        expect(lexicalSelection).toStrictEqual(
            expectedLexicalSelection
        )
        expect(lexicalSelectionBack).toStrictEqual(
            expectedLexicalSelection
        )
        const markdownSelectionBackBack = lexicalSelectionBack.toMarkdownSelection(processedState)
        expect(markdownSelectionBackBack).toStrictEqual(
            markdownSelectionBack
        )
    }
}


test('get ab from abc', () => {
    testSelectionTransform("abc",
        new MarkdownSelection(0, 2),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([0, 0], 2),
        )
    )
})


test('get abc from abc', () => {
    testSelectionTransform("abc",
        new MarkdownSelection(0, 3),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([0, 0], 3)
        )
    )
})


test('get abc from abcnndef', () => {
    testSelectionTransform(
        "abc\n\ndef",
        new MarkdownSelection(0, 3),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([1, 0], undefined),
        )
    )
})


test('index 0 of abc', () => {
    const markdown = "abc"
    const s = markdownToEditorStateNoEmbeds(markdown)
    const processedState = new ProcessedLexicalState(s)
    const expected = new LexicalPointer([0, 0], 0)
    const pointer = LexicalPointer.fromMarkdownIndex(processedState, 0)
    expect(pointer).toStrictEqual(expected)
})


test('index 4 of abcnndef', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorStateNoEmbeds(markdown)
    const processedState = new ProcessedLexicalState(s)
    const expected = new LexicalPointer([1, 0])
    const pointer = LexicalPointer.fromMarkdownIndex(processedState, 4)
    expect(pointer).toStrictEqual(expected)
})


test('get abc from abcnndef in endline', () => {
    testSelectionTransform(
        "abc\n\ndef",
        new MarkdownSelection(0, 4),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([1, 0], undefined)
        )
    )
})


test('get abcnnd from abcnndef', () => {
    testSelectionTransform("abc\n\ndef",
        new MarkdownSelection(0, 6),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([1, 0], 1),
        )
    )
})


test('get bcnd from abcndef', () => {
    testSelectionTransform("abc\n\ndef", new MarkdownSelection(1, 6))
})


test('access second new line', () => {
    testSelectionTransform("abc\n\ndef",
        new MarkdownSelection(1, 5),
        new LexicalSelection(
            new LexicalPointer([0, 0], 1),
            new LexicalPointer([1, 0], undefined)
        )
    )
})


test('get c from abcnndefnnghi', () => {
    testSelectionTransform("abc\n\ndef\n\nghi", new MarkdownSelection(2, 3))
})


test('get def from abcnndefnnghi', () => {
    testSelectionTransform("abc\n\ndef\n\nghi",
        new MarkdownSelection(5, 8),
        new LexicalSelection(
            new LexicalPointer([1, 0], undefined),
            new LexicalPointer([2, 0], undefined)
        )
    )
})


test("get bc from abcd", () => {
    testSelectionTransform("abcd",
        new MarkdownSelection(1, 3),
        new LexicalSelection(
            new LexicalPointer([0, 0], 1),
            new LexicalPointer([0, 0], 3)
        )
    )
})


test("get bc from xxnnabcd", () => {
    testSelectionTransform("xx\n\nabcd",
        new MarkdownSelection(5, 7),
        new LexicalSelection(
            new LexicalPointer([1, 0], 1),
            new LexicalPointer([1, 0], 3)
        )
    )
})


test('selections in long text', () => {
    expect(normalizeMarkdown(longText).slice(1321, 1333)).toStrictEqual("simple click")

    const markdownSelection = new MarkdownSelection(1321, 1333)

    const s = markdownToEditorStateNoEmbeds(normalizeMarkdown(longText))
    const lexicalSelection = markdownSelection.toLexicalSelection(JSON.stringify(s))

    expect(lexicalSelection).toStrictEqual(
        new LexicalSelection(
            new LexicalPointer([9, 2], 8),
            new LexicalPointer([9, 2], 20),
        )
    )


    testSelectionTransform(longText,
        new MarkdownSelection(1321, 1333),
        new LexicalSelection(
            new LexicalPointer([9, 2], 8),
            new LexicalPointer([9, 2], 20),
        )
    )
})


test('bad selection in header', () => {
    testSelectionTransform("### title",
        new MarkdownSelection(0, 2),
        new LexicalSelection(
            new LexicalPointer([]),
            new LexicalPointer([])
        )
    )
})


test('good selection in header', () => {
    testSelectionTransform("### title",
        new MarkdownSelection(0, 5),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([0, 0], 1)
        )
    )
})

const markdownWithImage = `
a

![](https://nutrenaworld.com/wp-content/uploads/2024/01/poultry_blog_why-keep-ducks_820x525.jpg)

b
`

test('selection inside image', () => {
    testSelectionTransform(markdownWithImage,
        new MarkdownSelection(0, 20),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([1, 0], undefined)
        )
    )
})


test('selection after image', () => {
    testSelectionTransform(markdownWithImage,
        new MarkdownSelection(101, 102),
        new LexicalSelection(
            new LexicalPointer([2, 0], undefined),
            new LexicalPointer([2, 0], 1)
        )
    )
})


test("subtree with undefined", () => {
    const markdown = normalizeMarkdown(markdownWithImage)
    const s = markdownToEditorStateNoEmbeds(markdown)
    const processedState = new ProcessedLexicalState(s)
    const markdownUpTo = new LexicalPointer([2, 0], undefined).getMarkdownUpTo(processedState, true)

    const res = `a

![](https://nutrenaworld.com/wp-content/uploads/2024/01/poultry_blog_why-keep-ducks_820x525.jpg)`
    expect(markdownUpTo).toStrictEqual(res)
})


test('selection including image', () => {
    testSelectionTransform(markdownWithImage,
        new MarkdownSelection(0, 102),
        new LexicalSelection(
            new LexicalPointer([0, 0], undefined),
            new LexicalPointer([2, 0], 1)
        )
    )
})

const markdownWithImageInParagraph = `
![](https://nutrenaworld.com/wp-content/uploads/2024/01/poultry_blog_why-keep-ducks_820x525.jpg)Párrafo 1

![](https://nutrenaworld.com/wp-content/uploads/2024/01/poultry_blog_why-keep-ducks_820x525.jpg)

Párrafo 2`

test("selection including image in paragraph", () => {
    testSelectionTransform(markdownWithImageInParagraph,
        new MarkdownSelection(0, 100),
        new LexicalSelection(
            new LexicalPointer([0, 0]),
            new LexicalPointer([1, 0], 2)
        )
    )
})


test("selection between images", () => {
    testSelectionTransform(markdownWithImageInParagraph,
        new MarkdownSelection(98, 105),
        new LexicalSelection(
            new LexicalPointer([1, 0]),
            new LexicalPointer([1, 0], 7)
        )
    )
})


test("selection with visualizations", () => {
    const markdown = "abc\n\ndef\n\nghi"
    const embeds: ArticleEmbed[] = [
        {
            $type: "ar.cabildoabierto.feed.article#articleEmbed",
            value: titanicVisualization,
            index: 3
        },
        {
            $type: "ar.cabildoabierto.feed.article#articleEmbed",
            value: titanicVisualization,
            index: 8
        }
    ]
    const editorState = markdownToEditorState(markdown, true, true, embeds)

    // prettyPrintLexicalState(editorState)
    const selection = new LexicalSelection(
        new LexicalPointer([0, 0], undefined),
        new LexicalPointer([3], undefined)
    )

    const subtree = selection.getSelectedSubtree(editorState)
    expect(subtree.root.children.length).toStrictEqual(3)
})


test("selection of two paragraphs", () => {
    const text: string = `A

## __B__

C

D`

    testSelectionTransform(text,
        new MarkdownSelection(0, 14),
        new LexicalSelection(
            new LexicalPointer([1, 0]),
            new LexicalPointer([3, 0])
        )
    )
})