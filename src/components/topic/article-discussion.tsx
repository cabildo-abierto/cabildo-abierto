import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { smoothScrollTo } from "../editor/plugins/TableOfContentsPlugin"
import { Button } from "@mui/material"
import {TopicProps} from "../../app/lib/definitions";



export const ArticleDiscussion = ({topic, version}: {topic: TopicProps, version: number}) => {
    const content = topic.versions[version]

    function onGoToInformation() {
        const targetElement = document.getElementById('information-start');

        return smoothScrollTo(targetElement, 300)
    }

    return <div className="w-full p-4">
        <div className="flex justify-between">
            <div>
                <h2>Discusión</h2>
            </div>

            <div className="text-[var(--text-light)]">
                <Button variant="outlined" onClick={onGoToInformation} size="small" color="inherit" endIcon={<ArrowUpwardIcon/>}>
                    Consenso
                </Button>
            </div>
        </div>
        <div className="text-[var(--text-light)] text-sm sm:text-base mb-4">
            Todo lo que se habló en Cabildo Abierto sobre el tema.
        </div>
        {/*<CommentSectionCommentEditor
            content={content}
            comments={comments}
            setComments={setComments}
            setViewComments={() => {}}
            setWritingReply={() => {}}
            startsOpen={true}
            depth={0}
        />*/}
        {/*<EntityCommentSection
            content={content}
            comments={comments}
            writingReply={true}
            depth={0}
        />*/}
    </div>

}