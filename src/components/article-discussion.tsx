import { useEffect, useState } from "react"
import { useContent } from "../app/hooks/contents"
import { CommentSectionCommentEditor } from "./comment-section-comment-editor"
import { EntityProps } from "../app/lib/definitions"
import { EntityCommentSection } from "./comment-section"
import LoadingSpinner from "./loading-spinner"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { smoothScrollTo } from "./editor/plugins/TableOfContentsPlugin"
import { Button } from "@mui/material"



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

            <div className="text-[var(--text-light)]">
                <Button variant="outlined" onClick={onGoToInformation} size="small" color="inherit" endIcon={<ArrowUpwardIcon/>}>
                    Información
                </Button>
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