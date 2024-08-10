import LexicalEditor from "./lexical-editor"


const FastEditor = ({ onSubmit, onSaveDraft, initialData }: any) => {

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
    }

    return <LexicalEditor settings={settings}/>
}


export default FastEditor