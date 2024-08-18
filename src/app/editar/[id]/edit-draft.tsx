"use client"

import { publishDraft, updateContent } from "@/actions/create-content";
import { useUser } from "@/app/hooks/user";
import { ContentProps } from "@/app/lib/definitions";
import dynamic from "next/dynamic";
import { useSWRConfig } from "swr";

const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


export default function EditDraftPage({content}: {content: ContentProps}) {
    const type = content.type
    const {mutate} = useSWRConfig()
    const {user} = useUser()

    const handleCreate = async (text: string, type: string, title?: string) => {
        if(user){
            await publishDraft(text, content.id, title)
            mutate("/api/content"+content.id)
            mutate("/api/feed")
            mutate("/api/profile-feed/"+user.id)
            mutate("/api/drafts/"+user.id)
        }
    }

    const handleSaveDraft = async (text: string, type: string, title?: string) => {
        if(user){
            await updateContent(text, content.id, title)
            mutate("/api/content/"+content.id)
            mutate("/api/drafts/"+user.id)
        }
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