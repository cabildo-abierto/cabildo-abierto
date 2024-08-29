"use client"

import { publishDraft, updateContent } from "src/actions/actions";
import { useUser } from "src/app/hooks/user";
import { ContentProps } from "src/app/lib/definitions";
import dynamic from "next/dynamic";
import { useSWRConfig } from "swr";

const PostEditor = dynamic( () => import( 'src/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( 'src/components/editor/fast-editor' ), { ssr: false } );


export default function EditDraftPage({content}: {content: ContentProps}) {
    const type = content.type
    const {mutate} = useSWRConfig()
    const {user} = useUser()

    const handleCreate = async (text: string, type: string, title?: string) => {
        if(user){
            const result = await publishDraft(text, content.id, user.id, title)
            await mutate("/api/content/"+content.id)
            await mutate("/api/feed")
            mutate("/api/profile-feed/"+user.id)
            mutate("/api/drafts/"+user.id)
            return result
        }
    }

    const handleSaveDraft = async (text: string, type: string, title?: string) => {
        if (user) {
            const result = await updateContent(text, content.id, title);
            await mutate("/api/content/" + content.id);
            mutate("/api/drafts/" + user.id);
            return result;
        }
    };

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