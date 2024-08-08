"use client"
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import { LinkNode } from '@lexical/link';
import {EditorRefPlugin} from '@lexical/react/LexicalEditorRefPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import NextLink from "next/link"
import { validPost } from '../utils';
import { SaveDraftButton } from './save-draft-button';
import { useEffect, useRef, useState } from 'react';

import "./styles.css"
import EditorTheme from './EditorTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {$generateNodesFromDOM} from '@lexical/html';
import {$generateHtmlFromNodes} from '@lexical/html';
import { $createParagraphNode, $getRoot, $insertNodes, EditorState, LexicalEditor } from 'lexical';


function ReadOnlyHtmlEditor({content}: any) {
    const editorRef = useRef<LexicalEditor>(null);

    const editorConfig = {
        namespace: 'React.js Demo',
        nodes: [LinkNode],

        onError(error: Error) {
          throw error;
        },
        theme: EditorTheme,
        editable: false,

        editorState: (editor: any) => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(content, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            const paragraphNode = $createParagraphNode();
      
            nodes.forEach((n) => paragraphNode.append(n));
      
            root.append(paragraphNode);
        },
    };


    return <LexicalComposer 
                initialConfig={editorConfig}
            >
            <div className="editor-container">
                <LinkPlugin />
                <div className="editor-inner">
                <RichTextPlugin
                    contentEditable={
                    <ContentEditable
                        className="editor-input"
                    />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                    
                />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <EditorRefPlugin editorRef={editorRef} />
                </div>
            </div>
            </LexicalComposer>
}


export default ReadOnlyHtmlEditor