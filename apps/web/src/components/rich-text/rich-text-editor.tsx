"use client"

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {EditorState, NodeSelection, TextSelection} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {baseKeymap, toggleMark} from "prosemirror-commands";
import {history, redo, undo} from "prosemirror-history";
import {keymap} from "prosemirror-keymap";
import {isRichTextEmpty, richTextPlainText} from "@cabildo-abierto/utils";
import type {AttachmentInsertionAction} from "@/components/attachments/attachment-insertion-picker";
import {RichTextFloatingToolbar, type RichTextToolbarState} from "@/components/rich-text/rich-text-floating-toolbar";
import {richTextDocumentFromString, richTextSchema, serializeRichTextDocument} from "@/components/rich-text/rich-text-schema";

function selectedLink(view: EditorView, from: number, to: number): RichTextToolbarState["link"] {
    let link: RichTextToolbarState["link"] = null;
    view.state.doc.nodesBetween(from, to, node => {
        if (link || !node.isText) return;
        const internal = richTextSchema.marks.internal_link.isInSet(node.marks);
        const external = richTextSchema.marks.external_link.isInSet(node.marks);
        if (internal) link = {type: "internal", topicId: internal.attrs.topicId as string};
        if (external) link = {type: "external", href: external.attrs.href as string};
    });
    return link;
}

function toolbarState(view: EditorView): RichTextToolbarState | null {
    const {from, to} = view.state.selection;
    if (view.state.selection instanceof NodeSelection && view.state.selection.node.type === richTextSchema.nodes.footnote) {
        return {
            from,
            to,
            hasSelection: false,
            bold: false,
            italic: false,
            link: null,
            footnote: {
                id: view.state.selection.node.attrs.id as string,
                content: view.state.selection.node.attrs.content as string,
            },
            openLinkPicker: false,
            openFootnoteEditor: false,
        };
    }
    if (!(view.state.selection instanceof TextSelection)) return null;
    const hasSelection = from !== to;
    const marks = hasSelection ? null : view.state.storedMarks ?? view.state.selection.$from.marks();
    return {
        from,
        to,
        hasSelection,
        bold: hasSelection
            ? view.state.doc.rangeHasMark(from, to, richTextSchema.marks.bold)
            : Boolean(richTextSchema.marks.bold.isInSet(marks ?? [])),
        italic: hasSelection
            ? view.state.doc.rangeHasMark(from, to, richTextSchema.marks.italic)
            : Boolean(richTextSchema.marks.italic.isInSet(marks ?? [])),
        link: hasSelection ? selectedLink(view, from, to) : null,
        footnote: null,
        openLinkPicker: false,
        openFootnoteEditor: false,
    };
}

export function RichTextEditor({content, footnoteNumbers, toolbarContainer, onChange, onDeleteEmpty, documentInsertion, datasetInsertion, onInsertVisualization}: {
    content: string
    footnoteNumbers?: ReadonlyMap<string, number>
    onInsertVisualization?: () => void
    datasetInsertion?: AttachmentInsertionAction
    documentInsertion?: AttachmentInsertionAction
    toolbarContainer: HTMLElement | null
    onChange: (content: string) => void
    onDeleteEmpty: () => void
}) {
    const mountRef = useRef<HTMLDivElement>(null);
    const initialContentRef = useRef(content);
    const toolbarElementRef = useRef<HTMLDivElement | null>(null);
    const onChangeRef = useRef(onChange);
    const onDeleteEmptyRef = useRef(onDeleteEmpty);
    const footnoteNumbersRef = useRef(footnoteNumbers);
    const [view, setView] = useState<EditorView | null>(null);
    const [toolbar, setToolbar] = useState<RichTextToolbarState | null>(null);
    onChangeRef.current = onChange;
    onDeleteEmptyRef.current = onDeleteEmpty;
    footnoteNumbersRef.current = footnoteNumbers;

    useEffect(() => {
        mountRef.current?.querySelectorAll<HTMLElement>("[data-footnote-id]").forEach(element => {
            const label = element.querySelector("sup");
            if (label) label.textContent = String(footnoteNumbers?.get(element.dataset.footnoteId ?? "") ?? "*");
        });
    }, [content, footnoteNumbers, view]);

    useEffect(() => {
        if (!mountRef.current) return;
        const editor = new EditorView(mountRef.current, {
            state: EditorState.create({
                doc: richTextDocumentFromString(initialContentRef.current),
                plugins: [
                    history(),
                    keymap({
                        "Mod-b": toggleMark(richTextSchema.marks.bold),
                        "Mod-i": toggleMark(richTextSchema.marks.italic),
                        "Mod-z": undo,
                        "Mod-y": redo,
                        "Mod-Shift-z": redo,
                        Enter: (state, dispatch) => {
                            dispatch?.(state.tr.replaceSelectionWith(richTextSchema.nodes.hard_break.create()).scrollIntoView());
                            return true;
                        },
                        Backspace: state => {
                            if (state.doc.textContent.length > 0) return false;
                            onDeleteEmptyRef.current();
                            return true;
                        },
                    }),
                    keymap(baseKeymap),
                ],
            }),
            attributes: {
                class: "m-0 min-h-5 whitespace-pre-wrap break-words p-0 text-sm leading-relaxed outline-none",
                role: "textbox",
                "aria-multiline": "true",
                "aria-label": "Contenido del párrafo",
            },
            nodeViews: {
                footnote: node => {
                    // Keep the atom on the text baseline; only its label is superscript.
                    const dom = document.createElement("span");
                    dom.className = "ml-0.5 inline-block cursor-pointer align-baseline font-medium leading-none";
                    dom.contentEditable = "false";
                    const label = document.createElement("sup");
                    dom.appendChild(label);
                    const render = (id: string, noteContent: string) => {
                        dom.dataset.footnoteId = id;
                        dom.dataset.footnoteContent = noteContent;
                        dom.title = noteContent;
                        label.textContent = String(footnoteNumbersRef.current?.get(id) ?? "*");
                    };
                    render(node.attrs.id as string, node.attrs.content as string);
                    return {
                        dom,
                        update: nextNode => {
                            if (nextNode.type !== richTextSchema.nodes.footnote) return false;
                            render(nextNode.attrs.id as string, nextNode.attrs.content as string);
                            return true;
                        },
                        ignoreMutation: () => true,
                    };
                },
            },
            handleDOMEvents: {
                focus: view => {
                    setToolbar(toolbarState(view));
                    return false;
                },
                click: (view, event) => {
                    const target = event.target;
                    if (!(target instanceof Element)) return false;
                    const footnote = target.closest<HTMLElement>("[data-footnote-id]");
                    if (footnote && view.dom.contains(footnote)) {
                        event.preventDefault();
                        const position = view.posAtDOM(footnote, 0);
                        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, position)));
                        const nextToolbar = toolbarState(view);
                        if (nextToolbar) setToolbar({...nextToolbar, openFootnoteEditor: true});
                        return true;
                    }
                    const link = target.closest("a");
                    if (!link || !view.dom.contains(link)) return false;
                    event.preventDefault();
                    const from = view.posAtDOM(link, 0);
                    const to = view.posAtDOM(link, link.childNodes.length);
                    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to)));
                    const nextToolbar = toolbarState(view);
                    if (nextToolbar) setToolbar({...nextToolbar, openLinkPicker: true});
                    return true;
                },
            },
            dispatchTransaction(transaction) {
                const nextState = editor.state.apply(transaction);
                if (transaction.docChanged) {
                    const serialized = serializeRichTextDocument(nextState.doc);
                    if (richTextPlainText(serialized).length > 20_000) return;
                    onChangeRef.current(serialized);
                }
                editor.updateState(nextState);
                setToolbar(toolbarState(editor));
            },
        });
        setView(editor);
        editor.focus();
        setToolbar(toolbarState(editor));

        const closeOnOutsidePointer = (event: PointerEvent) => {
            const target = event.target as Node;
            if (target instanceof Element && target.closest("[data-attachment-editor-popup]")) return;
            if (!editor.dom.contains(target) && !toolbarElementRef.current?.contains(target)) setToolbar(null);
        };
        document.addEventListener("pointerdown", closeOnOutsidePointer);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePointer);
            editor.destroy();
            setView(null);
        };
    }, []);

    return <div className="relative" draggable={false} onDragStart={event => event.stopPropagation()} onMouseDown={event => event.stopPropagation()}>
        {isRichTextEmpty(content) && <span className="pointer-events-none absolute inset-x-0 top-0 text-sm text-muted-foreground">Escribí un párrafo...</span>}
        <div ref={mountRef} className="relative"/>
        {view && toolbar && toolbarContainer && createPortal(<RichTextFloatingToolbar
            view={view}
            state={toolbar}
            documentInsertion={documentInsertion} datasetInsertion={datasetInsertion} onInsertVisualization={onInsertVisualization}
            toolbarRef={element => { toolbarElementRef.current = element; }}
        />, toolbarContainer)}
    </div>;
}
