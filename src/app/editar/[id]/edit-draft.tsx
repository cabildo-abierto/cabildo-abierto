import { publishDraft, updateContent } from "@/actions/create-content";
import { ContentProps } from "@/actions/get-content";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


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