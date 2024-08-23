"use client"
import { useContent } from "@/app/hooks/contents"
import { ReadOnlyEditor } from "./editor/read-only-editor"
import Link from "next/link"



export const DraftButton: React.FC<{draftId: string}> = ({draftId}) => {
    const {content, isLoading, isError} = useContent(draftId)
    
    return <div className="">
        <div className="panel w-full">
            <div className="px-2 py-2 content">
                {!content ? <></> : <ReadOnlyEditor initialData={content.text} content={content}/>}
            </div>
        </div>
        <div className="flex justify-end mt-1 mr-1">
            <Link href={"/editar/"+draftId}>
                <button className="gray-btn">Editar</button>
            </Link>
        </div>
    </div>
}