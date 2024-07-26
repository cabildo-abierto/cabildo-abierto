"use client"
import { publishDraft, updateContent } from "@/actions/create-content";
import { ContentProps } from "@/actions/get-content";
import { SaveDraftButton } from "@/components/editor/save-draft-button";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


export default function EditDraftPage({content}: {content: ContentProps}) {
    const type = content.type
    const router = useRouter()

    const handleCreate = async (text: string) => {
        const success = await publishDraft(text, content.id)
        if (success) {
            router.push("/")
        }
    }

    const handleSaveDraft = async (text: string) => {
        const success = await updateContent(text, content.id)
        if (success) {
            router.push("/borradores")
        }
    }

    return <div className="flex justify-center h-screen">
        <div className="flex flex-col w-full px-5 mt-8">
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
        </div>
    </div>
}