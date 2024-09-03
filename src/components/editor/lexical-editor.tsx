/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use client"

import './index.css';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { CAN_USE_DOM } from './shared/canUseDOM';

import { SharedHistoryContext, useSharedHistoryContext } from './context/SharedHistoryContext';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import PollPlugin from './plugins/PollPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import { InitialConfigType, InitialEditorStateType, LexicalComposer } from '@lexical/react/LexicalComposer';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import { TableContext } from './plugins/TablePlugin';

import { BeautifulMentionNode, BeautifulMentionsPlugin, createBeautifulMentionNode } from 'lexical-beautiful-mentions';
import { CustomMentionComponent, CustomMenuItemMentions, CustomMenuMentions, EmptyMentionResults, queryMentions } from './custom-mention-component';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

import {MarkNode} from '@lexical/mark';
import { CustomMarkNode } from './nodes/CustomMarkNode';
import { ContentProps } from 'src/app/lib/definitions';
import { $createParagraphNode, $createTextNode, $getRoot, DecoratorNode, LexicalNodeReplacement, LexicalEditor as OriginalLexicalEditor } from 'lexical';
import { DiffNode } from './nodes/DiffNode';


export type SettingsProps = {
  disableBeforeInput: boolean,
  emptyEditor: boolean,
  isAutocomplete: boolean,
  isCharLimit: boolean,
  isCharLimitUtf8: boolean,
  isCollab: boolean,
  isMaxLength: boolean,
  isRichText: boolean,
  measureTypingPerf: boolean,
  shouldPreserveNewLinesInMarkdown: boolean,
  shouldUseLexicalContextMenu: boolean,
  showNestedEditorTreeView: boolean,
  showTableOfContents: boolean,
  showTreeView: boolean,
  tableCellBackgroundColor: boolean,
  tableCellMerge: boolean,
  showActions: boolean,
  showToolbar: boolean,
  isComments: boolean,
  isDraggableBlock: boolean,
  useSuperscript: boolean,
  useStrikethrough: boolean,
  useSubscript: boolean,
  useCodeblock: boolean,
  placeholder: string,
  initialData: InitialEditorStateType,
  isReadOnly: boolean,
  isAutofocus: boolean,
  editorClassName: string,
  content?: ContentProps | null,
  placeholderClassName: string,
  showingChanges?: string
}


type LexicalEditorProps = {
  settings: SettingsProps,
  setEditor: any,
  setChanged: any,
  contentId?: string
}


function Editor({ settings, setEditor, setChanged }: 
  LexicalEditorProps): JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (setEditor) {
      setEditor(editor);
    }
    
  }, [editor, setEditor]);

  const {
    isMaxLength,
    isCharLimit,
    isCharLimitUtf8,
    isRichText,
    showTreeView,
    showTableOfContents,
    shouldUseLexicalContextMenu,
    tableCellMerge,
    tableCellBackgroundColor,
    showToolbar,
    isComments,
    isDraggableBlock,
    placeholder,
    isReadOnly,
    isAutofocus,
    editorClassName,
    content,
    placeholderClassName,
    initialData
  } = settings

  const isEditable = useLexicalEditable();
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

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


  return (
    <>
      {(isRichText && showToolbar) && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''
          }`}>
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        {isAutofocus && <AutoFocusPlugin />}
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />

        <BeautifulMentionsPlugin
          triggers={["@"]}
          onSearch={queryMentions}
          emptyComponent={EmptyMentionResults}
          menuComponent={CustomMenuMentions}
          menuItemComponent={CustomMenuItemMentions}
        />

        <OnChangePlugin
          onChange={(editorState) => {
            setEditor(editor)

            if(JSON.stringify(editorState) != initialData){
                setChanged(true)
            }
          }}
        />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <AutoLinkPlugin />
        {isComments && content && <CommentPlugin
          parentContent={content}
        />}
        {isRichText ? (
          <>
            <HistoryPlugin externalHistoryState={historyState} />
            <RichTextPlugin
              contentEditable={
                <div className={"editor-scroller " + editorClassName}>
                  <div className="editor" ref={onRef}>
                    <ContentEditable placeholder={placeholder} placeholderClassName={settings.placeholderClassName} settings={settings}/>
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <CodeHighlightPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
            />
            <TableCellResizer />
            <TableHoverActionsPlugin />
            <ImagesPlugin />
            <InlineImagePlugin />
            <LinkPlugin />
            <PollPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <ClickableLinkPlugin disabled={isEditable} newTab={false}/>
            <HorizontalRulePlugin />
            <EquationsPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            <PageBreakPlugin />
            <LayoutPlugin />

            {!isReadOnly && floatingAnchorElem && !isSmallWidthViewport && (
              <>
                {isDraggableBlock && <DraggableBlockPlugin anchorElem={floatingAnchorElem}/>}
                <FloatingLinkEditorPlugin
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  cellMerge={true}
                />
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
              contentEditable={
              <ContentEditable placeholder={placeholder} placeholderClassName={placeholderClassName} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
            maxLength={5}
          />
        )}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
      </div>
      {showTreeView && <TreeViewPlugin />}
    </>
  );
}


const initializeEmpty = (editor: OriginalLexicalEditor) => {
    editor.update(() => {
        const root = $getRoot()
        const node = $createParagraphNode()
        node.append($createTextNode("Este artículo está vacío!"))
        root.append(node)
    })
}

const LexicalEditor = ({ settings, setEditor, setChanged }: LexicalEditorProps) => {
  let {isReadOnly, initialData, showingChanges} = settings

  if(typeof initialData === 'string'){
      try {
          JSON.parse(initialData)
      } catch {
          initialData = initializeEmpty
      }
  }
  const initialConfig: InitialConfigType = {
    namespace: 'Playground',
    editorState: initialData,
    nodes: [
      ...createBeautifulMentionNode(CustomMentionComponent),
      ...PlaygroundNodes,
      CustomMarkNode,
      {
        replace: MarkNode,
        with: (node: MarkNode) => {
            return new CustomMarkNode(node.getIDs());
        }
      },
      DiffNode
    ],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
    editable: !isReadOnly,
  };

  return <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <div className="editor-shell">
            <Editor
              settings={settings}
              setEditor={setEditor}
              setChanged={setChanged}
            />
          </div>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
}


export default LexicalEditor