"use client"

import { publishDraft, updateContent } from "@/actions/create-content";
import { ContentProps } from "@/actions/get-content";
import dynamic from "next/dynamic";

import { redirect } from "next/navigation";
const PostEditorLexical = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );


export default function EditDraftPage({content}: {content: ContentProps}) {
    const type = content.type

    const handleCreate = async (text: string) => {
        await publishDraft(text, content.id)
        redirect("/borradores")
    }

    const handleSaveDraft = async (text: string) => {
        await updateContent(text, content.id)
        redirect("/borradores")
        // TO DO: Invalidate cache
    }

    return <>
        {type == "Post" ?
            <PostEditorLexical
                onSubmit={handleCreate}
                onSaveDraft={handleSaveDraft}
                initialData={content.text}
            /> : 
            <PostEditorLexical
                onSubmit={handleCreate}
                onSaveDraft={handleSaveDraft}
                initialData={content.text}
            />
        }
    </>
}