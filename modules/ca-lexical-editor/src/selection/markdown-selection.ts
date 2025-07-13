import {LexicalPointer, LexicalSelection} from "./lexical-selection";
import {$createRangeSelection, $getRoot, LexicalEditor, SerializedEditorState} from "lexical";
import {ProcessedLexicalState} from "./processed-lexical-state";
import {editorStateToMarkdown, markdownToEditorState} from "../markdown-transforms";


export class MarkdownSelection {
    /***
     Una selección dentro de un texto en formato markdown.
     Indica la selección [start, end).
     ***/

    start: number
    end: number

    constructor(start: number, end: number) {
        this.start = start
        this.end = end
    }

    toLexicalSelection(state: string | SerializedEditorState | ProcessedLexicalState): LexicalSelection | null {
        const processedState = ProcessedLexicalState.fromMaybeProcessed(state)
        let start: LexicalPointer
        let end: LexicalPointer
        try {
            start = LexicalPointer.fromMarkdownIndex(processedState, this.start)
            if(start.offset == 0) start.offset = undefined
        } catch (err) {
            console.warn(`Error getting start pointer from markdown selection ${this.start} ${this.end}`)
            console.error(err)
            return null
        }
        try {
            end = LexicalPointer.fromMarkdownIndex(processedState, this.end)
            if(end.offset == 0) end.offset = undefined
        } catch (err) {
            console.warn(`Error getting end pointer from markdown selection ${this.start} ${this.end}`)
            console.error(err)
            return null
        }
        if(!start || !end) return null
        if(start.equals(end) || this.start == this.end){
            return new LexicalSelection(
                new LexicalPointer([], undefined),
                new LexicalPointer([], undefined)
            )
        }
        return new LexicalSelection(start, end)
    }

    toArray(): [number, number] {
        return [this.start, this.end]
    }

    toString(): string {
        return `[${this.start}, ${this.end})`
    }

    /*shiftEmbeds(embeds: ArticleEmbed[]){
        const res: ArticleEmbed[] = []
        for(let i = 0; i < embeds.length; i++){
            if(embeds[i].index >= this.start && embeds[i].index < this.end){
                res.push(produce(embeds[i], draft => {
                    draft.index -= this.start
                }))
            }
        }
        return res
    }*/

    isEmpty() {
        return this.end <= this.start;
    }

    getLexicalRangeSelection(editor: LexicalEditor) {
        const root = $getRoot()
        const state = editor.getEditorState().toJSON()
        const stateStr = JSON.stringify(state)
        const lexicalSelection = this.toLexicalSelection(stateStr)
        const processedState = new ProcessedLexicalState(state)

        const startNode = lexicalSelection.start.getPointType(root, true, processedState)
        const endNode = lexicalSelection.end.getPointType(root, false, processedState)

        const rangeSelection = $createRangeSelection();
        if (!startNode || !endNode) {
            return null;
        }

        rangeSelection.anchor = startNode;
        rangeSelection.focus = endNode;

        return rangeSelection
    }

    equals(selection: MarkdownSelection) {
        return this.start == selection.start && this.end == selection.end
    }
}

