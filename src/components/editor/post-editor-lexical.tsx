import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import NextLink from "next/link"
import { validPost } from '../utils';
import { SaveDraftButton } from './save-draft-button';
import { useState } from 'react';

import ExampleTheme from './ExampleTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';

const theme = {
  // Theme styling goes here
  //...
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function PostEditorLexical({onSubmit, onSaveDraft, initialData=""}: any) {
	const [validContent, setValidContent] = useState(validPost(initialData))
    const editorConfig = {
        namespace: 'React.js Demo',
        nodes: [],
        // Handling of errors during update
        onError(error: Error) {
          throw error;
        },
        // The editor theme
        theme: ExampleTheme,
    };

    const editor = null
    const placeholder = 'Enter some rich text...';

    return <div className="flex flex-col">
        <div className="flex justify-between py-2">
            <NextLink href="/borradores" className="">
                <button className="px-4 py-2 gray-button">
                    Mis borradores
                </button>
            </NextLink>
            <div className="flex ">
                <div className="px-2">
                    <SaveDraftButton onSaveDraft={onSaveDraft} editor={editor} disabled={!validContent}/>
                </div>
                <button
                    onClick={() => {if(editor) onSubmit(editor.getData())}}
                    disabled={!validContent}
                    className="px-4 rounded font-bold transition duration-200 bg-blue-500 hover:bg-blue-600 text-white enabled:cursor-pointer disabled:bg-gray-400"
                >
                    Publicar
                </button>
            </div>
        </div>
        <div className="ck-content">
            <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container">
                <ToolbarPlugin />
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
                <TreeViewPlugin />
                </div>
            </div>
            </LexicalComposer>
        </div>
    </div>
}

export default PostEditorLexical