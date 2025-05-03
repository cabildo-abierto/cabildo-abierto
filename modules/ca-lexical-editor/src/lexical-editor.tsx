/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use client"

import './index.css';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClickableLinkPlugin} from '@lexical/react/LexicalClickableLinkPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import {useEffect, useRef, useState} from 'react';
import {CAN_USE_DOM} from './shared/canUseDOM';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import {SharedHistoryContext, useSharedHistoryContext} from './context/SharedHistoryContext';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CommentPlugin, {OnAddCommentProps} from './plugins/CommentPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import ContentEditable from './ui/ContentEditable';
import {InitialConfigType, LexicalComposer} from '@lexical/react/LexicalComposer';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import {BeautifulMentionsPlugin} from 'lexical-beautiful-mentions';
import {
    CustomMenuItemMentions,
    CustomMenuMentions,
    EmptyMentionResults,
    MentionProps
} from './ui/custom-mention-component';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    LexicalEditor as OriginalLexicalEditor
} from 'lexical';
import TableCellResizer from './plugins/TableCellResizer';
import {TableContext} from './plugins/TablePlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import {v4 as uuidv4} from 'uuid';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin'
import PlotPlugin from "./plugins/PlotPlugin";
import {getEditorNodes} from "./nodes/get-editor-nodes";
import {getInitialData} from "./get-initial-data";
import {PreventLeavePlugin} from "./plugins/PreventLeavePlugin";

export type QueryMentionsProps = (trigger: string, query: string | undefined | null) => Promise<MentionProps[]>

export type SettingsProps = {
    charLimit?: number
    isRichText: boolean
    useContextMenu: boolean
    tableOfContents: boolean
    showToolbar: boolean
    allowComments: boolean
    isDraggableBlock: boolean
    allowImages: boolean
    allowTables: boolean
    allowVisualizations: boolean
    markdownShortcuts: boolean

    useSuperscript: boolean
    useStrikethrough: boolean
    useSubscript: boolean

    isAutofocus: boolean

    preventLeave: boolean

    showingChanges?: string

    editorClassName: string
    placeholderClassName: string
    imageClassName: string

    isReadOnly: boolean

    title?: string
    initialText: string
    initialTextFormat: string
    placeholder: string

    measureTypingPerf: boolean
    showTreeView: boolean

    queryMentions: QueryMentionsProps
    onAddComment?: OnAddCommentProps
}


type LexicalEditorProps = {
    settings: SettingsProps,
    setEditor: any,
    setEditorState: any,
    contentId?: string
}


function Editor({settings, setEditor, setEditorState}: LexicalEditorProps) {
    const {historyState} = useSharedHistoryContext();
    const [editor] = useLexicalComposerContext();
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const [marginAboveEditor, setMarginAboveEditor] = useState<number>(0);
    const isEditable = useLexicalEditable();
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
    const [uniqueId, setUniqueId] = useState(undefined)

    useEffect(() => {
        if (setEditor) {
            setEditor(editor);
        }
    }, [editor, setEditor]);

    const {
        isRichText,
        showTreeView,
        tableOfContents,
        useContextMenu,
        showToolbar,
        allowComments,
        isDraggableBlock,
        placeholder,
        isReadOnly,
        isAutofocus,
        editorClassName,
        placeholderClassName,
        preventLeave,
        allowImages,
        allowTables,
        markdownShortcuts,
        queryMentions,
        onAddComment
    } = settings;

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    }

    useEffect(() => {
        const updateViewPortWidth = () => {
            const isNextSmallWidthViewport = CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

            if (isNextSmallWidthViewport !== isSmallWidthViewport) {
                setIsSmallWidthViewport(isNextSmallWidthViewport);
            }
        };
        updateViewPortWidth();
        window.addEventListener('resize', updateViewPortWidth);

        return () => {
            window.removeEventListener('resize', updateViewPortWidth);
        };
    }, [isSmallWidthViewport]);

    useEffect(() => {
        if (editorContainerRef.current) {
            const editorTop = editorContainerRef.current.getBoundingClientRect().top;
            setMarginAboveEditor(editorTop);
        }
    }, [editorContainerRef]);

    return (
        <>
            {isRichText && showToolbar && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode}/>}
            <div
                ref={editorContainerRef}
                className={`${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''}`}
            >
                <DragDropPaste/>

                {preventLeave && !isReadOnly && <PreventLeavePlugin uniqueId={uniqueId}/>}

                {isAutofocus && <AutoFocusPlugin defaultSelection={"rootStart"}/>}

                <BeautifulMentionsPlugin
                    triggers={['@']}
                    onSearch={queryMentions}
                    emptyComponent={EmptyMentionResults}
                    menuComponent={CustomMenuMentions}
                    menuItemComponent={CustomMenuItemMentions}
                />

                {allowTables && <TablePlugin
                    hasCellMerge={true}
                    hasCellBackgroundColor={false}
                />}
                <TableCellResizer/>

                {allowImages && <ImagesPlugin captionsEnabled={false}/>}

                <PlotPlugin/>

                <OnChangePlugin
                    onChange={(editorState) => {
                        setEditorState(editorState);
                        if (!isReadOnly && preventLeave && !uniqueId) {
                            const newUniqueId = uuidv4()
                            setUniqueId(newUniqueId)
                        }
                    }}
                />

                {markdownShortcuts && <MarkdownShortcutPlugin/>}

                <HashtagPlugin/>

                <AutoLinkPlugin/>

                {allowComments && <CommentPlugin onAddComment={onAddComment}/>}

                {isRichText ? (
                    <>
                        <HistoryPlugin externalHistoryState={historyState}/>
                        <RichTextPlugin
                            contentEditable={
                                <div className={'editor-scroller'}>
                                    <div className={"editor " + editorClassName} ref={onRef}>
                                        <ContentEditable
                                            placeholder={placeholder}
                                            placeholderClassName={placeholderClassName}
                                            editorClassName={editorClassName}
                                        />
                                    </div>
                                </div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <ListPlugin/>
                        <CheckListPlugin/>
                        <ListMaxIndentLevelPlugin maxDepth={7}/>
                        <LinkPlugin/>
                        <ClickableLinkPlugin disabled={isEditable} newTab={false}/>

                        {!isReadOnly && floatingAnchorElem && (
                            <>
                                {isDraggableBlock && <DraggableBlockPlugin anchorElem={floatingAnchorElem}/>}
                                <FloatingLinkEditorPlugin
                                    isLinkEditMode={isLinkEditMode}
                                    setIsLinkEditMode={setIsLinkEditMode}
                                />
                                <TableCellActionMenuPlugin
                                    anchorElem={floatingAnchorElem}
                                    cellMerge={true}/>
                                <FloatingTextFormatToolbarPlugin setIsLinkEditMode={setIsLinkEditMode}
                                                                 settings={settings}/>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <PlainTextPlugin
                            contentEditable={<ContentEditable
                                placeholder={placeholder}
                                placeholderClassName={placeholderClassName}
                                editorClassName={editorClassName}
                            />}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin externalHistoryState={historyState}/>
                    </>
                )}
                <div className="hidden lg:block">
                    {tableOfContents &&
                        <TableOfContentsPlugin title={settings.title} marginAboveEditor={marginAboveEditor}/>}
                </div>
                {useContextMenu && <ContextMenuPlugin/>}
            </div>
            {showTreeView && <TreeViewPlugin/>}
        </>
    );
}


export const initializeEmpty = (initialText: string) => (editor: OriginalLexicalEditor) => {
    editor.update(() => {
        const root = $getRoot()
        const node = $createParagraphNode()
        node.append($createTextNode(initialText))
        root.append(node)
    })
}


const LexicalEditor = ({settings, setEditor, setEditorState}: LexicalEditorProps) => {
    let {isReadOnly, initialText, initialTextFormat, imageClassName} = settings

    const nodes = getEditorNodes(settings)
    const initialData = getInitialData(initialText, initialTextFormat)


    const initialConfig: InitialConfigType = {
        namespace: 'Playground',
        editorState: initialData,
        nodes: nodes,
        onError: (error: Error) => {
            throw error;
        },
        theme: {...PlaygroundEditorTheme, image: "editor-image " + imageClassName},
        editable: !isReadOnly,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <SharedHistoryContext>
                <TableContext>
                    <div className="relative">
                        <Editor
                            settings={settings}
                            setEditor={setEditor}
                            setEditorState={setEditorState}
                        />
                    </div>
                </TableContext>
            </SharedHistoryContext>
        </LexicalComposer>
    )
}


export default LexicalEditor