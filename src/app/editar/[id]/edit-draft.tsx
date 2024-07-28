"use client"
import { publishDraft, updateContent } from "@/actions/create-content";
import { ContentProps } from "@/actions/get-content";
import { getContentsMap } from "@/components/update-context";
import { useContents } from "@/components/use-contents";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


export default function EditDraftPage({content}: {content: ContentProps}) {
    const router = useRouter()
    const {setContents} = useContents()

    const type = content.type

    const handleCreate = async (text: string) => {
        await publishDraft(text, content.id)
        setContents(await getContentsMap())
        router.push("/borradores")
    }

    const handleSaveDraft = async (text: string) => {
        await updateContent(text, content.id)
        setContents(await getContentsMap())
        router.push("/borradores")
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