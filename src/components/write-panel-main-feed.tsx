import { LexicalEditor, EditorState } from "lexical";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { commentEditorSettings } from "./editor/comment-editor";
import StateButton from "./state-button";
import Link from "next/link";
import { FastPostIcon, PostIcon } from "./icons";
import { NewPublicArticleButton } from "./new-public-article-button";
import { useUser } from "../app/hooks/user";
import { mutate } from "swr";
import { createPost } from "../actions/contents";
import { compress } from "./compression";
import { charCount, emptyOutput, validPost } from "./utils";
import { ExtraChars } from "./extra-chars";

const MyLexicalEditor = dynamic(() => import('./editor/lexical-editor'), { ssr: false });

export const WritePanelMainFeed = () => {
    const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined);
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined);
    const { user } = useUser();
    const [editorKey, setEditorKey] = useState(0);
    const [randomPlaceholder, setRandomPlaceholder] = useState<string>("");

    const placeholders = [
        "Escribí lo primero que se te venga a la cabeza... Y miralo dos veces.",
        "¿Qué te inspira hoy?",
        "Contá algo nuevo.",
        "¿Tenés algún reclamo que quieras compartir?",
        "¿Necesitás ayuda con algo?",
        "¿Qué fue tu peor experiencia con la administración pública?",
        "¿Qué está pasando?",
        "Compartí tus reflexiones más profundas.",
        "¿Tenés la solución para algún problema?",
        "¿Cuál creés que es el mayor problema de nuestro país?",
        "¿Sabías que este mensaje es distinto cada vez que recargás la página?"
    ];

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * placeholders.length);
        setRandomPlaceholder(placeholders[randomIndex]);
    }, []);

    const settings = { ...commentEditorSettings };
    settings.placeholder = randomPlaceholder;

    async function handleSubmit() {
        if (editor && user) {
            const text = JSON.stringify(editor.getEditorState());
            const compressedText = compress(text);
            await createPost(compressedText, "FastPost", false, user.id, undefined);
            mutate("/api/feed/");
            mutate("/api/profile-feed/" + user.id);
            setEditorKey(editorKey + 1);
        }
        return false;
    }

    const count = editor && editorState ? charCount(editorState) : 0;
    let disabled = !editor || emptyOutput(editorState) || (!validPost(editorState, settings.charLimit));

    return (
        <div className="w-full content-container rounded px-3 pb-2 pt-1">
            <div className="text-sm text-gray-400 flex items-center mt-1">
                <FastPostIcon fontSize="inherit" /> <span className="text-xs">Publicación rápida</span>
            </div>
            <div className="sm:text-lg py-2" key={editorKey}>
                <MyLexicalEditor
                    settings={settings}
                    setEditorState={setEditorState}
                    setEditor={setEditor}
                />
                {settings.charLimit && <ExtraChars charLimit={settings.charLimit} count={count}/>}
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between mt-2">
                <div className="flex space-x-2 mr-2">
                    <Link
                        href="/escribir/publicacion"
                        className="sm:text-sm text-xs flex items-center title hover:bg-[var(--secondary-light)] text-[var(--text-light)] px-1 sm:px-2 rounded"
                    >
                        <div className="mb-1 mr-2 hidden"><PostIcon /></div> Publicación
                    </Link>
                    <NewPublicArticleButton
                        onClick={() => {}}
                        textClassName="title sm:text-sm text-xs"
                        className="hover:bg-[var(--secondary-light)] text-[var(--text-light)] px-2 rounded"
                        showInfoPanel={false}
                        text={"Artículo público"}
                    />
                </div>
                <StateButton
                    text1="Publicar"
                    text2="Enviando..."
                    handleClick={handleSubmit}
                    disabled={disabled}
                    className="gray-btn title text-sm"
                />
            </div>
        </div>
    );
};
