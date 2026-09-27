"use client"

import type {FootnoteAttrs, FootnoteContent} from "@cabildo-abierto/utils";
import {useEffect, useState} from "react";
import type {EditorView} from "prosemirror-view";
import {toggleMark} from "prosemirror-commands";
import {ListBulletsIcon, ListNumbersIcon, AsteriskIcon, ImageIcon, ChartBarIcon, FileTextIcon, LinkSimpleIcon, TextBIcon, TextItalicIcon, TableIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {RichTextLinkPicker, type RichTextLink} from "@/components/rich-text/rich-text-link-picker";
import {toggleList, type RichTextListType} from "./rich-text-lists";
import {richTextSchema} from "@/components/rich-text/rich-text-schema";
import {cn} from "@/lib/utils";
import {AttachmentInsertionPicker, type AttachmentInsertionAction} from "@/components/attachments/attachment-insertion-picker";
import {RichTextFootnoteEditor} from "@/components/rich-text/rich-text-footnote-editor";

export type RichTextToolbarState = {
    from: number
    to: number
    hasSelection: boolean
    bold: boolean
    italic: boolean
    listType: RichTextListType | null
    link: RichTextLink | null
    footnote: FootnoteAttrs | null
    openLinkPicker: boolean
    openFootnoteEditor: boolean
};

function applyLink(view: EditorView, state: RichTextToolbarState, link: RichTextLink | null) {
    let transaction = view.state.tr
        .removeMark(state.from, state.to, richTextSchema.marks.internal_link)
        .removeMark(state.from, state.to, richTextSchema.marks.external_link);
    if (link?.type === "internal") transaction = transaction.addMark(state.from, state.to, richTextSchema.marks.internal_link.create({topicId: link.topicId}));
    if (link?.type === "external") transaction = transaction.addMark(state.from, state.to, richTextSchema.marks.external_link.create({href: link.href}));
    view.dispatch(transaction);
    view.focus();
}

export function RichTextFloatingToolbar({view, state, toolbarRef, documentInsertion, datasetInsertion, onInsertVisualization, onInsertImage}: {
    onInsertImage?: () => void
    onInsertVisualization?: () => void
    datasetInsertion?: AttachmentInsertionAction
    documentInsertion?: AttachmentInsertionAction
    view: EditorView
    state: RichTextToolbarState
    toolbarRef: (element: HTMLDivElement | null) => void
}) {
    const [attachmentPicker, setAttachmentPicker] = useState<"documento" | "dataset" | null>(null);
    const [linkPickerOpen, setLinkPickerOpen] = useState(state.openLinkPicker);
    const [footnoteEditorOpen, setFootnoteEditorOpen] = useState(state.openFootnoteEditor);
    useEffect(() => {
        if (state.openLinkPicker) setLinkPickerOpen(true);
    }, [state.openLinkPicker]);
    useEffect(() => {
        const closeOnTextPointer = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (!target.closest("a")) setLinkPickerOpen(false);
            if (!target.closest("[data-footnote-id]")) setFootnoteEditorOpen(false);
        };
        view.dom.addEventListener("pointerdown", closeOnTextPointer);
        return () => view.dom.removeEventListener("pointerdown", closeOnTextPointer);
    }, [view]);
    useEffect(() => {
        if (state.openFootnoteEditor) setFootnoteEditorOpen(true);
    }, [state.openFootnoteEditor]);
    const toggle = (type: "bold" | "italic") => {
        toggleMark(richTextSchema.marks[type])(view.state, view.dispatch);
        view.focus();
    };
    const finishLink = (link: RichTextLink | null) => {
        applyLink(view, state, link);
        setLinkPickerOpen(false);
    };
    const saveFootnote = (content: FootnoteContent) => {
        const attrs = {id: state.footnote?.id ?? crypto.randomUUID(), ...content};
        const transaction = state.footnote
            ? view.state.tr.setNodeMarkup(state.from, richTextSchema.nodes.footnote, attrs)
            : view.state.tr.insert(state.to, richTextSchema.nodes.footnote.create(attrs));
        view.dispatch(transaction.scrollIntoView());
        view.focus();
        setFootnoteEditorOpen(false);
    };
    const deleteFootnote = () => {
        if (state.footnote) view.dispatch(view.state.tr.delete(state.from, state.to));
        view.focus();
        setFootnoteEditorOpen(false);
    };
    const insertionAction = attachmentPicker === "dataset" ? datasetInsertion : documentInsertion;
    const panelOpen = linkPickerOpen || footnoteEditorOpen || attachmentPicker !== null;

    return <div ref={toolbarRef} className="flex justify-start"
        onMouseDown={event => event.stopPropagation()}>
        {!panelOpen && <div className={cn("flex max-w-full flex-wrap items-center gap-0.5 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md")}>
            <Button type="button" variant="ghost" size="icon-sm" className={cn(state.bold && "bg-muted")} aria-pressed={state.bold}
                aria-label="Negrita" title="Negrita" onMouseDown={event => event.preventDefault()} onClick={() => toggle("bold")}><TextBIcon className="size-4"/></Button>
            <Button type="button" variant="ghost" size="icon-sm" className={cn(state.italic && "bg-muted")} aria-pressed={state.italic}
                aria-label="Itálica" title="Itálica" onMouseDown={event => event.preventDefault()} onClick={() => toggle("italic")}><TextItalicIcon className="size-4"/></Button>
            {([['bullet_list', 'Lista con viñetas', ListBulletsIcon], ['ordered_list', 'Lista numerada', ListNumbersIcon]] as const).map(([type, label, Icon]) =>
                <Button key={type} type="button" variant="ghost" size="icon-sm" className={cn(state.listType === type && "bg-muted")}
                    aria-pressed={state.listType === type} aria-label={label} title={label} disabled={!!state.footnote}
                    onMouseDown={event => event.preventDefault()} onClick={() => { toggleList(type)(view.state, view.dispatch); view.focus(); }}><Icon className={cn("size-4")}/></Button>)}
            <Button type="button" variant="ghost" size="icon-sm" className={cn(state.link && "bg-muted")} aria-expanded={false}
                aria-label="Agregar o editar link" title={state.hasSelection ? "Link" : "Seleccioná texto para agregar un link"}
                disabled={!state.hasSelection} onMouseDown={event => event.preventDefault()} onClick={() => setLinkPickerOpen(true)}><LinkSimpleIcon className="size-4"/></Button>
            <Button type="button" variant="ghost" size="icon-sm" className={cn(state.footnote && "bg-muted")}
                aria-label="Agregar o editar nota al pie" title="Nota al pie" onMouseDown={event => event.preventDefault()}
                onClick={() => setFootnoteEditorOpen(true)}><AsteriskIcon className="size-4"/></Button>
            {onInsertImage && <Button type="button" variant="ghost" size="icon-sm" aria-label="Insertar imagen" title="Insertar imagen" onMouseDown={event => event.preventDefault()} onClick={onInsertImage}><ImageIcon className={cn("size-4")}/></Button>}
            {onInsertVisualization && <Button type="button" variant="ghost" size="icon-sm" aria-label="Insertar visualización" title="Insertar visualización" onMouseDown={event => event.preventDefault()} onClick={onInsertVisualization}><ChartBarIcon className={cn("size-4")}/></Button>}
            {documentInsertion && <Button type="button" variant="ghost" size="icon-sm" aria-label="Insertar documento" title="Insertar documento"
                onMouseDown={event => event.preventDefault()} onClick={() => setAttachmentPicker("documento")}><FileTextIcon className={cn("size-4")}/></Button>}
            {datasetInsertion && <Button type="button" variant="ghost" size="icon-sm" aria-label="Insertar conjunto de datos" title="Insertar conjunto de datos"
                onMouseDown={event => event.preventDefault()} onClick={() => setAttachmentPicker("dataset")}><TableIcon className={cn("size-4")}/></Button>}
        </div>}
        {attachmentPicker && insertionAction && <AttachmentInsertionPicker type={attachmentPicker}
            action={{...insertionAction, onInsert: async content => {
                const saved = await insertionAction.onInsert(content);
                if (saved) setAttachmentPicker(null);
                return saved;
            }}}
            onCancel={() => { setAttachmentPicker(null); view.focus(); }}/>}
        {linkPickerOpen && <RichTextLinkPicker
            current={state.link}
            onApply={link => finishLink(link)}
            onRemove={() => finishLink(null)}
        />}
        {footnoteEditorOpen && <RichTextFootnoteEditor
            initial={state.footnote ?? {kind: "text", content: ""}}
            editing={state.footnote !== null}
            onSave={saveFootnote}
            onDelete={deleteFootnote}
            onCancel={() => setFootnoteEditorOpen(false)}
        />}
    </div>;
}
