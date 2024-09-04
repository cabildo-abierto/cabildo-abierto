"use client"
import { useContent } from "src/app/hooks/contents"
import Link from "next/link"
import LoadingSpinner from "./loading-spinner"
import dynamic from "next/dynamic";
import ReadOnlyEditor from "./editor/read-only-editor";
import { PostTitleOnFeed } from "./post-on-feed";



export const DraftButton: React.FC<{draftId: string}> = ({draftId}) => {
    const {content, isLoading, isError} = useContent(draftId)
    
    if(isLoading) return <LoadingSpinner/>

    if(isError || !content) return <></>

    return <div className="">
        <div className="content-container w-full">
            <div className="px-2 py-2 content flex flex-col">
                {content.type == "Post" && <PostTitleOnFeed title={content.title}/>}
                <ReadOnlyEditor initialData={content.text} content={content}/>
            </div>
        </div>
        <div className="flex justify-end mt-1 mr-1">
            <Link href={"/editar/"+draftId}>
                <button className="gray-btn">Editar</button>
            </Link>
        </div>
    </div>
}