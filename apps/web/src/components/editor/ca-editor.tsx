/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './index.css';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClickableLinkPlugin} from '@lexical/react/LexicalClickableLinkPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import {useEffect, useMemo, useRef, useState} from 'react';
import {CAN_USE_DOM} from './shared/canUseDOM';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import {SharedHistoryContext, useSharedHistoryContext} from './context/SharedHistoryContext';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CommentPlugin, {OnAddCommentProps} from './plugins/CommentPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import TopicMentionsPlugin from './plugins/TopicMentionsPlugin';
import FloatingLinkEditorPlugin, {TopicsQuery} from './plugins/FloatingLinkEditorPlugin';
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
import {TableContext} from './plugins/TablePlugin/TablePlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import {v4 as uuidv4} from 'uuid';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin'
import EmbedPlugin from "./plugins/EmbedPlugin";
import {getEditorNodes} from "./nodes/get-editor-nodes";
import {getInitialData} from "./get-initial-data";
import TypingPerfPlugin from "./plugins/TypingPerfPlugin";
import {ArCabildoabiertoFeedArticle, EmbedContext} from "@cabildo-abierto/api"
import LinksToMentionsPlugin from "./plugins/MentionsToLinksPlugin";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {NoLineBreaksPlugin} from "./plugins/NoLineBreaksPlugin";
import {cn} from "./lib/utils";

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
    shouldPreserveNewLines: boolean
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    embedContexts?: EmbedContext[]

    useSuperscript: boolean
    useStrikethrough: boolean
    useSubscript: boolean

    isAutofocus: boolean

    preventLeave: boolean

    showingChanges?: string

    editorClassName: string
    editorContainerClassName: string
    placeholderClassName: string
    imageClassName: string

    isReadOnly: boolean

    title?: string
    initialText: string
    initialTextFormat: string
    placeholder: string

    showTreeView: boolean

    queryMentions: QueryMentionsProps
    onAddComment?: OnAddCommentProps

    measureTypingPerf?: boolean

    topicMentions: boolean

    namespace: string

    queryTopics: TopicsQuery
}


export type LexicalEditorProps = {
    settings: SettingsProps,
    setEditor: any,
    setEditorState: any,
    contentId?: string
}


function Editor({settings, setEditor, setEditorState}: LexicalEditorProps) {
    const {historyState} = useSharedHistoryContext()
    const [editor] = useLexicalComposerContext()
    const editorContainerRef = useRef<HTMLDivElement | null>(null)
    const [marginAboveEditor, setMarginAboveEditor] = useState<number>(0);
    const isEditable = useLexicalEditable()
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false)
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)
    const [uniqueId, setUniqueId] = useState<string | null>(null)
    const {layoutConfig} = useLayoutConfig()

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
        editorContainerClassName,
        preventLeave,
        allowImages,
        allowTables,
        allowVisualizations,
        markdownShortcuts,
        queryMentions,
        onAddComment,
        measureTypingPerf,
        topicMentions
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
                className={cn("relative", showTreeView && 'tree-view', !isRichText && 'plain-text')}
            >
                <DragDropPaste/>

                {isAutofocus && <AutoFocusPlugin defaultSelection={"rootStart"}/>}

                <BeautifulMentionsPlugin
                    triggers={['@']}
                    allowSpaces={false}
                    autoSpace={true}
                    showCurrentMentionsAsSuggestions={false}
                    onSearch={queryMentions}
                    emptyComponent={EmptyMentionResults}
                    menuComponent={CustomMenuMentions}
                    menuItemComponent={CustomMenuItemMentions}
                />

                {measureTypingPerf && <TypingPerfPlugin/>}

                {allowTables && <TablePlugin
                    hasCellMerge={true}
                    hasCellBackgroundColor={false}
                />}

                {allowImages && <ImagesPlugin captionsEnabled={false}/>}

                {allowVisualizations && <EmbedPlugin/>}

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

                <LinksToMentionsPlugin/>

                <AutoLinkPlugin/>

                {allowComments && onAddComment && <CommentPlugin
                    onAddComment={onAddComment}
                />}

                {topicMentions && <TopicMentionsPlugin/>}

                {isRichText ? (
                    <>
                        <HistoryPlugin externalHistoryState={historyState}/>
                        <RichTextPlugin
                            contentEditable={
                                <div className={'editor-scroller'} ref={onRef}>
                                    <div className={editorContainerClassName}>
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
                                <FloatingTextFormatToolbarPlugin
                                    setIsLinkEditMode={setIsLinkEditMode}
                                    settings={settings}
                                />
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
                        <NoLineBreaksPlugin/>
                    </>
                )}
                <div className={cn(!layoutConfig.spaceForLeftSide && "hidden")}>
                    {tableOfContents &&
                    <TableOfContentsPlugin
                        title={settings.title}
                        marginAboveEditor={marginAboveEditor}
                    />}
                </div>
                {useContextMenu && <ContextMenuPlugin/>}
            </div>
            {showTreeView && <TreeViewPlugin/>}
        </>
    );
}


export const CAEditor = ({settings, setEditor, setEditorState}: LexicalEditorProps) => {

    const initialConfig: InitialConfigType = useMemo(() => {
        const {
            topicMentions,
            isReadOnly,
            initialText,
            initialTextFormat,
            imageClassName,
            shouldPreserveNewLines,
            embeds
        } = settings
        return {
            namespace: settings.namespace,
            editorState: getInitialData(
                initialText,
                initialTextFormat,
                shouldPreserveNewLines,
                embeds,
                topicMentions
            ),
            nodes: getEditorNodes(settings),
            onError: (error: Error) => {
                throw error
            },
            theme: {
                ...PlaygroundEditorTheme,
                image: "editor-image " + imageClassName
            },
            editable: !isReadOnly,
        };
    }, [settings]);

    if (!initialConfig) return null

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


