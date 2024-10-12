import { useContent } from "../app/hooks/contents"
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons"
import { LikeCounter } from "./like-counter"
import LoadingSpinner from "./loading-spinner"
import { ViewsCounter } from "./views-counter"



export const EntityLikesAndViewsCounter = ({contentId}: {contentId: string}) => {
    const content = useContent(contentId)

    if(content.isLoading || !content.content){
        return <></>
    }

    return <div className="flex flex-col items-end">
        <div className="p-1 flex flex-col items-center">
            <LikeCounter
                content={content.content}
                icon1={<ActivePraiseIcon/>} icon2={<InactivePraiseIcon/>}
            />
            <ViewsCounter content={content.content}/>
        </div>
    </div>
}