import {
    getLexicalPointerFromMarkdownIndex, getLexicalStateLeaves, getMarkdownUpTo,
    getOrderedNodeListWithPointers, lexicalSelectionToMarkdownSelection,
    markdownSelectionToLexicalSelection
} from "../selection-transforms";
import {editorStateToMarkdown, markdownToEditorState} from "../markdown-transforms";
import {getSelectionSubtree} from "../editor-state-utils";


const longText = `
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


test('get ab from abc', () => {
    const markdown = "abc"
    const s = markdownToEditorState(markdown)

    const nodes = getOrderedNodeListWithPointers(s.root)
    expect(nodes).toStrictEqual(
        [
            {
                node: s.root,
                pointer: [],
                isLeaf: false
            },
            {
                node: s.root.children[0],
                pointer: [0],
                isLeaf: false
            },
            {
                node: s.root.children[0].children[0],
                pointer: [0, 0],
                isLeaf: true
            }
        ]
    )

    const res = {node: [0, 0], offset: 1}

    const lexicalSelection = {
        start: {node: [0, 0], offset: 0},
        end: {node: [0, 0], offset: 2},
    }

    const leaves = getLexicalStateLeaves(s)

    expect(getLexicalPointerFromMarkdownIndex(s, 1, leaves)).toStrictEqual(res)

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), [0, 1])).toStrictEqual(
        lexicalSelection
    )
})


test('get abc from abc', () => {
    const markdown = "abc"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [0, 2]
    const lexicalSelection = {
        start: {node: [0, 0], offset: 0},
        end: {node: [0, 0], offset: 3},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )
    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})


test('get subtree abc from abcndef', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorState(markdown)

    const lexicalSelection = {
        start: {node: [0, 0], offset: 0},
        end: {node: [0, 0], offset: 3},
    }

    const inclSubtree = getSelectionSubtree(s, {start: {node: [], offset: 0}, end: lexicalSelection.end})
    const inclMarkdown = editorStateToMarkdown(JSON.stringify(inclSubtree))

    expect(inclMarkdown).toStrictEqual("abc")
})


test('get abc from abcnndef', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [0, 2]
    const lexicalSelection = {
        start: {node: [0, 0], offset: 0},
        end: {node: [0, 0], offset: 3},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )

    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})



test('get abc from abcnndef in endline', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [0, 3]
    const lexicalSelection = {
        start: {node: [0, 0], offset: 0},
        end: {node: [0, 0], offset: 4},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )

    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})



test("get markdown up to 'a' from 'abc'", () => {
    const markdown = "abc"
    const s = markdownToEditorState(markdown)

    expect(getMarkdownUpTo(s, {node: [0, 0], offset: 1})).toStrictEqual("a")
})


test('get abcnd from abcndef', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [0, 5]
    const lexicalSelection = {
        start: {node: [0, 0], offset: 0},
        end: {node: [1, 0], offset: 1},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )

    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})


test('get bcnd from abcndef', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [1, 5]
    const lexicalSelection = {
        start: {node: [0, 0], offset: 1},
        end: {node: [1, 0], offset: 1},
    }
    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )

    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})


test('access second new line', () => {
    const markdown = "abc\n\ndef"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [1, 4]
    const lexicalSelection = {
        start: {node: [0, 0], offset: 1},
        end: {node: [0, 0], offset: 4},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )
})


test('get c from abcnndefnnghi', () => {
    const markdown = "abc\n\ndef\n\nghi"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [2, 2]
    const lexicalSelection = {
        start: {node: [0, 0], offset: 2},
        end: {node: [0, 0], offset: 3},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )

    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})



test('get def from abc|n|ndef|n|nghi', () => {
    const markdown = "abc\n\ndef\n\nghi"
    const s = markdownToEditorState(markdown)

    const markdownSelection: [number, number] = [5, 7]
    const lexicalSelection = {
        start: {node: [1, 0], offset: 0},
        end: {node: [1, 0], offset: 3},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )

    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})


test('selections in long text', () => {
    const s = markdownToEditorState(longText)

    const markdownSelection: [number, number] = [1315, 1322]
    const lexicalSelection = {
        start: {node: [9, 0], offset: 38},
        end: {node: [9, 0], offset: 46},
    }

    expect(markdownSelectionToLexicalSelection(JSON.stringify(s), markdownSelection)).toStrictEqual(
        lexicalSelection
    )

    expect(lexicalSelectionToMarkdownSelection(JSON.stringify(s), lexicalSelection)).toStrictEqual(
        markdownSelection
    )
})