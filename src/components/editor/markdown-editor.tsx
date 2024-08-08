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


function OnChangePlugin({ onChange }: any) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      return editor.registerUpdateListener(({editorState}) => {
        onChange(editorState);
      });
    }, [editor, onChange]);
    return null;
}


function MarkdownEditor({onSubmit, onSaveDraft, initialData=""}: any) {
    const editorRef = useRef<LexicalEditor>(null);
    const [editorState, setEditorState] = useState<EditorState | null>(null)
	const [validContent, setValidContent] = useState(validPost(initialData))

    
    const editorConfig = {
        namespace: 'React.js Demo',
        nodes: [LinkNode],

        onError(error: Error) {
          throw error;
        },
        theme: EditorTheme,

        editorState: (editor: any) => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(initialData, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            const paragraphNode = $createParagraphNode();
      
            nodes.forEach((n) => paragraphNode.append(n));
      
            root.append(paragraphNode);
        },
    };

    const placeholder = 'Empezá a escribir tu publicación acá...';

    const onChange = (e: any) => {
        setEditorState(e)
        setValidContent(true)
    }

    const handleSubmit = async () => {
        if(editorState){
            editorState.read(async () => {
                if(editorRef.current){
                    const data = $generateHtmlFromNodes(editorRef.current);
                    console.log(data)
                    await onSubmit(data)
                }
            });
        }
    }

    const handleSaveDraft = async () => {
        if(editorState){
            editorState.read(async () => {
                if(editorRef.current){
                    const data = $generateHtmlFromNodes(editorRef.current);
                    console.log(data)
                    await onSaveDraft(data)
                }
            });
        }
    }

    return <div className="flex flex-col">
        <div className="">
            <LexicalComposer 
                initialConfig={editorConfig}
            >
            
            <div className="flex justify-between py-2">
                <NextLink href="/borradores" className="">
                    <button className="px-4 py-2 gray-button">
                        Mis borradores
                    </button>
                </NextLink>
                <div className="flex ">
                    <div className="px-2">
                        <SaveDraftButton handleSaveDraft={handleSaveDraft} disabled={!validContent}/>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!validContent}
                        className="px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white enabled:cursor-pointer disabled:bg-gray-400"
                    >
                        Publicar
                    </button>
                </div>
            </div>

            <div className="editor-container">
                <ToolbarPlugin />
                <LinkPlugin />
                <div className="editor-inner">
                <RichTextPlugin
                    contentEditable={
                    <ContentEditable
                        className="editor-input"
                        aria-placeholder={placeholder}
                        placeholder={
                            <div className="editor-placeholder">{placeholder}</div>
                        }
                    />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                    
                />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <OnChangePlugin onChange={onChange}/>
                <EditorRefPlugin editorRef={editorRef} />
                </div>
            </div>
            </LexicalComposer>
        </div>
    </div>
}


export default MarkdownEditor