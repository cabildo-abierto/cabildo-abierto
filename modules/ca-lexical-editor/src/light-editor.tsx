/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use client"

import './index.css';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {useEffect, useMemo, useRef, useState} from 'react';
import {CAN_USE_DOM} from './shared/canUseDOM';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import TopicMentionsPlugin from './plugins/TopicMentionsPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import ContentEditable from './ui/ContentEditable';
import {InitialConfigType, LexicalComposer} from '@lexical/react/LexicalComposer';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {TableContext} from './plugins/TablePlugin/TablePlugin';
import {getInitialData} from "./get-initial-data";
import {LINK, MarkdownTransformer} from "./ca-transformers";
import {LexicalEditorProps} from "./lexical-editor";
import {KlassConstructor, LexicalNode, LexicalNodeReplacement} from "lexical";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {TopicMentionNode} from "./nodes/TopicMentionNode";

function getEditorNodes(settings: { allowImages: boolean, topicMentions: boolean }): readonly (KlassConstructor<typeof LexicalNode> | LexicalNodeReplacement)[] {
    const {topicMentions} = settings

    return [
        ...(topicMentions ? [TopicMentionNode] : []),
        LinkNode,
        AutoLinkNode
    ]
}


function Editor({settings, setEditor, setEditorState}: LexicalEditorProps) {
    const [editor] = useLexicalComposerContext();
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);

    useEffect(() => {
        if (setEditor) {
            setEditor(editor);
        }
    }, [editor, setEditor]);


    const {
        isRichText,
        showTreeView,
        placeholder,
        editorClassName,
        placeholderClassName,
        topicMentions
    } = settings;

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

    return (
        <>
            <div
                ref={editorContainerRef}
                className={`${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''}`}
            >
                <AutoLinkPlugin/>

                {topicMentions && <TopicMentionsPlugin/>}

                <PlainTextPlugin
                    contentEditable={<ContentEditable
                        placeholder={placeholder}
                        placeholderClassName={placeholderClassName}
                        editorClassName={editorClassName}
                    />}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            {showTreeView && <TreeViewPlugin/>}
        </>
    );
}


export const LIGHT_MARKDOWN_TRANSFORMERS: MarkdownTransformer[] = [
    LINK
]


const LightEditor = ({settings, setEditor, setEditorState}: LexicalEditorProps) => {

    const initialConfig: InitialConfigType = useMemo(() => {
        const {topicMentions, isReadOnly, initialText, initialTextFormat, imageClassName, shouldPreserveNewLines, embeds} = settings
        return {
            namespace: settings.namespace,
            editorState: getInitialData(
                initialText,
                initialTextFormat,
                shouldPreserveNewLines,
                embeds,
                topicMentions,
                LIGHT_MARKDOWN_TRANSFORMERS
            ),
            nodes: getEditorNodes(settings),
            onError: (error: Error) => { throw error },
            theme: {
                ...PlaygroundEditorTheme,
                image: "editor-image " + imageClassName
            },
            editable: !isReadOnly,
        };
    }, [settings]);

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


export default LightEditor