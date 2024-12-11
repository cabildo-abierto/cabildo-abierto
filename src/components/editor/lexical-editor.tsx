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
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import {TableNode} from '@lexical/table';
import { useEffect, useRef, useState } from 'react';
import { CAN_USE_DOM } from './shared/canUseDOM';

import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import { SharedHistoryContext, useSharedHistoryContext } from './context/SharedHistoryContext';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import ContentEditable from './ui/ContentEditable';
import { InitialConfigType, InitialEditorStateType, LexicalComposer } from '@lexical/react/LexicalComposer';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

import { BeautifulMentionsPlugin, createBeautifulMentionNode } from 'lexical-beautiful-mentions';
import { CustomMentionComponent, CustomMenuItemMentions, CustomMenuMentions, EmptyMentionResults, queryMentions } from './custom-mention-component';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

import {MarkNode} from '@lexical/mark';
import { CustomMarkNode } from './nodes/CustomMarkNode';
import { $createParagraphNode, $createTextNode, $getRoot, LexicalEditor as OriginalLexicalEditor } from 'lexical';
import { DiffNode } from './nodes/DiffNode';
import { AuthorNode } from './nodes/AuthorNode';
import TableCellResizer from './plugins/TableCellResizer';
import { TableContext } from './plugins/TablePlugin';
import { CustomTableNode } from './nodes/CustomTableNode';

import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import { getAllText } from '../diff';
import { usePageLeave } from '../prevent-leave';
import { v4 as uuidv4 } from 'uuid';
import {ImageNode} from './nodes/ImageNode'
import {InlineImageNode} from './nodes/InlineImageNode/InlineImageNode';


export type SettingsProps = {
  disableBeforeInput: boolean,
  emptyEditor: boolean,
  isAutocomplete: boolean,
  isCharLimit: boolean,
  isCharLimitUtf8: boolean,
  charLimit?: number,
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
  content?: {
    cid: string
    type: string
    title?: string
    parentEntityId?: string
    text?: string
    childrenContents?: any[]
  },
  placeholderClassName: string,
  showingChanges?: string,
  imageClassName: string,
  preventLeave: boolean,
  allowImages: boolean
}


type LexicalEditorProps = {
  settings: SettingsProps,
  setEditor: any,
  setEditorState: any,
  contentId?: string
}


function Editor({ settings, setEditor, setEditorState }: LexicalEditorProps): JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const [editor] = useLexicalComposerContext();
  const {leaveStoppers, setLeaveStoppers} = usePageLeave()

  const [uniqueId, setUniqueId] = useState(undefined)
  
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const [marginAboveEditor, setMarginAboveEditor] = useState<number>(0);

  useEffect(() => {
    if (setEditor) {
      setEditor(editor);
    }
  }, [editor, setEditor]);

  useEffect(() => {
    return () => {
      if(!isReadOnly && preventLeave && uniqueId){
        leaveStoppers.delete(uniqueId)
        setLeaveStoppers(leaveStoppers);
      }
    };
  }, [setLeaveStoppers, uniqueId]);

  const {
    isMaxLength,
    isCharLimit,
    isCharLimitUtf8,
    isRichText,
    showTreeView,
    showTableOfContents,
    shouldUseLexicalContextMenu,
    showToolbar,
    isComments,
    isDraggableBlock,
    placeholder,
    isReadOnly,
    isAutofocus,
    editorClassName,
    content,
    placeholderClassName,
    charLimit,
    preventLeave,
    allowImages
  } = settings;

  const isEditable = useLexicalEditable();
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
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

  useEffect(() => {
    if (editorContainerRef.current) {
      const editorTop = editorContainerRef.current.getBoundingClientRect().top;
      setMarginAboveEditor(editorTop);
    }
  }, [editorContainerRef]);

  return (
    <>
      {isRichText && showToolbar && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div
        ref={editorContainerRef}
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''}`}
      >
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        {isAutofocus && <AutoFocusPlugin />}
        <ClearEditorPlugin />

        <BeautifulMentionsPlugin
          triggers={['@']}
          onSearch={queryMentions}
          emptyComponent={EmptyMentionResults}
          menuComponent={CustomMenuMentions}
          menuItemComponent={CustomMenuItemMentions}
        />
        <TablePlugin
          hasCellMerge={true}
          hasCellBackgroundColor={false}
        />
        <TableCellResizer />
        {allowImages && <ImagesPlugin captionsEnabled={false}/>}
        {allowImages && <InlineImagePlugin/>}

        <OnChangePlugin
          onChange={(editorState) => {
            setEditorState(editorState);
            if(!isReadOnly && preventLeave && !uniqueId){
              const newUniqueId = uuidv4()
              setUniqueId(newUniqueId)
              const newStoppers = leaveStoppers.add(newUniqueId)
              setLeaveStoppers(newStoppers);
            }        
          }}
        />
        <HashtagPlugin />
        <AutoLinkPlugin />
        {isComments && content && <CommentPlugin
          parentContent={content}
        />}
        {isRichText ? (
          <>
            <HistoryPlugin externalHistoryState={historyState} />
            <RichTextPlugin
              contentEditable={
                <div className={'editor-scroller'}>
                  <div className={"editor " + editorClassName} ref={onRef}>
                    <ContentEditable placeholder={placeholder} placeholderClassName={placeholderClassName} settings={settings} />
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />

            <LinkPlugin />
            <ClickableLinkPlugin disabled={isEditable} newTab={false} />

            <LayoutPlugin />

            {!isReadOnly && floatingAnchorElem && (
              <>
                {isDraggableBlock && <DraggableBlockPlugin anchorElem={floatingAnchorElem} />}
                <FloatingLinkEditorPlugin
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true} />
                <FloatingTextFormatToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} settings={settings} />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable placeholder={placeholder} placeholderClassName={placeholderClassName} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        <div className="hidden lg:block">
          {showTableOfContents && <TableOfContentsPlugin content={content} marginAboveEditor={marginAboveEditor} />}
        </div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
      </div>
      {showTreeView && <TreeViewPlugin />}
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

const LexicalEditor = ({ settings, setEditor, setEditorState }: LexicalEditorProps) => {
  let {isReadOnly, initialData, imageClassName, allowImages} = settings

  if(typeof initialData === 'string'){
      try {
          const root = JSON.parse(initialData).root
          if(getAllText(root).length == 0){
            initialData = undefined
          }
      } catch {
          initialData = initializeEmpty(initialData as string)
      }
  }

  let nodes = [...PlaygroundNodes]

  if(allowImages){
      nodes = [...PlaygroundNodes, ImageNode, InlineImageNode]
  }

  const initialConfig: InitialConfigType = {
    namespace: 'Playground',
    editorState: initialData,
    nodes: [
      ...createBeautifulMentionNode(CustomMentionComponent),
      ...nodes,
      CustomMarkNode,
      {
        replace: MarkNode,
        with: (node: MarkNode) => {
            return new CustomMarkNode(node.getIDs());
        }
      },
      DiffNode,
      AuthorNode,
      CustomTableNode,
      { replace: TableNode, with: (node: TableNode) => new CustomTableNode(), withKlass: CustomTableNode } 
    ],
    onError: (error: Error) => {
      throw error;
    },
    theme: {...PlaygroundEditorTheme, image: "editor-image " + imageClassName},
    editable: !isReadOnly,
  };

  return <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <div className="editor-shell">
            <Editor
              settings={settings}
              setEditor={setEditor}
              setEditorState={setEditorState}
            />
          </div>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
}


export default LexicalEditor