import { UserProps } from "@/actions/get-user"
import { useDrafts } from "../hooks/contents"
import { DraftButton } from "@/components/draft-button"


export const DraftsPreview = ({user}: {user: UserProps}) => {
    const {drafts, isLoading, isError} = useDrafts(user.id)
    if(isLoading){
        return <>Cargando...</>
    }
    if(isError || !drafts){
        return <>Error :(</>
    }
    <ul>
        {drafts.map(({id}, index: number) => {
            return <li key={index} className="py-4">
                <DraftButton draftId={id}/>
            </li>
        })}
    </ul>
}