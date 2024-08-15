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
import {AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link'

import { SharedHistoryContext, useSharedHistoryContext } from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
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
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import { TableContext } from './plugins/TablePlugin';
import { SharedAutocompleteContext } from './context/SharedAutocompleteContext';
import { FlashMessageContext } from './context/FlashMessageContext';

import { beautifulMentionsTheme } from './themes/beautiful-mentions-theme'
import { BeautifulMentionsPlugin, createBeautifulMentionNode } from 'lexical-beautiful-mentions';
import { CustomMentionComponent, CustomMenuItemMentions, CustomMenuMentions, EmptyMentionResults, queryMentions } from './custom-mention-component';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $insertNodes, COMMAND_PRIORITY_CRITICAL } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { $convertFromMarkdownString } from '@lexical/markdown'

function Editor({ settings, setEditor, setOutput }: any): JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const [editor] = useLexicalComposerContext()
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (setEditor) {
      setEditor(editor);
    }
    
  }, [editor, setEditor]);

  const {
    isAutocomplete,
    isMaxLength,
    isCharLimit,
    isCharLimitUtf8,
    isRichText,
    showTreeView,
    showTableOfContents,
    shouldUseLexicalContextMenu,
    shouldPreserveNewLinesInMarkdown,
    tableCellMerge,
    tableCellBackgroundColor,
    showActions,
    showToolbar,
    isComments,
    isDraggableBlock,
    placeholder,
    initialData,
    isMarkdownEditor,
    isHtmlEditor,
    isReadOnly,
    isAutofocus,
    editorClassName,
    user,
    content
  } = settings

  useEffect(() => {
    if(!hasInitialized.current && initialData) {
      editor.update(() => {
        if(isMarkdownEditor){
          const root = $getRoot()
          $convertFromMarkdownString(initialData, undefined, root, false)
        } else if(isHtmlEditor){
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialData, "text/html");
        
          const nodes = $generateNodesFromDOM(editor, dom);
          $getRoot().clear();
          $getRoot().select();
        
          $insertNodes(nodes);
        }
      });
    }
    hasInitialized.current = true;
  }, [editor, initialData, isMarkdownEditor])

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
            setOutput(editorState)
            setEditor(editor)
          }}
        />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <AutoLinkPlugin />
        {isComments && <CommentPlugin
          user={user}
          parentContent={content}
        />}
        {isRichText ? (
          <>
            <HistoryPlugin externalHistoryState={historyState} />
            <RichTextPlugin
              contentEditable={
                <div className={"editor-scroller " + editorClassName + (isReadOnly ? "" : " min-h-[105px]")}>
                  <div className="editor" ref={onRef}>
                    <ContentEditable placeholder={placeholder} settings={settings}/>
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
            <ClickableLinkPlugin disabled={isEditable} />
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
                <CodeActionMenuPlugin />
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
              contentEditable={<ContentEditable placeholder={placeholder} />}
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
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
        {showActions && <ActionsPlugin
          isRichText={isRichText}
          shouldPreserveNewLinesInMarkdown={shouldPreserveNewLinesInMarkdown}
        />}
      </div>
      {showTreeView && <TreeViewPlugin />}
    </>
  );
}


const LexicalEditor = ({ settings, setEditor, setOutput }: any) => {
  const {isReadOnly, initialData, isHtmlEditor, isMarkdownEditor} = settings
  const initialConfig = {
    editorState: (!isHtmlEditor && !isMarkdownEditor) ? initialData : undefined,
    namespace: 'Playground',
    nodes: [
      ...createBeautifulMentionNode(CustomMentionComponent),
      ...PlaygroundNodes,
    ],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
    editable: !isReadOnly,
  };

  return <FlashMessageContext>
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell">
              <Editor
                settings={settings}
                setEditor={setEditor}
                setOutput={setOutput}  
              />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  </FlashMessageContext>
}


export default LexicalEditor