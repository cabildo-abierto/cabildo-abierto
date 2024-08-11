"use client"

import { publishDraft, updateContent } from "@/actions/create-content";
import { ContentProps } from "@/actions/get-content";
import dynamic from "next/dynamic";

import { redirect } from "next/navigation";
const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


export default function EditDraftPage({content}: {content: ContentProps}) {
    const type = content.type

    const handleCreate = async (text: string, type: string) => {
        await publishDraft(text, content.id)
    }

    const handleSaveDraft = async (text: string, type: string) => {
        await updateContent(text, content.id)
    }

    return <>
        {type == "Post" ?
            <PostEditor
                onSubmit={handleCreate}
                onSaveDraft={handleSaveDraft}
                initialData={content.text}
            /> : 
            <FastEditor
                onSubmit={handleCreate}
                onSaveDraft={handleSaveDraft}
                initialData={content.text}
            />
        }
    </>
}