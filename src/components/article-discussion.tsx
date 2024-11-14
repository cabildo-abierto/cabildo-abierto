import { useEffect, useState } from "react"
import { useContent } from "../app/hooks/contents"
import { CommentSectionCommentEditor } from "./comment-section-comment-editor"
import { EntityProps } from "../app/lib/definitions"
import { EntityCommentSection } from "./comment-section"
import LoadingSpinner from "./loading-spinner"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { smoothScrollTo } from "./editor/plugins/TableOfContentsPlugin"



export const ArticleDiscussion = ({contentId, entity, version}: {contentId: string, entity: EntityProps, version: number}) => {
    const {content} = useContent(contentId)

    const [comments, setComments] = useState([])

    useEffect(() => {
        if(content) setComments(content.childrenContents)
    }, [content])

    if(!content) return <LoadingSpinner/>

    function onGoToInformation() {
        const targetElement = document.getElementById('information-start');

        return smoothScrollTo(targetElement, 300)
    }

    return <div className="w-full p-4 rounded-lg content-container">
        <div className="flex justify-between">
            <div>
                <h2>Discusión</h2>
            </div>

            <div className="">
                <button className="flex items-center space-x-2 w-full sm:text-base text-sm bg-[var(--secondary-light)] text-gray-700 rounded px-1" onClick={onGoToInformation}>
                    Información <ArrowUpwardIcon fontSize="inherit"/>
                </button>
            </div>
        </div>
        <div className="text-[var(--text-light)] text-sm sm:text-base mb-4">
            Todo lo que se habló en Cabildo Abierto sobre el tema.
        </div>
        <CommentSectionCommentEditor
            content={content}
            comments={comments}
            setComments={setComments}
            setViewComments={() => {}}
            setWritingReply={() => {}}
            startsOpen={true}
            depth={0}
        />
        <EntityCommentSection
            content={content}
            comments={comments}
            writingReply={true}
            depth={0}
        />
    </div>

}