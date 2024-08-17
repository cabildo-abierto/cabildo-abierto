"use client"

import { publishDraft, updateContent } from "@/actions/create-content";
import { ContentProps } from "@/actions/get-content";
import dynamic from "next/dynamic";

const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


export default function EditDraftPage({content}: {content: ContentProps}) {
    const type = content.type

    const handleCreate = async (text: string, type: string, title?: string) => {
        await publishDraft(text, content.id, title)
    }

    const handleSaveDraft = async (text: string, type: string, title?: string) => {
        await updateContent(text, content.id, title)
    }

    return <>
        {type == "Post" ?
            <PostEditor
                onSubmit={handleCreate}
                onSaveDraft={handleSaveDraft}
                initialData={content.text}
                initialTitle={content.title ? content.title : undefined}
            /> : 
            <FastEditor
                onSubmit={handleCreate}
                onSaveDraft={handleSaveDraft}
                initialData={content.text}
            />
        }
    </>
}