import { LexicalEditor, EditorState } from "lexical";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { commentEditorSettings } from "./editor/comment-editor";
import StateButton from "./state-button";
import Link from "next/link";
import { CloseButtonIcon, FastPostIcon, PostIcon } from "./icons";
import { NewPublicArticleButton } from "./new-public-article-button";
import { useUser } from "../app/hooks/user";
import { mutate } from "swr";
import { createPost } from "../actions/contents";
import { compress } from "./compression";
import { charCount, emptyOutput, validPost } from "./utils";
import { ExtraChars } from "./extra-chars";
import { CloseButton } from "./close-button";

const MyLexicalEditor = dynamic(() => import('./editor/lexical-editor'), { ssr: false });

export const WritePanelMainFeed = ({onClose}: {onClose: () => void}) => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined);
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined);
    const { user } = useUser();
    const [editorKey, setEditorKey] = useState(0);
    const [randomPlaceholder, setRandomPlaceholder] = useState<string>("")
    const [errorOnCreatePost, setErrorOnCreatePost] = useState(false)

    const placeholders = [
        "Una ráfaga comunicacional...",
    ];

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * placeholders.length);
        setRandomPlaceholder(placeholders[randomIndex]);
    }, []);

    const settings = { ...commentEditorSettings };
    settings.placeholder = randomPlaceholder;
    settings.editorClassName = "min-h-[250px]"

    async function handleSubmit() {
        setErrorOnCreatePost(false)
        if (editor && user) {
            const text = JSON.stringify(editor.getEditorState());
            const compressedText = compress(text);
            const content = await createPost(compressedText, "FastPost", false, user.id, undefined);
            if(content){
                mutate("/api/feed/");
                mutate("/api/following-feed/")
                mutate("/api/profile-feed/" + user.id);
                setEditorKey(editorKey + 1);
                onClose()
                return true
            } else {
                setErrorOnCreatePost(true)
            }
            return false
        }
        setErrorOnCreatePost(true)
        return false;
    }

    const count = editor && editorState ? charCount(editorState) : 0;
    let disabled = !editor || emptyOutput(editorState) || (!validPost(editorState, settings.charLimit));

    return (
        <div className="w-full rounded px-2 pb-2 pt-1">
            <div className="flex justify-between">
                <div className="text-sm text-gray-400 flex items-center">
                    <FastPostIcon fontSize="inherit" /> <span className="text-xs">Publicación rápida</span>
                </div>
                <CloseButton onClose={onClose}/>
            </div>
            <div className="sm:text-lg py-2 px-1 h-full max-h-[400px] overflow-scroll" key={editorKey}>
                <MyLexicalEditor
                    settings={settings}
                    setEditorState={setEditorState}
                    setEditor={setEditor}
                />
                {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-end mt-2">
                <StateButton
                    text1="Publicar"
                    text2="Enviando..."
                    handleClick={handleSubmit}
                    disabled={disabled}
                    className="gray-btn title text-sm"
                />
            </div>
            {errorOnCreatePost && <div className="flex justify-end text-sm text-red-600">Ocurrió un error al publicar. Intentá de nuevo.</div>}
        </div>
    );
};
