import { useDrafts } from "../app/hooks/contents"
import { DraftButton } from "@/components/draft-button"
import { UserProps } from "../app/lib/definitions"
import LoadingSpinner from "./loading-spinner"
 
export const DraftsPreview = ({user}: {user: UserProps}) => {
    const {drafts, isLoading, isError} = useDrafts(user.id)
    if(isLoading){
        return <LoadingSpinner/>
    }
    if(isError || !drafts){
        return <></>
    }
    return <ul>
        {drafts.map(({id}, index: number) => {
            return <li key={index} className="py-4">
                <DraftButton draftId={id}/>
            </li>
        })}
    </ul>
}