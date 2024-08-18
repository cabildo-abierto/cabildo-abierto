import { useDrafts } from "../app/hooks/contents"
import { DraftButton } from "@/components/draft-button"
import { UserProps } from "../app/lib/definitions"
 
export const DraftsPreview = ({user}: {user: UserProps}) => {
    const {drafts, isLoading, isError} = useDrafts(user.id)
    if(isLoading){
        return <></>
    }
    if(isError || !drafts){
        return <>Error :(</>
    }
    return <ul>
        {drafts.map(({id}, index: number) => {
            return <li key={index} className="py-4">
                <DraftButton draftId={id}/>
            </li>
        })}
    </ul>
}